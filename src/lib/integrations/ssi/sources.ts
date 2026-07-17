export interface SsiDataSource {
  url: string
  zipFileName: string
  jsonFileName: string
}

export const SSI_SITES_SOURCE: SsiDataSource = {
  url: "https://api.divessi.com/app/APP_CACHE_SITES.zip?ssiapp=0815_ADR&lang=en&version=ADR_4.1.268-ssi&context=s",
  zipFileName: "ssi-sites.zip",
  jsonFileName: "ssi-sites.json",
}

export const SSI_CENTERS_SOURCE: SsiDataSource = {
  url: "https://api.divessi.com/app/APP_CACHE_CENTER.zip?ssiapp=0815_ADR&lang=en&version=ADR_4.1.268-ssi&context=s",
  zipFileName: "ssi-centers.zip",
  jsonFileName: "ssi-centers.json",
}

export const SSI_DATA_SOURCES: SsiDataSource[] = [
  SSI_SITES_SOURCE,
  SSI_CENTERS_SOURCE,
]
