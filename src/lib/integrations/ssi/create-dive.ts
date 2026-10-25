import { mutationOptions } from "@tanstack/react-query"
import { createServerFn } from "@tanstack/react-start"
import type { DiveLog } from "divessi-client"
import z from "zod"
import { getSSIToken } from "@/lib/session.server"
import { createSsiClient } from "./api"
import { uploadSsiDive } from "./upload"

export const saveSsiDive = createServerFn({ method: "POST" })
  .validator(z.object({ dive: z.custom<DiveLog>() }))
  .handler(async (ctx) => {
    const client = createSsiClient(await getSSIToken())
    return uploadSsiDive(client, ctx.data.dive)
  })

export function ssiCreateDiveOptions() {
  return mutationOptions({
    mutationFn: async (variables: { dive: DiveLog }) => {
      return await saveSsiDive({ data: variables })
    },
    onSuccess: async (_data, _variables, _onMutateResult, context) => {
      await context.client.invalidateQueries({ queryKey: ["ssi", "dives"] })
    },
  })
}
