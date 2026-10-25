import { createClient, type JsonValue } from "divessi-client"
import { ssiFetch } from "./http"

// A client owns its token, so each server request gets an isolated instance.
export function createSsiClient(token?: string) {
  return createClient({ token, metadata: { lang: "en" }, fetch: ssiFetch })
}

export function assertSsiAuthenticated(data: JsonValue) {
  if (
    data !== null &&
    typeof data === "object" &&
    !Array.isArray(data) &&
    data.authenticated === false
  ) {
    throw new Error(
      typeof data.authenticated_message === "string"
        ? data.authenticated_message
        : "SSI authentication failed"
    )
  }
}
