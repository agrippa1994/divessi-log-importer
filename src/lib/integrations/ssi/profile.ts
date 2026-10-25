import { queryOptions } from "@tanstack/react-query"
import { createServerFn } from "@tanstack/react-start"
import { getSSIToken } from "@/lib/session.server"
import { createSsiClient } from "./api"
import { decodeSsiProfile } from "./responses"

export const getSSIProfile = createServerFn({ method: "GET" }).handler(
  async () => {
    const { data } = await createSsiClient(await getSSIToken()).get_user_data(
      undefined,
      { decode: decodeSsiProfile }
    )
    return data
  }
)

export function ssiProfileOptions() {
  return queryOptions({
    queryKey: ["ssi", "profile"],
    queryFn: (ctx) => getSSIProfile({ signal: ctx.signal }),
  })
}
