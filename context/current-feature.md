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

### Comment Cleanup + Current Focus Card

**Spec:** inline (`/feature load`) · **Merged:** 2026-08-28 · **Commit:** `a5377fc`

A maintenance pass over comment density, plus two small changes to the hero's focus panel.

- **Comments** — 208 comment lines down to 41 across 18 files in `components/`, `lib/`, `types/`, `content/` and `app/`. Every docblock that restated a prop name, re-described a class list or explained what `useGSAP` does was cut. What survives is one or two lines each.
- **Offset accent block** — `--shadow-offset-accent: 10px 10px 0 0 rgb(0 229 199 / 0.1)` in the `@theme` block, applied to the `data-hero="focus"` panel.
- **Tags** — `heroSection.currentFocus.tags` patched and published to `["Next.js", "TypeScript", "AI"]`. No code change; the tags were already CMS data.

**Decisions taken during the build:**

- **The kept comments are a fixed list.** The keep test was "does deleting this let someone silently break something". Survivors: the `scale-[1.08]` parallax travel room and the push-on-enter observer rule in `FeaturedProjectCard`, the `isDesktop` GSAP dependency in `CardReadout`, the `portrait?.asset` guard and the clipped status capsule in `SidebarCard`, the `min-h-18` reflow lock in `FeaturedWorkReadout`, the document-order tie-break in `section-observer`, the schema-duplication rationale in `content/work.ts`, and the hydration-timing note in `use-media-query`
- **`box-shadow`, not an offset `::before`.** A pseudo-element would need `z-index: -1`, and the hero's `page-grid` and `hero-glow` layers are positioned siblings that paint in the z-auto layer — above negative-z-index content. A zero-blur `box-shadow` paints behind the element's own background with no stacking-context exposure, and inherits `rounded-r-card` for free
- **First attempt was wrong.** A blurred three-layer neutral elevation shadow was built first from the screenshot, then replaced — the reference was a flat offset rectangle, not depth
- **`app/globals.css` comments were left alone.** The request named components; the stylesheet's comments document token and utility intent
- **The `next-sanity` docblock in `app/studio/[[...tool]]/page.tsx` was cut** — eight lines of upstream boilerplate linking to docs. It will come back if the route is ever regenerated

**Gotchas recorded for later features:**

- `npm install` copies indentation from `package.json` into `package-lock.json`. The lockfile was tab-indented from before Prettier landed, so an install rewrote all 19.5k lines. `npm install --package-lock-only` after formatting `package.json` re-derives it and shrinks the diff to the real change
- A Tailwind v4 `@theme` typo produces no class and no error — the utility silently does not exist. Verify new tokens against `.next/static/chunks/*.css` from a production build

**Left for follow-up:**

- **No browser verification.** Playwright MCP tools were not exposed to this session either. The offset block is confirmed in the production CSS (`.shadow-offset-accent{--tw-shadow:10px 10px 0 0 …}`) and in the prerendered HTML, but has not been looked at
- **The offset block is a coloured shadow**, which @context/project-overview.md rules out. It is a flat graphic device rather than a glow, and it was explicitly requested — but the rule and the code now disagree, and one of them should move
- **The focus panel's label and statement still read `CURRENT ROLE` / `AI Native Software Engineering · Booksy`**, not the screenshot's `CURRENT FOCUS` / `Shipping calmer interfaces.` Treated as a styling reference; the copy was left as the Booksy positioning

### Navigation Pill (Phase 1 — Desktop & Tablet)

**Spec:** @context/features/navigation-pill-spec.md · **Merged:** 2026-08-28 · **Commit:** `7534600`

A fixed right-edge rail of eight section links, plus scroll-to-top and a placeholder theme toggle.

- **`lib/navigation.ts`** — `NAV_ITEMS`, eight structural entries. Not CMS-managed.
- **`components/icons/index.tsx`** — eleven inline Lucide-path SVGs behind one `Icon` component keyed by an `IconName` union, so no `lucide-react` dependency lands for eleven glyphs
- **`NavigationPill`** — mounted in `SplitLayout` outside the grid columns; the sticky card's stacking context cannot clip it. `NavPillLink` renders real `<a href="#id">` anchors in a `<ul>`, with `aria-current`, a left-side tooltip on hover and `:focus-visible`, and a shared `2px` accent indicator tweened on section change
- **Active state** reads the existing `useSectionObserver()`. No second `IntersectionObserver`, no hash sync on scroll
- **Smooth scroll** — GSAP `ScrollToPlugin`, `0.8s` `power2.inOut`, hash written in `onComplete`, `duration: 0` under reduce
- **`section-padding`** reserves `5.5rem` / `6rem` inline-end from `md` up; the `nav-rail` utility only becomes scrollable below `40rem` viewport height

**Decisions taken during the build:**

- **The theme toggle shipped as a placeholder**, against the decision recorded at the top of this file. It holds state in `lib/theme.tsx` that nothing reads, and the light palette is a later feature. Its `aria-label` was made static (`Toggle theme`) — the original `Switch to {next} theme` flipped to "Switch to dark theme" on click while the page stayed dark, asserting a light theme that was not in effect. **@context/project-overview.md and @context/coding-standards.md still say dark only, no toggle; the code now disagrees with both**
- **`nav-rail` scrolls only under `height < 40rem`.** An always-on `overflow-y: auto` container would clip the tooltips, which sit outside the pill
- **Below `md` the rail is `display: none`, not unmounted.** The goal said "renders `null`" but also specified `hidden md:flex`; the class won, so the eight anchors still ship in the mobile DOM

**Gotchas recorded for later features:**

- **`text-base` is a colour, not a size.** The palette defines `--color-base`, so Tailwind resolves `text-base` to `color: #0A0B0E` — near-invisible on the page background. Two hero elements carried it. Use `text-[length:…]` or a named size; never `text-base` in this project
- GSAP's ticker is rAF-driven, so a `scrollTo` tween stalls mid-flight while the tab is backgrounded — a scroll assertion taken too early under automation reads as a failed scroll when the tween is merely paused

**Left for follow-up:**

- **The theme toggle still does nothing.** Either the light palette ships or the button goes; a placeholder control in the corner of every viewport is the least defensible of the three states
- **The hero stat row renders `1.6 years of experience`**, which @context/project-overview.md rules out by name as "the one number that works against me". CMS content, one Studio edit
- Six of the eight links (`timeline`, `teaching`, `skills`, `more-work`, `beekeeping`, `contact`) point at sections that do not exist yet and no-op on click

### Mobile Navigation (Phase 2 — Mobile)

**Spec:** @context/features/mobile-nav-spec.md · **Merged:** 2026-08-28 · **Commit:** `7d69ee9`

The navigation layer below `md`, replacing the Phase 1 pill. **The first feature in this project verified in a real browser** — the Playwright MCP tools were finally exposed to the session.

- **`lib/use-smooth-scroll.ts`** — the Phase 1 click handler extracted so both nav layers share one `ScrollToPlugin` implementation. Also exports `prefersReducedMotion()`
- **`components/navigation/control-size.ts`** — `CONTROL_SIZES` behind a `ControlSize` union; `ThemeToggle` additionally takes `showTooltip`, since a hover tooltip has no trigger on touch and would sit off the right edge
- **`MobileTopBar`** — `RS` monogram (from `heroSection.monogram`, threaded through `SplitLayout`) plus a hamburger whose bars are positioned with `top`/`bottom` rather than Tailwind translate utilities, so GSAP owns `transform` outright. Background fades in past `32px` through a class toggle, not a `ScrollTrigger`
- **`MobileMenuPanel`** — compact `top-16 right-4` dropdown over a blurred backdrop; `NAV_ITEMS` as real anchors with icon, label, a `2px` accent bar and `aria-current`
- **`MobileControlStack`** — both controls share one 44px corner slot. The theme toggle rests in it and lifts `52px` on `elastic.out(1, 0.55)` when the arrow appears, dropping back on `back.in(1.7)`
- **`MobileNav`** — a `closed | open | closing` machine, body scroll lock with `scrollY` restore, hand-rolled focus trap, `Escape`, and auto-close at `md+`

**Decisions taken during the build:**

- **The panel mounts only while open.** This is what kept the mobile menu's eight anchors from duplicating the pill's eight in the DOM — the concern flagged when the spec was loaded. Confirmed at both breakpoints: 8 pill anchors and 0 menu anchors at rest
- **`closing` is a third state, not a boolean.** `isOpen` alone would rip the panel out of the DOM mid-exit; the close timeline's `onComplete` is what commits `closed`
- **`prefersReducedMotion()` instead of the spec's `gsap.matchMedia()`.** A matchMedia context auto-reverts on teardown, which snapped the hamburger back to bars before the close animation could play it. This also matches what `ScrollToTopButton` already did
- **The scroll lock uses `position: fixed`, not `overflow` alone** — iOS Safari scrolls the body regardless of overflow, which is why `scrollY` has to be restored by hand. The lock effect is declared _before_ the pending-scroll effect so React's cleanup ordering unlocks the body before the tween starts
- **The top bar goes `z-60` while open** so the trigger sits above the `z-50` backdrop. Required for the focus trap to include it, and it matches `hamburger-modal.png`
- **Three hamburger bars, not the spec's two** — corrected during review
- **The `size` prop is half-dead.** The spec asks for `"md" | "lg"` then puts `size-11` on both surfaces, so both call sites pass `lg`. Shrinking the desktop buttons to `size-10` would have dropped them under the 44px hit target, so the `md` branch was left unused rather than forced
- **The arrow's scale rides on a wrapper div**, not the button — `ScrollToTopButton` runs its own opacity tween and is shared with the desktop pill, so animating a wrapper composes with it and leaves desktop untouched

**Verified in Chrome** at 390×844 unless noted: top-bar background past 32px · open/X morph/stagger · `Escape` closes, unlocks, returns focus, `aria-expanded=false` · backdrop click · item click closes then scrolls (landed at `#hero`, hash written) · body `fixed` → `static` with `scrollY` restored · focus trap wrapping trigger ↔ `#contact` · crossing to `md+` closes and unlocks · panel caps at 324px and scrolls at 640×420 · reduced motion cuts in at opacity 1 and the zero-duration close still fires `onComplete` · `md`/`lg` byte-identical after the `max-md:` changes.

**Gotchas recorded for later features:**

- **`useGSAP` does not revert on dependency change** — `revertOnUpdate` defaults to `false`, only unmount reverts. This is what lets a state-driven timeline animate _from_ where the previous one left off, and why `gsap.matchMedia()` is the wrong tool inside a `useGSAP` keyed on state
- **`react-hooks/set-state-in-effect` rejects reacting to a derived media-query boolean.** Subscribing to `matchMedia().addEventListener('change', …)` and setting state in the callback is both lint-clean and more correct — only the _crossing_ matters
- The desktop pill and the mobile stack share `aria-label`s (`Toggle theme`, `Back to top`). A bare `document.querySelector` in a browser check hits the pill's copy first and returns a zero-size rect while it is `display: none` — scope such queries to the mobile container
- Confirming the Phase 1 note: GSAP's rAF ticker stalls under automation until the mouse moves, so entrance tweens read as "content missing" and mid-flight assertions read as failures. Move the mouse, then measure

**Left for follow-up:**

- **`activeSection` is `null` at the top of the page on mobile**, so the menu shows no active item on the first screen — the sidebar card occupies the observer's middle band before `#hero` does. The desktop pill has the same gap. Section registration is out of scope per the spec, but this is the first place it visibly costs something
- **The theme toggle still does nothing, and now does nothing on two surfaces.** Third feature running with @context/project-overview.md and @context/coding-standards.md saying dark only, no toggle, while the code ships one
- **Beyond the spec, at request:** the sidebar card lost its monogram below `md`, gained `pt-20` clearance, dropped to `min-h-[calc(100svh-13rem)]`, and its column took `max-md:min-h-svh` so the hero stops bleeding into the first viewport. The decorative `tabIndex={-1}` arrow CTA is hidden below `sm` to stop the CTA row wrapping
- Six of the eight menu rows still point at sections that do not exist
