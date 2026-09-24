"use client"

import { Copy, Check, QrCode, RefreshCw, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { QRCodeImage } from "@/components/qr-code"
import { ShortenResult } from "../types"

interface ShortenResultProps {
  result: ShortenResult
  targetUrl: string
  copied: boolean
  showQrDrawer: boolean
  onCopy: () => void
  onToggleQr: () => void
  onReset: () => void
}

export function ShortenResultCard({
  result,
  targetUrl,
  copied,
  showQrDrawer,
  onCopy,
  onToggleQr,
  onReset,
}: ShortenResultProps) {
  const fullShortUrl =
    result.shortUrl.startsWith("http://") || result.shortUrl.startsWith("https://")
      ? result.shortUrl
      : `https://${result.shortUrl}`

  const match = fullShortUrl.match(/^(https?:\/\/)(.*)$/)
  const protocol = match ? match[1] : "https://"
  const domainAndPath = match ? match[2] : result.shortUrl

  const destinationUrl =
    targetUrl.startsWith("http://") || targetUrl.startsWith("https://")
      ? targetUrl
      : `https://${targetUrl}`

  return (
    <div className="space-y-4 animate-in fade-in-50 duration-200">
      <div className="flex items-center justify-between gap-2 pb-1 border-b border-border/60">
        <div className="flex items-center gap-2">
          <span className="inline-flex size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-foreground">Link Created Successfully</span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={onReset}
          className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground font-mono transition-colors h-auto p-0"
        >
          <RefreshCw className="size-3" />
          <span>Shorten another</span>
        </Button>
      </div>

      {/* Result Block: Monospace alias chip + Copy button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="flex-1 min-w-0 bg-paper border border-border rounded-lg px-3.5 py-2.5 flex items-center justify-between gap-2 overflow-hidden">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs text-muted-foreground font-mono select-none">{protocol}</span>
            <span className="font-mono text-sm sm:text-base font-medium text-foreground truncate">
              {domainAndPath}
            </span>
          </div>
          <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-mint-bg text-mint-text border border-mint-bg">
            Active
          </span>
        </div>

        {/* Copy Button with micro-state feedback */}
        <Button
          type="button"
          onClick={onCopy}
          className={`h-11 sm:h-10 px-5 text-sm font-medium gap-2 transition-all active:scale-[0.98] ${
            copied
              ? "bg-mint-bg text-mint-text hover:bg-mint-bg/90 border border-emerald-300"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          {copied ? (
            <>
              <Check className="size-4 text-mint-text animate-in zoom-in-50 duration-150" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="size-4" />
              <span>Copy</span>
            </>
          )}
        </Button>
      </div>

      {/* Original Destination URL Preview & QR Code Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5 min-w-0 max-w-[340px]">
          <span className="shrink-0 select-none">Target:</span>
          <a
            href={destinationUrl}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[11px] truncate text-foreground hover:text-electric-blue transition-colors flex items-center gap-1"
          >
            <span className="truncate">{targetUrl}</span>
            <ExternalLink className="size-3 shrink-0" />
          </a>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={onToggleQr}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors h-auto p-0"
        >
          <QrCode className="size-3.5 text-electric-blue" />
          <span>{showQrDrawer ? "Hide QR" : "Show QR Code"}</span>
        </Button>
      </div>

      {/* QR Code Preview Drawer */}
      {showQrDrawer && (
        <div className="mt-3 pt-3 border-t border-border/60 flex items-center gap-4 bg-paper/60 p-3 rounded-xl border border-border/80">
          <QRCodeImage value={fullShortUrl} size={84} />
          <div className="flex flex-col gap-1 text-left">
            <span className="text-xs font-medium text-foreground">Scan or Share</span>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Points directly to destination with 0ms surveillance hop.
            </p>
            <span className="font-mono text-[10px] text-muted-foreground">
              alias: {result.alias}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
