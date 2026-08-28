# Hero Section — Spec

## Overview

Build the `HeroSection` component and the **two-column layout shell** it sits inside. This is the first section of the portfolio home page and the place where the page's core structural split is established: a sticky card column on the left (1/3) and a scrolling content column on the right (2/3).

Because the split originates here, this spec covers both the shell (`SplitLayout`, `SidebarCard`) and the hero content itself. Later sections mount into the shell built here and do not re-create it.

All content — including the portrait, social links, stats and CTA labels — is managed via Sanity. All visible text is in English.

Visual reference: `@context/screenshots/hero.png`

---

## Sanity Schema

### `heroSection` singleton document

Create as a singleton (one instance, no create/delete in Studio). This is a deliberate expansion of the otherwise narrow CMS scope — hero copy is the thing that gets rewritten most often, so it belongs in Studio rather than in a constant.

| Field              | Type                  | Notes                                                                               |
| ------------------ | --------------------- | ----------------------------------------------------------------------------------- |
| `eyebrow`          | string                | Mono label above the headline. Default: `"/ RADOSŁAW SIEK ·  PORTFOLIO · 2026"`     |
| `headlineLead`     | string                | First part, renders in `fg`. Default: `"I build interfaces that make complex work"` |
| `headlineAccent`   | string                | Second part, renders in `accent`. Default: `"feel simple."`                         |
| `subheadline`      | text                  | 1–2 sentences under the headline                                                    |
| `portrait`         | image                 | `options: { hotspot: true }`, required `alt` field                                  |
| `monogram`         | string                | Two characters, top-left of card. Default: `"RS"`                                   |
| `cardGreeting`     | string                | Default: `"Hey, I'm Radosław"`                                                      |
| `cardBio`          | text                  | 2 lines max at card width                                                           |
| `statusBadge`      | object                | See below                                                                           |
| `socials`          | array of `socialLink` | Max 4                                                                               |
| `primaryCta`       | object                | `{ label, href }` — default `{ "Let's talk", "mailto:…" }`                          |
| `secondaryCta`     | object (optional)     | `{ label, href }` — default `{ "Download CV", "/cv.pdf" }`                          |
| `currentFocus`     | object                | See below                                                                           |
| `availabilityNote` | string (optional)     | Left of the work CTA                                                                |
| `workCta`          | object                | `{ label, href }` — default `{ "View selected work", "#work" }`                     |
| `stats`            | array of `stat`       | Exactly 4, validated                                                                |
| `ticker`           | array of `tickerItem` | Company names                                                                       |
| `scrollCue`        | string                | Default: `"scroll to inspect"`                                                      |

### `statusBadge` object

- `label` — string — default: `"→ Booksy · AI Native SWE · Sept 2026"`
- `tone` — string — `select` with `options.list`: `"upcoming"` (accent dot, default), `"available"` (accent dot), `"none"` (badge hidden)

> The screenshot carries "Available for Work" from the reference template. Default the seed value to the Booksy line — a stale or untrue availability badge is the fastest way to undercut the rest of the page. The `available` tone stays in the schema for whenever it's actually true.

### `socialLink` object

- `platform` — string — `select`: `"github"`, `"linkedin"`, `"x"`, `"email"`
- `url` — url (allow `mailto:` scheme)

Icons are inline SVG mapped from `platform` in code — do not store icon images in Sanity.

### `stat` object

- `value` — string — e.g. `"5"`, `"200+"` (string, not number, so suffixes work)
- `label` — string — e.g. `"production systems"`, rendered uppercase in mono

### `tickerItem` object

- `name` — string
- `isCurrent` — boolean — renders the name in `accent`, with no prefix

### Seed Initial Values

**Stats** (exactly these four — do **not** add a "years of experience" stat):

| Value | Label              |
| ----- | ------------------ |
| `5`   | production systems |
| `4`   | shipped solo       |
| `7`   | languages shipped  |
| `2`   | years teaching     |

**Ticker:**

| Name                  | isCurrent |
| --------------------- | --------- |
| Giganci Programowania | false     |
| Jointhubs             | false     |
| Hued.me               | false     |
| Booksy                | true      |

**Current focus:** label `"CURRENT FOCUS"`, statement `"Shipping calmer interfaces."`, tags `["React", "TypeScript", "Product thinking"]`

**Card bio:** replace the reference template's placeholder copy entirely. Seed with something true — no "no-code", no "Cupertino, CA".

---

## Layout Shell

Built here, reused by every subsequent section.

- File: `src/components/layout/SplitLayout.tsx`
- CSS Grid: `lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]`, full-bleed, `bg-base`
- Left column: `SidebarCard` in a wrapper with `lg:sticky lg:top-0 lg:h-screen lg:flex lg:items-center`
- Right column: `<main>` containing all sections in order, each a `<section id="…">`
- A `1px` vertical divider in `border` sits on the column boundary at `lg+` (visible in the reference as the seam left of the content column)
- Below `lg`: single column, card renders as a full-height first block then scrolls away — **not sticky** (see Responsive)

### `SectionObserverProvider`

Wraps `SplitLayout`. Holds `{ activeSection, activePayload }`. Sections register via `useSectionObserver(id, payload)`, backed by one shared `IntersectionObserver` with `rootMargin: "-40% 0px -40% 0px"`.

The hero registers with `id: "hero"` and a `null` payload — at hero the card shows its **default state** (bio + CTAs, exactly as in the screenshot). Contextual readouts replace that region only from the featured-work section onward.

---

## Component Requirements

- Files:
  - `src/components/layout/SplitLayout.tsx`
  - `src/components/layout/SidebarCard.tsx`
  - `src/components/sections/HeroSection.tsx`
- Section background: `bg-base` (`#0A0B0E`)
- Right column applies `.section-padding`; hero is the one section that runs full viewport height (`min-h-svh`) with content vertically centered
- Data: fetch the `heroSection` singleton via GROQ in the server component, pass down as props. `SidebarCard` is a client component (needs observer context); keep the fetch above it.

### Sidebar Card

> **Design-system overrides.** Where this section's classes conflict with the design system, the design system wins: the card uses `rounded-card` (8px), not `rounded-2xl`, and the social buttons carry no `backdrop-blur` (no glassmorphism). The one sanctioned exception is the **primary CTA pill**, which the reference shows clearly — so `rounded-full` is allowed on the status badge and the primary CTA, nowhere else.

- Container: `relative rounded-card border border-border bg-surface overflow-hidden`, `aspect-[3/4]` at `lg`, max height `calc(100svh - 4rem)`
- Portrait: `next/image` with `fill`, `object-cover`, grayscale (`grayscale contrast-110`), Sanity hotspot respected
- Gradient scrim over the lower half so text stays readable: `absolute inset-0 bg-gradient-to-t from-base via-base/70 to-transparent`
- **Monogram**: `absolute top-4 left-4`, mono, `text-sm font-medium text-fg/80`
- **Socials**: `absolute top-4 right-4`, vertical `flex flex-col gap-2`. Each: `size-9 rounded-sm bg-surface-raised border border-border grid place-items-center text-fg-muted hover:text-accent hover:border-accent transition-colors`
- **Content block**, `absolute inset-x-0 bottom-0 p-5`:
  - Status badge: `inline-flex items-center gap-2`, `size-1.5 rounded-full bg-accent`, label in mono `text-[11px] tracking-wider uppercase text-fg-muted`
  - Greeting: `font-display text-xl font-semibold text-fg mt-3`
  - Bio: `text-sm text-fg-muted mt-2 leading-relaxed`
  - `hr` in `border-border` `my-4`
  - CTA row: primary as `rounded-full bg-accent text-base px-5 py-2.5 text-sm font-medium` with a `↗` glyph; secondary as `text-sm text-fg-muted hover:text-fg` with a document icon
- **Readout slot**: an empty, fixed-height `div` rendered between the bio and the CTA row, `min-h-[4.5rem]`, hidden at hero. Reserve the space now so later sections don't cause the card to reflow when the readout mounts.

### Hero Content (right column)

Vertical stack, `max-w-2xl`, `gap` handled per-block:

1. **Eyebrow** — mono, `text-xs tracking-[0.18em] uppercase text-fg-muted`
2. **Headline** — `font-display font-bold tracking-[-0.02em] leading-[0.95]`, `text-5xl md:text-6xl lg:text-7xl`, `mt-6`. `headlineLead` in `text-fg`, `headlineAccent` in `text-accent` on its own line
3. **Subheadline** — `text-base md:text-lg text-fg-muted mt-6 max-w-lg leading-relaxed`
4. **Current focus panel** — `mt-10 border border-border border-l-2 border-l-accent bg-surface/60 rounded-r-lg p-5 max-w-md`
   - Label row: `size-1.5 rounded-full bg-accent` + mono `text-[11px] tracking-widest uppercase text-fg-muted`
   - Statement: `font-display text-base font-semibold text-fg mt-2`
   - Tags: mono `text-[11px] tracking-widest uppercase text-fg-muted mt-2`, joined with `·`
5. **Availability row** — `mt-6 flex items-center justify-between max-w-md`
   - Note: mono `text-xs text-fg-muted`
   - Work CTA: mono `text-xs text-fg underline underline-offset-4 decoration-accent hover:text-accent transition-colors` with `↗`
6. **Stat row** — `mt-12 grid grid-cols-4 gap-6 max-w-lg`
   - Value: `font-display text-4xl font-bold text-fg tabular-nums`
   - Label: mono `text-[10px] tracking-widest uppercase text-fg-muted mt-1`
7. **Ticker** — `mt-12`, full width of the content column, masked at both edges with `[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]`
   - Items in `font-display text-2xl md:text-3xl font-semibold`, separated by a `·` in `text-fg-muted`
   - Normal items: `text-fg-muted`. `isCurrent` items: `text-accent`, no prefix
   - Continuous horizontal marquee, duplicated track, `animation: marquee 40s linear infinite`, pauses on hover
8. **Scroll cue** — `absolute bottom-8`, mono `text-xs text-fg-muted` + `↓`, gentle 2px vertical loop

---

## Background Treatment

Ambient accent light, **one hue only**. Three low-opacity radial sources, placed so the field is not a single flat corner wash: a bright primary entering low-left, a weaker counter-light high-right so the top corner does not go dead, and a faint sheen under the stat row. Peak opacity stays at `0.11` — the interest comes from placement, not intensity.

```
radial-gradient(120% 90% at 12% 100%, rgb(0 229 199 / 0.11) 0%, transparent 58%),
radial-gradient( 75% 55% at 95%   4%, rgb(0 229 199 / 0.06) 0%, transparent 62%),
radial-gradient( 60% 45% at 68%  72%, rgb(0 229 199 / 0.04) 0%, transparent 70%)
```

Implemented as the `hero-glow` utility in `app/globals.css` — one element, three
layered backgrounds, no extra DOM.

Layer beneath it: the faint page grid at `0.02–0.03` opacity. Nothing else.

**Explicitly do not add:**

- No large ellipse, circle or ring outlines. The reference screenshot shows faint elliptical shapes on the right side of the content column — these are **not wanted** and must not be reproduced.
- No blob shapes, no organic SVG forms, no rotated squares or floating geometry
- No noise-heavy overlays, no scanlines, no glitch effects
- No second gradient in another hue — one accent, one glow

The gradient should read as ambient light in the corner of a dark room, not as a decorated background.

---

## Motion

Use gsap with the `useGSAP` hook (`gsap`, `@gsap/react`) — the only animation library on this project. The load sequence below is one `gsap.timeline()`; the delays are timeline positions, not per-element `setTimeout`s.

**Load sequence** (hero only animates on mount, never on scroll-back):

| Element          | Animation                                                | Delay    |
| ---------------- | -------------------------------------------------------- | -------- |
| Sidebar card     | `opacity 0→1`, `x -12→0`, `500ms`                        | `0ms`    |
| Eyebrow          | `opacity 0→1`, `y 8→0`, `400ms`                          | `120ms`  |
| Headline         | `opacity 0→1`, `y 16→0`, `600ms`, `ease: [0.16,1,0.3,1]` | `200ms`  |
| Subheadline      | same as headline                                         | `320ms`  |
| Focus panel      | `opacity 0→1`, `y 12→0`, `450ms`                         | `440ms`  |
| Availability row | same                                                     | `520ms`  |
| Stats            | stagger `60ms`, `opacity 0→1`, `y 12→0`                  | `600ms`  |
| Ticker           | `opacity 0→1`, `700ms`                                   | `860ms`  |
| Scroll cue       | `opacity 0→1`                                            | `1000ms` |

**Count-up:** stat values animate from `0` to target over `1200ms` with `ease-out`, starting with the stat stagger. Non-numeric prefixes/suffixes (`+`) are preserved. Runs once.

**Requirements:**

- gsap is browser-only: it runs inside `'use client'` components via `useGSAP`, scoped to a container ref, and must not cost the first paint. Register once at module level with `gsap.registerPlugin(useGSAP)`; animations created in event handlers use `contextSafe()`
- Under `prefers-reduced-motion: reduce`: all entrance animation, the count-up, the marquee and the scroll-cue loop are disabled; final states render immediately
- Nothing animates on hover except color and border
- No scroll-jacking, no custom cursor, no parallax on the hero

---

## Responsive

- **`lg` (1024px+)** — the 1/3 – 2/3 split. Card sticky and vertically centered. Divider visible.
- **`md`** — single column. Card becomes a full-width block at the top, `aspect-[4/3]`, then scrolls away. Hero content follows beneath at full width.
- **`< md`** — card fills the first viewport (`min-h-svh`), portrait as the background with the scrim, content block anchored to the bottom. Hero content starts on the second screen. Headline drops to `text-4xl`.
  - Stat row becomes `grid-cols-2 gap-y-8`
  - Availability row stacks
  - Ticker font drops to `text-xl`
  - **Card is never sticky below `lg`** — at 380px it would consume a third of the viewport permanently. The sticky mobile bottom bar that replaces it is out of scope here and specified with the global layout.

---

## Out of Scope

- **The right-edge vertical icon rail** visible in the reference screenshot belongs to a global floating nav component, not the hero. Do not build it here.
- The mobile sticky bottom bar (global layout).
- Contextual readout content — the slot is reserved here; variants ship with the featured-work section.

---

## References

- `@context/screenshots/hero.png` — visual reference
- `@context/portfolio-project-spec.md` — Design System, Layout Architecture, The Sticky Card, Motion Budget
- `@src/app/globals.css` — theme tokens and utility classes
- `@sanity/schemas/heroSection.ts` — create this schema
- `@sanity/schemas/objects/` — `statusBadge`, `socialLink`, `stat`, `tickerItem`
- `@src/components/layout/SplitLayout.tsx` — create
- `@src/components/layout/SidebarCard.tsx` — create
- `@src/components/sections/HeroSection.tsx` — create
- `@src/lib/section-observer.tsx` — create (`SectionObserverProvider`, `useSectionObserver`)
