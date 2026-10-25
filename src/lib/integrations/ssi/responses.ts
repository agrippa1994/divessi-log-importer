import type { JsonValue } from "divessi-client"
import z from "zod"
import { assertSsiAuthenticated } from "./api"

// The API returns numeric flags in existing logbooks, whereas the library's
// recovered iOS models expect booleans. Validate the fields this app consumes.
const logbookDetailSchema = z.object({
  odin_user_log_id: z.number().nullable(),
  odin_user_log_nr: z.number(),
  odin_user_log_datetime: z.string(),
  odin_user_log_deleted: z
    .union([z.boolean(), z.literal(0), z.literal(1)])
    .transform(Number),
  odin_user_log_dive_sites_id: z.number(),
  odin_user_log_depth_m: z.number(),
  odin_user_log_avg_depth_m: z.number().nullish(),
  odin_user_log_divetime: z.number(),
  odin_user_log_watertemp_c: z.number().nullish(),
})

const logbookStatsSchema = z.object({
  myLoggedDives: z.number(),
  myAverageMaxDepth: z.number(),
  myMaxDepth: z.number(),
  myAverageDivetime: z.number(),
  myVisitedSites: z.number(),
})

const divelogSchema = z.object({
  // Require a real logbook before making duplicate checks or assigning numbers.
  logbook_details: z.array(logbookDetailSchema),
  logbook_sites: z.array(
    z.object({
      odin_dive_sites_id: z.number(),
      odin_dive_sites_name: z.string(),
      odin_dive_sites_meta_country: z.string(),
    })
  ),
  logbook_stats: logbookStatsSchema,
})

const profileSchema = z.object({
  user_forename: z.string().nullish(),
  user_lastname: z.string().nullish(),
  user_image: z
    .string()
    .nullish()
    .transform((value) => value ?? undefined),
})

export type LogbookDetail = z.infer<typeof logbookDetailSchema>
export type LogbookStats = z.infer<typeof logbookStatsSchema>

export function decodeSsiDivelog(data: JsonValue) {
  assertSsiAuthenticated(data)
  return divelogSchema.parse(data)
}

export function decodeSsiProfile(data: JsonValue) {
  assertSsiAuthenticated(data)
  return profileSchema.parse(data)
}
