import { CircleAlertIcon, FileIcon, PlusIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/reui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import type { FileUploadActions } from "@/hooks/use-file-upload"

/**
 * File picker + drop zone for Suunto dive log exports. Supports selecting
 * multiple files at once; parsing/validation is handled by the caller.
 */
export function DiveUploadField({
  fileActions,
  fileError,
  hasDives,
}: {
  fileActions: FileUploadActions
  fileError: string | null
  hasDives: boolean
}) {
  return (
    <Field>
      <FieldLabel>
        <FileIcon data-icon="inline-start" />
        Suunto dive logs
      </FieldLabel>

      <div className="flex items-center gap-3 rounded-2xl border border-dashed p-3">
        <Button type="button" size="sm" onClick={fileActions.openFileDialog}>
          <PlusIcon data-icon="inline-start" />
          {hasDives ? "Add more files" : "Add files"}
        </Button>
        <input
          {...fileActions.getInputProps({ multiple: true })}
          className="sr-only"
        />

        <span className="text-sm text-muted-foreground">
          Drop JSON files here or click to browse
        </span>
      </div>

      {fileError && (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>Invalid file</AlertTitle>
          <AlertDescription>{fileError}</AlertDescription>
        </Alert>
      )}
    </Field>
  )
}
