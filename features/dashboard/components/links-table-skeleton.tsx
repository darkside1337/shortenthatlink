import { Card } from "@/components/ui/card"

export function LinksTableSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Desktop Table Skeleton */}
      <Card className="hidden sm:block overflow-hidden rounded-xl border border-border bg-card shadow-xs p-0">
        <div className="border-b border-border/80 bg-paper/50 py-3 px-4 flex justify-between">
          <div className="h-4 bg-muted rounded w-24" />
          <div className="h-4 bg-muted rounded w-32" />
          <div className="h-4 bg-muted rounded w-16" />
          <div className="h-4 bg-muted rounded w-20" />
          <div className="h-4 bg-muted rounded w-16" />
        </div>
        <div className="divide-y divide-border/60">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="py-3.5 px-4 flex items-center justify-between gap-4">
              <div className="h-6 bg-muted/60 rounded-md w-36" />
              <div className="h-4 bg-muted/40 rounded w-48" />
              <div className="h-5 bg-muted/50 rounded-full w-14" />
              <div className="h-4 bg-muted/40 rounded w-24" />
              <div className="flex gap-2">
                <div className="size-7 bg-muted/50 rounded" />
                <div className="size-7 bg-muted/50 rounded" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Mobile Card Skeleton */}
      <div className="sm:hidden space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex justify-between items-center gap-2">
              <div className="h-7 bg-muted/60 rounded w-36" />
              <div className="h-8 bg-muted/50 rounded w-16" />
            </div>
            <div className="h-4 bg-muted/40 rounded w-48" />
            <div className="flex justify-between items-center pt-2 border-t border-border/40">
              <div className="h-4 bg-muted/40 rounded w-20" />
              <div className="flex gap-2">
                <div className="h-7 bg-muted/50 rounded w-14" />
                <div className="h-7 bg-muted/50 rounded w-14" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
