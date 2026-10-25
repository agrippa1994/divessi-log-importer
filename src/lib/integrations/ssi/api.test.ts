import { readFileSync } from "node:fs"
import type { JsonValue } from "divessi-client"
import { afterEach, describe, expect, it, vi } from "vitest"
import { convertSuuntoToSSI } from "../suunto/converter"
import { createSsiClient } from "./api"
import { decodeSsiDivelog, decodeSsiProfile } from "./responses"
import { uploadSsiDive } from "./upload"

const storedDive = JSON.parse(
  readFileSync(
    new URL("../../../../samples/ssi/dive.json", import.meta.url),
    "utf8"
  )
)

function logbook(details: JsonValue[] = []) {
  return {
    logbook_details: details,
    logbook_sites: [],
    logbook_stats: {
      myLoggedDives: details.length,
      myAverageMaxDepth: 12,
      myMaxDepth: 24,
      myAverageDivetime: 45,
      myVisitedSites: 1,
    },
  }
}

function mockResponses(...responses: JsonValue[]) {
  const fetch = vi.fn(async (_url: string, _init?: RequestInit) => {
    if (responses.length === 0) throw new Error("Unexpected SSI request")
    return new Response(JSON.stringify(responses.shift()), {
      status: 200,
      headers: { "content-type": "application/json" },
    })
  })
  vi.stubGlobal("fetch", fetch)
  return fetch
}

function convertedDive(file = "2.json") {
  return {
    ...convertSuuntoToSSI(
      JSON.parse(
        readFileSync(
          new URL(`../../../../samples/suunto/${file}`, import.meta.url),
          "utf8"
        )
      )
    ),
    odin_user_log_nr: 126,
    odin_user_log_dive_sites_id: 123,
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe("SSI client integration", () => {
  it("keeps login tokens isolated between users", async () => {
    const fetch = mockResponses(
      { authenticated: true, token: "first-token" },
      { user_forename: "Diver" },
      { user_forename: "Other diver" }
    )
    const first = createSsiClient()
    const second = createSsiClient("second-token")
    await first.login({ l: "diver@example.com", p: "test-password" })
    await first.get_user_data(undefined, { decode: decodeSsiProfile })
    await second.get_user_data(undefined, { decode: decodeSsiProfile })

    const urls = fetch.mock.calls.map(([url]) => new URL(url))
    expect(urls[0].searchParams.has("token")).toBe(false)
    expect(urls[1].searchParams.get("token")).toBe("first-token")
    expect(urls[2].searchParams.get("token")).toBe("second-token")
  })

  it.each([false, true, 0, 1])(
    "accepts the logbook deletion flag %s",
    (flag) => {
      const result = decodeSsiDivelog(
        logbook([{ ...storedDive, odin_user_log_deleted: flag }])
      )
      expect(result.logbook_details[0].odin_user_log_deleted).toBe(Number(flag))
    }
  )

  it("rejects an expired session before treating its response as a logbook", async () => {
    const fetch = mockResponses({
      authenticated: false,
      authenticated_message: "Session expired",
    })
    await expect(
      uploadSsiDive(createSsiClient("expired-token"), convertedDive())
    ).rejects.toThrow("Session expired")
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it("rejects incomplete logbooks before uploading", async () => {
    const fetch = mockResponses({})
    await expect(
      uploadSsiDive(createSsiClient("token"), convertedDive())
    ).rejects.toThrow()
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it.each([undefined, null, 123, ""])(
    "rejects a dive with datetime %s before making requests",
    async (datetime) => {
      const fetch = mockResponses()
      await expect(
        uploadSsiDive(createSsiClient("token"), {
          ...convertedDive(),
          odin_user_log_datetime: datetime,
        })
      ).rejects.toThrow("Dive start datetime is required")
      expect(fetch).not.toHaveBeenCalled()
    }
  )

  it("skips an existing dive when its stored datetime uses a space", async () => {
    const dive = convertedDive()
    const fetch = mockResponses(
      logbook([
        {
          ...storedDive,
          odin_user_log_datetime: dive.odin_user_log_datetime
            .replace("+", " ")
            .slice(0, 16),
          odin_user_log_deleted: 0,
        },
      ])
    )
    await expect(
      uploadSsiDive(createSsiClient("token"), dive)
    ).resolves.toEqual({
      skipped: true,
    })
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it.each(["2.json", "3.json", "4.json", "5.json", "6.json"])(
    "uploads converted %s as one form-encoded JSON payload and verifies it",
    async (file) => {
      const dive = convertedDive(file)
      const stored = {
        ...storedDive,
        odin_user_log_datetime: dive.odin_user_log_datetime,
        odin_user_log_deleted: false,
      }
      const fetch = mockResponses(
        logbook(),
        { success: true },
        logbook([stored])
      )

      await expect(
        uploadSsiDive(createSsiClient("token"), dive)
      ).resolves.toEqual({
        skipped: false,
      })
      expect(fetch.mock.calls.map(([, init]) => init?.method)).toEqual([
        "GET",
        "POST",
        "GET",
      ])
      const [url, init] = fetch.mock.calls[1]
      expect(new URL(url).searchParams.get("what")).toBe("save_divelog")
      expect(new URL(url).searchParams.get("token")).toBe("token")
      expect(new Headers(init?.headers).get("user-agent")).toBe(
        "Dart/3.12 (dart:io)"
      )
      const form = new URLSearchParams(String(init?.body))
      expect([...form.keys()]).toEqual(["json_data"])
      expect(JSON.parse(form.get("json_data") ?? "null")).toEqual(dive)
    }
  )

  it("rejects a successful save response if the dive was silently dropped", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    mockResponses(logbook(), { success: true }, logbook())
    await expect(
      uploadSsiDive(createSsiClient("token"), convertedDive())
    ).rejects.toThrow("Dive #126 was not stored by SSI")
  })

  it("rejects a save that returns an authentication failure with HTTP 200", async () => {
    const fetch = mockResponses(logbook(), {
      authenticated: false,
      authenticated_message: "Session expired",
    })
    await expect(
      uploadSsiDive(createSsiClient("token"), convertedDive())
    ).rejects.toThrow("Session expired")
    expect(fetch).toHaveBeenCalledTimes(2)
  })
})
