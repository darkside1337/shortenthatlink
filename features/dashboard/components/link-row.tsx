import React from "react"
import { Check, Copy, ExternalLink, Clock, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LinkItem } from "../types"

interface LinkRowProps {
  link: LinkItem
  isCopied: boolean
  host?: string
  onCopy: (id: number, alias: string) => void
  onOpenManage: (link: LinkItem, confirmDeleteFirst: boolean) => void
}

export const LinkRow = React.memo(function LinkRow({
  link,
  isCopied,
  host = "",
  onCopy,
  onOpenManage,
}: LinkRowProps) {
  const displayLink = host ? `${host}/${link.alias}` : link.alias

  return (
    <tr className="transition-colors hover:bg-muted/30">
      {/* 1. Short Link */}
      <td className="py-3.5 px-4 font-mono">
        <div className="inline-flex items-center gap-1.5">
          <span className="bg-paper border border-border px-2 py-1 rounded-md text-xs font-mono font-medium text-foreground select-all">
            {displayLink}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => onCopy(link.id, link.alias)}
            title="Copy short link"
            aria-label={`Copy short link for ${link.alias}`}
            className={`rounded-md border transition-all ${
              isCopied
                ? "bg-mint-bg text-mint-text border-mint-bg"
                : "border-transparent hover:border-border hover:bg-paper text-muted-foreground hover:text-foreground"
            }`}
          >
            {isCopied ? (
              <Check className="size-3.5 text-mint-text animate-in fade-in-50 zoom-in-50 duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:fade-in-50 motion-reduce:zoom-in-100" />
            ) : (
              <Copy className="size-3.5 animate-in fade-in-50 zoom-in-50 duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:fade-in-50 motion-reduce:zoom-in-100" />
            )}
          </Button>
        </div>
      </td>

      {/* 2. Original URL */}
      <td className="py-3.5 px-4">
        <a
          href={link.originalUrl}
          target="_blank"
          rel="noreferrer"
          title={link.originalUrl}
          className="group inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors max-w-[280px]"
        >
          <span className="truncate font-mono text-[11px]">
            {link.originalUrl}
          </span>
          <ExternalLink className="size-3 shrink-0 opacity-60 group-hover:opacity-100 group-hover:text-electric-blue transition-opacity" />
        </a>
      </td>

      {/* 3. Type Pill Badge */}
      <td className="py-3.5 px-4">
        {link.isCustom ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-mint-bg text-mint-text border border-mint-bg">
            <span className="size-1.5 rounded-full bg-emerald-600" />
            Custom
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-paper text-muted-foreground border border-border">
            Generated
          </span>
        )}
      </td>

      {/* 4. Expiration */}
      <td className="py-3.5 px-4">
        {link.isExpiringSoon ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-amber-badge-bg text-amber-badge-text border border-amber-badge-bg">
            <Clock className="size-3" />
            {link.expiresAt}
          </span>
        ) : (
          <span
            className={`font-mono text-xs ${
              link.expiresAt === "Never"
                ? "text-muted-foreground"
                : "text-foreground"
            }`}
          >
            {link.expiresAt}
          </span>
        )}
      </td>

      {/* 5. Actions */}
      <td className="py-3.5 px-4 text-right">
        <div className="inline-flex items-center gap-1 justify-end">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => onOpenManage(link, false)}
            title="Manage link (Rename & Delete)"
            aria-label={`Manage link ${link.alias}`}
            className="rounded-md hover:bg-paper hover:border hover:border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => onOpenManage(link, true)}
            title="Delete link"
            aria-label={`Delete link ${link.alias}`}
            className="rounded-md hover:bg-rose-badge-bg/40 hover:text-rose-badge-text text-muted-foreground transition-colors"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  )
})
