import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { queryOptions } from "@tanstack/react-query"
import { createServerFn } from "@tanstack/react-start"
import z from "zod"
import { env } from "@/lib/env"
import type { Divesite } from "./sites"
import { SSI_SITES_SOURCE } from "./sources"

const MAX_RESULTS = 20

let sitesPromise: Promise<Divesite[]> | undefined

/** Lazily reads + caches the (large) dive sites JSON so we only parse it once per process. */
async function loadSites(): Promise<Divesite[]> {
  if (!sitesPromise) {
    sitesPromise = readFile(
      join(env.DATA_DIR, SSI_SITES_SOURCE.jsonFileName),
      "utf-8"
    ).then((raw) => JSON.parse(raw).divesites as Divesite[])
  }
  return sitesPromise
}

export const searchSsiSites = createServerFn({ method: "GET" })
  .validator(z.object({ query: z.string() }))
  .handler(async (ctx) => {
    const query = ctx.data.query.trim().toLowerCase()
    if (query.length < 2) return []

    const sites = await loadSites()

    const results: SiteSearchResult[] = []
    for (const site of sites) {
      if (typeof site.odin_dive_sites_name !== "string") continue
      if (!site.odin_dive_sites_name.toLowerCase().includes(query)) continue

      results.push({
        odin_dive_sites_id: site.odin_dive_sites_id,
        odin_dive_sites_name: site.odin_dive_sites_name,
        odin_dive_sites_meta_country: site.odin_dive_sites_meta_country,
      })
      if (results.length >= MAX_RESULTS) break
    }

    return results
  })

export interface SiteSearchResult {
  odin_dive_sites_id: number
  odin_dive_sites_name: string
  odin_dive_sites_meta_country: string
}

export function ssiSiteSearchOptions(query: string) {
  return queryOptions({
    queryKey: ["ssi", "site-search", query],
    queryFn: (ctx) => searchSsiSites({ data: { query }, signal: ctx.signal }),
    enabled: query.trim().length >= 2,
  })
}
