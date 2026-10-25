import { createEnv } from "@t3-oss/env-core"
import * as z from "zod"

export const env = createEnv({
  server: {
    SESSION_SECRET: z.string().min(32),
    NODE_ENV: z.string().optional(),
    DATA_DIR: z.string().default("./data"),
    SSI_DEBUG_HTTP: z.enum(["true", "false", "1", "0"]).default("false"),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})
