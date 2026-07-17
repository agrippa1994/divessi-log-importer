import { definePlugin } from "nitro"
import { env } from "@/lib/env"
import { ensureSsiDataSource } from "@/lib/integrations/ssi/download.server"
import { SSI_DATA_SOURCES } from "@/lib/integrations/ssi/sources"

export default definePlugin(() => {
  for (const source of SSI_DATA_SOURCES) {
    ensureSsiDataSource(env.DATA_DIR, source).catch((err) => {
      console.error(`[ssi-data] failed to prepare ${source.jsonFileName}:`, err)
    })
  }
})
