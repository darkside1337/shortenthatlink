---
name: shortenTHATlink
description: Frosted Precision — Mobile-first, developer-grade, zero-surveillance link routing on tactile rice paper
colors:
  primary: "#0a0a0a"
  accent: "#2563eb"
  canvas: "#ffffff"
  paper: "#f5f5f5"
  ash: "#e5e5e5"
  smoke: "#d4d4d4"
  charcoal: "#171717"
  graphite: "#262626"
  steel: "#737373"
  mint: "#15803d"
  mint-bg: "#dcfce7"
  amber: "#92400e"
  amber-bg: "#fef3c7"
  rose: "#b91c1c"
  rose-bg: "#fee2e2"
typography:
  display:
    fontFamily: "var(--font-ibm-plex-sans), -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "clamp(1.875rem, 4vw, 3rem)"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "var(--font-ibm-plex-sans), -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  title:
    fontFamily: "var(--font-ibm-plex-sans), -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 500
    lineHeight: 1.35
  body:
    fontFamily: "var(--font-ibm-plex-sans), -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "var(--font-ibm-plex-mono), ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.43
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
  2xl: "18px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.canvas}"
    rounded: "{rounded.md}"
    padding: "10px 24px"
  button-primary-hover:
    backgroundColor: "{colors.charcoal}"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.charcoal}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
---

# Design System: shortenTHATlink

## Overview

**Creative North Star: "Frosted Precision"**

shortenTHATlink is an ergonomic, mobile-first utility for immediate URL shortening and link management. Because link creation frequently happens on-the-go—pasting URLs directly from chat apps (WhatsApp, Telegram, Slack), social networks, and mobile browsers—mobile is the primary design canvas, not a responsive concession.

The system combines tactile rice-paper surfaces with developer-grade precision: ultra-crisp 1px hairline borders, calm medium typography weights, and a strictly disciplined monochromatic base punctuated by a single vibrant voltage point. Zero surveillance, zero telemetry, zero visual slop.

**Key Characteristics:**
- Mobile-first thumb-zone ergonomics (strict 44×44px minimum tap targets)
- Tactile 1px hairline borders over heavy drop shadows
- Neutral canvas & paper mist with a single chromatic voltage point (Electric Blue #2563eb)
- Developer-grade Geist Mono typography for zero character ambiguity
- Contextual bottom sheet drawers on mobile viewports

## Colors

The palette is anchored by crisp canvas neutrals with a single high-voltage blue accent and calibrated high-contrast status tags.

### Primary
- **Primary Action** (#0a0a0a / oklch(0.205 0 0)): Main committed CTA background (Shorten button, Save button).

### Secondary
- **Electric Blue** (#2563eb / oklch(0.546 0.245 262.88)): Primary interactive accent, touch focus rings, brand glyphs, active tabs.

### Neutral
- **Canvas** (#ffffff / oklch(1 0 0)): Base page background and primary card face.
- **Paper Mist** (#f5f5f5 / oklch(0.97 0 0)): Secondary panels, nested card fills, muted button backgrounds.
- **Ash (Hairline)** (#e5e5e5 / oklch(0.922 0 0)): Universal 1px structural container and divider border.
- **Smoke** (#d4d4d4 / oklch(0.87 0 0)): Elevated borders, active hover outlines.
- **Charcoal** (#171717 / oklch(0.145 0 0)): Primary body copy and headings.
- **Graphite** (#262626 / oklch(0.25 0 0)): Secondary text and high-contrast UI icons.
- **Steel** (#737373 / oklch(0.556 0 0)): Helper text, destination URLs, timestamps, metadata.

### Semantic Badges (WCAG AA Calibrated)
- **Mint Badge** (#15803d text on #dcfce7 bg): Custom alias tags and verified states (4.54:1 AA).
- **Amber Badge** (#92400e text on #fef3c7 bg): Expiring-soon alerts and warning tags (5.12:1 AA).
- **Rose Badge** (#b91c1c text on #fee2e2 bg): Expired aliases and destructive confirmation banners (5.70:1 AA).

### Named Rules
**The Single Voltage Point Rule.** Surfaces remain neutral canvas white or paper mist. The single chromatic centerpiece is Electric Blue (#2563eb), reserved strictly for touch focus rings, active links, copy confirmations, and brand glyphs.

**The Contrast Floor Rule.** All badge text and foreground treatments must strictly exceed WCAG AA 4.5:1 contrast against their rendered backgrounds.

## Typography

**Display Font:** IBM Plex Sans (with -apple-system, BlinkMacSystemFont, sans-serif)  
**Body Font:** IBM Plex Sans  
**Label/Mono Font:** IBM Plex Mono (ui-monospace, monospace)  

Calm, sharp 500 medium weights with snug tracking. Monospaced characters are first-class citizens across all aliases, hashes, and previews to prevent visual character ambiguity (0 vs O, 1 vs l, I).

### Hierarchy
- **Display** (weight 500, clamp(1.875rem, 4vw, 3rem), line-height 1.1): Mobile hero header (30px–36px) scaling to desktop (48px–56px). Snug tracking (-0.025em to -0.03em).
- **Headline** (weight 500, 1.5rem, line-height 1.25): Dashboard section headings and drawer titles.
- **Title** (weight 500, 1.125rem, line-height 1.35): Modal titles, card headers, and dropdown trigger groups.
- **Body** (weight 400, 1rem, line-height 1.5): Standard reading copy and mandatory 16px mobile input size.
- **Label** (weight 500, 0.875rem, line-height 1.43): Monospace short link displays, copy buttons, timestamps, and status chips.

### Named Rules
**The Input Scale Rule.** Text inputs enforce a 16px font size (text-base) on mobile to prevent iOS Safari auto-zoom on focus.

**The Monospace Distinction Rule.** Monospaced fonts (IBM Plex Mono) are first-class citizens across all aliases, hashes, and previews to eliminate character ambiguity (0 vs O, 1 vs l, I).

## Layout

Mobile container default is full width with a 16px (px-4) gutter (w-full max-w-lg mx-auto). Desktop enhancement centers with sm:max-w-4xl lg:max-w-5xl and sm:px-6. Base spacing rhythm aligns to a 4px geometric scale (p-1, p-2, p-3, p-4, p-6, p-8) with vertical section separation of py-10 sm:py-16.

### Named Rules
**The Thumb-Zone Priority Rule.** All primary touch targets satisfy a strict 44×44px minimum boundary (h-11 or p-2.5+), placed comfortably within the natural lower-half thumb zone.

## Elevation & Depth

Surfaces rely on crisp 1px hairline borders instead of diffuse drop shadows. This evokes a technical, tactile printed-document feel.

### Shadow Vocabulary
- **Flat Hairline** (border: 1px solid #e5e5e5): Default container and card edge at rest.
- **Drawer Wash** (box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.08)): Ambient grounding under slide-up mobile bottom sheets.

### Named Rules
**The Border-First Elevation Rule.** Surfaces rely on crisp 1px hairline borders (ash #e5e5e5 in light mode, 10% white in dark mode) instead of diffuse drop shadows, evoking a technical, tactile printed-document feel.

## Shapes

- **9999px (rounded-full):** Status badges, custom/generated tags, filter chips, and pill buttons.
- **6px / 8px (rounded-md / rounded-lg):** Form inputs, standard buttons, dropdown triggers.
- **12px / 16px (rounded-xl / rounded-2xl):** Cards, hero creation containers, drawers, modals.

## Components

### Buttons
- **Shape:** Gently rounded (rounded-lg, 8px) or full pill (rounded-full, 9999px).
- **Primary:** Background #0a0a0a, text #ffffff, padding 10px 24px, 44px minimum tap height on mobile (h-12 sm:h-10).
- **Hover / Focus:** Hover background #171717, active transform scale-[0.98], focus ring 2px Electric Blue with 20% alpha wash.
- **Secondary:** Background #f5f5f5, text #171717, border 1px solid #e5e5e5.

### Inputs / Fields
- **Style:** 1px hairline border (#e5e5e5), canvas background (#ffffff), 8px radius (rounded-lg), 16px font size on mobile (text-base).
- **Focus:** 2px ring in Electric Blue (#2563eb/20) with solid border transition.
- **Error:** Rose hairline border (#fee2e2) with subtle alert text.

### Hero Shortener Card
- **Container:** w-full rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs.
- **Input & Action Stack:** Vertically stacked on mobile (flex flex-col gap-2.5), expanding horizontally on desktop (sm:flex-row sm:gap-2).
- **Post-Creation Result Card:** Prominent monospace alias display with oversized 48px tap-target Copy Button and instant tactile checkmark confirmation.

### Decoupled Bottom Sheets & Drawers
- **Mobile (<640px):** Native slide-up bottom sheet with swipe-down dismissal bar.
- **Desktop (sm:):** Centered modal dialog (sm:max-w-md).

## Do's and Don'ts

### Do:
- **Do** build mobile layout as the default CSS, enhancing to desktop via sm: and md:.
- **Do** ensure all clickable/tappable elements have a minimum dimension of 44×44px.
- **Do** use text-base (16px) on mobile inputs to eliminate iOS Safari focus zoom.
- **Do** use Bottom Sheet Drawers for mobile dialogs and forms.

### Don't:
- **Don't** rely on hover-only interactions (tooltips, hidden action menus) for mobile users.
- **Don't** cram desktop 5-column tables onto mobile screens; use the card stream pattern.
- **Don't** introduce heavy drop shadows or gradient text.
