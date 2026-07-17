import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { suuntoDiveLogSchema } from "./schema"

describe("Suunto dive log schema", () => {
  it.each(["5.json", "4.json", "3.json", "2.json", "6.json"])(
    "should parse %s",
    async (x) => {
      const contents = await readFile(
        join(
          import.meta.dirname,
          "..",
          "..",
          "..",
          "..",
          "samples",
          "suunto",
          x
        ),
        {
          encoding: "utf-8",
        }
      )
      const data = JSON.parse(contents)

      const log = await suuntoDiveLogSchema.safeParseAsync(data)
      expect(log.error).toBeFalsy()
      expect(log.success).toBe(true)
    }
  )
})
