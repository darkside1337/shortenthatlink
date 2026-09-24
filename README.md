# shortenTHATlink

> A zero-surveillance, utility-first URL shortener built with Next.js 16, React 19, Neon Postgres, Drizzle ORM, and Better Auth.

---

## Overview

**shortenTHATlink** provides instant link shortening without mandatory signups, paywalled custom aliases, or redirect intermediaries. Anonymous and authenticated users can create short links with customizable expiration intervals and custom slugs, while signed-in users gain access to a personal management dashboard to track, copy, rename, and delete their links.

### Key Highlights
- **Zero Surveillance:** No click analytics tracking, no tracking pixels, and no referral logging.
- **Instant Routing:** Generated NanoID aliases (`23456789abcdefghjkmnpqrstuvwxyz`) or custom slugs (4–52 characters).
- **Flexible Expiration:** 1 hour, 24 hours, 7 days, 30 days, or never. Expired links logically 404 immediately and are purged automatically via scheduled Vercel Cron.
- **Frosted Precision UI:** Mobile-first, developer-grade aesthetic built on hairline borders, monospaced alias clarity, and Shadcn UI primitives (`@base-ui/react`).
- **SSR & Server Components:** Lean client islands (`NavAuthButton`, `ShortenerForm`, `DashboardView`) mounted within server-rendered shells.

---

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **UI & Runtime:** [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/)
- **Component Primitives:** [Base UI](https://base-ui.com/) / [Shadcn UI](https://ui.shadcn.com/) (`base-nova` preset)
- **Database:** [Neon Postgres](https://neon.tech/) (`@neondatabase/serverless`)
- **ORM & Migrations:** [Drizzle ORM](https://orm.drizzle.team/) & [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview)
- **Authentication:** [Better Auth](https://www.better-auth.com/) (Google & GitHub OAuth)
- **Testing:** [Vitest](https://vitest.dev/) (Unit/Integration) and [Playwright](https://playwright.dev/) (E2E)

---

## Getting Started

### Prerequisites

- **Node.js**: v20 or higher
- **Package Manager**: [pnpm](https://pnpm.io/) (`pnpm` is required for this project)
- **Postgres Database**: Neon connection string

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/darkside1337/shortenthatlink.git
cd shortenthatlink
pnpm install
```

### 2. Configure Environment Variables

Copy the example environment configuration:

```bash
cp .env.example .env.local
```

Fill in the required values in `.env.local`:

```env
# Database Connection (Neon pooled connection string)
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# Better Auth Configuration
BETTER_AUTH_SECRET="your-32-character-secret"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Scheduled Cleanup Secret
CRON_SECRET="your-cron-secret"

# Optional Social OAuth (Google & GitHub)
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

### 3. Run Database Migrations

Apply the existing migrations to your Neon database:

```bash
pnpm db:migrate
```

### 4. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Starts the Next.js development server with Turbopack. |
| `pnpm build` | Builds the production bundle with Next.js Turbopack. |
| `pnpm start` | Runs the production build locally. |
| `pnpm typecheck` | Checks TypeScript types without emitting output (`tsc --noEmit`). |
| `pnpm test:unit` | Executes unit tests via Vitest (excludes DB integration and E2E specs). |
| `pnpm test:integration` | Runs database integration tests against your Neon database. |
| `pnpm test:e2e` | Runs end-to-end browser tests using Playwright. |
| `pnpm test:all` | Runs all Vitest test suites. |
| `pnpm db:generate` | Generates new SQL migration files in `lib/db/migrations/` from schema changes. |
| `pnpm db:migrate` | Applies pending migrations to the configured database. |
| `pnpm db:push` | Pushes schema changes directly to the database without generating migration files (dev only). |
| `pnpm db:studio` | Launches Drizzle Studio in your browser to inspect database tables. |

---

## Architecture & Code Organization

The codebase follows strict architectural boundaries:
- **Routes (`app/`) compose features:** Route handlers and page components act solely as thin orchestrators (handling HTTP params, auth redirects, headers, metadata, and mounting feature components).
- **Features (`features/`) contain business logic:** Domain-specific components, state hooks, and client validation reside in domain modules (`features/shortener`, `features/dashboard`, `features/auth`).
- **Core (`lib/`):** Houses pure domain helpers, API contracts, environment validation, auth adapters, and the database layer (`lib/db/`).

```
├── app/                          # Next.js App Router (thin orchestrator pages & routes)
│   ├── [alias]/route.ts          # Public fast-redirect route
│   ├── api/urls/                 # Link creation & management endpoints
│   ├── api/cron/cleanup/         # Scheduled cleanup handler
│   ├── dashboard/                # Authenticated dashboard route
│   └── page.tsx                  # Home shortener landing page
├── components/                   # Shared UI primitives
│   ├── ui/                       # Shadcn UI primitives (button, card, dialog, input, etc.)
│   └── theme-toggle.tsx          # Accessible light/dark theme switch
├── features/                     # Domain modules (UI, hooks, schemas)
│   ├── shortener/                # Link creation form, options, result card
│   └── dashboard/                # Links table, modal dialogs, dashboard state
├── hooks/                        # Shared client hooks (useOrigin, useCopyToClipboard)
├── lib/                          # Core invariants, utilities & data layer
│   ├── db/                       # Drizzle ORM client, schema, and migrations
│   │   ├── index.ts              # Drizzle client singleton
│   │   ├── schema.ts             # Drizzle tables (url, user, session, etc.)
│   │   └── migrations/           # Versioned SQL migrations
│   ├── env.ts                    # Startup Zod environment validation
│   ├── urls.ts                   # Database query functions with ownership checks
│   ├── alias.ts                  # NanoID generator & custom alias validator
│   ├── expiration.ts             # Expiration timestamp calculation
│   └── auth.ts                   # Better Auth server configuration & session cache
└── proxy.ts                      # Route protection & auth redirection
```

---

## Documentation

For in-depth specifications and guidelines:
- [Architecture & Invariants](docs/ARCHITECTURE.md) (`docs/ARCHITECTURE.md`)
- [Visual Design System & Tokens](docs/DESIGN.md) (`docs/DESIGN.md`)
- [Product Requirements (PRD)](docs/PRD.md) (`docs/PRD.md`)
- [Implementation Roadmap](docs/ROADMAP.md) (`docs/ROADMAP.md`)
- [Product Vision & Positioning](PRODUCT.md) (`PRODUCT.md`)

---

## License

MIT
