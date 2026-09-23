# shortenTHATlink — Design System & Style Reference
> Frosted Precision: Mobile-First, developer-grade, zero-surveillance link routing on tactile rice paper

**Status:** Active  
**Stack:** Next.js 16 (App Router), Tailwind CSS v4, `@base-ui/react` / `shadcn/ui` (`base-nova`), Lucide Icons  
**Design Philosophy:** Mobile-First Ergonomic SaaS (touch-first simplicity, zero marketing slop, desktop density through progressive enhancement)  

---

## 1. Atmosphere & Design Philosophy

`shortenTHATlink` is an ergonomic, mobile-first utility for immediate URL shortening and link management. Because link creation frequently happens on-the-go—pasting URLs directly from chat apps (WhatsApp, Telegram, Slack), social networks, and mobile browsers—mobile is the primary design canvas, not a responsive concession.

### Core Principles
1. **Mobile-First Ergonomics & Thumb-Zone Architecture:**
   - All primary touch targets satisfy a strict **44×44px minimum** boundary (`h-11` or `p-2.5+`).
   - Core creation CTAs and copy triggers sit comfortably within the natural lower-half thumb zone.
   - Text inputs enforce a **16px font size (`text-base`)** on mobile to prevent iOS Safari auto-zoom on focus.
2. **Bottom-Sheet Drawers Over Floating Modals:**
   - On mobile viewports (`<640px`), contextual flows (Edit Alias, Delete Link, QR Share) slide up as native-feeling **Bottom Sheets / Drawers** with swipe-down dismissal gestures.
   - On desktop viewports (`sm:`), they smoothly expand into centered dialogs.
3. **Border-First Elevation:**
   - Surfaces rely on crisp 1px hairline borders (`#e5e5e5` / `oklch(0.922 0 0)` in light mode, `oklch(1 0 0 / 10%)` in dark mode) instead of diffuse drop shadows. This evokes a technical, tactile printed-document feel.
4. **Neutral Base with a Single Voltage Point:**
   - Surfaces remain canvas white or subtle paper mist (`#f5f5f5`). The single chromatic centerpiece is **Electric Blue** (`#2563eb`), reserved strictly for touch focus rings, active links, copy confirmations, and brand glyphs.
5. **Pill-Centric Tag Architecture (3-Tier Radius):**
   - `9999px` (`rounded-full`): Status badges, custom/generated tags, filter chips, and pill buttons.
   - `6px` / `8px` (`rounded-md` / `rounded-lg`): Form inputs, standard buttons, dropdown triggers.
   - `12px` / `16px` (`rounded-xl` / `rounded-2xl`): Cards, hero creation containers, drawers, modals.
6. **Developer-Grade Typography:**
   - Calm, sharp `500` medium weights with snug tracking. Monospaced fonts (`Geist Mono`) are first-class citizens across all aliases, hashes, and previews to prevent visual character ambiguity (`0` vs `O`, `1` vs `l`, `I`).

---

## 2. Design Tokens

### Color Palette (Light & Dark Mode)

All status text colors are strictly calibrated to exceed **WCAG AA 4.5:1 contrast** against their badge backgrounds.

| Token | CSS Variable | Light Hex / Oklch | Dark Oklch | Purpose / Role |
| :--- | :--- | :--- | :--- | :--- |
| **Canvas** | `--canvas` | `#ffffff` / `oklch(1 0 0)` | `oklch(0.145 0 0)` | Base page background and primary card face |
| **Paper Mist** | `--paper` | `#f5f5f5` / `oklch(0.97 0 0)` | `oklch(0.205 0 0)` | Secondary panels, nested card fills, muted button backgrounds |
| **Ash (Hairline)** | `--ash` | `#e5e5e5` / `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` | Universal 1px structural container and divider border |
| **Smoke** | `--smoke` | `#d4d4d4` / `oklch(0.87 0 0)` | `oklch(1 0 0 / 18%)` | Elevated borders, active hover outlines |
| **Charcoal** | `--foreground` | `#171717` / `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | Primary body copy and headings |
| **Graphite** | `--color-graphite` | `#262626` / `oklch(0.25 0 0)` | `oklch(0.85 0 0)` | Secondary text and high-contrast UI icons |
| **Steel** | `--muted-foreground` | `#737373` / `oklch(0.556 0 0)` | `oklch(0.708 0 0)` | Helper text, destination URLs, timestamps, metadata |
| **Electric Blue** | `--electric-blue` | `#2563eb` / `oklch(0.546 0.245 262.88)` | `#3b82f6` / `oklch(0.623 0.214 259.82)` | Primary interactive accent, focus rings, brand glyphs |
| **Primary Action** | `--primary` | `#0a0a0a` / `oklch(0.205 0 0)` | `oklch(0.922 0 0)` | Main committed CTA background (Shorten button, Save button) |
| **Mint Badge BG** | `--mint-bg` | `#dcfce7` | `oklch(0.25 0.08 145)` | Background for `Custom Alias` badge / success states |
| **Mint Badge Text**| `--mint-text` | `#15803d` *(4.54:1 AA)* | `oklch(0.85 0.15 145)` | Text for `Custom Alias` badge / success icons |
| **Amber Badge BG** | `--amber-badge-bg` | `#fef3c7` | `oklch(0.25 0.08 80)` | Background for expiring-soon indicators |
| **Amber Badge Text**| `--amber-badge-text` | `#92400e` *(5.12:1 AA)* | `oklch(0.85 0.15 80)` | Text for expiring-soon indicators |
| **Rose Badge BG** | `--rose-badge-bg` | `#fee2e2` | `oklch(0.25 0.08 25)` | Background for expired/destructive states |
| **Rose Badge Text** | `--rose-badge-text` | `#b91c1c` *(5.70:1 AA)* | `oklch(0.85 0.15 25)` | Text for expired/destructive alerts |

### Typography Scale (Mobile-First)

- **Display (`font-display`):** Satoshi or Inter Display
  - Mobile: `30px / 1.15` (`text-3xl`) to `36px / 1.1` (`text-4xl`), medium `500`, tracking snug (`-0.025em`).
  - Desktop (`sm:`): `48px–56px / 1.08` (`sm:text-5xl md:text-6xl`), medium `500`, tracking `-0.03em`.
- **Body (`font-sans`):** Inter / System Sans
  - `16px / 1.5` (`text-base`): **Mandatory mobile input field size** to prevent viewport jumping on focus; mobile hero subtitle.
  - `14px / 1.43` (`text-sm`): Navigation links, button labels, list secondary copy.
  - `12px / 1.5` (`text-xs`): Badges, tooltips, secondary timestamps, input helper copy.
- **Monospace (`font-mono`):** Geist Mono
  - `14px / 1.43` (`text-sm font-mono`): Used for generated & custom aliases (`shortenTHATlink/xy29z`), code snippets, redirect targets, and copy buttons.

### Spacing & Grid (Mobile-First)
- **Base Grid:** 4px geometric scale (`p-1`, `p-2`, `p-3`, `p-4`, `p-6`, `p-8`).
- **Mobile Container:** Full width with `px-4` gutter (`w-full max-w-lg mx-auto`).
- **Desktop Enhancement:** Centered with `sm:max-w-4xl lg:max-w-5xl` and `sm:px-6`.
- **Section Separation:** `py-10 sm:py-16`.

---

## 3. Component Architecture & Interaction Patterns

### 1. Mobile-First Navigation Bar
- Height: Compact 56px (`h-14`) with glass blur (`backdrop-blur-md bg-background/80 border-b border-border/60`).
- Left: Brand mark (`shortenTHATlink`) in `font-mono text-sm font-semibold tracking-tight` with Electric Blue mark.
- Center: Trust tag (`"Zero Surveillance • 0ms Telemetry"`) hidden on mobile (`hidden md:inline-flex`).
- Right: Touch-friendly Auth button (compact outlined button or 36×36px user avatar with 44px tap padding).

### 2. Mobile-First Hero Shortener Card (`/`)
Built for effortless one-handed thumb interaction:
- Container: `w-full rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs`.
- Input & Action Stack (Mobile Baseline):
  - Stacked vertically on mobile (`flex flex-col gap-2.5`), expanding to horizontal row on desktop (`sm:flex-row sm:gap-2`).
  - Input field: `h-12 sm:h-10 text-base sm:text-sm px-3.5 rounded-lg border border-border bg-background focus:border-electric-blue focus:ring-2 focus:ring-electric-blue/20`.
  - Primary "Shorten" CTA button: Full-width on mobile (`w-full sm:w-auto h-12 sm:h-10 px-6 font-medium text-base sm:text-sm rounded-lg bg-primary text-primary-foreground active:scale-[0.98]`).
  - **Keyboard accelerator:** Pressing `Enter` automatically submits and copies the short URL.
- Advanced Disclosure Drawer:
  - Accessible via a clean touch toggle: *"Options: Custom alias, Expiration"*.
  - Expands inline with smooth transition without page reload or layout jump.
- Result Card (Post-Creation):
  - Prominent monospace alias display with oversized **48px tap-target Copy Button** (`w-full sm:w-auto py-3 px-5 rounded-lg bg-primary text-primary-foreground font-medium`).
  - Instant tactile checkmark confirmation (`Copied!`) with screen-reader announcement (`aria-live="polite"`).
  - Quick action pills: QR Code view (opens bottom drawer) and Test Redirect.

### 3. Dashboard Links List (`/dashboard`)
Designed with the **Mobile Card Stream** as the primary canonical view:
- Header: Title, total active counter, and "+ New Link" thumb-accessible action.
- **Mobile Card Stream (`flex flex-col gap-3 sm:hidden`):**
  - Dedicated card per link with hairline border and touch-friendly padding.
  - Header: Monospace short link in prominent weight with a dedicated 44×44px tap-to-copy button.
  - Body: Destination URL truncated with single-tap expansion.
  - Footer bar: Status pills (`Custom` / `Generated`, `Expires in 2d`) on the left; clean `Edit` and `Delete` touch targets on the right.
- **Desktop Table View (`hidden sm:table w-full`):**
  - Progressively enhances into a high-density tabular view with hover tooltips for wide screens (`sm:table`).

### 4. Decoupled Bottom Sheets & Modals (Mobile-First Safety)

To prevent cramped mobile modals and slip hazards, actions use **Bottom Sheets / Drawers** on mobile:

#### A. Edit Alias Drawer / Modal
- Mobile: Native slide-up bottom sheet with swipe-down bar and touch-friendly input.
- Desktop: Centered modal dialog (`sm:max-w-md`).
- Context Anchor: Displays immutable destination URL.
- Live Visual Diff:
  ```text
  shortenTHATlink/old  ➔  shortenTHATlink/new
  ```
- Warning Notice: *"Renaming immediately breaks the previous alias. Shared links will stop resolving."*

#### B. Delete Link Drawer / Modal
- Mobile: Bottom sheet tinted in rose wash (`bg-rose-badge-bg/20`).
- Confirmation: Clear destructive button requiring explicit confirmation before permanent deletion.

### 5. 404 & Expired Link State
- Mobile-optimized centered message with friendly spacing.
- Distinct copy for expired links vs. non-existent links.
- Big, thumb-friendly recovery CTA: *"Claim this alias & shorten a link"*.

---

## 4. Implementation Guidelines

### Touch Target Floor & Utilities
```html
<!-- Touch-Optimized Primary Button (44px min height on mobile) -->
<button class="w-full sm:w-auto h-12 sm:h-10 px-5 rounded-lg bg-primary text-primary-foreground font-medium text-base sm:text-sm active:scale-[0.98] transition-all">
  Shorten Link
</button>

<!-- Mobile Input (16px text-base prevents iOS zoom) -->
<input
  type="url"
  class="w-full h-12 sm:h-10 text-base sm:text-sm px-3.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-electric-blue"
  placeholder="https://..."
/>

<!-- Pill Badge (WCAG AA compliant) -->
<span class="inline-flex items-center gap-1.5 rounded-full bg-mint-bg px-2.5 py-1 text-xs font-medium text-mint-text">
  <span class="size-1.5 rounded-full bg-emerald-600"></span>
  Custom
</span>
```

### Do's and Don'ts
- **DO** build mobile layout as the default CSS, enhancing to desktop via `sm:` and `md:`.
- **DO** ensure all clickable/tappable elements have a minimum dimension of `44×44px`.
- **DO** use `text-base` (16px) on mobile inputs to eliminate iOS Safari focus zoom.
- **DO** use Bottom Sheet Drawers for mobile dialogs and forms.
- **DON'T** rely on hover-only interactions (tooltips, hidden action menus) for mobile users.
- **DON'T** cram desktop 5-column tables onto mobile screens; use the card stream pattern.
- **DON'T** introduce heavy drop shadows or gradient text.
