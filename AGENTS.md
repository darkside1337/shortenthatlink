shortenTHATlink is a zero-surveillance, utility-first URL shortener with instant link creation, optional authenticated link management, and custom aliases backed by Next.js and Neon Postgres — see docs/ARCHITECTURE.md.

Package manager: pnpm

For phased task breakdown and current progress, see docs/ROADMAP.md
For visual design system, tokens, and layout specs, see docs/DESIGN.md
For project architecture, request lifecycles, and security invariants, see docs/ARCHITECTURE.md
For data model, alias specifications, and requirements, see docs/PRD.md
For product positioning, principles, and target audience, see PRODUCT.md

Build & Database: `pnpm build`, `pnpm db:generate`, `pnpm db:migrate`

## Roadmap Maintenance

- After completing a task in `docs/ROADMAP.md`, check it off (`- [ ]` → `- [x]`) immediately in the same turn once verified.
- Only check a box when work is tested and diff applied; never uncheck without explicit instruction.
- When a milestone is verified, suggest a conventional commit command with a proposed message and staged files list.

## UI & Styling Workflow

- **Mobile-first:** Build every screen mobile-first using base Tailwind classes, layering `md:` and `lg:` for progressive enhancement. Follow `docs/DESIGN.md` for per-breakpoint specs.
- **Shadcn Component Architecture:** Use Shadcn UI primitives (`components/ui/`) for all buttons, inputs, dialogs, cards, dropdowns, and badges. Do not use raw HTML tags or custom CSS where a Shadcn primitive applies.
- **On-Demand Components:** Install missing components with `pnpm dlx shadcn@latest add <component>` and match `docs/DESIGN.md` design tokens ("Frosted Precision").
- **Pre-Completion UI Audit:** Before marking UI tasks complete or committing, run `git diff` on modified pages and verify that native `<button>`, `<input>`, or un-abstracted container tags outside `components/ui/` are replaced with Shadcn components.

## Architectural Boundaries

- **Routes compose features; features contain business logic:**
  - Route handlers and page components (`app/`) act solely as thin orchestrators: handle routing, search/route parameters, metadata, and mount feature components.
  - Domain components, user interaction flows, and client/server validation live within feature modules in `features/` (e.g. `features/shortener`, `features/dashboard`).
  - Core database operations, auth adapters, and shared helpers stay in `lib/` (including `lib/db/`).

## Planning Workflow

- **Plan Visibility:** Whenever an Implementation Plan is created (e.g. during `/plan`) in the agent brain, duplicate it into `.plans/` in the project root.
- **Component Fidelity in Plans:** Plan code snippets must use Shadcn primitives (`<Button>`, `<Card>`, `<Input>`), never raw HTML tags.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
