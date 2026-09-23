"use client"

import { useState } from "react"
import { ShortenResult, ExpirationOption } from "../types"

export function useShortener() {
  const [url, setUrl] = useState<string>("https://github.com/better-auth/better-auth")
  const [customAlias, setCustomAlias] = useState<string>("auth-docs")
  const [expiration, setExpiration] = useState<ExpirationOption>("never")
  const [isAdvancedOpen, setIsAdvancedOpen] = useState<boolean>(false)

  const [createdResult, setCreatedResult] = useState<ShortenResult | null>(null)
  const [copied, setCopied] = useState<boolean>(false)
  const [showQrDrawer, setShowQrDrawer] = useState<boolean>(false)

  const handleShorten = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!url.trim()) return

    setCreatedResult({
      shortUrl: customAlias.trim()
        ? `shortenTHATlink/${customAlias.trim()}`
        : "shortenTHATlink/7k9xz2",
      originalUrl: url.trim(),
      alias: customAlias.trim() || "7k9xz2",
    })
  }

  const handleCopy = () => {
    if (!createdResult) return
    navigator.clipboard.writeText(`https://${createdResult.shortUrl}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  const handleReset = () => {
    setCreatedResult(null)
    setCopied(false)
    setShowQrDrawer(false)
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
    createdResult,
    copied,
    showQrDrawer,
    setShowQrDrawer,
    handleShorten,
    handleCopy,
    handleReset,
  }
}
