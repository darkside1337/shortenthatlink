export interface LinkItem {
  id: number
  alias: string
  originalUrl: string
  isCustom: boolean
  expiresAt: string
  isExpiringSoon?: boolean
  createdAt: string
  rawExpiresAt?: string | null
}
