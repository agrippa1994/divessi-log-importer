import { queryOptions } from "@tanstack/react-query"
import { createServerFn } from "@tanstack/react-start"
import { getSSIToken } from "@/lib/session.server"
import { createSsiClient } from "./api"
import { decodeSsiDivelog } from "./responses"

export type { LogbookDetail, LogbookStats } from "./responses"

export const getSSIDives = createServerFn({ method: "GET" }).handler(
  async () => {
    const { data } = await createSsiClient(await getSSIToken()).get_divelog(
      undefined,
      { decode: decodeSsiDivelog }
    )
    return data
  }
)

export function ssiDivesOptions() {
  return queryOptions({
    queryKey: ["ssi", "dives"],
    queryFn: (ctx) => getSSIDives({ signal: ctx.signal }),
    // Never show a cached logbook; always load it fresh from SSI
    gcTime: 0,
  })
}
