"use client"

import { useState } from "react"
import { LinkItem } from "../types"

const INITIAL_LINKS: LinkItem[] = [
  {
    id: "1",
    alias: "auth-docs",
    originalUrl: "https://github.com/better-auth/better-auth/tree/main/docs/overview",
    isCustom: true,
    expiresAt: "Never",
    createdAt: "Sep 20, 2026",
  },
  {
    id: "2",
    alias: "spring-release",
    originalUrl: "https://linear.app/changelog/2026-03-spring-updates-and-integrations",
    isCustom: true,
    expiresAt: "Expires in 18h",
    isExpiringSoon: true,
    createdAt: "Sep 22, 2026",
  },
  {
    id: "3",
    alias: "8k2mz91",
    originalUrl: "https://figma.com/design/4044680601076201931/shortenTHATlink-System-Tokens",
    isCustom: false,
    expiresAt: "Oct 14, 2026",
    createdAt: "Sep 19, 2026",
  },
  {
    id: "4",
    alias: "stripe-billing",
    originalUrl: "https://stripe.com/docs/billing/subscriptions/overview-and-lifecycle",
    isCustom: true,
    expiresAt: "Nov 01, 2026",
    createdAt: "Sep 18, 2026",
  },
  {
    id: "5",
    alias: "4p9xq72",
    originalUrl: "https://news.ycombinator.com/item?id=39847291-show-hn-lightweight-redirector",
    isCustom: false,
    expiresAt: "Never",
    createdAt: "Sep 15, 2026",
  },
  {
    id: "6",
    alias: "api-specs",
    originalUrl: "https://swagger.io/specification/v3/json-schema-validation-rules-drizzle",
    isCustom: true,
    expiresAt: "Dec 31, 2026",
    createdAt: "Sep 12, 2026",
  },
  {
    id: "7",
    alias: "9m3tz84",
    originalUrl: "https://youtube.com/watch?v=dQw4w9WgXcQ",
    isCustom: false,
    expiresAt: "Never",
    createdAt: "Sep 08, 2026",
  },
]

const RESERVED_ALIASES = new Set([
  "api",
  "dashboard",
  "login",
  "admin",
  "auth",
  "cron",
  "static",
  "assets",
  "favicon",
  "robots",
  "sitemap",
])

function validateAliasFormat(alias: string): string | null {
  const trimmed = alias.trim().toLowerCase()
  if (trimmed.length < 4 || trimmed.length > 52) {
    return "Alias must be between 4 and 52 characters."
  }
  if (!/^[a-z0-9-]+$/.test(trimmed)) {
    return "Only lowercase letters, numbers, and hyphens are allowed."
  }
  if (trimmed.startsWith("-") || trimmed.endsWith("-")) {
    return "Alias cannot start or end with a hyphen."
  }
  if (trimmed.includes("--")) {
    return "Alias cannot contain consecutive hyphens."
  }
  if (RESERVED_ALIASES.has(trimmed)) {
    return "This alias is reserved by the system."
  }
  return null
}

export function useDashboard() {
  const [links, setLinks] = useState<LinkItem[]>(INITIAL_LINKS)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Manage Link modal state (rename + delete)
  const [managingLink, setManagingLink] = useState<LinkItem | null>(null)
  const [manageAliasInput, setManageAliasInput] = useState<string>("")
  const [aliasError, setAliasError] = useState<string | null>(null)
  const [isDeleteConfirming, setIsDeleteConfirming] = useState<boolean>(false)

  // Create New modal state
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false)
  const [newUrl, setNewUrl] = useState<string>("")
  const [newCustomAlias, setNewCustomAlias] = useState<string>("")
  const [newExpiry, setNewExpiry] = useState<string>("never")

  const handleCopy = (id: string, alias: string) => {
    navigator.clipboard.writeText(`https://shortenTHATlink/${alias}`)
    setCopiedId(id)
    setTimeout(() => {
      setCopiedId((prev) => (prev === id ? null : prev))
    }, 2000)
  }

  const handleOpenManage = (link: LinkItem, confirmDeleteFirst = false) => {
    setManagingLink(link)
    setManageAliasInput(link.alias)
    setAliasError(null)
    setIsDeleteConfirming(confirmDeleteFirst)
  }

  const handleCloseManage = () => {
    setManagingLink(null)
    setAliasError(null)
    setIsDeleteConfirming(false)
  }

  const handleSaveManage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!managingLink || !manageAliasInput.trim()) return

    const trimmedAlias = manageAliasInput.trim().toLowerCase()

    const formatErr = validateAliasFormat(trimmedAlias)
    if (formatErr) {
      setAliasError(formatErr)
      return
    }

    const isTaken = links.some(
      (l) => l.id !== managingLink.id && l.alias.toLowerCase() === trimmedAlias
    )

    if (isTaken) {
      setAliasError("This alias is already taken.")
      return
    }

    setLinks((prev) =>
      prev.map((l) =>
        l.id === managingLink.id
          ? { ...l, alias: trimmedAlias, isCustom: true }
          : l
      )
    )
    handleCloseManage()
  }

  const handleConfirmDelete = () => {
    if (!managingLink) return
    setLinks((prev) => prev.filter((l) => l.id !== managingLink.id))
    handleCloseManage()
  }

  const handleCreateLink = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUrl.trim()) return

    const newLink: LinkItem = {
      id: Date.now().toString(),
      alias: newCustomAlias.trim() || `gen${Math.random().toString(36).substring(2, 7)}`,
      originalUrl: newUrl.trim(),
      isCustom: Boolean(newCustomAlias.trim()),
      expiresAt: newExpiry === "never" ? "Never" : `Expires in ${newExpiry}`,
      isExpiringSoon: newExpiry === "1h" || newExpiry === "24h",
      createdAt: "Just now",
    }

    setLinks([newLink, ...links])
    setNewUrl("")
    setNewCustomAlias("")
    setNewExpiry("never")
    setIsCreatingNew(false)
  }

  return {
    links,
    copiedId,
    managingLink,
    manageAliasInput,
    aliasError,
    isDeleteConfirming,
    isCreatingNew,
    newUrl,
    newCustomAlias,
    newExpiry,
    handleCopy,
    handleOpenManage,
    handleCloseManage,
    handleSaveManage,
    handleConfirmDelete,
    handleCreateLink,
    setManageAliasInput,
    setAliasError,
    setIsDeleteConfirming,
    setIsCreatingNew,
    setNewUrl,
    setNewCustomAlias,
    setNewExpiry,
  }
}
