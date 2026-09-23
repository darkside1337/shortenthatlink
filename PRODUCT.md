# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Anyone (anonymous or logged in) needing to shorten a long URL instantly for sharing in chat, email, documents, or social media.
- Logged-in users who need a centralized dashboard to track, copy, manage, and assign memorable custom aliases to their links.

## Product Purpose

`shortenTHATlink` is a fast, clean URL shortener designed to eliminate unnecessary friction in link creation and sharing. It exists to provide instant link shortening without mandatory signups, paywalled aliases, or sluggish redirect intermediaries. Success means an anonymous or authenticated user can paste a URL, get a compact shortened link, and copy it to their clipboard in under two seconds.

## Positioning

A zero-surveillance, utility-first URL shortener. Unlike commercial shorteners that force tracking pixels, analytics cookies, monetization redirects, or paywalls for basic custom aliases, `shortenTHATlink` treats short links strictly as clean, functional identifiers. No click tracking, no analytics tables, and no redirect delays.

## Operating Context

- **Mobile-First Responsive Web Application:** Primary usage occurs on mobile browsers (iOS Safari, Android Chrome) for rapid on-the-go link shortening and sharing directly from chat apps, social networks, and emails.
- Ergonomic single-thumb reachability, bottom-sheet dialogs, and a strict 44×44px touch target minimum.
- Embedded in fast-paced sharing workflows (chat apps, markdown documentation, email, slides).
- High demand for keyboard friendliness on desktop, instant clipboard feedback, and scannable link lists.

## Capabilities and Constraints

- **Core Capabilities (MVP):**
  - Instant public link shortening with generated NanoID aliases (9 characters, unambiguous alphabet: `23456789abcdefghjkmnpqrstuvwxyz`).
  - Optional custom alias selection at creation or post-creation for authenticated users (4–52 characters, `a-z0-9-`, case-insensitive).
  - Optional link expiration intervals (1 hour, 24 hours, 7 days, 30 days, or never).
  - Social authentication via Better Auth (Google and GitHub) for link persistence and management.
  - Authenticated management dashboard (`/dashboard`) for copying, renaming, and deleting links.
  - Public redirect route (`/[alias]`) with unified 404/expired handling.
  - Scheduled automated purge of expired link records via Vercel Cron.
- **Constraints & Non-Goals:**
  - **No Analytics or Telemetry:** Explicit non-goal. No `clicks` table, no visitor IP tracking, and no referral logging.
  - **No Alias History or Chains:** Renaming an alias immediately and permanently invalidates the previous alias.
  - **No Sensitive-Link Gating:** Password-protected, single-use, or private links are explicitly out of scope for MVP. Aliases are public identifiers, not a security boundary.
  - **Reserved Aliases:** Application routes and static asset paths are strictly reserved to prevent routing collisions.

## Brand Commitments

- **Name:** `shortenTHATlink`
- **Voice & Tone:** Minimal, functional, and developer-grade. Direct and calm without promotional clutter or false urgency.
- **Design System:** "Frosted Precision" ([`docs/DESIGN.md`](file:///home/darkside/projects/shortenthatlink/docs/DESIGN.md)), aligned with Google Stitch project `projects/11066595528545754512`. Built on hairline borders, pure canvas against paper mist, monospaced alias clarity, and restrained electric blue interactive accents.

## Evidence on Hand

- Product Requirements Document: [`docs/PRD.md`](file:///home/darkside/projects/shortenthatlink/docs/PRD.md)
- Architecture Specification: [`docs/ARCHITECTURE.md`](file:///home/darkside/projects/shortenthatlink/docs/ARCHITECTURE.md)
- Design System Specification: [`docs/DESIGN.md`](file:///home/darkside/projects/shortenthatlink/docs/DESIGN.md)
- Connected Google Stitch Project: `projects/11066595528545754512` ("URL Shortener Landing System")
- *Absences:* No user tracking data, testimonials, or commercial tiers exist; future work must not fabricate them.

## Product Principles

1. **Zero-Friction Utility:** Create and copy a short link in seconds with zero mandatory registration or interstitial delays.
2. **Privacy by Default:** Pure link routing without surveillance, tracking pixels, or click analytics tables.
3. **Destructive Simplicity:** Renaming or deleting an alias is permanent and clean; no confusing redirect chains or zombie aliases.
4. **Typographic Rigor:** Monospaced formatting for all alias paths and URL hashes to eliminate visual character ambiguity (`0` vs `O`, `1` vs `l`).
