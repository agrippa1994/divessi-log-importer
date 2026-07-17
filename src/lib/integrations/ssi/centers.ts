import { queryOptions } from "@tanstack/react-query"
import { loadOrFetchCachedZip } from "./cache"

const CENTERS_URL =
  "https://api.divessi.com/app/APP_CACHE_CENTER.zip?ssiapp=0815_ADR&lang=en&version=ADR_4.1.268-ssi&context=s"

export interface DiveCenter {
  [key: string]: unknown
}

export function ssiCentersOptions() {
  return queryOptions({
    queryKey: ["ssi", "centers"],
    queryFn: () =>
      loadOrFetchCachedZip<DiveCenter[]>(
        CENTERS_URL,
        "ssi-centers.zip",
        "ssi-centers.json"
      ),
  })
}
