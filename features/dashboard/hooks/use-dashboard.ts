"use client"

import { useState, useEffect, useCallback } from "react"
import type { ExpirationOption } from "@/features/shortener/types"
import { computeExpirationDate } from "@/lib/expiration"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { LinkItem } from "../types"
import { mapUrlsToLinkItems } from "../lib/link-mapper"

export function useDashboard({ initialLinks }: { initialLinks?: LinkItem[] } = {}) {
  const [links, setLinks] = useState<LinkItem[]>(initialLinks ?? [])
  const [isLoading, setIsLoading] = useState<boolean>(!initialLinks)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [aliasError, setAliasError] = useState<string | null>(null)
  const { copiedId, copy } = useCopyToClipboard<number>(2000)

  // Manage Link modal state (rename + delete)
  const [managingLink, setManagingLink] = useState<LinkItem | null>(null)
  const [manageAliasInput, setManageAliasInput] = useState<string>("")
  const [isDeleteConfirming, setIsDeleteConfirming] = useState<boolean>(false)

  // Create New modal state
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false)
  const [newUrl, setNewUrl] = useState<string>("")
  const [newCustomAlias, setNewCustomAlias] = useState<string>("")
  const [newExpiry, setNewExpiry] = useState<ExpirationOption>("never")

  const refetch = useCallback(async () => {
    setIsLoading(true)
    setFetchError(null)
    try {
      const res = await fetch("/api/urls")
      const data = await res.json()
      if (data?.success && data?.data) {
        setLinks(mapUrlsToLinkItems(data.data))
      } else {
        setFetchError(data?.error?.message || "Failed to load links.")
      }
    } catch {
      setFetchError("Failed to load links. Check your connection.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!initialLinks) {
      refetch()
    }
  }, [initialLinks, refetch])

  const handleCopy = useCallback(
    (id: number, alias: string) => {
      const origin = typeof window !== "undefined" ? window.location.origin : ""
      copy(id, `${origin}/${alias}`)
    },
    [copy]
  )

  const handleOpenManage = useCallback((link: LinkItem, confirmDeleteFirst = false) => {
    setManagingLink(link)
    setManageAliasInput(link.alias)
    setAliasError(null)
    setIsDeleteConfirming(confirmDeleteFirst)
  }, [])

  const handleCloseManage = useCallback(() => {
    setManagingLink(null)
    setAliasError(null)
    setIsDeleteConfirming(false)
  }, [])

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
      } else {
        const data = await res.json().catch(() => null)
        setAliasError(data?.error?.message || "Failed to delete link.")
      }
    } catch {
      setAliasError("Failed to delete link. Check your network connection.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUrl.trim()) return

    setIsSubmitting(true)
    setCreateError(null)

    const computedExpiresAt = computeExpirationDate(newExpiry)

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
        const [newLinkItem] = mapUrlsToLinkItems([data.data])
        if (newLinkItem) {
          setLinks((prev) => [newLinkItem, ...prev])
        }
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
    fetchError,
    refetch,
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
