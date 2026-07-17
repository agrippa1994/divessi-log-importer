import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function ImportDiveDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import dive</DialogTitle>
          <DialogDescription>
            Import a dive from your dive computer or another log. This is coming
            soon.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
