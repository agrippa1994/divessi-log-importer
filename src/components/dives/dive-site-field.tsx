import { useDebouncedValue } from "@tanstack/react-pacer"
import { useQuery } from "@tanstack/react-query"
import { MapPinIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompleteStatus,
} from "@/components/reui/autocomplete"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import type { SiteSearchResult } from "@/lib/integrations/ssi/site-search"
import {
  ssiNearestSiteOptions,
  ssiSiteSearchOptions,
} from "@/lib/integrations/ssi/site-search"

/** The subset of a site we persist on a dive (search results are a superset). */
type SelectedSite = {
  odin_dive_sites_id: number
  odin_dive_sites_name: string
}

/**
 * Dive-site picker for a single dive. Owns its own search query state and
 * auto-fills the nearest site from the dive's GPS when no site is selected yet.
 */
export function DiveSiteField({
  gps,
  value,
  onChange,
  invalid,
}: {
  gps: { latitude: number; longitude: number } | null
  value: SelectedSite | null
  onChange: (site: SiteSearchResult | null) => void
  invalid?: boolean
}) {
  const [siteQuery, setSiteQuery] = useState(value?.odin_dive_sites_name ?? "")
  const [debouncedSiteQuery] = useDebouncedValue(siteQuery, { wait: 300 })

  const siteResults = useQuery(ssiSiteSearchOptions(debouncedSiteQuery))
  const nearestSite = useQuery(
    ssiNearestSiteOptions(gps?.latitude ?? null, gps?.longitude ?? null)
  )

  // Auto-fill from GPS only once, so clearing the site via "Change" sticks
  // instead of being immediately re-filled from the same nearest-site result.
  const autoFilledRef = useRef(false)
  useEffect(() => {
    const site = nearestSite.data
    if (site && !value && !autoFilledRef.current) {
      autoFilledRef.current = true
      onChange(site)
      setSiteQuery(site.odin_dive_sites_name)
    }
  }, [nearestSite.data, value, onChange])

  return (
    <Field data-invalid={invalid}>
      <FieldLabel>
        <MapPinIcon data-icon="inline-start" />
        Dive site
      </FieldLabel>

      {value ? (
        <div className="flex items-center justify-between gap-2 rounded-2xl border px-3 py-2">
          <span className="truncate font-medium">
            {value.odin_dive_sites_name}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              onChange(null)
              setSiteQuery("")
            }}
          >
            Change
          </Button>
        </div>
      ) : (
        <Autocomplete
          items={siteResults.data ?? []}
          value={siteQuery}
          onValueChange={setSiteQuery}
          itemToStringValue={(item: unknown) =>
            (item as SiteSearchResult).odin_dive_sites_name
          }
          filter={null}
        >
          <AutocompleteInput placeholder="Search dive sites…" />
          {siteQuery.trim().length >= 2 && (
            <AutocompleteContent>
              <AutocompleteStatus>
                {siteResults.isFetching
                  ? "Searching…"
                  : (siteResults.data?.length ?? 0) === 0
                    ? `No sites found for "${siteQuery}"`
                    : ""}
              </AutocompleteStatus>
              <AutocompleteList>
                {(item: SiteSearchResult) => (
                  <AutocompleteItem
                    key={item.odin_dive_sites_id}
                    value={item}
                    onClick={() => {
                      onChange(item)
                      setSiteQuery(item.odin_dive_sites_name)
                    }}
                  >
                    <div className="flex flex-col">
                      <span>{item.odin_dive_sites_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.odin_dive_sites_meta_country}
                      </span>
                    </div>
                  </AutocompleteItem>
                )}
              </AutocompleteList>
            </AutocompleteContent>
          )}
        </Autocomplete>
      )}
    </Field>
  )
}
