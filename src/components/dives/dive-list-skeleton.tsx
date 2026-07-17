import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function DiveListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-5 w-10" />
            </div>
          ))}
        </CardContent>
      </Card>

      {Array.from({ length: 4 }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((__, j) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
              <div key={j} className="flex flex-col gap-2">
                <Skeleton className="h-3 w-14" />
                <Skeleton className="h-5 w-12" />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
