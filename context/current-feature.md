# Current Feature

## Status

Not Started

## Goals

<!-- Populated by /feature load -->

## Notes

<!-- Populated by /feature load -->

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

### Hero Section + Two-Column Layout Shell

**Spec:** @context/features/hero-spec.md · **Merged:** 2026-08-27 · **Commit:** `6e1646c`

Built the page's structural split and the first section inside it.

- **Sanity** — `heroSection` singleton plus `ctaLink`, `statusBadge`, `socialLink`, `stat`, `tickerItem`, `currentFocus` objects, in `documents/` and `objects/` with card/content field groups. True singleton: fixed document id in `sanity/structure.ts`, and duplicate/delete/unpublish plus the global create entry removed in `sanity.config.ts`. Seeded and published.
- **Shell** — `SplitLayout` (1fr/2fr, sticky centred card at `lg` only, hairline divider), `SectionObserverProvider` over one shared observer
- **Card** — framed portrait with hotspot-driven `object-position`, stylised monogram, fixed-order social stack, vertical status capsule with pulsing dot, reserved readout slot
- **Hero** — eyebrow, split headline, focus panel, availability row, stat row, marquee ticker, scroll cue; three-source single-hue background glow
- **Motion** — one `gsap.timeline()` with the spec's delays as absolute positions, count-up preserving suffixes

**Decisions taken during the build:**

- **Dataset made public.** `sanityFetch` withholds the token for the default `published` perspective, so a private dataset returned `null` at build. Chosen over an authenticated `client.fetch`, which would have cost live updates and broken the "always use sanityFetch" rule
- **`(app)` route group added** so `<SanityLive />` never mounts on `/studio`; `useCdn` off for ISR; `browserToken: false` so no token reaches the browser
- **Ticker flag renamed** `isUpcoming` → `isCurrent`, rendering in accent with no `→` prefix. Note this diverges from @context/project-overview.md, which frames Booksy as deliberately future-tense — the timeline section still specs a dashed "upcoming" node
- **Readout slot no longer reserves height.** `min-h-[4.5rem]` at hero pushed the greeting into the middle of the card. Reflow prevention moves to the readout variants themselves, which must carry a fixed height when they ship with featured work

**Gotchas recorded for later features:**

- A Sanity image field exists as soon as alt text is typed, with no `asset` until a file is uploaded — guard on `portrait?.asset`, never on the object, or `urlFor()` throws a 500
- Next caches fetch results in `.next/cache`; a failed fetch stays cached across rebuilds. `rm -rf .next/cache` when data changes but the render does not
- `revalidate = 3600` applies in dev too, so Studio edits do not appear until the dev server restarts
- Tailwind v4 arbitrary values cannot express an elliptical `border-radius` (the `/` collides with the opacity modifier) — use `@utility`

**Left for follow-up:**

- **Placeholder URLs are live in the CMS:** `linkedin.com/in/CHANGE-ME` and `mailto:CHANGE-ME@example.com`
- **`/cv.pdf` does not exist** — the Download CV link 404s until a file lands in `public/`
- **Status badge reads "Available for Work"**, which contradicts @context/project-overview.md ("I'm not available"). One Studio edit to switch back to the Booksy line
- **@context/project-overview.md still says only `project`/`technology`/`testimonial` live in Sanity** — the `heroSection` singleton contradicts it
- No visual check at `lg`/`md`/`<md` was possible: the Playwright MCP tools were not exposed to the session. Verification was HTTP + generated-CSS inspection only
