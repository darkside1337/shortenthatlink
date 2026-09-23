export interface ShortenResult {
  shortUrl: string
  originalUrl: string
  alias: string
}

export type ExpirationOption = "1h" | "24h" | "7d" | "30d" | "never"
