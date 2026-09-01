# Side Project Section — Spec

## Overview

Build the `SideProjectSection` component — the seventh section of the portfolio home page. It has two parts:

1. A **triptych** of three photographs — building, teaching, beekeeping — presented with identical treatment so they read as one statement rather than a collage
2. A **project block** for the hive management app: a Python service that generates inspection reports, extended with a **voice-driven, hands-free inspection flow** for experienced beekeepers

This is the only section on the page describing work that was self-initiated, self-designed, and used by its own author. That is the argument it makes, and the framing line states it directly: _the only project on this page where I was also the user._

It sits between More work and Contact, and is deliberately styled to contrast with the client work above it.

Section id: `beekeeping`. Nav label: `Side project`.

---

## Positioning

The app started as a record-keeping tool: log hive inspections, generate PDF reports. The voice layer is what makes it worth a section of its own.

**The constraint that produced it:** inspecting a hive occupies both hands. There are gloves, a smoker, frames that weigh several kilos, and bees. A phone form is unusable in that context — a beekeeper either memorises the inspection and types it up afterwards, losing detail, or doesn't record it at all.

**The response:** a guided voice flow. The app speaks each inspection step, the beekeeper answers out loud, and the answer is parsed into a structured record. Hands stay on the hive. The report is generated afterwards from complete data captured at the moment of observation rather than reconstructed from memory an hour later.

That is the story this section tells. Not "I built an app for my hobby" — a domain problem with a physical constraint, solved with an interface that gets out of the way.

> **Copy discipline:** describe the constraint before the feature. "Voice control" as a headline sounds like a novelty; "both hands are inside the hive" makes the reason obvious in six words, and the feature then reads as inevitable rather than decorative.

---

## Sanity Schema

### `sideProjectSection` — add to the `homePage` singleton

| Field         | Type                     | Notes                                                                 |
| ------------- | ------------------------ | --------------------------------------------------------------------- |
| `eyebrow`     | string                   | Default: `"Side project"`                                             |
| `headline`    | string                   | Default: `"Built for the one user I could interview any time"`        |
| `framingLine` | text                     | Default: `"The only project on this page where I was also the user."` |
| `triptych`    | array of `triptychImage` | Exactly 3, validated                                                  |
| `project`     | reference → `project`    | The hive app document                                                 |

### `triptychImage` object

- `image` — image, `options: { hotspot: true }`, required `alt`
- `caption` — string — lowercase, one word. Seeds: `building`, `teaching`, `beekeeping`

Order is fixed by array order. The sequence is intentional: two things the rest of the page already argued, then the thing that ties them together.

### `project` document — the hive app

A normal `project` document with `featured: false`. Fields consumed here:

| Field        | Seed value                                                                                                                                                                 |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`      | Hive Log                                                                                                                                                                   |
| `thesis`     | `product-thinking`                                                                                                                                                         |
| `company`    | Personal project                                                                                                                                                           |
| `role`       | Everything — design, backend, voice flow                                                                                                                                   |
| `year`       | 2025 — present                                                                                                                                                             |
| `visibility` | `public` or `no-public-url`, whichever is true                                                                                                                             |
| `stack`      | Python, FastAPI, Whisper (or whichever STT), an LLM for extraction, PDF generation, the frontend framework                                                                 |
| `problem`    | Inspecting a hive occupies both hands. Records get written from memory hours later, or not at all.                                                                         |
| `approach`   | A spoken, guided inspection: the app reads each step aloud, the beekeeper answers, and speech is parsed into a structured record. Reports generate from the captured data. |
| `outcome`    | Inspections recorded at the hive instead of reconstructed afterwards, with per-colony history and seasonal comparison.                                                     |

**Exclude this document from the More work bento** so it does not render twice. The bento query filters it out by dereferencing `homePage.sideProjectSection.project._ref`:

```groq
*[_type == "project" && featured != true && _id != ^.sideProjectRef] | order(order asc)
```

Or pass the id down as a prop and filter in the section — either is fine, but the exclusion must exist.

### `inspectionSteps` — optional, for the voice flow visual

Array of objects on `sideProjectSection`, max 5:

- `prompt` — string — what the app asks aloud, e.g. `"Queen sighted?"`
- `response` — string — a representative spoken answer, e.g. `"Yes, and there's fresh brood"`
- `field` — string — the structured field it fills, e.g. `queen_sighted: true, brood: fresh`

---

## Component Requirements

- Files:
  - `src/components/sections/SideProjectSection.tsx` (server, fetches)
  - `src/components/side-project/Triptych.tsx`
  - `src/components/side-project/VoiceFlow.tsx` (client, GSAP)
- Section id: `beekeeping`
- Background: `bg-base`
- Apply `.section-padding`
- Registers via `useSectionObserver("beekeeping", payload)` — see readout below

### Contrast treatment

This section should not look like the client work above it. Not a different design system — a different rhythm within the same one.

- Wider content measure than the featured cards: `max-w-4xl` instead of `max-w-2xl`
- A visible top divider: `border-t border-border` with the eyebrow sitting on it
- Slightly more vertical air above the triptych than the standard section padding
- **No accent-coloured eyebrow.** Every other section uses `text-accent` here; this one uses `text-fg-muted` so the visual weight drops and the section reads as an aside rather than another pitch.

### Header Block

- Eyebrow: mono `text-xs tracking-[0.18em] uppercase text-fg-muted`
- Headline: `font-display text-3xl md:text-4xl font-bold text-fg mt-3 max-w-2xl`
- Framing line: `text-base text-fg-muted mt-4 max-w-xl leading-relaxed`

### Triptych

- Container: `grid grid-cols-3 gap-3 md:gap-4 mt-12`
- Each figure: `relative aspect-[3/4] rounded-lg border border-border overflow-hidden bg-surface`
- `next/image` with `fill`, `object-cover`, hotspot respected, `sizes="(min-width:768px) 30vw, 33vw"`
- Caption: mono `text-[11px] tracking-widest lowercase text-fg-muted mt-3`, left-aligned under each image
- Hover: `border-accent/30` only. No zoom, no lift, no filter change.

**Image treatment — the part that decides whether this works:**

The three photos only read as intentional if they share treatment. Different framing, lighting, or grading turns a statement into a collage.

- Identical aspect ratio (`3:4`), enforced by the container
- Comparable crop distance — all three at roughly the same subject scale
- Unified grading applied **in the source files, not in CSS.** Desaturate toward the palette, consistent shadow tone, optionally a very light duotone pull toward `#00E5C7` at low opacity
- Plain rectangles with hairline borders. **No hexagon frames**, no angled crops, no masks

> Do not apply `grayscale` or `sepia` filters in CSS to force consistency. It flattens all three equally, including the one that was already fine, and it looks like a filter rather than a grade.

### Project Block

Below the triptych, `mt-20`.

- Container: `rounded-xl border border-border bg-surface p-6 md:p-8`
- Title row: `font-display text-2xl font-bold text-fg`, with the role in mono `text-[11px] tracking-widest uppercase text-fg-muted` beneath
- **Problem** — `text-base text-fg-muted leading-relaxed max-w-xl mt-6`. Lead with the physical constraint.
- **Approach** — same treatment, `mt-4`
- Stack tags: same component and styling as `FeaturedProjectCard`
- Link row: `→ case study` plus live link or `visibility` fallback, identical to the featured cards

### Voice Flow visual

The one thing on this page that needs showing rather than describing. It sits inside the project block, after the approach paragraph.

A vertical list of `inspectionSteps`, each rendered as an exchange:

- **Prompt** — mono `text-xs tracking-wider uppercase text-fg-muted`, prefixed with a small speaker glyph
- **Response** — `font-display text-base text-fg`, in quotation marks, indented `pl-6`
- **Field** — mono `text-[11px] text-accent`, indented `pl-6`, prefixed `→`, rendered as the structured output

Steps are connected by a `1px` vertical line in `border`, running down the left edge. Each step reveals on scroll with a short stagger, so reading down the list mimics the pace of the actual interaction.

**Static rendering only.** No microphone permission, no live speech recognition, no audio playback. A portfolio page that asks for mic access on scroll is a page people close. If a demo is wanted later, it belongs on the case study page behind an explicit button.

---

## Card Readout

Section id `beekeeping`. Payload:

```ts
{
  role: "Personal project",
  meta: "Hive Log · 2025 — present",
  stack: ["Python", "FastAPI", "Whisper", "PDF"]
}
```

Add `SideProjectReadout` to the variant map in `CardReadout.tsx`. Same layout as `FeaturedWorkReadout` — reuse the component with different props rather than writing a second one, unless a distinct line is wanted (e.g. a hive count).

---

## GSAP Animations

```ts
gsap.registerPlugin(useGSAP, ScrollTrigger)
```

All inside `useGSAP(() => { … }, { scope: sectionRef })`.

### Header block

`start: "top 80%"`, `once: true`. Eyebrow, headline, framing line as a timeline: `y: 24 → 0`, `opacity: 0 → 1`, `duration: 0.6`, `stagger: 0.08`, `ease: "power3.out"`.

### Triptych

`start: "top 75%"`, `once: true`.

| Target   | From                | Duration | Stagger              |
| -------- | ------------------- | -------- | -------------------- |
| Figures  | `opacity: 0, y: 32` | `0.7`    | `0.1`                |
| Captions | `opacity: 0, y: 8`  | `0.4`    | `0.1`, offset `+0.2` |

Left to right. The stagger is what makes three images read as a sequence rather than a grid appearing at once.

### Project block

`start: "top 80%"`, `once: true`. `opacity: 0 → 1`, `y: 24 → 0`, `duration: 0.6`.

### Voice flow steps

`start: "top 85%"`, `once: true`. Each step: `opacity: 0 → 1`, `x: -8 → 0`, `duration: 0.4`, `stagger: 0.12`.

The stagger here is slower than elsewhere on purpose — it should feel like a conversation unfolding, not a list rendering. The connecting line draws with `scaleY: 0 → 1`, `transformOrigin: "top"`, running alongside the step stagger at matching total duration.

### Reduced motion

`gsap.matchMedia()`. Under `reduce`: all final states render immediately, no stagger, connecting line at full height.

---

## Responsive

| Breakpoint     | Behaviour                                                                                                                                                                                                                                                                                          |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lg` (1024px+) | Triptych `grid-cols-3`, project block `p-8`, content `max-w-4xl`                                                                                                                                                                                                                                   |
| `md`           | Triptych stays `grid-cols-3` — three portrait images at tablet width still read fine                                                                                                                                                                                                               |
| `< md`         | Triptych becomes a horizontal scroll row: `flex gap-3 overflow-x-auto snap-x snap-mandatory`, each figure `w-[70%] shrink-0 snap-center`, scrollbar hidden. **Do not stack the three vertically** — the statement depends on seeing them together, and stacked they become three unrelated photos. |
| `< md`         | Voice flow indentation reduces to `pl-4`; step text drops to `text-sm`                                                                                                                                                                                                                             |
| `< md`         | Project block `p-5`, title `text-xl`                                                                                                                                                                                                                                                               |

Add a subtle edge fade on the mobile scroll row (`mask-image` gradient) so it reads as scrollable without a visible scrollbar.

---

## Content Rules

Unlike every other section on this page, **this content is entirely mine** — no client confidentiality applies. Real screenshots, real inspection data, real hive counts are all fine.

The one constraint carries over from the project spec:

> **One bee reference maximum, and it is already spent.** The triptych photo and the app's subject matter are the reference. Do not add: honeycomb background patterns, hexagon shapes or frames, bee icons, amber or honey-toned accent colours, or copy playing on "hive mind" / "busy as a bee" / "the swarm". It is charming once and twee the second time, and twee is what stands between cyberpunk and professional.

Nav icon stays `sprout` per the navigation spec — not a hexagon.

---

## Out of Scope

- `/work/[slug]` case study page for the hive app — Phase 4
- Any live microphone or speech recognition in the browser
- The More work bento (this section only requires the exclusion rule in its query)

---

## References

- `@context/portfolio-project-spec.md` — Beekeeping section, Motion Budget, Design System
- `@context/featured-work-spec.md` — `StackTags`, link row, `visibility` handling, `CardReadout` variant pattern
- `@context/hero-spec.md` — `SectionObserverProvider`, `useSectionObserver`
- `@context/navigation-pill-spec.md` — `beekeeping` nav entry, `sprout` icon
- `@src/app/globals.css` — theme tokens
- `@sanity/schemas/homePage.ts` — add `sideProjectSection`
- `@sanity/schemas/objects/triptychImage.ts` — create
- `@sanity/schemas/objects/inspectionStep.ts` — create
- `@src/components/sections/SideProjectSection.tsx` — create
- `@src/components/side-project/Triptych.tsx` — create
- `@src/components/side-project/VoiceFlow.tsx` — create
