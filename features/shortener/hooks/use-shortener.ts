"use client"

import { useState } from "react"
import { ShortenResult, ExpirationOption } from "../types"
import { computeExpirationDate } from "@/lib/expiration"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"

export function useShortener() {
  const [url, setUrl] = useState<string>("")
  const [customAlias, setCustomAlias] = useState<string>("")
  const [expiration, setExpiration] = useState<ExpirationOption>("never")
  const [isAdvancedOpen, setIsAdvancedOpen] = useState<boolean>(false)

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const [createdResult, setCreatedResult] = useState<ShortenResult | null>(null)
  const { copiedId, copy } = useCopyToClipboard(2200)
  const copied = Boolean(copiedId)
  const [showQrDrawer, setShowQrDrawer] = useState<boolean>(false)

  const handleShorten = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!url.trim()) return

    const computedExpiresAt = computeExpirationDate(expiration)

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/urls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalUrl: url.trim(),
          customAlias: customAlias.trim() || undefined,
          expiresAt: computedExpiresAt,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        const origin = typeof window !== "undefined" ? window.location.origin : ""
        setCreatedResult({
          shortUrl: origin ? `${origin}/${data.data.alias}` : data.data.alias,
          originalUrl: data.data.originalUrl,
          alias: data.data.alias,
        })
      } else {
        setError(data.error?.message || "Failed to shorten link.")
      }
    } catch {
      setError("Failed to shorten link. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = () => {
    if (!createdResult) return
    const fullUrl = createdResult.shortUrl.startsWith("http")
      ? createdResult.shortUrl
      : `https://${createdResult.shortUrl}`
    copy("result", fullUrl)
  }

  const handleReset = () => {
    setCreatedResult(null)
    setShowQrDrawer(false)
    setError(null)
    setUrl("")
    setCustomAlias("")
    setExpiration("never")
  }

  return {
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
  }
}

