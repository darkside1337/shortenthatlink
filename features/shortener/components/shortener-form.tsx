"use client"

import { ArrowRight, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useShortener } from "../hooks/use-shortener"
import { AdvancedOptions } from "./advanced-options"
import { ShortenResultCard } from "./shorten-result"

export function ShortenerForm() {
  const {
    url,
    setUrl,
    customAlias,
    setCustomAlias,
    expiration,
    setExpiration,
    isAdvancedOpen,
    setIsAdvancedOpen,
    isLoading,
    error,
    createdResult,
    copied,
    showQrDrawer,
    setShowQrDrawer,
    handleShorten,
    handleCopy,
    handleReset,
  } = useShortener()

  return (
    <Card className="w-full mt-8 sm:mt-10 rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs text-left transition-[border-color,background-color,box-shadow] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]">
      {createdResult ? (
        <ShortenResultCard
          result={createdResult}
          targetUrl={url}
          copied={copied}
          showQrDrawer={showQrDrawer}
          onCopy={handleCopy}
          onToggleQr={() => setShowQrDrawer(!showQrDrawer)}
          onReset={handleReset}
        />
      ) : (
        <form onSubmit={handleShorten} className="space-y-3.5 animate-in fade-in-50 slide-in-from-bottom-2 duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:fade-in-50 motion-reduce:slide-in-from-bottom-0">
          {error && (
            <div
              role="alert"
              className="p-3 text-xs rounded-lg border border-rose-badge-bg bg-rose-badge-bg/30 text-rose-badge-text flex items-center gap-2 animate-in fade-in-50 slide-in-from-top-2 duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:fade-in-50 motion-reduce:slide-in-from-top-0"
            >
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Single-line URL input row paired with dark Shorten button */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Input
                type="url"
                required
                aria-label="URL to shorten"
                placeholder="https://github.com/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
                className="h-12 sm:h-11 text-base sm:text-sm px-3.5 bg-background border-border focus-visible:ring-electric-blue/20 focus-visible:border-electric-blue"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="w-full sm:w-auto h-12 sm:h-11 px-6 text-base sm:text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] gap-2 rounded-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Shortening…</span>
                </>
              ) : (
                <>
                  <span>Shorten</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </div>

          {/* Advanced Options Disclosure Toggle */}
          <AdvancedOptions
            isOpen={isAdvancedOpen}
            onToggle={() => setIsAdvancedOpen(!isAdvancedOpen)}
            customAlias={customAlias}
            onCustomAliasChange={setCustomAlias}
            expiration={expiration}
            onExpirationChange={setExpiration}
          />
        </form>
      )}
    </Card>
  )
}

