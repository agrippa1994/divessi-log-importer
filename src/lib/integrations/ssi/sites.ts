/** biome-ignore-all lint/suspicious/noExplicitAny: interface */
import { queryOptions } from "@tanstack/react-query"
import { loadOrFetchCachedZip } from "./cache"

const SITES_URL =
  "https://api.divessi.com/app/APP_CACHE_SITES.zip?ssiapp=0815_ADR&lang=en&version=ADR_4.1.268-ssi&context=s"

export interface Root {
  created: string
  divesites_total: number
  divesites_locked_total: number
  divesites_deleted_total: number
  divesites: Divesite[]
}

export interface Divesite {
  odin_dive_sites_id: number
  odin_dive_sites_name: any
  odin_countries_code_iso: string
  odin_dive_sites_meta_address: any
  odin_dive_sites_lat: number
  odin_dive_sites_lon: number
  odin_dive_sites_geo_locked: number
  odin_dive_sites_is_private: number
  odin_dive_sites_deleted: any
  odin_dive_sites_alias_ids: any
  timestamp: string
  odin_dive_sites_meta_country: string
  odin_dive_sites_meta_region: string
  odin_dive_sites_comment: any
  iso2: string
  odin_user_log_animal_ids: number[]
  bow?: string
  current?: Current
  alias_names_search?: string
  alias_names?: string[]
  odin_dive_sites_is_private_owner?: number
}

export interface Current {
  no_current?: number
  light_current?: number
  strong_current?: number
  ripping_current?: number
}

export function ssiSitesOptions() {
  return queryOptions({
    queryKey: ["ssi", "sites"],
    queryFn: () =>
      loadOrFetchCachedZip<Root>(SITES_URL, "ssi-sites.zip", "ssi-sites.json"),
  })
}
