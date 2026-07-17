import { useNavigate } from "@tanstack/react-router"
import { LogOutIcon, PlusIcon, UserRoundIcon } from "lucide-react"
import { useState } from "react"
import { ImportDiveDialog } from "@/components/dives/import-dive-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { logout } from "@/lib/session"

export function DiveHeader() {
  const navigate = useNavigate()
  const [importOpen, setImportOpen] = useState(false)

  async function handleLogout() {
    await logout()
    navigate({ to: "/login" })
  }

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b bg-background/80 px-4 py-3 backdrop-blur-sm">
      <h1 className="font-heading text-base font-medium">Dive Log</h1>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={() => setImportOpen(true)}>
          <PlusIcon data-icon="inline-start" />
          <span className="hidden sm:inline">Import dive</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
            <UserRoundIcon />
            <span className="sr-only">Account menu</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem variant="destructive" onClick={handleLogout}>
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ImportDiveDialog open={importOpen} onOpenChange={setImportOpen} />
    </header>
  )
}
