import { LinkItem } from "../types"

interface RawUrlRow {
  id: number
  alias: string
  originalUrl: string
  isCustomAlias?: boolean
  expiresAt: Date | string | null
  createdAt: Date | string
}

export function formatExpiration(expiresAt: Date | string | null): { text: string; isExpiringSoon: boolean } {
  if (!expiresAt) {
    return { text: "Never", isExpiringSoon: false }
  }
  const expDate = new Date(expiresAt)
  const now = new Date()
  const diffMs = expDate.getTime() - now.getTime()

  if (diffMs <= 0) {
    return { text: "Expired", isExpiringSoon: true }
  }

  const diffHours = Math.round(diffMs / (1000 * 60 * 60))
  if (diffHours < 24) {
    return { text: `Expires in ${Math.max(1, diffHours)}h`, isExpiringSoon: true }
  }

  const formatted = expDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
  return { text: formatted, isExpiringSoon: false }
}

export function mapUrlsToLinkItems(rows: RawUrlRow[]): LinkItem[] {
  return rows.map((row) => {
    const { text, isExpiringSoon } = formatExpiration(row.expiresAt)
    const createdAtFormatted = new Date(row.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    return {
      id: row.id,
      alias: row.alias,
      originalUrl: row.originalUrl,
      isCustom: Boolean(row.isCustomAlias),
      expiresAt: text,
      isExpiringSoon,
      createdAt: createdAtFormatted,
      rawExpiresAt: row.expiresAt ? new Date(row.expiresAt).toISOString() : null,
    }
  })
}
