"use client"

import { useState, useEffect } from "react"
import { Check, Copy, ExternalLink, Clock, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LinkItem } from "../types"

interface LinkCardProps {
  link: LinkItem
  isCopied: boolean
  onCopy: (id: number, alias: string) => void
  onOpenManage: (link: LinkItem, confirmDeleteFirst: boolean) => void
}

export function LinkCard({
  link,
  isCopied,
  onCopy,
  onOpenManage,
}: LinkCardProps) {
  const [host, setHost] = useState<string>("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHost(window.location.host)
    }
  }, [])

  const displayLink = host ? `${host}/${link.alias}` : link.alias

  return (
    <Card className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-xs">
      {/* Mobile Header: Short Link + 1-Tap Copy */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 bg-paper border border-border px-2.5 py-1.5 rounded-lg flex-1 overflow-hidden">
          <span className="font-mono text-xs font-medium text-foreground truncate block">
            {displayLink}
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onCopy(link.id, link.alias)}
          className={`h-9 px-3 shrink-0 rounded-lg text-xs gap-1.5 ${
            isCopied
              ? "bg-mint-bg text-mint-text border-mint-bg"
              : "border-border"
          }`}
        >
          {isCopied ? (
            <>
              <Check className="size-3.5 text-mint-text" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              <span>Copy</span>
            </>
          )}
        </Button>
      </div>

      {/* Destination URL */}
      <div className="text-xs">
        <a
          href={link.originalUrl}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 truncate"
        >
          <span className="truncate">{link.originalUrl}</span>
          <ExternalLink className="size-3 shrink-0" />
        </a>
      </div>

      {/* Mobile Footer: Badges Left, Actions Right */}
      <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          {link.isCustom ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-mint-bg text-mint-text border border-mint-bg">
              <span className="size-1 rounded-full bg-emerald-600" />
              Custom
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-paper text-muted-foreground border border-border">
              Generated
            </span>
          )}

          {link.isExpiringSoon ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-amber-badge-bg text-amber-badge-text border border-amber-badge-bg">
              <Clock className="size-2.5" />
              {link.expiresAt}
            </span>
          ) : (
            <span className="text-[11px] font-mono text-muted-foreground">
              {link.expiresAt}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenManage(link, false)}
            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <Pencil className="size-3.5 mr-1" />
            <span>Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenManage(link, true)}
            className="h-8 px-2.5 text-xs text-rose-badge-text hover:text-rose-badge-text hover:bg-rose-badge-bg/40"
          >
            <Trash2 className="size-3.5 mr-1" />
            <span>Delete</span>
          </Button>
        </div>
      </div>
    </Card>
  )
}
