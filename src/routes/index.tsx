import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { Suspense } from "react"
import { DiveCard } from "@/components/dives/dive-card"
import { DiveHeader } from "@/components/dives/dive-header"
import { DiveListSkeleton } from "@/components/dives/dive-list-skeleton"
import { StatsSummary } from "@/components/dives/stats-summary"
import { ssiDivesOptions } from "@/lib/integrations/ssi/dives"
import { isLoggedIn } from "@/lib/session"

export const Route = createFileRoute("/")({
  component: App,
  beforeLoad: async () => {
    const session = await isLoggedIn()
    if (!session.ssiToken) {
      throw redirect({ to: "/login" })
    }
  },
})

function App() {
  return (
    <div className="flex min-h-svh flex-col">
      <DiveHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-4">
        <Suspense fallback={<DiveListSkeleton />}>
          <DiveList />
        </Suspense>
      </main>
    </div>
  )
}

function DiveList() {
  const { data } = useSuspenseQuery(ssiDivesOptions())

  const sitesById = new Map(
    data.logbook_sites.map((site) => [site.odin_dive_sites_id, site])
  )

  const dives = data.logbook_details
    .filter((dive) => dive.odin_user_log_deleted === 0)
    .sort(
      (a, b) =>
        new Date(b.odin_user_log_datetime).getTime() -
        new Date(a.odin_user_log_datetime).getTime()
    )

  return (
    <div className="flex flex-col gap-4">
      <StatsSummary stats={data.logbook_stats} />

      {dives.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No dives logged yet.
        </p>
      ) : (
        dives.map((dive) => {
          const site = sitesById.get(dive.odin_user_log_dive_sites_id)
          return (
            <DiveCard
              key={dive.odin_user_log_id ?? dive.odin_user_log_nr}
              dive={dive}
              siteName={site?.odin_dive_sites_name}
              siteCountry={site?.odin_dive_sites_meta_country}
            />
          )
        })
      )}
    </div>
  )
}
