import { Card, CardContent } from "@/components/ui/card"
import type { LogbookStats } from "@/lib/integrations/ssi/dives"

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-heading text-lg font-medium">{value}</span>
    </div>
  )
}

export function StatsSummary({ stats }: { stats: LogbookStats }) {
  return (
    <Card>
      <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <StatItem label="Dives" value={String(stats.myLoggedDives)} />
        <StatItem label="Max depth" value={`${stats.myMaxDepth} m`} />
        <StatItem
          label="Avg depth"
          value={`${stats.myAverageMaxDepth.toFixed(1)} m`}
        />
        <StatItem
          label="Avg time"
          value={`${Math.round(stats.myAverageDivetime)} min`}
        />
        <StatItem label="Sites" value={String(stats.myVisitedSites)} />
      </CardContent>
    </Card>
  )
}
