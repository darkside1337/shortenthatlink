"use client"

import { Link2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardEmptyStateProps {
  onCreateNew: () => void
}

export function DashboardEmptyState({ onCreateNew }: DashboardEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/60 p-12 sm:p-16 flex flex-col items-center justify-center text-center animate-in fade-in-50 duration-200">
      <div className="size-12 rounded-full border border-border bg-paper flex items-center justify-center text-muted-foreground mb-4">
        <Link2 className="size-5" strokeWidth={1.75} />
      </div>

      <h2 className="text-base sm:text-lg font-medium tracking-tight text-foreground">
        No links yet
      </h2>
      <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-xs sm:max-w-sm">
        Create your first shortened link to get started. Clean redirects with zero tracking.
      </p>

      <div className="mt-6">
        <Button
          type="button"
          onClick={onCreateNew}
          className="h-10 px-5 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg gap-2 active:scale-[0.98]"
        >
          <Plus className="size-4" />
          <span>New Link</span>
        </Button>
      </div>
    </div>
  )
}
