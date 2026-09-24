import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { formatExpiration, mapUrlsToLinkItems } from "../lib/link-mapper"

describe("link-mapper", () => {
  const fixedNow = new Date("2026-09-24T12:00:00.000Z")

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(fixedNow)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe("formatExpiration", () => {
    it("returns 'Never' and isExpiringSoon: false when expiresAt is null or undefined", () => {
      expect(formatExpiration(null)).toEqual({
        text: "Never",
        isExpiringSoon: false,
      })
    })

    it("returns 'Expired' and isExpiringSoon: true when expiration is in the past", () => {
      const pastDate = new Date("2026-09-24T11:00:00.000Z")
      expect(formatExpiration(pastDate)).toEqual({
        text: "Expired",
        isExpiringSoon: true,
      })
    })

    it("returns 'Expired' and isExpiringSoon: true when expiration is exactly now", () => {
      expect(formatExpiration(fixedNow)).toEqual({
        text: "Expired",
        isExpiringSoon: true,
      })
    })

    it("returns 'Expires in Xh' and isExpiringSoon: true when expiration is less than 24h away", () => {
      const fiveHoursLater = new Date("2026-09-24T17:00:00.000Z")
      expect(formatExpiration(fiveHoursLater)).toEqual({
        text: "Expires in 5h",
        isExpiringSoon: true,
      })

      const thirtyMinutesLater = new Date("2026-09-24T12:30:00.000Z")
      expect(formatExpiration(thirtyMinutesLater)).toEqual({
        text: "Expires in 1h",
        isExpiringSoon: true,
      })
    })

    it("returns formatted date and isExpiringSoon: false when expiration is greater than 24h away", () => {
      const twoDaysLater = new Date("2026-09-26T12:00:00.000Z")
      const result = formatExpiration(twoDaysLater)

      expect(result.isExpiringSoon).toBe(false)
      expect(result.text).toBe(
        twoDaysLater.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      )
    })
  })

  describe("mapUrlsToLinkItems", () => {
    it("maps raw database URL rows to LinkItem format", () => {
      const rows = [
        {
          id: 1,
          alias: "custom-link",
          originalUrl: "https://example.com/long-path",
          isCustomAlias: true,
          expiresAt: new Date("2026-09-24T17:00:00.000Z"),
          createdAt: new Date("2026-09-20T10:00:00.000Z"),
        },
        {
          id: 2,
          alias: "auto-gen",
          originalUrl: "https://github.com",
          isCustomAlias: false,
          expiresAt: null,
          createdAt: "2026-09-21T08:00:00.000Z",
        },
      ]

      const items = mapUrlsToLinkItems(rows)

      expect(items).toHaveLength(2)
      expect(items[0]).toEqual({
        id: 1,
        alias: "custom-link",
        originalUrl: "https://example.com/long-path",
        isCustom: true,
        expiresAt: "Expires in 5h",
        isExpiringSoon: true,
        createdAt: new Date("2026-09-20T10:00:00.000Z").toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        rawExpiresAt: "2026-09-24T17:00:00.000Z",
      })

      expect(items[1]).toEqual({
        id: 2,
        alias: "auto-gen",
        originalUrl: "https://github.com",
        isCustom: false,
        expiresAt: "Never",
        isExpiringSoon: false,
        createdAt: new Date("2026-09-21T08:00:00.000Z").toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        rawExpiresAt: null,
      })
    })

    it("handles empty list correctly", () => {
      expect(mapUrlsToLinkItems([])).toEqual([])
    })
  })
})
