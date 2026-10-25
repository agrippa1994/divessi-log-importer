import { mkdtemp, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { strToU8, zipSync } from "fflate"
import { afterEach, describe, expect, it, vi } from "vitest"
import { createSsiClient } from "./api"
import { ensureSsiDataSource } from "./download.server"
import { ssiFetch } from "./http"

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

function debugLogs() {
  vi.stubEnv("SSI_DEBUG_HTTP", "true")
  const spy = vi.spyOn(console, "info").mockImplementation(() => {})
  return {
    spy,
    text: () => JSON.stringify(spy.mock.calls),
    entries: () => spy.mock.calls.map((call) => JSON.parse(call[1])),
  }
}

describe("SSI HTTP diagnostics", () => {
  it.each([undefined, "false", "0"])(
    "does not log or read response bodies when the flag is %s",
    async (flag) => {
      vi.stubEnv("SSI_DEBUG_HTTP", flag)
      const log = vi.spyOn(console, "info").mockImplementation(() => {})
      const response = new Response("original response")
      const clone = vi.spyOn(response, "clone")
      const fetch = vi.fn().mockResolvedValue(response)
      vi.stubGlobal("fetch", fetch)
      const init = { method: "POST", body: "original body" }

      expect(await ssiFetch("https://api.divessi.com/app/a21.php", init)).toBe(
        response
      )
      expect(fetch).toHaveBeenCalledWith(
        "https://api.divessi.com/app/a21.php",
        init
      )
      expect(log).not.toHaveBeenCalled()
      expect(clone).not.toHaveBeenCalled()
      expect(response.bodyUsed).toBe(false)
    }
  )

  it("logs SDK login calls without leaking credentials or returned tokens", async () => {
    const logs = debugLogs()
    const data = { authenticated: true, token: "returned-session-token" }
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(data)))

    const client = createSsiClient()
    const result = await client.login({
      l: "diver+login@example.com",
      p: "secret+password&value",
    })

    expect(result.data.token).toBe(data.token)
    expect(client.getToken()).toBe(data.token)
    for (const value of [
      "diver+login@example.com",
      "secret+password&value",
      data.token,
    ]) {
      expect(logs.text()).not.toContain(value)
      expect(logs.text()).not.toContain(encodeURIComponent(value))
    }
    const [request, response] = logs.entries()
    expect(request.event).toBe("request")
    expect(request.details.url).toContain("what=authenticate")
    expect(response.event).toBe("response")
    expect(response.details.status).toBe(200)
    expect(response.details.body.token).toBe("[REDACTED]")
    expect(response.requestId).toBe(request.requestId)
    expect(response.details.durationMs).toBeGreaterThanOrEqual(0)
  })

  it("redacts headers, nested JSON/form fields and echoed secrets without modifying traffic", async () => {
    const logs = debugLogs()
    const token = "request-session-token"
    const password = 'password-with-"quotes"&symbols'
    const responseToken = "new-response-token"
    const url = `https://api.divessi.com/app/a21.php?what=save_divelog&token=${token}`
    const payload = {
      odin_user_log_nr: 42,
      nested: [{ password }, { email: "nested@example.com" }],
      embedded: JSON.stringify({ api_key: "nested-api-key" }),
    }
    const body = new URLSearchParams({
      json_data: JSON.stringify(payload),
    }).toString()
    const init = {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        authorization: "Bearer bearer-credential",
        cookie: "ssi=cookie-credential",
        "x-api-key": "header-api-key",
        "user-agent": "Dart/3.12 (dart:io)",
      },
      body,
    }
    const data = {
      message: `Echo ${token} ${password} ${responseToken} bearer-credential`,
      emailLink: "https://example.com/?user=other%40example.com",
      nested: [{ access_token: responseToken }],
      dive: { odin_user_log_nr: 42 },
    }
    const response = Response.json(data, {
      status: 403,
      headers: {
        "set-cookie": "ssi=response-cookie",
        "x-auth-token": "response-header-token",
        "x-request-id": "upstream-request-id",
      },
    })
    const fetch = vi.fn().mockResolvedValue(response)
    vi.stubGlobal("fetch", fetch)

    expect(await ssiFetch(url, init)).toBe(response)
    expect(fetch).toHaveBeenCalledWith(url, init)
    expect(init.body).toBe(body)
    expect(await response.json()).toEqual(data)
    for (const value of [
      token,
      password,
      responseToken,
      "nested@example.com",
      "other@example.com",
      "bearer-credential",
      "cookie-credential",
      "nested-api-key",
      "header-api-key",
      "response-cookie",
      "response-header-token",
    ]) {
      expect(logs.text()).not.toContain(value)
      expect(logs.text()).not.toContain(encodeURIComponent(value))
    }
    const [request, loggedResponse] = logs.entries()
    expect(request.details.headers.authorization).toBe("[REDACTED]")
    expect(request.details.headers["user-agent"]).toBe("Dart/3.12 (dart:io)")
    expect(JSON.parse(request.details.body.json_data).odin_user_log_nr).toBe(42)
    expect(loggedResponse.details.status).toBe(403)
    expect(loggedResponse.details.headers["x-request-id"]).toBe(
      "upstream-request-id"
    )
    expect(loggedResponse.details.body.dive.odin_user_log_nr).toBe(42)
  })

  it("redacts repeated query credentials and URL userinfo from echoed errors", async () => {
    const logs = debugLogs()
    const url =
      "https://name:private-pass@api.divessi.com/app/a21.php?token=first-token&token=second-token&l=user%40example.com"
    const error = new Error(
      `Failed ${url}; first-token second-token private-pass`
    )
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(error))

    await expect(ssiFetch(url)).rejects.toBe(error)
    for (const value of [
      "first-token",
      "second-token",
      "private-pass",
      "user@example.com",
    ]) {
      expect(logs.text()).not.toContain(value)
    }
    const [request, failure] = logs.entries()
    expect(failure.event).toBe("error")
    expect(failure.requestId).toBe(request.requestId)
  })

  it("redacts sensitive assignments in non-JSON error bodies", async () => {
    const logs = debugLogs()
    const response = new Response(
      'Failure: "password": "body-secret", token=body-token; Bearer standalone-credential; user=diver%40example.com; echo body-secret body-token standalone-credential',
      { status: 500, headers: { "content-type": "text/plain" } }
    )
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response))
    await ssiFetch("https://api.divessi.com/app/a21.php")
    for (const value of [
      "body-secret",
      "body-token",
      "standalone-credential",
      "diver%40example.com",
    ]) {
      expect(logs.text()).not.toContain(value)
    }
    expect(logs.entries()[1].details.body).toContain("Failure")
  })

  it("logs cache downloads without reading binary bodies into diagnostics", async () => {
    const logs = debugLogs()
    vi.stubEnv("SSI_DEBUG_HTTP", "1")
    const archive = zipSync({ "sites.json": strToU8('{"divesites":[]}') })
    const response = new Response(new Blob([archive.buffer as ArrayBuffer]), {
      headers: {
        "content-type": "application/zip",
        "content-length": String(archive.length),
      },
    })
    const clone = vi.spyOn(response, "clone")
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response))
    const directory = await mkdtemp(join(tmpdir(), "ssi-debug-test-"))
    try {
      await ensureSsiDataSource(directory, {
        url: "https://api.divessi.com/app/APP_CACHE_SITES.zip",
        zipFileName: "sites.zip",
        jsonFileName: "sites.json",
      })
      expect(await readFile(join(directory, "sites.json"), "utf8")).toBe(
        '{"divesites":[]}'
      )
      expect(clone).not.toHaveBeenCalled()
      expect(logs.entries()[1].details.body).toBe("[binary body omitted]")
      expect(logs.entries()[1].details.headers["content-length"]).toBe(
        String(archive.length)
      )
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })

  it("preserves the original response when its clone cannot be read", async () => {
    const logs = debugLogs()
    const response = Response.json({ ok: true })
    vi.spyOn(response, "clone").mockImplementation(() => {
      throw new Error("Cannot clone")
    })
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response))
    expect(await ssiFetch("https://api.divessi.com/app/a21.php")).toBe(response)
    expect(await response.json()).toEqual({ ok: true })
    expect(logs.entries()[1].details.body).toBe("[response body unavailable]")
  })
})
