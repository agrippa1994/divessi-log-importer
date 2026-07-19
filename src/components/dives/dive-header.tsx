import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { LogOutIcon, PlusIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ssiProfileOptions } from "@/lib/integrations/ssi/profile"
import { logout } from "@/lib/session"

export function DiveHeader() {
  const navigate = useNavigate()
  const { data: profile } = useQuery(ssiProfileOptions())

  const fullName = [profile?.user_forename, profile?.user_lastname]
    .filter(Boolean)
    .join(" ")
  const initials =
    [profile?.user_forename, profile?.user_lastname]
      .filter((part): part is string => Boolean(part))
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || undefined

  async function handleLogout() {
    await logout()
    await navigate({ to: "/login" })
  }

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b bg-background/80 px-4 py-3 backdrop-blur-sm">
      <h1 className="font-heading text-base font-medium">Dive Log</h1>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={() => navigate({ to: "/import" })}>
          <PlusIcon data-icon="inline-start" />
          <span className="hidden sm:inline">Import dive</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="rounded-full" />
            }
          >
            <Avatar>
              <AvatarImage src={profile?.user_image} alt={fullName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
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
    </header>
  )
}
