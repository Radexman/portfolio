# Current Feature: Hero Section + Two-Column Layout Shell

## Status

In Progress

## Goals

**Spec:** @context/features/hero-spec.md · **Visual reference:** @context/screenshots/hero.png

### 1. Sanity — `heroSection` singleton

- New document type `heroSection`, registered in `sanity/schemaTypes/index.ts` with an `@sanity/icons` icon
- Objects: `statusBadge`, `socialLink`, `stat`, `tickerItem`
- Fields per the spec table: `eyebrow`, `headlineLead`, `headlineAccent`, `subheadline`, `portrait` (hotspot + required `alt`), `monogram`, `cardGreeting`, `cardBio`, `statusBadge`, `socials` (max 4), `primaryCta`, `secondaryCta`, `currentFocus`, `availabilityNote`, `workCta`, `stats` (exactly 4, validated), `ticker`, `scrollCue`
- Studio structure: surface as a **singleton** — one document, no create/delete
- Seed the document: the four stats (`5` production systems, `4` shipped solo, `7` languages shipped, `2` years teaching — **no "years of experience"**), the four ticker items with Booksy flagged `isCurrent`, and the current-focus block
- `statusBadge` defaults to the Booksy line, **not** "Available for Work"
- Card bio seeded with something true — the reference's "no-code" / "Cupertino, CA" copy is placeholder and gets replaced

### 2. Layout shell — built once, reused by every later section

- `components/layout/SplitLayout.tsx` — CSS Grid `lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]`, full-bleed, `bg-base`
- Left column: `SidebarCard` wrapper, `lg:sticky lg:top-0 lg:h-screen lg:flex lg:items-center`
- Right column: `<main>` holding each section as `<section id="…">`
- `1px` vertical divider in `border` on the column boundary at `lg+`
- Below `lg`: single column, card scrolls away — **never sticky**

### 3. Section observer

- `lib/section-observer.tsx` — `SectionObserverProvider` holding `{ activeSection, activePayload }`, plus a `useSectionObserver(id, payload)` hook over **one shared** `IntersectionObserver` at `rootMargin: "-40% 0px -40% 0px"`
- Hero registers as `id: "hero"` with a `null` payload → card shows its default state

### 4. `SidebarCard`

- `relative rounded-* border border-border bg-surface overflow-hidden`, `aspect-[3/4]` at `lg`, max height `calc(100svh - 4rem)`
- Portrait via `next/image` `fill` + `object-cover`, grayscale, Sanity hotspot respected, explicit `sizes`
- Gradient scrim over the lower half for text legibility
- Monogram top-left; socials top-right as a vertical stack, inline SVG mapped from `platform` (no icon images in Sanity)
- Content block: status badge → greeting → bio → divider → CTA row (primary pill + secondary)
- **Readout slot** — empty fixed-height `div` (`min-h-[4.5rem]`) between bio and CTA row, reserved now so later sections don't reflow the card

### 5. `HeroSection` content

`components/sections/HeroSection.tsx`, `max-w-2xl`, `min-h-svh` with content vertically centred:

1. Eyebrow (mono, tracked, uppercase)
2. Headline — `headlineLead` in `fg`, `headlineAccent` in `accent` on its own line
3. Subheadline
4. Current-focus panel — accent left border, `bg-surface/60`
5. Availability row — note + work CTA
6. Stat row — 4 up, `tabular-nums`, mono labels
7. Ticker — masked edges, continuous marquee, duplicated track, pauses on hover, upcoming items in `accent` prefixed `→`
8. Scroll cue — bottom-anchored, gentle vertical loop

### 6. Background

- Exactly one effect: the accent radial glow from lower-left, `rgba(0,229,199,0.10)` → transparent
- Faint page grid beneath at `0.02–0.03` opacity
- **Explicitly forbidden:** the elliptical ring shapes visible in the reference screenshot, blobs, organic SVG, rotated geometry, scanlines, glitch, second hue

### 7. Motion

- Load sequence per the spec's delay table (card → eyebrow → headline → subheadline → focus panel → availability → stats stagger → ticker → scroll cue)
- Count-up on stat values, `0` → target over `1200ms`, suffixes like `+` preserved, runs once
- Mount only — never re-triggers on scroll-back
- `prefers-reduced-motion: reduce` disables entrance animation, count-up, marquee and scroll-cue loop; final states render immediately
- Animation must not cost the first paint

### 8. Data flow

- Fetch the `heroSection` singleton via GROQ in a server component; pass down as props
- `SidebarCard` is a client component (observer context) — keep the fetch above it
- Query in `sanity/lib/queries.ts` wrapped in `defineQuery`; result type hand-written in `types/`

**Done when:** `npm run build`, `npm run lint` and `npx tsc --noEmit` pass; the hero renders at `lg`, `md` and `< md` per the responsive rules; the card is sticky only at `lg+`; the singleton is editable in Studio and edits show on the page; reduced-motion renders the final state with no animation.

## Notes

### Settled

1. **Animation: gsap.** The spec's animation section has been **rewritten in @context/features/hero-spec.md** — it now specifies gsap + `useGSAP`, with the load sequence as one `gsap.timeline()` and the delay column as timeline positions. gsap is the only animation library on this project, and the docs no longer name any other.

2. **Card styling: design system wins, CTA pill kept.** Also written into the spec as a "Design-system overrides" note: card is `rounded-card` (8px) not `rounded-2xl`; social buttons drop `backdrop-blur-sm` and `bg-surface-raised/80` for solid `bg-surface-raised` with `rounded-sm`; `rounded-full` is permitted **only** on the status badge and the primary CTA.

3. **Paths.** The spec's `src/components/…`, `src/lib/…`, `sanity/schemas/…` are translated to this repo's real layout in the goals above, per @context/coding-standards.md.

### Still open — decide during implementation

4. **CMS scope.** @context/project-overview.md says only `project`, `technology` and `testimonial` live in Sanity, with all static copy in `content/`. This spec adds a `heroSection` singleton and argues for it explicitly (hero copy is rewritten most often). Proceeding with the singleton — project-overview.md needs updating so the two documents stop disagreeing.

5. **`availabilityNote`.** The reference reads "Available for selected projects", which contradicts "I'm not available" in the project spec. Seeding it empty unless given true copy.

6. **`secondaryCta` → `/cv.pdf`.** No such file exists. The field is optional; seeding it empty until a CV is actually placed in `public/`.

### Prerequisites this feature needs

- **A portrait image.** Nothing renders convincingly without one, and it has to be uploaded to Sanity by hand.
- **`.section-padding`** — referenced by the spec, does not exist yet. Will be added to `app/globals.css` as part of the shell.
- **Page grid texture** — deferred as "out of scope" in the previous feature; the background goal here requires it.

### Carried forward from the foundation feature

- `sanity/lib/client.ts` has `useCdn: true`; ISR wants `false` — this feature is the first to actually fetch, so it is the right moment
- `<SanityLive />` is not rendered in `app/layout.tsx`. If it is added, route groups `(app)` / `(studio)` are needed so it does not mount on the Studio route
- Mono comment labels in JSX must be written as `{"// core"}` — a bare `//` trips `react/jsx-no-comment-textnodes`

### Out of scope

- The right-edge vertical icon rail in the reference screenshot (global floating nav)
- The mobile sticky bottom bar (global layout)
- Contextual readout **content** — the slot is reserved here; variants ship with featured work

## History

### Foundation — Cleanup, Dependencies, Theme & Env

**Spec:** @context/features/cleanup-spec.md · **Merged:** 2026-08-27 · **Commit:** `788421a`

Replaced the create-next-app template with the project foundation.

- **Boilerplate removed** — template landing page, Geist fonts, "Create Next App" metadata, the five template SVGs in `public/`, and the white/black `:root` defaults plus `prefers-color-scheme` block in `globals.css`
- **Dependencies** — `gsap@3.15.0` + `@gsap/react@2.1.2`. Analytics and `schema-dts` deferred to the deploy and SEO phases
- **Fonts** — Inter Tight / Inter / JetBrains Mono via `next/font/google`, `display: swap`, `latin` + `latin-ext`
- **Tokens** — the seven palette colours, `--radius-sm: 4px` / `--radius-card: 8px`, and `--tracking-display` / `--tracking-label` in a Tailwind v4 `@theme` block; fonts in a separate `@theme inline` block; base layer sets `color-scheme: dark`, body styles, display font on headings, an accent focus ring, and defaults `border-color` to the border token
- **Env** — `.env.example` committed with all five keys annotated with where to obtain them; `.env.local` filled in and verified against the Sanity API; `.gitignore` needed `!.env.example` because `.env*` was swallowing it

**Gotchas recorded for later features:**

- `next/font` rejects a spread for `subsets` — it needs statically analyzable literals, so the array is repeated per call
- A literal `// core` in JSX trips `react/jsx-no-comment-textnodes`; mono comment labels must be written as `{"// core"}`. This recurs in the Skills section
- The Sanity dataset `portfolio` is **public** — published documents are readable without a token; drafts still require one
- Sanity CORS allows `http://localhost:3000` only. If Next falls back to `:3001`, the embedded Studio loads but cannot authenticate

**Carried forward, not done here:**

- `sanity/lib/client.ts` has `useCdn: true`; the planned ISR (`revalidate: 3600`) wants `false`
- `app/layout.tsx` does not render `<SanityLive />`, so `sanityFetch` will not live-update
- Sanity schemas (`project` / `technology` / `testimonial`), Studio structure and seed content — the rest of Phase 1
