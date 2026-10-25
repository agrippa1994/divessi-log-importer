import { createHttpRedactor } from "./http-redaction"

function parseBody(body: string, contentType: string) {
  try {
    return JSON.parse(body)
  } catch {
    if (contentType.includes("application/x-www-form-urlencoded")) {
      return Object.fromEntries(new URLSearchParams(body))
    }
    return body
  }
}

async function responseBody(response: Response) {
  const contentType = response.headers.get("content-type") ?? ""
  if (/zip|octet-stream|^image\/|^audio\/|^video\//i.test(contentType)) {
    return "[binary body omitted]"
  }
  try {
    return parseBody(await response.clone().text(), contentType)
  } catch {
    return "[response body unavailable]"
  }
}

// Both the SDK and public cache downloads go through this server-side wrapper.
export async function ssiFetch(
  url: string,
  init?: RequestInit
): Promise<Response> {
  if (!/^(true|1)$/.test(process.env.SSI_DEBUG_HTTP ?? "")) {
    return globalThis.fetch(url, init)
  }

  const redact = createHttpRedactor()
  const requestId = crypto.randomUUID()
  const started = performance.now()
  const headers = new Headers(init?.headers)
  const body =
    typeof init?.body === "string"
      ? parseBody(init.body, headers.get("content-type") ?? "")
      : init?.body == null
        ? undefined
        : "[non-text request body omitted]"

  const log = (event: string, data: object) => {
    let details: unknown
    try {
      details = redact(data)
    } catch {
      // Diagnostics must not stop a request or fall back to logging raw data.
      details = "[HTTP details unavailable]"
    }
    console.info(
      "[ssi-http]",
      JSON.stringify({
        timestamp: new Date().toISOString(),
        requestId,
        event,
        details,
      })
    )
  }

  log("request", {
    method: init?.method ?? "GET",
    url,
    headers: Object.fromEntries(headers),
    body,
  })

  try {
    const response = await globalThis.fetch(url, init)
    log("response", {
      status: response.status,
      url: response.url || url,
      headers: Object.fromEntries(response.headers),
      body: await responseBody(response),
      durationMs: Math.round(performance.now() - started),
    })
    return response
  } catch (error) {
    log("error", {
      error: error instanceof Error ? error.message : String(error),
      durationMs: Math.round(performance.now() - started),
    })
    throw error
  }
}
