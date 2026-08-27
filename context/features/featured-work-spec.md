# Featured Work Section — Spec

## Overview

Build the `FeaturedWorkSection` component — the second section of the portfolio home page and the first real argument the page makes. It displays exactly three featured projects as full-width stacked cards with alternating image sides. Each card is a self-contained pitch: thesis, title, problem, screenshot, stack, and a link to its case study.

This section also ships the **contextual card readout** — the slot reserved but left empty in the hero. As each project card enters the viewport, the sticky sidebar card updates to show that project's role and stack. This is the first place the split layout's core interaction becomes visible, so it carries more weight than a normal content section.

Content is managed via Sanity. All visible text is in English.

Deliberately **not** a bento grid: three items in a bento is three boxes with extra CSS. Bento belongs on the case study pages and in the "More work" section.

---

## Sanity Schema

### `project` document — fields consumed here

The full schema is defined in `@context/portfolio-project-spec.md`. This section reads:

| Field | Type | Use in this section |
| --- | --- | --- |
| `title` | string | Card headline |
| `slug` | slug | `→ case study` link target |
| `featured` | boolean | Filter — only `true` renders here |
| `order` | number | Sort order within the three slots |
| `thesis` | string | Mono eyebrow — see allowed values below |
| `company` | string | Rendered beside the year |
| `role` | string | Honest scope, e.g. `"Sole frontend owner"` / `"Four key features"` |
| `year` | string | |
| `stack` | array of refs → `technology` | First 4 render as tags on the card; all render in the readout |
| `visibility` | string | Controls the link row — see below |
| `liveUrl` | url (optional) | |
| `coverImage` | image (hotspot) | The screenshot |
| `problem` | text | First sentence renders as the card's problem line |

### Allowed `thesis` values (`options.list`)

Each featured project argues something different. Three cards sharing a Next.js + CMS + Azure stack blur into one unless each has its own thesis.

| Value | Label |
| --- | --- |
| `"architecture"` | Architecture |
| `"data-application"` | Data application |
| `"ai-realtime"` | AI & real-time |
| `"product-thinking"` | Product thinking |
| `"craft-i18n"` | Craft & localisation |

### `visibility` handling

| Value | Link row renders |
| --- | --- |
| `"public"` | `↗ liveUrl` (hostname only as label) + `→ case study` |
| `"no-public-url"` | `Internal platform — no public URL` in `fg-muted` + `→ case study` |
| `"anonymised"` | `Client work — details on request` in `fg-muted` + `→ case study` |

Never hardcode a per-project exception in the component. BRAIN has no public URL by design; the field handles it.

### `featuredWorkSection` — add to the `homePage` singleton

- `eyebrow` — string — default: `"Selected work"`
- `headline` — string — default: `"Three systems, three different problems"`
- `subheadline` — text (optional) — one line, `max-w-xl`

### Seed Initial Values

Three `project` documents, `featured: true`:

| Order | Title | Thesis | Company | Role | Visibility |
| --- | --- | --- | --- | --- | --- |
| 1 | MB Group Multisite | `architecture` | Hued.me | Sole frontend owner | `public` |
| 2 | Debt Exchange | `data-application` | Hued.me | Four key features | `public` |
| 3 | BRAIN | `ai-realtime` | Hued.me | UI & chat experience | `no-public-url` |

Problem lines (first sentence of `problem`, seed as written):

- **MB Group** — Four brands and six domains needed separate sites without four separate codebases.
- **Debt Exchange** — A financial marketplace with nine sortable columns had to live inside a CMS-editable page.
- **BRAIN** — Business users needed to query a production database without knowing SQL, and to trust the answer.

---

## Contextual Card Readout

The mechanism the split layout exists for. Ships here.

### Files

- `src/components/layout/CardReadout.tsx` — variant map keyed by section id
- `src/components/layout/readouts/FeaturedWorkReadout.tsx` — this section's variant

### Behaviour

- The section registers with `id: "work"` via `useSectionObserver`
- Each of the three `FeaturedProjectCard`s runs its **own** `IntersectionObserver` (`rootMargin: "-45% 0px -45% 0px"`) and pushes a payload when it occupies the middle band:

```ts
{ role: string, company: string, year: string, stack: string[] }
```

- `CardReadout` reads `{ activeSection, activePayload }` from context and renders `FeaturedWorkReadout` when `activeSection === "work"`
- Content crossfades on payload change: `opacity 1→0→1` over `~200ms` total with a `4px` `y` shift, driven by GSAP
- Slot height is fixed at `min-h-[4.5rem]` (reserved in the hero spec) — **the card must never reflow or jump** when the readout swaps
- Between cards, when no card owns the middle band, the last payload persists — do not clear to empty

### Readout layout

- Role line: `font-display text-sm font-semibold text-fg`
- Meta line: mono `text-[11px] tracking-widest uppercase text-fg-muted mt-1` — `{company} · {year}`
- Stack: mono `text-[11px] text-fg-muted mt-2`, joined with ` · `, truncated to 2 lines with `line-clamp-2`

---

## Component Requirements

- Files:
  - `src/components/sections/FeaturedWorkSection.tsx` (server component, fetches)
  - `src/components/work/FeaturedProjectCard.tsx` (client, needs observer + GSAP)
- Section background: `bg-base`
- Apply `.section-padding` for vertical spacing
- Section id: `work` — the hero's `View selected work` CTA targets `#work`
- Data: `*[_type == "project" && featured == true] | order(order asc)[0...3]` with `stack[]->{name}` dereferenced
- If fewer than three featured projects exist, render what exists — do not pad with placeholders

### Header Block (left-aligned)

- Eyebrow: mono `text-xs tracking-[0.18em] uppercase text-accent`
- Headline: `font-display text-4xl md:text-5xl font-bold text-fg mt-3`
- Subheadline: `text-base text-fg-muted mt-3 max-w-xl`
- No "See all" link — the More work section handles the archive

### Project Card

Container: `relative grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[70vh] py-16 border-t border-border`

Alternating sides: odd-index cards get `lg:[&>figure]:order-2` so the image swaps to the right. Text column stays `max-w-lg`.

**Text column:**

- Index marker: mono `text-[11px] tracking-widest text-fg-muted` — `01` / `02` / `03`
- Thesis eyebrow: mono `text-xs tracking-[0.18em] uppercase text-accent mt-4`
- Title: `font-display text-3xl md:text-4xl font-bold text-fg tracking-[-0.02em] mt-3`
- Meta: mono `text-[11px] tracking-widest uppercase text-fg-muted mt-3` — `{role} · {company} · {year}`
- Problem line: `text-base text-fg-muted mt-5 leading-relaxed max-w-md`
- Stack tags: `flex flex-wrap gap-2 mt-6`, each `rounded border border-border bg-surface px-2.5 py-1 font-mono text-[11px] tracking-wider uppercase text-fg-muted`. First 4 only; if more exist append a `+N` tag.
- Link row: `flex items-center gap-5 mt-8`
  - Case study: `font-mono text-xs tracking-widest uppercase text-fg underline underline-offset-4 decoration-accent hover:text-accent transition-colors` with `→`
  - Live link or visibility fallback per the table above

**Image column (`<figure>`):**

- Frame: `relative aspect-[16/10] rounded-lg border border-border bg-surface overflow-hidden`
- `next/image` with `fill`, `object-cover`, `sizes="(min-width:1024px) 50vw, 100vw"`, Sanity hotspot respected
- Inner image scaled `scale-[1.08]` at rest to give the parallax room to move without exposing edges
- Subtle top-edge highlight: `after:absolute after:inset-x-0 after:top-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-border after:to-transparent`
- Hover: `border-accent/40` only. No scale, no glow, no tilt.
- `figcaption` is visually hidden but present, describing the screenshot for screen readers

---

## GSAP Animations

Use `gsap` with `useGSAP`. No Motion for React.

```ts
gsap.registerPlugin(useGSAP, ScrollTrigger);
```

All animation inside `useGSAP(() => { … }, { scope: containerRef })` — scoped cleanup, no manual `gsap.context()` teardown.

### Header block

`ScrollTrigger` at `start: "top 80%"`, `once: true`:
- Eyebrow, headline, subheadline as a timeline: `y: 24 → 0`, `opacity: 0 → 1`, `duration: 0.6`, `ease: "power3.out"`, `stagger: 0.08`

### Project cards

Each card animates independently, `start: "top 75%"`, `once: true`:

| Target | From | Duration | Position |
| --- | --- | --- | --- |
| Image frame | `opacity: 0, y: 40` | `0.7` | `0` |
| Text block children | `opacity: 0, y: 24`, `stagger: 0.06` | `0.5` | `0.15` |
| Stack tags | `opacity: 0, y: 12`, `stagger: 0.04` | `0.4` | `0.4` |

Ease `power3.out` throughout.

### Image parallax

The one scrub-linked effect outside the timeline section. Keep it small — this is depth, not movement.

```
scrollTrigger: { trigger: figure, start: "top bottom", end: "bottom top", scrub: 0.6 }
inner image: yPercent -6 → 6
```

### Readout crossfade

Not scroll-triggered — fires on payload change. `gsap.timeline()`: fade out `0.12s`, swap content in an `onComplete`, fade in `0.18s` with `y: 4 → 0`.

### Reduced motion

Wrap everything in `gsap.matchMedia()`:

```
mm.add("(prefers-reduced-motion: no-preference)", () => { /* all of the above */ });
mm.add("(prefers-reduced-motion: reduce)", () => { /* set final states, no tweens, no parallax */ });
```

The readout still swaps under reduced motion — it just cuts instead of crossfading.

---

## Responsive

- **`lg` (1024px+)** — two-column card, alternating sides, `70vh` minimum, sticky sidebar active
- **`md`** — single column. Image above text on every card, no alternation. `min-h` drops to `auto` with `py-12`.
- **`< md`** — image `aspect-[4/3]`, title `text-2xl`, stack tags truncate to 3 plus `+N`, parallax disabled entirely (it costs more than it gives on a phone)
- Below `lg` the readout does not render — the sidebar card has already scrolled away. The `FeaturedWorkReadout` should return `null` rather than rendering into a hidden container.

---

## Content Rules — screenshots

Every image in this section comes from client work. These are not optional.

**UI is publishable, data never is.** For any screenshot showing records, run the app locally against seeded fake data and capture that.

- **Debt Exchange** — the live table shows real company names, NIP numbers, invoice amounts and enforcement stages. Seed mock rows (`DEMO LOGISTICS SP. Z O.O.`, `PL0000000000`, `2025/01/0001`) and vary the enforcement stage across rows so the enum reads as an enum. **Never blur** — blur looks amateur and leaves the shape of the data intact.
- **BRAIN** — the chat table shows real order numbers and third-party client order references. Mock data only. Never capture an expanded SQL preview: it exposes the client's schema.
- **MB Group** — public marketing pages, safe as-is. Capture from the verified custom domain.
- **Never publish `*.azurewebsites.net` URLs** — not as `liveUrl`, not in copy, not visible in a screenshot address bar.
- `designCredit` renders on cards where the design was client-supplied. Stating it reads as confident, not defensive.

---

## Out of Scope

- `/work/[slug]` case study pages — links point there but the route ships in Phase 4
- The More work bento and its skill-filter wiring
- Readout variants for any other section — the map is created here with one entry; later sections add their own

---

## References

- `@context/screenshots/hero.png` — established layout, card, and type treatment
- `@context/portfolio-project-spec.md` — Featured work, The Sticky Card, Motion Budget, Content Rules
- `@context/hero-spec.md` — `SplitLayout`, `SidebarCard`, `SectionObserverProvider`, reserved readout slot
- `@src/app/globals.css` — theme tokens and utility classes
- `@sanity/schemas/project.ts` — extend with `thesis` `options.list`
- `@sanity/schemas/homePage.ts` — add `featuredWorkSection` fields
- `@src/components/sections/FeaturedWorkSection.tsx` — create
- `@src/components/work/FeaturedProjectCard.tsx` — create
- `@src/components/layout/CardReadout.tsx` — create
- `@src/components/layout/readouts/FeaturedWorkReadout.tsx` — create
