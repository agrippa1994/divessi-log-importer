const REDACTED = "[REDACTED]"
const EMAIL = /[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi
const SENSITIVE_NAME =
  /token|password|passwd|passphrase|secret|authorization|cookie|credential|api[_.-]?key|email|login|session[_.-]?(?:id|key)/i
const SENSITIVE_ASSIGNMENT = new RegExp(
  String.raw`(?<![\w.-])((["']?)(?:[\w.-]*(?:${SENSITIVE_NAME.source})[\w.-]*|[lp])\2\s*[:=]\s*)("[^"]*"|'[^']*'|[^\s&,;<>]+)`,
  "gi"
)

function isSensitive(key: string) {
  const name = key.toLowerCase().replace(/[^a-z0-9]/g, "")
  return name === "l" || name === "p" || SENSITIVE_NAME.test(name)
}

function jsonContainer(text: string): unknown {
  if (!/^[\s]*[[{]/.test(text)) return undefined
  try {
    return JSON.parse(text)
  } catch {
    return undefined
  }
}

function httpUrl(text: string) {
  if (!/^https?:\/\//i.test(text)) return undefined
  try {
    return new URL(text)
  } catch {
    return undefined
  }
}

// Keep secrets local to a request/response pair, including values echoed under
// an unrelated field. Collect first so field order cannot affect redaction.
export function createHttpRedactor() {
  const secrets = new Set<string>()

  function remember(value: unknown) {
    if (typeof value === "string" && value.length > 0) {
      secrets.add(value)
      secrets.add(encodeURIComponent(value))
      secrets.add(JSON.stringify(value).slice(1, -1))
      const credential = /^(?:Bearer|Basic)\s+(.+)$/i.exec(value)
      if (credential) secrets.add(credential[1])
    } else if (Array.isArray(value)) {
      value.forEach(remember)
    } else if (value !== null && typeof value === "object") {
      Object.values(value).forEach(remember)
    }
  }

  function collect(value: unknown): void {
    if (typeof value === "string") {
      const json = jsonContainer(value)
      if (json !== undefined) collect(json)
      for (const match of value.matchAll(SENSITIVE_ASSIGNMENT)) {
        remember(match[3].replace(/^["']|["']$/g, ""))
      }
      for (const match of value.matchAll(
        /\b(?:Bearer|Basic)\s+([A-Z0-9._~+/=-]+)/gi
      )) {
        remember(match[1])
      }
      const url = httpUrl(value)
      if (url) {
        remember(decodeURIComponent(url.username))
        remember(decodeURIComponent(url.password))
        for (const [key, child] of url.searchParams) collect({ [key]: child })
      }
    } else if (Array.isArray(value)) {
      value.forEach(collect)
    } else if (value !== null && typeof value === "object") {
      for (const [key, child] of Object.entries(value)) {
        if (isSensitive(key)) remember(child)
        collect(child)
      }
    }
  }

  function text(value: string): string {
    let result = value
    for (const secret of [...secrets].sort((a, b) => b.length - a.length)) {
      result = result.replaceAll(secret, REDACTED)
    }
    return result
      .replace(EMAIL, REDACTED)
      .replace(
        /[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+%40[A-Z0-9.-]+\.[A-Z]{2,}/gi,
        REDACTED
      )
      .replace(/\b(Bearer|Basic)\s+[A-Z0-9._~+/=-]+/gi, `$1 ${REDACTED}`)
      .replace(
        SENSITIVE_ASSIGNMENT,
        (_match, prefix: string) => `${prefix}${REDACTED}`
      )
  }

  function visit(value: unknown): unknown {
    if (typeof value === "string") {
      const json = jsonContainer(value)
      if (json !== undefined) return JSON.stringify(visit(json))
      const url = httpUrl(value)
      if (url) {
        if (url.username) url.username = REDACTED
        if (url.password) url.password = REDACTED
        const params = new URLSearchParams()
        for (const [key, child] of url.searchParams) {
          params.append(
            text(key),
            isSensitive(key) ? REDACTED : String(visit(child))
          )
        }
        url.search = params.toString()
        url.pathname = text(url.pathname)
        url.hash = text(url.hash)
        return url.toString()
      }
      return text(value)
    }
    if (Array.isArray(value)) return value.map(visit)
    if (value !== null && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value).map(([key, child]) => [
          text(key),
          isSensitive(key) ? REDACTED : visit(child),
        ])
      )
    }
    return value
  }

  return (value: unknown) => {
    collect(value)
    return visit(value)
  }
}
