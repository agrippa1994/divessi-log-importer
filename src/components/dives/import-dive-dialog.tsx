import { useForm, useStore } from "@tanstack/react-form"
import { useDebouncedValue } from "@tanstack/react-pacer"
import { useMutation, useQuery } from "@tanstack/react-query"
import { CircleAlertIcon, FileIcon, MapPinIcon, PlusIcon } from "lucide-react"
import { useEffect, useState } from "react"
import z from "zod"
import { Alert, AlertDescription, AlertTitle } from "@/components/reui/alert"
import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompleteStatus,
} from "@/components/reui/autocomplete"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { useFileUpload } from "@/hooks/use-file-upload"
import type { CreateDive } from "@/lib/integrations/ssi/create-dive"
import { ssiCreateDiveOptions } from "@/lib/integrations/ssi/create-dive"
import { ssiDivesOptions } from "@/lib/integrations/ssi/dives"
import type { SiteSearchResult } from "@/lib/integrations/ssi/site-search"
import {
  ssiNearestSiteOptions,
  ssiSiteSearchOptions,
} from "@/lib/integrations/ssi/site-search"
import {
  convertSuuntoToSSI,
  extractSuuntoGps,
} from "@/lib/integrations/suunto/converter"
import { suuntoDiveLogSchema } from "@/lib/integrations/suunto/schema"

const schema = z.object({
  dive: z.object({
    fileName: z.string(),
    contents: suuntoDiveLogSchema,
  }),
  site: z.object({
    odin_dive_sites_id: z.number(),
    odin_dive_sites_name: z.string(),
  }),
})

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
})

function formatDuration(totalSeconds: number) {
  return `${Math.round(totalSeconds / 60)} min`
}

export function ImportDiveDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [siteQuery, setSiteQuery] = useState("")
  const [fileError, setFileError] = useState<string | null>(null)
  const [debouncedSiteQuery] = useDebouncedValue(siteQuery, { wait: 300 })

  const dives = useQuery(ssiDivesOptions())
  const siteResults = useQuery(ssiSiteSearchOptions(debouncedSiteQuery))
  const createDive = useMutation(ssiCreateDiveOptions())

  const form = useForm({
    validators: { onChange: schema },
    defaultValues: { dive: null, site: null } as unknown as z.infer<
      typeof schema
    >,
    onSubmit: async ({ value }) => {
      const nextNr =
        (dives.data?.logbook_details.at(-1)?.odin_user_log_nr ?? 0) + 1

      const dive: CreateDive = {
        ...convertSuuntoToSSI(value.dive.contents),
        odin_user_log_nr: nextNr,
        odin_user_log_id: null,
        odin_user_log_dive_sites_id: value.site.odin_dive_sites_id,
      }

      await createDive.mutateAsync({ dive })
      handleOpenChange(false)
    },
  })

  const uploadedDive = useStore(form.store, (s) => s.values.dive)
  const gps = uploadedDive ? extractSuuntoGps(uploadedDive.contents) : null
  const nearestSite = useQuery(
    ssiNearestSiteOptions(gps?.latitude ?? null, gps?.longitude ?? null)
  )

  useEffect(() => {
    const site = nearestSite.data
    if (site && !form.getFieldValue("site")) {
      form.setFieldValue("site", site)
      setSiteQuery(site.odin_dive_sites_name)
    }
  }, [nearestSite.data, form])

  const [, fileActions] = useFileUpload({
    accept: "application/json",
    multiple: false,
    maxFiles: 1,
    onFilesAdded: (added) => {
      const fileItem = added[0]
      if (!fileItem || !(fileItem.file instanceof File)) return

      fileItem.file
        .text()
        .then((text) => {
          const parsed = suuntoDiveLogSchema.safeParse(JSON.parse(text))
          if (!parsed.success) {
            setFileError("This doesn't look like a valid Suunto dive log.")
            return
          }
          setFileError(null)
          form.setFieldValue("dive", {
            fileName: fileItem.file.name,
            contents: parsed.data,
          })
        })
        .catch(() => {
          setFileError("Could not read the selected file.")
        })
    },
  })

  function handleOpenChange(next: boolean) {
    if (!next) {
      form.reset()
      fileActions.clearFiles()
      setSiteQuery("")
      setFileError(null)
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import dive</DialogTitle>
          <DialogDescription>
            Import a dive from a Suunto dive log export.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field name="dive">
              {(field) => {
                const value = field.state.value

                return (
                  <Field data-invalid={field.state.meta.errors.length > 0}>
                    <FieldLabel>
                      <FileIcon data-icon="inline-start" />
                      Suunto dive log
                    </FieldLabel>

                    <div className="flex items-center gap-3 rounded-2xl border border-dashed p-3">
                      <Button
                        type="button"
                        size="sm"
                        onClick={fileActions.openFileDialog}
                      >
                        <PlusIcon data-icon="inline-start" />
                        {value ? "Change file" : "Add file"}
                      </Button>
                      <input
                        {...fileActions.getInputProps()}
                        className="sr-only"
                      />

                      {value ? (
                        <span className="truncate text-sm text-muted-foreground">
                          {value.fileName}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Drop a JSON file here or click to browse
                        </span>
                      )}
                    </div>

                    {fileError && (
                      <Alert variant="destructive">
                        <CircleAlertIcon />
                        <AlertTitle>Invalid file</AlertTitle>
                        <AlertDescription>{fileError}</AlertDescription>
                      </Alert>
                    )}

                    {value && (
                      <Card size="sm">
                        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-muted-foreground">
                              Date
                            </span>
                            <span className="font-medium">
                              {dateTimeFormatter.format(
                                new Date(
                                  value.contents.DeviceLog.Header.DateTime
                                )
                              )}
                            </span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-muted-foreground">
                              Max depth
                            </span>
                            <span className="font-medium">
                              {value.contents.DeviceLog.Header.Depth.Max} m
                            </span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-muted-foreground">
                              Avg depth
                            </span>
                            <span className="font-medium">
                              {value.contents.DeviceLog.Header.DepthAverage.toFixed(
                                1
                              )}{" "}
                              m
                            </span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-muted-foreground">
                              Duration
                            </span>
                            <span className="font-medium">
                              {formatDuration(
                                value.contents.DeviceLog.Header.Duration
                              )}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </Field>
                )
              }}
            </form.Field>

            <form.Field name="site">
              {(field) => {
                const selected = field.state.value

                return (
                  <Field data-invalid={field.state.meta.errors.length > 0}>
                    <FieldLabel>
                      <MapPinIcon data-icon="inline-start" />
                      Dive site
                    </FieldLabel>

                    {selected ? (
                      <div className="flex items-center justify-between gap-2 rounded-2xl border px-3 py-2">
                        <span className="truncate font-medium">
                          {selected.odin_dive_sites_name}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            field.handleChange(
                              null as unknown as SiteSearchResult
                            )
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
                                    field.handleChange(item)
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
              }}
            </form.Field>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <form.Subscribe
              selector={(s) => ({
                canSubmit: s.canSubmit && s.isDirty,
                isSubmitting: s.isSubmitting,
              })}
            >
              {(s) => (
                <Button
                  type="submit"
                  disabled={!s.canSubmit || createDive.isPending}
                >
                  {createDive.isPending ? "Importing…" : "Import dive"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
