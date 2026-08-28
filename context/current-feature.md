# Current Feature: Comment Cleanup + Current Focus Card

## Status

In Progress

## Goals

- **Strip over-explicit commenting** from the components. Every file under `components/`, plus `lib/`, `types/` and `content/`, is carrying block comments that narrate what the code already says. Keep only the comments that record a non-obvious decision or a gotcha someone would otherwise reintroduce; delete the rest.
- **Give the hero's Current Focus panel an outer shadow** so it lifts off the page background the way the reference screenshot shows.
- **Change the Current Focus tags** to `Next.js`, `TypeScript`, `AI`.

## Notes

**Scope of the comment pass.** Current comment-line counts, worst first:

| File                                                 | Comment lines / total |
| ---------------------------------------------------- | --------------------- |
| `components/work/FeaturedProjectCard.tsx`            | 31 / 274              |
| `lib/section-observer.tsx`                           | 24 / 160              |
| `components/layout/CardReadout.tsx`                  | 21 / 103              |
| `types/work.ts`                                      | 16 / 63               |
| `components/layout/readouts/FeaturedWorkReadout.tsx` | 14 / 44               |
| `content/work.ts`                                    | 14 / 29               |
| `components/sections/FeaturedWorkSection.tsx`        | 12 / 39               |
| `components/layout/SplitLayout.tsx`                  | 12 / 33               |

The keep/cut test: a comment survives if deleting it would let someone silently break something. The three worth keeping across the codebase are already known — the Tailwind `scale-*` / GSAP `yPercent` interaction in `FeaturedProjectCard`, the "only push on enter, never clear on exit" rule in `FeaturedWorkShell`, and the `isDesktop` dependency in `CardReadout`. Everything that restates a prop name, re-describes a class list, or explains what `useGSAP` does goes.

**The tags are CMS data, not code.** They live at `heroSection.currentFocus.tags` in Sanity, currently `["TypeScript", "Product thinking"]`. Changing them to `Next.js · TypeScript · AI` is a Studio edit (or an MCP patch), not an edit to `HeroSection.tsx`.

**The label does not match the screenshot.** The reference reads `CURRENT FOCUS`; the published document says `CURRENT ROLE`, and the statement is `AI Native Software Engineering · Booksy` rather than `Shipping calmer interfaces.` The screenshot is a styling reference — confirm before changing copy, since the current copy is the Booksy positioning the page argues for.

**The shadow has a design-system constraint.** @context/project-overview.md rules out colored drop shadows and glassmorphism, so this is a neutral, near-black shadow that reads as depth — not an accent glow around the left rail. The panel already carries `border-l-2 border-l-accent` and `rounded-r-card`; the shadow needs to sit under that without turning into the neon treatment the whole redesign exists to get away from.

**Where the markup lives:** the panel is the `data-hero="focus"` block in `components/sections/HeroSection.tsx`, around line 200. It is one of the elements the hero's GSAP load timeline animates, so any wrapper change has to keep that `data-hero` hook intact.

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

### Featured Work Section + Contextual Card Readout

**Spec:** @context/features/featured-work-spec.md · **Merged:** 2026-08-27 · **Commit:** `04aa55a`

Section B, plus the interaction the split layout exists for.

- **Sanity** — `project`, `technology` and a `featuredWorkSection` singleton. `thesis` and `visibility` are closed lists, so the link row is data-driven rather than a per-project exception in the component. `liveUrl` has a custom validator that rejects `*.azurewebsites.net` outright and requires a URL only when `visibility == "public"`. Studio structure gains Featured projects (filtered `featured == true`) / All projects / Technologies. Seeded and published: 17 technologies, three projects, the section copy.
- **Section** — `FeaturedWorkSection` (server) fetches header copy and projects in one round trip; `FeaturedWorkShell` (client) owns the `<section id="work">`, its observer registration and the header reveal. Three files rather than the spec's two, so the fetching component stays on the server.
- **Card** — `FeaturedProjectCard`: index marker, thesis eyebrow, title, `{role} · {company} · {year}`, the first sentence of `problem`, four stack tags plus `+N`, and a link row driven by `visibility`. Alternating image side via `lg:[&>figure]:order-2` on odd indices.
- **Readout** — `CardReadout` is a variant map keyed by section id; `FeaturedWorkReadout` is its one entry. GSAP crossfade: out `0.12s`, commit in a `.call()`, in `0.18s` with `y: 4 → 0`. Returns `null` below `lg` via a `useSyncExternalStore` media-query hook.
- **Motion** — header and per-card reveals on `ScrollTrigger` with `once: true`, one scrubbed parallax, all inside `gsap.matchMedia()`. Under reduce nothing animates at all, which is stronger than setting final states.

**Decisions taken during the build:**

- **`featuredWorkSection` is a sibling singleton, not a `homePage` merge.** The spec asked for fields on a `homePage` document that does not exist here; folding them into `heroSection` would have meant hero-specific field groups holding non-hero copy, and a migration of already-published content
- **Each card observes itself and only pushes on enter.** Clearing on exit would blank the readout in the gap between two cards, making the sidebar flicker on every scroll through
- **MB Group seeded as `anonymised`, not `public`.** @context/project-overview.md confirms only `grupatransportowa.pl` and `gtairandocean.com` as verified domains, and neither is MB Group's. It renders `Client work — details on request` until a domain is verified — inventing one would breach the content rules
- **Thesis and visibility labels are duplicated in `content/work.ts`** rather than imported from the schema. The schema file imports the `sanity` package, and pulling it into a client component to read two strings would drag the Studio runtime into the browser bundle. Typed against the unions so a change fails the build
- **A `// screenshot pending` placeholder frame** renders when `coverImage` has no asset, so an unseeded project degrades instead of crashing

**Gotchas recorded for later features:**

- Tailwind v4 `scale-*` compiles to the standalone `scale` property, not `transform` — so a GSAP `yPercent` tween composes with a Tailwind scale instead of overwriting it. This is what lets the parallax image sit at `scale-[1.08]` at rest
- The dev server's generated CSS goes stale after a class is renamed; it kept serving a `md:min-h-[70vh]` rule that no longer existed in source. Verify utility output against `.next/static/chunks/*.css` from a production build, not the dev stylesheet
- `useGSAP` re-runs only when its `dependencies` change, so a component that both animates and calls `setState` from inside a tween needs the state it reads in the deps — `CardReadout` needs `isDesktop` there because its container does not exist until that flips true after hydration

**Left for follow-up:**

- **No cover images.** All three projects have an empty `coverImage`, so every card shows the placeholder. Capturing them is a content task with real constraints: Debt Exchange and BRAIN must be shot against seeded mock data, never blurred, and BRAIN never with an expanded SQL preview
- **MB Group needs its verified domain** and a switch to `visibility: "public"` — one Studio edit
- **`→ case study` links 404.** `/work/[slug]` ships in Phase 4; expected, per the spec's Out of Scope
- **No browser verification.** Playwright MCP tools were again not exposed to the session, so this is SSR HTML plus generated-CSS inspection only. **The readout crossfade is unverified in a browser** — and @context/project-overview.md calls it the highest-risk component, the one to confirm feels useful rather than gimmicky before more sections are built on the premise
- **`firstSentence` and `hostnameOf`** in `FeaturedProjectCard.tsx` are the first real data-shaping functions in the codebase. Per @context/coding-standards.md that is the trigger for installing Vitest; they were left in the component rather than promoted to `lib/` to keep the commit scoped
