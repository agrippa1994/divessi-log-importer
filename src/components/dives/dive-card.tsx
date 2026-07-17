import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { LogbookDetail } from "@/lib/integrations/ssi/dives"

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
})

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

export function DiveCard({
  dive,
  siteName,
  siteCountry,
}: {
  dive: LogbookDetail
  siteName?: string
  siteCountry?: string
}) {
  const maxDepth = `${dive.odin_user_log_depth_m} m`
  const avgDepth =
    dive.odin_user_log_avg_depth_m != null
      ? `${dive.odin_user_log_avg_depth_m.toFixed(1)} m`
      : "—"
  const diveTime = `${dive.odin_user_log_divetime} min`
  const waterTemp =
    dive.odin_user_log_watertemp_c != null
      ? `${dive.odin_user_log_watertemp_c}°C`
      : "—"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="truncate">
          {siteName ?? "Unknown dive site"}
        </CardTitle>
        <CardDescription>
          {dateFormatter.format(new Date(dive.odin_user_log_datetime))}
          {siteCountry ? ` · ${siteCountry}` : ""}
        </CardDescription>
        <CardAction>
          <Badge variant="secondary">#{dive.odin_user_log_nr}</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricItem label="Max depth" value={maxDepth} />
        <MetricItem label="Avg depth" value={avgDepth} />
        <MetricItem label="Dive time" value={diveTime} />
        <MetricItem label="Water temp" value={waterTemp} />
      </CardContent>
    </Card>
  )
}
