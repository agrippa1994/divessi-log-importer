import { useForm } from "@tanstack/react-form"
import { useMutation, useQuery } from "@tanstack/react-query"
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { ArrowLeftIcon, Trash2Icon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import z from "zod"
import { DiveSiteField } from "@/components/dives/dive-site-field"
import { DiveUploadField } from "@/components/dives/dive-upload-field"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FieldGroup } from "@/components/ui/field"
import { useFileUpload } from "@/hooks/use-file-upload"
import type { CreateDive } from "@/lib/integrations/ssi/create-dive"
import { ssiCreateDiveOptions } from "@/lib/integrations/ssi/create-dive"
import { ssiDivesOptions } from "@/lib/integrations/ssi/dives"
import {
  convertSuuntoToSSI,
  extractSuuntoGps,
} from "@/lib/integrations/suunto/converter"
import { suuntoDiveLogSchema } from "@/lib/integrations/suunto/schema"
import { isLoggedIn } from "@/lib/session"

export const Route = createFileRoute("/import")({
  component: ImportPage,
  beforeLoad: async () => {
    const session = await isLoggedIn()
    if (!session.ssiToken) {
      throw redirect({ to: "/login" })
    }
  },
})

const diveEntrySchema = z.object({
  id: z.string(),
  fileName: z.string(),
  contents: suuntoDiveLogSchema,
  site: z.object({
    odin_dive_sites_id: z.number(),
    odin_dive_sites_name: z.string(),
  }),
})

type DiveEntry = z.infer<typeof diveEntrySchema>

const schema = z.object({
  dives: z.array(diveEntrySchema).min(1),
})

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
})

function formatDuration(totalSeconds: number) {
  return `${Math.round(totalSeconds / 60)} min`
}

/** Sort dives ascending by their recorded start time. */
function sortByStartTime(dives: DiveEntry[]): DiveEntry[] {
  return [...dives].sort(
    (a, b) =>
      new Date(a.contents.DeviceLog.Header.DateTime).getTime() -
      new Date(b.contents.DeviceLog.Header.DateTime).getTime()
  )
}

function ImportPage() {
  const navigate = useNavigate()
  const [fileError, setFileError] = useState<string | null>(null)

  const dives = useQuery(ssiDivesOptions())
  const createDive = useMutation(ssiCreateDiveOptions())

  const form = useForm({
    validators: { onChange: schema },
    defaultValues: { dives: [] as DiveEntry[] },
    onSubmit: async ({ value }) => {
      const baseNr =
        (dives.data?.logbook_details.at(-1)?.odin_user_log_nr ?? 0) + 1

      try {
        // Dives are already sorted ascending, so log numbers stay in order.
        for (const [index, entry] of value.dives.entries()) {
          const dive: CreateDive = {
            ...convertSuuntoToSSI(entry.contents),
            odin_user_log_nr: baseNr + index,
            odin_user_log_id: null,
            odin_user_log_dive_sites_id: entry.site.odin_dive_sites_id,
          }

          await createDive.mutateAsync({ dive })
        }
      } catch {
        toast.error("Could not import the dives. Please try again.")
        return
      }

      const count = value.dives.length
      toast.success(count > 1 ? `Imported ${count} dives` : "Imported 1 dive")
      await navigate({ to: "/" })
    },
  })

  const [, fileActions] = useFileUpload({
    accept: "application/json",
    multiple: true,
    onFilesAdded: async (added) => {
      const parsed = await Promise.all(
        added.map(async (fileItem): Promise<DiveEntry | null> => {
          if (!(fileItem.file instanceof File)) return null
          try {
            const result = suuntoDiveLogSchema.safeParse(
              JSON.parse(await fileItem.file.text())
            )
            if (!result.success) return null
            return {
              id: crypto.randomUUID() as string,
              fileName: fileItem.file.name,
              contents: result.data,
              site: null as unknown as DiveEntry["site"],
            }
          } catch {
            return null
          }
        })
      )

      const valid = parsed.filter((entry): entry is DiveEntry => entry !== null)

      if (valid.length < added.length) {
        setFileError(
          "Some files couldn't be read or aren't valid Suunto dive logs."
        )
      } else {
        setFileError(null)
      }

      if (valid.length === 0) return

      const current = form.getFieldValue("dives") ?? []
      form.setFieldValue("dives", sortByStartTime([...current, ...valid]))
    },
  })

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-10 flex items-center gap-2 border-b bg-background/80 px-4 py-3 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="icon"
          className="-ml-2 rounded-full"
          onClick={() => navigate({ to: "/" })}
        >
          <ArrowLeftIcon />
          <span className="sr-only">Back</span>
        </Button>
        <h1 className="font-heading text-base font-medium">Import dives</h1>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        <p className="mb-6 text-sm text-muted-foreground">
          Import one or more dives from Suunto dive log exports.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field name="dives" mode="array">
              {(field) => (
                <>
                  <DiveUploadField
                    fileActions={fileActions}
                    fileError={fileError}
                    hasDives={field.state.value.length > 0}
                  />

                  {field.state.value.map((dive, i) => (
                    <Card key={dive.id} size="sm">
                      <CardContent className="flex flex-col gap-4">
                        <div className="flex items-start justify-between gap-2">
                          <span className="truncate text-sm text-muted-foreground">
                            {dive.fileName}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => field.removeValue(i)}
                          >
                            <Trash2Icon data-icon="inline-start" />
                            Remove
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-muted-foreground">
                              Date
                            </span>
                            <span className="font-medium">
                              {dateTimeFormatter.format(
                                new Date(
                                  dive.contents.DeviceLog.Header.DateTime
                                )
                              )}
                            </span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-muted-foreground">
                              Max depth
                            </span>
                            <span className="font-medium">
                              {dive.contents.DeviceLog.Header.Depth.Max} m
                            </span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-muted-foreground">
                              Avg depth
                            </span>
                            <span className="font-medium">
                              {dive.contents.DeviceLog.Header.DepthAverage.toFixed(
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
                                dive.contents.DeviceLog.Header.Duration
                              )}
                            </span>
                          </div>
                        </div>

                        <form.Field name={`dives[${i}].site`}>
                          {(siteField) => (
                            <DiveSiteField
                              gps={extractSuuntoGps(dive.contents)}
                              value={siteField.state.value}
                              onChange={(s) =>
                                siteField.handleChange(s as DiveEntry["site"])
                              }
                              invalid={siteField.state.meta.errors.length > 0}
                            />
                          )}
                        </form.Field>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
            </form.Field>
          </FieldGroup>

          <div className="mt-6 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: "/" })}
            >
              Cancel
            </Button>
            <form.Subscribe
              selector={(s) => ({
                canSubmit: s.canSubmit && s.isDirty,
                isSubmitting: s.isSubmitting,
                diveCount: s.values.dives.length,
              })}
            >
              {(s) => (
                <Button type="submit" disabled={!s.canSubmit || s.isSubmitting}>
                  {s.isSubmitting
                    ? "Importing…"
                    : s.diveCount > 1
                      ? `Import ${s.diveCount} dives`
                      : "Import dive"}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </main>
    </div>
  )
}
