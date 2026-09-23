export interface LinkItem {
  id: string
  alias: string
  originalUrl: string
  isCustom: boolean
  expiresAt: string
  isExpiringSoon?: boolean
  createdAt: string
}
