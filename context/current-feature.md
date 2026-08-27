# Current Feature — Featured Work Section

## Status

In Progress

## Goals

**Spec:** @context/features/featured-work-spec.md

- **Sanity `project` document ships** — `title`, `slug`, `featured`, `order`, `thesis` (5-value `options.list`), `company`, `role`, `year`, `stack[]` (refs → `technology`), `visibility`, `liveUrl`, `coverImage` (hotspot), `problem`. Registered in `sanity/schemaTypes/index.ts`, with a `technology` document to reference and Studio structure entries for Featured Projects / All Projects / Technologies.
- **Section copy in the CMS** — `eyebrow` / `headline` / `subheadline` for the section header, defaulting to `"Selected work"` / `"Three systems, three different problems"`.
- **Three featured projects seeded and published** — MB Group Multisite (`architecture`, public), Debt Exchange (`data-application`, public), BRAIN (`ai-realtime`, `no-public-url`), with the problem lines written in the spec.
- **`FeaturedWorkSection`** (server component) fetches `*[_type == "project" && featured == true] | order(order asc)[0...3]` with `stack[]->{name}` dereferenced, via `sanityFetch`. Renders `id="work"` so the hero's `View selected work` CTA resolves. Renders whatever exists — never pads to three.
- **`FeaturedProjectCard`** — full-width stacked card, `min-h-[70vh]`, two columns at `lg` with the image side alternating on odd indices, hairline top border. Index marker, thesis eyebrow, title, `{role} · {company} · {year}` meta, problem line, first 4 stack tags plus `+N`, and a link row whose live-link half is driven entirely by `visibility` — no per-project special cases in the component.
- **Contextual card readout ships** — the interaction the whole split layout exists for. `CardReadout` variant map keyed by section id (one entry now), `FeaturedWorkReadout` renders `{ role, company, year, stack }`. Each card runs its own `IntersectionObserver` at `-45% 0px -45% 0px` and pushes its payload when it owns the middle band; the last payload persists between cards rather than clearing.
- **Readout never reflows the card** — the variant carries its own fixed height (`min-h-[4.5rem]`), since the hero's slot deliberately reserves none. Crossfade is GSAP: out `0.12s`, swap, in `0.18s` with `y: 4 → 0`.
- **Motion per the budget** — header timeline and per-card reveal on `ScrollTrigger` with `once: true`, plus one scrub-linked image parallax (`yPercent -6 → 6`, `scrub: 0.6`). All of it inside `useGSAP` + `gsap.matchMedia()`, with a reduce branch that sets final states, kills the parallax, and lets the readout cut instead of crossfade.
- **Responsive** — alternating two-column at `lg`; single column, image-above-text, `py-12` at `md`; `aspect-[4/3]`, `text-2xl` title, 3 stack tags and no parallax below `md`. The readout returns `null` below `lg` rather than rendering into a hidden container.
- **Screenshots respect the confidentiality rules** — Debt Exchange and BRAIN captured against seeded mock data (never blurred, never an expanded SQL preview), MB Group from its verified custom domain, no `*.azurewebsites.net` anywhere.
- `npm run build` and `npx tsc --noEmit` pass; the section is verified in the browser at all three breakpoints.

## Notes

### Spec paths do not match this repo

The spec was written against a `src/` layout and a `homePage` singleton, neither of which exists here. Mapping applied:

| Spec reference | Actual |
| --- | --- |
| `src/components/sections/FeaturedWorkSection.tsx` | `components/sections/FeaturedWorkSection.tsx` |
| `src/components/work/FeaturedProjectCard.tsx` | `components/work/FeaturedProjectCard.tsx` |
| `src/components/layout/CardReadout.tsx` | `components/layout/CardReadout.tsx` |
| `src/components/layout/readouts/FeaturedWorkReadout.tsx` | `components/layout/readouts/FeaturedWorkReadout.tsx` |
| `@sanity/schemas/project.ts` | `sanity/schemaTypes/documents/project.ts` (new) |
| `@sanity/schemas/homePage.ts` | no `homePage` — see below |
| `@src/app/globals.css` | `app/globals.css` |
| `@context/portfolio-project-spec.md` | `context/project-overview.md` |
| `@context/hero-spec.md` | `context/features/hero-spec.md` |

**Assumption to confirm at `/feature start`:** the spec's `featuredWorkSection` fields are added as a **new sibling singleton** (`sanity/schemaTypes/documents/featuredWorkSection.ts`, registered in `SINGLETON_TYPES`) rather than folded into `heroSection`, whose name and field groups are hero-specific. Say so if you'd rather have one `homePage` singleton with `hero` / `featuredWork` groups — that is a larger refactor of shipped schema and content.

### Prerequisites the spec assumes but that are not built

- **No `project` schema exists yet.** Phase 1 only ever shipped `heroSection`; `project`, `technology` and `testimonial` were explicitly carried forward. This feature has to build `project` *and* `technology` (the `stack[]` refs need a target) before any of the section work.
- **No Studio structure for projects.** `sanity/structure.ts` lists the `heroSection` editor and then auto-lists everything else, so new document types appear — but Featured Projects / All Projects / Technologies as named, filtered lists are part of this feature.
- **No `/work/[slug]` route.** `→ case study` links are dead until Phase 4. Expected, per Out of Scope.
- **`useSectionObserver` exists** in `lib/section-observer.tsx` and already supports a separate `setPayload` path, so per-card payload pushes need no changes to the provider — the section registers `"work"` and each card calls `setPayload("work", …)`.

### Spec detail contradicted by what shipped

The spec says the readout slot's `min-h-[4.5rem]` was "reserved in the hero spec". It was not — the hero build removed it, because reserving height there pushed the card greeting into the middle of the card. The slot in [SidebarCard.tsx:188](components/layout/SidebarCard.tsx#L188) is a zero-height `div`. The fixed height therefore belongs to `FeaturedWorkReadout` itself, which is what the spec's own "Behaviour" section requires anyway.

### Existing conventions to follow

- GROQ goes in `sanity/lib/queries.ts` wrapped in `defineQuery`; result types are hand-written in `types/` (TypeGen is not configured) — `types/hero.ts` is the pattern.
- Data is read through `sanityFetch` from `sanity/lib/live.ts`, never ad-hoc `client.fetch`.
- `section-padding` is an existing `@utility` in [globals.css:147](app/globals.css#L147).
- A literal `//` in JSX trips `react/jsx-no-comment-textnodes` — not needed here, but relevant if any mono comment labels appear.
- Guard on `coverImage?.asset`, never on the object: a Sanity image field exists as soon as alt text is typed, and `urlFor()` throws a 500 without an asset.
- `revalidate = 3600` applies in dev, and `.next/cache` holds failed fetches — restart the dev server and `rm -rf .next/cache` after Studio edits.

### Carried over from the hero, still open

Not this feature's scope, but still live in the CMS: placeholder `linkedin.com/in/CHANGE-ME` and `mailto:CHANGE-ME@example.com`, a missing `/cv.pdf`, and a status badge reading "Available for Work" that contradicts @context/project-overview.md.

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
