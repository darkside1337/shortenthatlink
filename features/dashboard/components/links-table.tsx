"use client"

import { Card } from "@/components/ui/card"
import { LinkItem } from "../types"
import { LinkRow } from "./link-row"
import { LinkCard } from "./link-card"

interface LinksTableProps {
  links: LinkItem[]
  copiedId: string | null
  onCopy: (id: string, alias: string) => void
  onOpenManage: (link: LinkItem, confirmDeleteFirst: boolean) => void
}

export function LinksTable({
  links,
  copiedId,
  onCopy,
  onOpenManage,
}: LinksTableProps) {
  return (
    <div className="space-y-4">
      {/* Desktop Table View (hidden on mobile, visible on sm+) */}
      <Card className="hidden sm:block overflow-hidden rounded-xl border border-border bg-card shadow-xs p-0">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border/80 bg-paper/50 text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
              <th className="py-3 px-4 font-medium">Short Link</th>
              <th className="py-3 px-4 font-medium">Original URL</th>
              <th className="py-3 px-4 font-medium">Type</th>
              <th className="py-3 px-4 font-medium">Expiration</th>
              <th className="py-3 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-xs">
            {links.map((link, idx) => (
              <LinkRow
                key={link.id}
                link={link}
                isHoverSample={idx === 1}
                isCopied={copiedId === link.id}
                onCopy={onCopy}
                onOpenManage={onOpenManage}
              />
            ))}
          </tbody>
        </table>
      </Card>

      {/* Mobile Card Stream View (sm:hidden, touch-optimized baseline) */}
      <div className="sm:hidden flex flex-col gap-3">
        {links.map((link) => (
          <LinkCard
            key={link.id}
            link={link}
            isCopied={copiedId === link.id}
            onCopy={onCopy}
            onOpenManage={onOpenManage}
          />
        ))}
      </div>
    </div>
  )
}
