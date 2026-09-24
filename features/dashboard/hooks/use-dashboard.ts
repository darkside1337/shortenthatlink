"use client"

import { useState, useEffect } from "react"
import { LinkItem } from "../types"
import { mapUrlsToLinkItems } from "../lib/link-mapper"

export function useDashboard({ initialLinks }: { initialLinks?: LinkItem[] } = {}) {
  const [links, setLinks] = useState<LinkItem[]>(initialLinks ?? [])
  const [isLoading, setIsLoading] = useState<boolean>(!initialLinks)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [aliasError, setAliasError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  // Manage Link modal state (rename + delete)
  const [managingLink, setManagingLink] = useState<LinkItem | null>(null)
  const [manageAliasInput, setManageAliasInput] = useState<string>("")
  const [isDeleteConfirming, setIsDeleteConfirming] = useState<boolean>(false)

  // Create New modal state
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false)
  const [newUrl, setNewUrl] = useState<string>("")
  const [newCustomAlias, setNewCustomAlias] = useState<string>("")
  const [newExpiry, setNewExpiry] = useState<string>("never")

  useEffect(() => {
    if (!initialLinks) {
      let isMounted = true
      fetch("/api/urls")
        .then((res) => res.json())
        .then((data) => {
          if (isMounted && data?.data) {
            setLinks(mapUrlsToLinkItems(data.data))
          }
        })
        .catch(() => {
          // Keep empty links or fallback
        })
        .finally(() => {
          if (isMounted) {
            setIsLoading(false)
          }
        })
      return () => {
        isMounted = false
      }
    }
  }, [initialLinks])

  const handleCopy = (id: number, alias: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : ""
    navigator.clipboard.writeText(`${origin}/${alias}`)
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

  const handleSaveManage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!managingLink || !manageAliasInput.trim()) return

    setIsSubmitting(true)
    setAliasError(null)

    try {
      const res = await fetch(`/api/urls/${managingLink.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newAlias: manageAliasInput.trim() }),
      })
      const data = await res.json()

      if (res.status === 409) {
        setAliasError("This alias is already taken.")
        return
      }

      if (!res.ok) {
        setAliasError(data?.error?.message || "Failed to rename alias.")
        return
      }

      setLinks((prev) =>
        prev.map((l) =>
          l.id === managingLink.id
            ? { ...l, alias: data.data.alias, isCustom: true }
            : l
        )
      )
      handleCloseManage()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to rename alias."
      setAliasError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!managingLink) return

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/urls/${managingLink.id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setLinks((prev) => prev.filter((l) => l.id !== managingLink.id))
        handleCloseManage()
      }
    } catch {
      // Ignore or handle network failure
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUrl.trim()) return

    setIsSubmitting(true)
    setCreateError(null)

    let computedExpiresAt: string | undefined = undefined
    if (newExpiry === "1h") {
      computedExpiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()
    } else if (newExpiry === "24h") {
      computedExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    } else if (newExpiry === "7d") {
      computedExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    } else if (newExpiry === "30d") {
      computedExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }

    try {
      const res = await fetch("/api/urls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalUrl: newUrl.trim(),
          customAlias: newCustomAlias.trim() || undefined,
          expiresAt: computedExpiresAt,
        }),
      })

      const data = await res.json()

      if (res.status === 201) {
        const [newLinkItem] = mapUrlsToLinkItems([
          {
            ...data.data,
            isCustomAlias: Boolean(newCustomAlias.trim()),
          },
        ])
        setLinks((prev) => [newLinkItem, ...prev])
        setNewUrl("")
        setNewCustomAlias("")
        setNewExpiry("never")
        setIsCreatingNew(false)
      } else {
        setCreateError(data?.error?.message || "Failed to create link.")
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create link."
      setCreateError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    links,
    isLoading,
    isSubmitting,
    createError,
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
