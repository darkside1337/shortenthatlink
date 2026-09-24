# shortenTHATlink — Implementation Roadmap

> Generated from [`docs/PRD.md`](./PRD.md) and [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md).
> Phases are ordered by dependency — do not skip ahead. Each step is self-contained enough to verify before moving on.

**Current state snapshot (as of roadmap creation):**

- Next.js 16, Drizzle, Neon Postgres (`@neondatabase/serverless`), better-auth already installed.
- `db/schema.ts` — only better-auth tables (`user`, `session`, `account`, `verification`). **`Url` table is missing.**
- `db/index.ts` — Drizzle + Neon pool wired up. ✅
- `lib/auth.ts` — `betterAuth()` with Drizzle adapter + Google + GitHub social providers. ✅
- `lib/auth-client.ts` — `createAuthClient` with `signIn`, `signOut`, `useSession`. ✅
- `app/api/auth/[...all]/route.ts` — better-auth catch-all handler. ✅
- `app/login/page.tsx` — Google + GitHub OAuth sign-in UI. ✅ (UI complete, wired to real auth)
- `app/page.tsx` — Home/hero page with shortener form. ✅ (UI complete, **mock/hardcoded — not wired to API**)
- `app/(dashboard)/dashboard/page.tsx` — Dashboard UI. ✅ (UI complete, **mock/hardcoded — not wired to API**)
- `app/not-found.tsx` — 404 page. ✅
- No `proxy.ts`, no `app/[alias]/route.ts`, no `lib/alias.ts`, no `lib/reserved-aliases.ts`, no `lib/urls.ts`, no `/api/urls` routes, no `/api/cron/cleanup`, no `vercel.json`.

---

## Phase 1 — Database Schema & Migrations

> Goal: Get the `Url` table in the database and all indexes defined.

- [x] **1.1** Open `db/schema.ts`. Add the `Url` table using `pgTable`:
  - `id`: `serial("id").primaryKey()`
  - `alias`: `varchar("alias", { length: 52 }).notNull().unique()`
  - `originalUrl`: `text("original_url").notNull()`
  - `isCustomAlias`: `boolean("is_custom_alias").default(false).notNull()`
  - `userId`: `text("user_id").references(() => user.id, { onDelete: "cascade" })` — nullable (no `.notNull()`)
  - `expiresAt`: `timestamp("expires_at")` — nullable (no `.notNull()`, no default)
  - `createdAt`: `timestamp("created_at").defaultNow().notNull()`
  - `updatedAt`: `timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull()`

- [x] **1.2** In the same file, add indexes to the `Url` table as a second argument to `pgTable`:
  - `(table) => [ index("url_alias_idx").on(table.alias), index("url_userId_idx").on(table.userId), index("url_expiresAt_idx").on(table.expiresAt) ]`

- [x] **1.3** Export a `urlRelations` Drizzle relation: `Url` has one `user` (via `userId` → `user.id`). Also add `urls: many(url)` to the existing `userRelations`.

- [x] **1.4** Run `pnpm drizzle-kit generate` to generate the migration SQL file. Inspect the output — confirm it creates the `url` table with all 8 columns and the 3 indexes.

- [x] **1.5** Run `pnpm drizzle-kit migrate` (with `DATABASE_URL` set in your `.env.local`) to apply the migration to the Neon database.

- [x] **1.6** Verify via Neon console (or `psql`) that the `url` table exists and has the correct schema.

---

## Phase 1.5 — Test Infrastructure

> Goal: Get `pnpm test:unit` reliably running the existing test files and lay the rails for unit, integration, and E2E commands. Do this before implementing any Phase 2 logic.

- [x] **1.5.1** Create `vitest.config.ts` at the project root with `@/` path alias resolution and `environment: "node"`. _(Per-file DOM override available via `// @vitest-environment jsdom` at any file top — no extra installs needed for that.)_

- [x] **1.5.2** Update `package.json` scripts:
  - `test` / `test:unit` — runs Vitest, excludes `*.integration.test.ts` and `e2e/**` (fast, no DB needed)
  - `test:integration` — targets `lib/__tests__/*.integration.test.ts` only (requires `DATABASE_URL`)
  - `test:e2e` — runs `playwright test` (added in Phase 7)
  - `test:all` — runs everything
  - `test:watch` — Vitest watch mode (unit tests only)

- [x] **1.5.3** Run `pnpm test:unit` — the existing `lib/__tests__/alias.test.ts` suite (11 tests across `RESERVED_ALIASES`, `generateAlias`, `validateCustomAlias`) should pass cleanly with no path-alias errors.

- [x] **1.5.4** Run `pnpm test:integration` — `lib/__tests__/urls.integration.test.ts` should pass against your Neon dev database (requires `DATABASE_URL` in `.env.local`). _(This can be deferred until after Phase 2.4 when `lib/urls.ts` is implemented.)_

---

## Phase 2 — Core Business Logic (lib/)

> Goal: Implement alias generation, validation, reserved-alias list, and all database query functions — with zero UI involvement.

### Step 2.1 — `lib/reserved-aliases.ts`

- [x] **2.1.1** Create `lib/reserved-aliases.ts`. Export a `const RESERVED_ALIASES: Set<string>` containing at minimum: `"api"`, `"auth"`, `"admin"`, `"dashboard"`, `"login"`, `"cron"`, `"static"`, `"assets"`, `"favicon"`, `"robots"`, `"sitemap"`. These must match every top-level route in `app/`.

- [x] **2.1.2** Run `pnpm test:unit` — the `RESERVED_ALIASES` describe block (2 tests) should go green.

### Step 2.2 — `lib/alias.ts`

- [x] **2.2.1** Create `lib/alias.ts`. Install `nanoid` if not already present (`pnpm add nanoid`).

- [x] **2.2.2** Implement `generateAlias(): string`:
  - Uses NanoID with alphabet `"23456789abcdefghjkmnpqrstuvwxyz"` (no `0/O`, `1/l/I`, no uppercase) and length `9`.
  - Returns a single generated alias string.

- [x] **2.2.3** Implement `validateCustomAlias(alias: string): string | null`:
  - Lowercase the input first.
  - Return an error string (not throw) for each failure case, in this order:
    1. Length not between 4 and 52 → `"Alias must be 4–52 characters."`
    2. Contains characters other than `a-z`, `0-9`, `-` → `"Only letters, numbers, and hyphens allowed."`
    3. Starts or ends with `-` → `"Alias cannot start or end with a hyphen."`
    4. Contains `--` → `"Alias cannot contain consecutive hyphens."`
    5. Is in `RESERVED_ALIASES` → `"This alias is reserved."`
  - Return `null` if all checks pass.

- [x] **2.2.4** Run `pnpm test:unit` — all `generateAlias` and `validateCustomAlias` describe blocks (9 tests) should pass.

### Step 2.3 — `lib/auth.ts` additions

- [x] **2.3.1** Add a `getCurrentUserId()` helper function to `lib/auth.ts`:
  ```ts
  import { headers } from "next/headers";
  export async function getCurrentUserId(): Promise<string | null> {
    const session = await auth.api.getSession({ headers: await headers() });
    return session?.user.id ?? null;
  }
  ```
  Nothing outside `lib/auth.ts` should call `auth.api` directly.

### Step 2.4 — `lib/urls.ts`

- [x] **2.4.1** Create `lib/urls.ts`. Import `db` from `@/db`, the `url` table (exported as `url` from `db/schema.ts`), `eq`, `and`, `lt`, `sql` from `drizzle-orm`, and any types needed.

- [x] **2.4.2** Implement `findUrlByAlias(alias: string): Promise<typeof url.$inferSelect | null>`:
  - Query: `SELECT * FROM url WHERE alias = lowercase(alias) LIMIT 1`.
  - Return the row or `null`.

- [x] **2.4.3** Implement `createUrl(input: { originalUrl: string; alias: string; isCustomAlias: boolean; userId: string | null; expiresAt: Date | null }): Promise<typeof url.$inferSelect>`:
  - Insert a new row. Return the inserted row (use `.returning()`).
  - Do **not** catch DB errors here — let the caller handle unique-constraint violations (`error.code === "23505"`).

- [x] **2.4.4** Implement `renameUrlAlias(id: number, userId: string, newAlias: string): Promise<typeof url.$inferSelect | null>`:
  - Update query: `UPDATE url SET alias = newAlias WHERE id = id AND userId = userId RETURNING *`.
  - The `WHERE` clause must include both `id` AND `userId` — ownership enforcement happens in the query, not application code.
  - Return the updated row, or `null` if no row matched (either not found or wrong owner — callers treat both as 404).

- [x] **2.4.5** Implement `deleteUrl(id: number, userId: string): Promise<void>`:
  - Delete query: `DELETE FROM url WHERE id = id AND userId = userId`.
  - Same dual-condition ownership enforcement.
  - No return value needed.

- [x] **2.4.6** Implement `listUrlsForUser(userId: string): Promise<(typeof url.$inferSelect)[]>`:
  - Query: `SELECT * FROM url WHERE userId = userId ORDER BY createdAt DESC`.

- [x] **2.4.7** Implement `deleteExpiredUrls(): Promise<number>`:
  - Query: `DELETE FROM url WHERE expiresAt IS NOT NULL AND expiresAt < NOW()`.
  - Return the count of deleted rows (use `.returning()` and `.length`, or check Drizzle's delete result).

- [x] **2.4.8** Run `pnpm test:integration` — all 6 test cases in `lib/__tests__/urls.integration.test.ts` (`createUrl`, `findUrlByAlias`, `renameUrlAlias`, `listUrlsForUser`, `deleteUrl`, `deleteExpiredUrls`) should pass against your Neon dev database. This also satisfies step **1.5.4**.

---

## Phase 3 — Route Protection (proxy.ts)

> Goal: Protect `/dashboard` and write API routes so unauthenticated users get redirected/rejected. This is Next.js 16's `proxy.ts` pattern.

- [x] **3.1** Read `node_modules/next/dist/docs/` to understand the Next.js 16 `proxy.ts` route-protection convention before writing any code (per AGENTS.md rules).

- [x] **3.2** Create `proxy.ts` at the project root (same level as `package.json`). Configure it to:
  - Redirect unauthenticated requests to `/dashboard` → redirect to `/login`.
  - Return 401 for unauthenticated requests to `PATCH /api/urls/[id]` and `DELETE /api/urls/[id]`.
  - Return 401 for unauthenticated `GET /api/urls` (list my links — requires auth per PRD §6).
  - Allow all other routes to pass through (public: `/`, `/login`, `/[alias]`, `POST /api/urls`, `GET /api/auth/[...all]`).
  - Use `auth.api.getSession({ headers: req.headers })` (or the equivalent Next.js 16 proxy API) to read the session.

- [x] **3.3** Verify the config: unauthenticated visit to `/dashboard` in the browser should redirect to `/login`. Authenticated visit should load the dashboard.

---

## Phase 4 — API Route Handlers

> Goal: Implement all five API endpoints. Each handler calls `lib/urls.ts` and `lib/auth.ts` — no direct DB queries in route handlers.

### Step 4.1 — `POST /api/urls` and `GET /api/urls`

- [x] **4.1.1** Create `app/api/urls/route.ts`.

- [x] **4.1.2** Implement `POST` handler (create a short URL):
  1. Parse JSON body: `{ originalUrl, customAlias?, expiresAt? }`. Return `400` if `originalUrl` is missing or not a valid URL.
  2. Call `getCurrentUserId()` — may be `null` (anonymous is allowed).
  3. If `customAlias` is provided:
     - Call `validateCustomAlias(customAlias)`. If it returns an error string, return `{ success: false, error: { message, code: "INVALID_FORMAT" } }` with status `400`.
     - Lowercase `customAlias`.
     - Call `createUrl({ ..., alias: customAlias, isCustomAlias: true })`.
     - If the DB throws with `error.code === "23505"`, return `{ success: false, error: { message: "Alias already taken.", code: "ALIAS_TAKEN" } }` with status `409`.
  4. If no `customAlias`:
     - Loop up to 5 times: call `generateAlias()`, attempt `createUrl(...)`.
     - If the DB throws `23505`, retry. After 5 failures, return `{ success: false, error: { message: "Failed to generate a unique alias.", code: "ALIAS_COLLISION" } }` with status `500`.
  5. On success: return `{ success: true, data: { id, alias, originalUrl, expiresAt, createdAt } }` with status `201`.

- [x] **4.1.3** Implement `GET` handler (list current user's URLs):
  1. Call `getCurrentUserId()`. If `null`, return `{ success: false, error: { message: "Authentication required." } }` with status `401`.
  2. Call `listUrlsForUser(userId)`.
  3. Return `{ success: true, data: urls }` with status `200`.

- [x] **4.1.4** Create `app/api/urls/__tests__/route.test.ts`. Use `vi.mock()` to stub `@/lib/urls`, `@/lib/alias`, and `@/lib/auth`. Test cases:
  - `POST` returns `400` if `originalUrl` is missing from body
  - `POST` returns `400` if `originalUrl` is not a parseable URL
  - `POST` with a valid URL and no custom alias calls `generateAlias` + `createUrl` and returns `201`
  - `POST` with a valid custom alias calls `validateCustomAlias` + `createUrl` and returns `201`
  - `POST` with a custom alias failing validation returns `400 INVALID_FORMAT`
  - `POST` with a custom alias that collides in the DB returns `409 ALIAS_TAKEN`
  - `POST` retries up to 5 times on generated-alias collision, then returns 500 ALIAS_COLLISION
  - `GET` returns `401` when `getCurrentUserId()` returns `null`
  - `GET` returns `200` with the user's link array on success

  Run `pnpm test:unit` — all 9 handler tests pass.

### Step 4.2 — `PATCH /api/urls/[id]` and `DELETE /api/urls/[id]`

- [x] **4.2.1** Create `app/api/urls/[id]/route.ts`.

- [x] **4.2.2** Implement `PATCH` handler (rename alias):
  1. Call `getCurrentUserId()`. If `null`, return `401`.
  2. Parse `id` from params as integer. If not a valid integer, return `400`.
  3. Parse JSON body: `{ newAlias }`. If missing, return `400`.
  4. **Important:** Fetch the target row first to check `isCustomAlias`. If the row's `isCustomAlias` is `false`, return `400` with `{ message: "Generated aliases must be converted to custom first.", code: "NOT_CUSTOM" }`. (The edit that converts is the rename itself — if sending a new alias to a generated-alias row, set `isCustomAlias: true` in the update.)

  > **Clarification from Architecture §5 Edit:** The PATCH endpoint accepts a new alias for any row. If the row currently has `isCustomAlias: false`, the first rename converts it (flips to `true`). So actually: do **not** block the rename if `isCustomAlias` is false — instead, allow it and the `renameUrlAlias` will update `isCustomAlias: true` on the same UPDATE. Amend step 3 accordingly: remove the `isCustomAlias` check block. The rename is always allowed; it sets `isCustomAlias: true`.
  4. Call `validateCustomAlias(newAlias)`. If it returns an error, return `400`.
  5. Call `renameUrlAlias(id, userId, newAlias.toLowerCase())`.
     - If it returns `null`, return `404` (not found or not owned — do not distinguish).
     - If DB throws `23505`, return `409` with `code: "ALIAS_TAKEN"`.
  6. On success: return `{ success: true, data: updatedRow }` with status `200`.

- [x] **4.2.3** Implement `DELETE` handler:
  1. Call `getCurrentUserId()`. If `null`, return `401`.
  2. Parse `id` from params as integer. If invalid, return `400`.
  3. Call `deleteUrl(id, userId)`.
  4. Return `{ success: true, data: null }` with status `200`.

  > Note: `deleteUrl` silently does nothing if the row doesn't exist or the user doesn't own it (the WHERE clause just matches 0 rows). That's acceptable — idempotent delete is fine for MVP.

- [x] **4.2.4** Create `app/api/urls/[id]/__tests__/route.test.ts`. Use `vi.mock()` to stub `@/lib/urls`, `@/lib/alias`, and `@/lib/auth`. Test cases:
  - `PATCH` returns `401` when `getCurrentUserId()` is `null`
  - `PATCH` returns `400` for a non-integer `id` param
  - `PATCH` returns `400` when `newAlias` fails `validateCustomAlias`
  - `PATCH` returns `404` when `renameUrlAlias` returns `null` (not found / wrong owner)
  - `PATCH` returns `409 ALIAS_TAKEN` when the DB throws a unique-constraint error
  - `PATCH` returns `200` with the updated row on success
  - `DELETE` returns `401` when no session
  - `DELETE` returns `400` for a non-integer `id` param
  - `DELETE` returns `200` on success (idempotent)

  Run `pnpm test:unit` — all 9 handler tests pass.

### Step 4.3 — `GET /[alias]` (redirect)

- [x] **4.3.1** Create `app/[alias]/route.ts` (a route handler, not a page — it handles the GET and does server-side redirect).

- [x] **4.3.2** Add `export const dynamic = "force-dynamic"` at the top of the file. This is mandatory — alias→URL mappings change at write time and must never be served stale.

- [x] **4.3.3** Implement the `GET` handler:
  1. Lowercase the `alias` param from `params`.
  2. Call `findUrlByAlias(alias)`.
  3. If `null` → call Next.js `notFound()`.
  4. If `row.expiresAt` is not null and `row.expiresAt < new Date()` → call `notFound()`. (Logical expiry check — the row may still exist physically.)
  5. Otherwise → call `redirect(row.originalUrl)`.

- [x] **4.3.4** Confirm `app/not-found.tsx` is already in place (it is — shows 404/expired message). No changes needed.

### Step 4.4 — `DELETE /api/cron/cleanup`

- [x] **4.4.1** Create `app/api/cron/cleanup/route.ts`.

- [x] **4.4.2** Implement `DELETE` handler:
  1. Read the `Authorization` header. Compare to `Bearer ${process.env.CRON_SECRET}`. If missing or mismatched → return `401`.
  2. Call `deleteExpiredUrls()`.
  3. Return `{ success: true, data: { deleted: count } }` with status `200`.

- [x] **4.4.3** Create `app/api/cron/cleanup/__tests__/route.test.ts`. Use `vi.mock()` to stub `@/lib/urls`. Test cases:
  - Returns `401` when the `Authorization` header is absent
  - Returns `401` when the bearer token does not match `process.env.CRON_SECRET`
  - Returns `200` with `{ deleted: <count> }` when the token is correct

  Run `pnpm test:unit` — all 3 cron handler tests pass.

### Step 4.5 — `vercel.json`

- [x] **4.5.1** Create `vercel.json` at the project root:
  ```json
  {
    "crons": [{ "path": "/api/cron/cleanup", "schedule": "0 * * * *" }]
  }
  ```

---

## Phase 5 — Feature Decomposition & Real State Wiring

> Goal: Decompose route pages into domain feature slices (`features/shortener`, `features/dashboard`), and replace all mock/hardcoded data with real API calls.
> Core rule: **Routes compose features; features contain business logic.**

### Step 5.1 — Shortener Feature (`features/shortener` & `app/page.tsx`)

- [x] **5.1.1** Extract link creation UI and hooks into `features/shortener/`:
  - `features/shortener/components/shortener-form.tsx`
  - `features/shortener/components/advanced-options.tsx`
  - `features/shortener/components/shorten-result.tsx`
  - `features/shortener/hooks/use-shortener.ts`
- [x] **5.1.2** In `features/shortener/hooks/use-shortener.ts`, replace the mock result assignment with a real `fetch("POST /api/urls", { body: JSON.stringify({ originalUrl: url, customAlias: customAlias || undefined, expiresAt: computedExpiresAt }) })`.
  - Compute `expiresAt` from the `expiration` dropdown value before the fetch (e.g. `"1h"` → `new Date(Date.now() + 3600_000).toISOString()`; `"never"` → omit the field).
  - On success (`response.ok && data.success`): set `createdResult` using the response data.
  - On error: show the `data.error.message` to the user (add a simple error state string, render it below the form in red text).
- [x] **5.1.3** Add a loading state to the Shorten button: disable it and show a spinner or "Shortening…" text while the fetch is in flight.
- [x] **5.1.4** Update the `createdResult.shortUrl` display to use the real `window.location.origin` + `"/" + alias` instead of the hardcoded `"shortenTHATlink/..."` prefix.
- [x] **5.1.5** Keep `app/page.tsx` as a thin orchestrator composing the navigation header, `<ShortenerForm />`, and footer.


### Step 5.2 — Dashboard Feature (`features/dashboard` & `app/(dashboard)/dashboard/page.tsx`)

- [x] **5.2.1** Decompose the monolithic dashboard route into `features/dashboard/`:
  - `features/dashboard/components/dashboard-header.tsx`
  - `features/dashboard/components/links-table.tsx`
  - `features/dashboard/components/link-row.tsx`
  - `features/dashboard/components/edit-link-dialog.tsx`
  - `features/dashboard/components/delete-link-dialog.tsx`
  - `features/dashboard/components/dashboard-empty-state.tsx`
  - `features/dashboard/components/dashboard-view.tsx`
  - `features/dashboard/hooks/use-dashboard.ts`
- [x] **5.2.2** Remove `INITIAL_LINKS` hardcoded mock data and inline `validateAliasFormat` duplicates from the dashboard.

- [x] **5.2.2** Add a data-fetching effect: on mount, call `GET /api/urls`. On success, set the `links` state with the returned array. Map the API response fields to the local `LinkItem` interface (note field name differences: `isCustomAlias` → `isCustom`, `expiresAt` timestamp → formatted display string).

- [x] **5.2.3** Wire the "New Link" dialog's `handleCreateLink` to `POST /api/urls`. On success, prepend the new link to the local `links` state (or re-fetch). On error, display the `error.message` inline in the form.

- [x] **5.2.4** Wire the Manage modal's `handleSaveManage` (rename) to `PATCH /api/urls/[link.id]` with `{ newAlias }`. On success, update the link in local state. On `409`, set `aliasError` to `"This alias is already taken."`. On other errors, set a generic error.

- [x] **5.2.5** Wire `handleConfirmDelete` to `DELETE /api/urls/[link.id]`. On success, remove from local state. On error, close the modal and show a toast or alert (a simple `window.alert` is acceptable for MVP).

- [x] **5.2.6** Add loading states: disable the Save/Delete buttons and show feedback while requests are in flight.

- [x] **5.2.7** Remove the `validateAliasFormat` function from the dashboard — alias validation lives in `lib/alias.ts` on the server. On the client, you may keep simple inline length/character hints as UX, but the authoritative validation is the API's `400` response.

### Step 5.3 — Dashboard Route Group Layout

- [x] **5.3.1** Check `app/(dashboard)/layout.tsx`. If it doesn't exist, create it. It should:
  - Be a Server Component.
  - Call `getCurrentUserId()`. If `null`, call Next.js `redirect("/login")`.
  - Otherwise render `{children}`.
  - This is a belt-and-suspenders guard alongside `proxy.ts` — the proxy handles the redirect before the request hits the server component, but the layout guard is still good practice.

---

## Phase 6 — Environment Variables & Deployment Checklist

> Goal: Ensure the app is deployable to Vercel with all required configuration.

- [ ] **6.1** Confirm `.env.local` (for local dev) contains:
  - `DATABASE_URL` — Neon pooled connection string.
  - `BETTER_AUTH_SECRET` — a long random string (generate with `openssl rand -base64 32`).
  - `BETTER_AUTH_URL` — `http://localhost:3000` locally; production URL on Vercel.
  - `NEXT_PUBLIC_BETTER_AUTH_URL` — same as above (client-side auth client needs it).
  - `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` — from GitHub OAuth app settings.
  - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` — from Google Cloud Console.
  - `CRON_SECRET` — any strong random string; Vercel will also set this automatically for cron routes.

- [ ] **6.2** Add all of the above env vars to the Vercel project settings (Settings → Environment Variables).

- [ ] **6.3** Set OAuth callback URLs:
  - GitHub OAuth app: add `https://<your-vercel-domain>/api/auth/callback/github`.
  - Google OAuth app: add `https://<your-vercel-domain>/api/auth/callback/google`.

- [ ] **6.4** Ensure `drizzle-kit migrate` runs as part of the Vercel build or as a one-time deploy step — **not on cold start**. One approach: add a `migrate` script in `package.json` and run it manually before the first deploy, or as a pre-build step in `vercel.json`.

- [ ] **6.5** Confirm `vercel.json` exists (created in Phase 4.5) and the cron schedule is correct.

---

## Phase 7 — End-to-End Verification

> Goal: Automated Playwright specs covering the critical paths, followed by a final manual pass for the cases that are hardest to automate (OAuth login, DB console manipulation, etc.).

### Step 7.0 — Playwright Setup & Specs

- [ ] **7.0** Install Playwright and set up the E2E harness:
  1. `pnpm add -D @playwright/test`
  2. `pnpm exec playwright install --with-deps chromium`
  3. Create `playwright.config.ts` at the project root:
     ```ts
     import { defineConfig, devices } from "@playwright/test";
     export default defineConfig({
       testDir: "./e2e",
       fullyParallel: true,
       retries: process.env.CI ? 2 : 0,
       use: {
         baseURL: process.env.TEST_BASE_URL ?? "http://localhost:3000",
         screenshot: "only-on-failure",
         trace: "on-first-retry",
       },
       projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
     });
     ```
  4. Create the `e2e/` directory at the project root.
  5. Add `e2e/.auth/` to `.gitignore` (used for saved session state in step 7.0.3).

- [ ] **7.0.1** Create `e2e/home.spec.ts` — anonymous shortener flow:
  - Anonymous user can paste a URL, click Shorten, and see the result card with a short link
  - Submitting an invalid custom alias format shows an inline validation error
  - Creating two links with the same custom alias shows an inline `ALIAS_TAKEN` error on the second attempt

- [ ] **7.0.2** Create `e2e/redirect.spec.ts` — redirect and expiry:
  - Navigating to a valid short URL redirects to the original destination
  - Navigating to an unknown alias renders the 404/expired page

- [ ] **7.0.3** Create `e2e/dashboard.spec.ts` — authenticated CRUD using saved session state:
  - Save auth state once: run `pnpm exec playwright codegen http://localhost:3000/login`, log in via OAuth, save the browser storage to `e2e/.auth/user.json`; configure the spec with `test.use({ storageState: "e2e/.auth/user.json" })`
  - Dashboard loads and shows the user's links
  - Creating a link via the "New Link" dialog adds it to the table
  - Renaming an alias via the Manage modal reflects the new alias in the row
  - Deleting a link removes it from the table

- [ ] **7.0.4** With `pnpm dev` running in a separate terminal, run `pnpm test:e2e` — all specs in `e2e/` should pass before proceeding to the manual verification steps below.

### Step 7.1–7.12 — Manual Verification

> [!NOTE]
> The automated specs above cover the happy paths. The steps below verify edge cases and deployment-specific behaviour that is hard to automate reliably.

- [ ] **7.1** Anonymous user can shorten a URL on `/` and get a working redirect link. _(PRD §8 criterion 1)_

- [ ] **7.2** Short link redirect (`/[alias]`) works — paste the short URL in a new browser tab, confirm it redirects to the original URL. _(PRD §8 criterion 4)_

- [ ] **7.3** Custom alias validation: try creating a link with an alias that is too short, contains invalid chars, starts with a hyphen, is a reserved word — confirm each returns a `400` with the correct error message.

- [ ] **7.4** Custom alias collision: create two links with the same alias — confirm the second returns `409 ALIAS_TAKEN`. _(PRD §8 criterion 3)_

- [ ] **7.5** Sign in with Google or GitHub. Confirm the session persists and the dashboard loads with real data. _(PRD §8 criterion 1 + 5)_

- [ ] **7.6** Create a link while logged in. Confirm it appears in the dashboard with the correct alias, destination URL, and expiry. _(PRD §8 criterion 5)_

- [ ] **7.7** Rename a link's alias from the dashboard Manage modal. Confirm:
  - The old alias now 404s.
  - The new alias redirects correctly. _(PRD §8 criterion 5)_

- [ ] **7.8** Delete a link from the dashboard. Confirm the old alias now 404s and the link disappears from the list. _(PRD §8 criterion 5)_

- [ ] **7.9** Create a link with a short expiry (e.g. 1 hour, then manually set `expiresAt` to a past timestamp in the DB via Neon console). Confirm the redirect returns 404 (not found page) even though the row still exists. _(PRD §8 criterion 4 + 6)_

- [ ] **7.10** Hit `DELETE /api/cron/cleanup` with the correct `Authorization: Bearer <CRON_SECRET>` header. Confirm expired rows are deleted and the response returns the count. _(PRD §8 criterion 6)_

- [ ] **7.11** Hit `DELETE /api/cron/cleanup` without the auth header — confirm `401` is returned.

- [ ] **7.12** Try to `PATCH /api/urls/<id>` or `DELETE /api/urls/<id>` without a session — confirm `401`. Try with a session but a row owned by a different user (or a non-existent id) — confirm `404`.

---

## Appendix — File Creation Checklist

A flat list of every file that needs to be **created** (not yet in the repo):

- [x] `lib/reserved-aliases.ts`
- [x] `lib/alias.ts`
- [x] `lib/urls.ts`
- [x] `proxy.ts` (project root)
- [x] `app/[alias]/route.ts`
- [x] `app/api/urls/route.ts`
- [x] `app/api/urls/__tests__/route.test.ts`
- [x] `app/api/urls/[id]/route.ts`
- [x] `app/api/urls/[id]/__tests__/route.test.ts`
- [x] `app/api/cron/cleanup/route.ts`
- [x] `app/api/cron/cleanup/__tests__/route.test.ts`
- [x] `app/(dashboard)/layout.tsx` (may already exist — check first)
- [x] `vercel.json` (project root)
- [x] `vitest.config.ts` (project root)
- [ ] `playwright.config.ts` (project root)
- [ ] `e2e/home.spec.ts`
- [ ] `e2e/redirect.spec.ts`
- [ ] `e2e/dashboard.spec.ts`

And every file that needs to be **modified** (already in the repo):

- [x] `db/schema.ts` — add `Url` table + `urlRelations` + `urls: many(url)` to `userRelations`
- [x] `lib/auth.ts` — add `getCurrentUserId()` helper
- [x] `app/page.tsx` — wire form to `POST /api/urls`
- [x] `app/(dashboard)/dashboard/page.tsx` — replace mock data with real API calls
- [x] `package.json` — add `test:unit`, `test:integration`, `test:e2e`, `test:all`, `test:watch` scripts
