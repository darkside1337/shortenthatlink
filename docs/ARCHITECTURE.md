# shortenTHATlink — Architecture

this doc covers _how_ the system is built; the PRD covers _what_ it does and why. Keep them in sync — if behavior changes here, update the PRD's Behavior & Rules section too.

**Stack:** Next.js (App Router), Drizzle ORM, PostgreSQL, better-auth, Vercel (hosting + Cron)

---

## 1. System Overview

```
                     ┌─────────────────────┐
   Browser  ────────▶│  Next.js App Router │
                     │  (Vercel)           │
                     └─────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                 ▼
       GET /[alias]      /api/urls/*      /api/cron/cleanup
       (redirect)        (CRUD, auth'd)   (Vercel Cron only)
              │                │                 │
              └────────────────┼─────────────────┘
                               ▼
                       ┌───────────────┐
                       │  Drizzle ORM  │
                       └───────┬───────┘
                               ▼
                       ┌───────────────┐
                       │  PostgreSQL   │
                       │  users, urls  │
                       └───────────────┘
```

Three independent entry points into the same database, no shared server-side session state beyond the DB itself — this app is stateless between requests by design, which is what makes it deployable to Vercel's serverless functions without extra infrastructure.

---

## 2. UI Pages

| Page                 | Route                     | Auth     | Contents                                                                                                                                                                                                                                                                        |
| -------------------- | ------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home / Create        | `/`                       | Public   | URL input + "Shorten" button; optional advanced section (custom alias, expiry date); result state with copy-to-clipboard after submission; link to dashboard if logged in                                                                                                       |
| 404 / Expired        | (fallback for `/[alias]`) | Public   | "This link doesn't exist or has expired" — deliberately doesn't distinguish the two cases, same as the API's ownership-check responses don't leak existence; link back to home                                                                                                  |
| Sign in              | `/login`                  | Public   | "Continue with Google" / "Continue with GitHub" buttons calling better-auth's `signIn.social({ provider: "google" \| "github" })`. No separate signup page or route — OAuth sign-in creates the account on first use, so there's nothing distinct for a signup page to contain. |
| Dashboard / My Links | `/dashboard`              | Required | List of the user's `Url` rows (alias, destination, created date, expiry, custom/generated badge); per-row Edit button; per-row copy button; empty state; create-new entry point                                                                                                 |

**Edit modal** (not a route — opened from a dashboard row's Edit button): handles both rename and delete for that row. Rename (alias input, same validation as creation, inline collision/format errors) is the primary action at the top; delete is visually separated below it — distinct styling, its own confirm step — since both renaming and deleting are immediate and irreversible per the PRD's no-history rule. Keeping both actions in one modal avoids a separate page for either, since neither is complex enough to warrant one.

No individual link detail page, no analytics/stats page (no `clicks` table — PRD §3), no admin page (out of scope) — all deliberate omissions, not oversights.

---

## 3. Project Structure

```
├── app/                          # Thin route orchestrators & page composition
│   ├── [alias]/
│   │   └── route.ts              # GET — public redirect handler
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...all]/
│   │   │       └── route.ts      # better-auth catch-all handler (toNextJsHandler)
│   │   ├── urls/
│   │   │   ├── route.ts          # POST create, GET list-mine
│   │   │   └── [id]/
│   │   │       └── route.ts      # PATCH rename, DELETE
│   │   └── cron/
│   │       └── cleanup/
│   │           └── route.ts      # DELETE expired rows — cron-only
│   ├── (dashboard)/              # Authenticated route group
│   │   └── dashboard/
│   │       └── page.tsx          # Mounts features/dashboard/components/dashboard-view
│   ├── login/
│   │   └── page.tsx              # Mounts features/auth/components/social-auth-buttons
│   ├── layout.tsx
│   └── page.tsx                  # Home route — composes features/shortener
├── features/                     # Domain-driven feature slices (business logic & UI)
│   ├── shortener/                # Link creation domain
│   │   ├── components/           # ShortenerForm, AdvancedOptions, ShortenResult
│   │   ├── hooks/                # useShortener
│   │   └── types.ts              # Shortener contracts & state types
│   ├── dashboard/                # Authenticated link management domain
│   │   ├── components/           # DashboardView, LinksTable, EditLinkDialog, etc.
│   │   ├── hooks/                # useDashboard
│   │   └── types.ts              # Link item types & filters
│   └── auth/                     # Authentication domain
│       └── components/           # SocialAuthButtons
├── components/                   # Shared UI primitives
│   ├── ui/                       # Shadcn primitives (button, card, dialog, input, etc.)
│   ├── theme-toggle.tsx          # Cross-cutting theme switch
│   └── qr-code.tsx               # Reusable QR rendering
├── db/
│   ├── schema.ts                 # App tables (Url) + better-auth-generated tables
│   └── index.ts                  # Drizzle client singleton
├── lib/                          # Core invariants, utilities & data layer
│   ├── alias.ts                  # generateAlias(), validateCustomAlias()
│   ├── reserved-aliases.ts       # RESERVED_ALIASES set
│   ├── auth.ts                   # betterAuth() instance + getCurrentUserId() helper
│   ├── auth-client.ts            # better-auth React client
│   └── urls.ts                   # shared query functions (see §4)
├── proxy.ts                      # route protection for authenticated pages/API routes
└── vercel.json                   # cron schedule
```

### Architectural Boundaries: Routes Compose Features

1. **Routes (`app/`):** Thin orchestrators that handle HTTP concerns (request routing, URL search/route parameters, metadata, redirects, auth guards) and mount feature components. Route files do not house complex state machines, data tables, or raw validation rules.
2. **Features (`features/`):** Domain modules encapsulating domain-specific UI, user interaction flows, validation, and presentation state machines.
3. **Core (`lib/`, `db/`):** Central source of truth for pure invariants (data model, database queries with ownership enforcement, auth client/server adapters, alias format validators).

**Why route handlers (`route.ts`) instead of Server Actions for the API surface:** the redirect handler and cron handler are hit by non-browser clients (link clicks from anywhere, Vercel's cron invoker) — they need stable, directly-callable HTTP endpoints, not React-coupled actions. Using plain route handlers for all of `/api/*` keeps the API surface consistent rather than mixing Server Actions for the dashboard UI and route handlers for everything else.

---

## 4. Data Layer

Schema lives in `db/schema.ts`. `Url` is the one hand-authored app table (see PRD §4 for the authoritative field list — not duplicated here to avoid drift). `user`, `session`, `account`, and `verification` are generated by the better-auth CLI (`npx @better-auth/cli generate`) and should not be hand-edited — regenerate them when auth config (enabled methods, plugins) changes, then re-run `drizzle-kit generate`/`migrate` to apply.

**Client setup (`db/index.ts`):** a single Drizzle client instance, reused across requests. On Vercel's serverless functions this means using a connection-pooling-friendly driver (e.g. `@neondatabase/serverless` or equivalent for your Postgres host) rather than a raw long-lived `pg.Pool`, since each function invocation may be a cold start.

**Query functions live in `lib/urls.ts`, not inline in route handlers.** Route handlers call these functions; they don't build Drizzle queries themselves. This keeps the redirect handler, the CRUD routes, and (later) any admin/dashboard server component all going through the same tested logic instead of three slightly different re-implementations of "look up by alias."

```typescript
// lib/urls.ts — shape, not full implementation
export async function findUrlByAlias(alias: string): Promise<Url | null>;
export async function createUrl(input: CreateUrlInput): Promise<Url>;
export async function renameUrlAlias(
  id: number,
  userId: string,
  newAlias: string,
): Promise<Url>;
export async function deleteUrl(id: number, userId: string): Promise<void>;
export async function listUrlsForUser(userId: string): Promise<Url[]>;
export async function deleteExpiredUrls(): Promise<number>; // returns count deleted
```

Ownership checks (`userId` match) happen **inside these functions**, not just in the route handler — so `renameUrlAlias` and `deleteUrl` take `userId` as a required parameter and filter on it in the query itself (`WHERE id = ? AND userId = ?`), rather than fetching the row first and checking in application code. This closes the gap between "checked" and "enforced": a route handler bug that skips the check can't accidentally grant access, because the query itself is incapable of touching another user's row.

---

## 5. Request Flows

### Create (`POST /api/urls`)

1. Parse body: `originalUrl`, optional `customAlias`, optional `expiresAt`.
2. Resolve current user from session (nullable — anonymous allowed).
3. If `customAlias` provided → run `validateCustomAlias()` (lib/alias.ts). On failure, 400 with the specific validation error. On success, attempt insert with `isCustomAlias: true`; on unique-constraint violation (`23505`), return 409 "alias already taken."
4. If no `customAlias` → generate via `generateAlias()`, attempt insert with `isCustomAlias: false`, retry up to 5 times on `23505`, then fail with 500 if still colliding.
5. Return the created row (excluding nothing sensitive — `id`, `alias`, `originalUrl`, `expiresAt`, `createdAt`).

### Redirect (`GET /[alias]`)

1. Lowercase the incoming alias param.
2. `findUrlByAlias()`.
3. Not found → Next.js `notFound()` (404 page).
4. Found but `expiresAt` in the past → treat identically to not found (see PRD §5, Redirect — this is a logical check independent of whether the cron has physically deleted the row yet).
5. Otherwise → `redirect(originalUrl)` (Next.js redirect, not a client-side fetch — keeps this a single fast round trip).

This route is the **hottest path in the app** — every link click hits it, with no auth check and no write. Keep it minimal: one indexed lookup, one conditional, one redirect. Don't add analytics writes, logging side effects, or anything else here that turns a single indexed read into a write on the critical path — that was a deliberate scope cut (PRD §3) and re-adding it here would quietly undo that decision.

### Edit (`PATCH /api/urls/[id]`)

1. Require authenticated user.
2. Load target row; if `isCustomAlias` is false, reject — generated aliases aren't directly editable (per PRD, converting is itself treated as an edit: the same endpoint accepts a new alias and flips `isCustomAlias` to `true` on first conversion).
3. Validate new alias via `validateCustomAlias()`.
4. `renameUrlAlias(id, userId, newAlias)` — ownership-scoped query per §4. Row-not-found-for-this-user and row-doesn't-exist should return the same 404, not leak which case it was.
5. On unique violation → 409 "alias already taken."
6. On success → row's `updatedAt` is bumped (handled by the update statement, not application code, so it can't be forgotten in a future edit path).

### Delete (`DELETE /api/urls/[id]`)

1. Require authenticated user.
2. `deleteUrl(id, userId)` — ownership-scoped, same reasoning as edit.
3. Deleting a `user` row cascades to their `Url` rows (`onDelete: cascade` on the FK) — no separate cleanup code needed for account deletion.

### Cron cleanup (`DELETE /api/cron/cleanup`)

1. Verify the request is actually from Vercel Cron, not a public caller — check the `Authorization` header against `CRON_SECRET` (Vercel sets this automatically when the route is configured as a cron target; reject with 401 if missing/mismatched).
2. `deleteExpiredUrls()` — single `DELETE WHERE expiresAt < now()`, using the `expiresAt` index.
3. Log/return count deleted for observability. This route has no user-facing effect — the redirect handler already blocks expired links logically (§5, Redirect step 4) — so a missed or delayed cron run is a storage-hygiene issue, not a correctness issue.

**`vercel.json`:**

```json
{
  "crons": [{ "path": "/api/cron/cleanup", "schedule": "0 * * * *" }]
}
```

(Hourly shown as a placeholder — confirm actual frequency against the plan-tier question flagged as open in the PRD.)

---

## 6. Auth (better-auth)

**Provider:** [better-auth](https://better-auth.com) — TypeScript-first, owns its own `user`/`session`/`account`/`verification` tables via the Drizzle adapter, so there's no separate user table to keep in sync by hand.

**Wiring:**

- `lib/auth.ts` exports a single `betterAuth(...)` instance, configured with `drizzleAdapter(db, { provider: "pg" })` (default config, singular `user` table) and `socialProviders: { google: {...}, github: {...} }` — OAuth-only, no email/password. This means `user.email` is populated from the OAuth provider on first sign-in rather than collected via a form, and there's no password field/flow to build.
- `app/api/auth/[...all]/route.ts` mounts the catch-all handler: `export const { GET, POST } = toNextJsHandler(auth)`. Every sign-in/sign-up/session/sign-out request lands here — no custom auth logic is written by hand.
- **Server-side session reads** (route handlers, server components) use `auth.api.getSession({ headers: await headers() })`. This is wrapped in React's `cache()` internally by better-auth, so calling it multiple times within one request is cheap — route handlers and layouts can each call it independently without a manual "fetch once and pass down" pattern.
- **Client-side** (dashboard UI, sign-in page) uses `lib/auth-client.ts`'s `useSession()` hook and `signIn.social({ provider })` / `signOut()` methods from better-auth's React client.
- `getCurrentUserId()` in `lib/auth.ts` wraps `getSession()` and returns `session?.user.id ?? null` — this is the one function the rest of the app calls; nothing outside `lib/auth.ts` touches `auth.api` directly.

**Type consequence:** better-auth's `user.id` is `text` (not a serial int — it has to support values from arbitrary auth methods/providers), so `userId` is `string | null` everywhere downstream, and `Url.userId` in the schema is `text`, not `integer` (see PRD §4).

**Route protection:** authenticated pages (`(dashboard)/`) and write endpoints (`/api/urls` POST/PATCH/DELETE, `/api/urls/[id]`) check the session and reject/redirect if absent. If the project is on Next.js 16, this is a `proxy.ts` file (the `middleware.ts` successor); on Next.js 15 and earlier it's `middleware.ts`. Functionally equivalent for this app's purposes — pick based on the actual Next.js version in use.

**What stays generic downstream:** `lib/urls.ts` and the route handlers only ever see a plain `userId: string | null` — no better-auth types leak past `lib/auth.ts`. Swapping providers later would mean rewriting `lib/auth.ts` and regenerating the schema's auth tables, not touching the query layer.

---

## 7. Error Handling Conventions

Consistent shape across `/api/*` routes so the frontend has one thing to parse, expressed as a discriminated union on `success` — this lets TypeScript narrow `data` vs `error` based on the boolean, rather than checking key presence:

```typescript
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { message: string; code?: string } };
```

Every `/api/*` route returns this shape regardless of outcome; the HTTP status code carries the category of failure (table below), and `error.code` can carry a machine-readable subtype (e.g. `"ALIAS_TAKEN"`, `"INVALID_FORMAT"`) for client-side branching without string-matching `message`.

| Situation                                            | HTTP status                                                            |
| ---------------------------------------------------- | ---------------------------------------------------------------------- |
| Validation failure (bad alias format, missing field) | 400                                                                    |
| Not authenticated (write endpoints)                  | 401                                                                    |
| Authenticated but doesn't own the resource           | 404 (not 403 — avoids confirming the resource exists for another user) |
| Alias collision (custom)                             | 409                                                                    |
| Generated-alias retries exhausted                    | 500                                                                    |
| Cron endpoint hit without valid cron auth            | 401                                                                    |

The 404-not-403 choice on ownership mismatches is deliberate: it means a user probing `/api/urls/17` that belongs to someone else learns nothing about whether row 17 exists at all.

---

## 8. Deployment Notes

- **Environment variables:** `DATABASE_URL` (pooled connection string), `CRON_SECRET` (Vercel-managed), plus whatever the chosen auth provider requires.
- **Migrations:** Drizzle Kit (`drizzle-kit generate` / `drizzle-kit migrate`), run as part of the deploy pipeline, not on cold start.
- **Redirect route caching:** `GET /[alias]` should not be statically cached or ISR'd — alias→URL mappings and expiration state change at write time and must be read fresh on every request. Mark it dynamic explicitly (`export const dynamic = "force-dynamic"`) rather than relying on Next.js's inference, so a future refactor can't accidentally make link clicks serve stale destinations.

---

## 9. What This Doc Intentionally Doesn't Cover

Per the PRD's non-goals and deferred decisions — not because they were forgotten:

- Click analytics infrastructure (no `clicks` table — see PRD §3).
- Rate limiting on anonymous creation — flagged as an open question in the PRD; if added, it slots in as a check inside `createUrl()`'s route handler (e.g. IP-based, via Vercel's edge middleware or a KV store), not a schema change.
- Sensitive/private link handling — would be additive (new columns/table), not a rework of anything described here.
