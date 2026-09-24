"use client"

import { useState } from "react"
import { ShortenResult, ExpirationOption } from "../types"

export function useShortener() {
  const [url, setUrl] = useState<string>("")
  const [customAlias, setCustomAlias] = useState<string>("")
  const [expiration, setExpiration] = useState<ExpirationOption>("never")
  const [isAdvancedOpen, setIsAdvancedOpen] = useState<boolean>(false)

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const [createdResult, setCreatedResult] = useState<ShortenResult | null>(null)
  const [copied, setCopied] = useState<boolean>(false)
  const [showQrDrawer, setShowQrDrawer] = useState<boolean>(false)

  const handleShorten = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!url.trim()) return

    let computedExpiresAt: string | undefined
    if (expiration === "1h") {
      computedExpiresAt = new Date(Date.now() + 3600 * 1000).toISOString()
    } else if (expiration === "24h") {
      computedExpiresAt = new Date(Date.now() + 24 * 3600 * 1000).toISOString()
    } else if (expiration === "7d") {
      computedExpiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString()
    } else if (expiration === "30d") {
      computedExpiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()
    } else {
      computedExpiresAt = undefined
    }

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
    navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  const handleReset = () => {
    setCreatedResult(null)
    setCopied(false)
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

