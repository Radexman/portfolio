# Card Project Mode — Feature Spec

## Overview

Change how the sticky sidebar card behaves while the Selected Work section is in view. Instead of updating a small readout strip inside an otherwise unchanged card, **the entire card transforms into a project card**: its background becomes a heavily blurred version of the active project's cover image, and its content is replaced with that project's title, description, year, role, stack tags, and a position counter.

The card returns to its default identity state when the section is exited in either direction.

> **This supersedes the "Contextual Card Readout" section of `@context/featured-work-spec.md`.** The reserved `min-h-[4.5rem]` readout slot and `FeaturedWorkReadout` are replaced by a full card mode swap. `CardReadout` is still built as the variant mechanism for later sections (Teaching, Skills, Side project) — Selected Work simply overrides the whole card instead of filling one slot.

Visual references:

- `@context/screenshots/featured-projects.png` — card in project mode, first project active
- `@context/screenshots/featured-projects-card-interaction.mp4` — full scroll interaction

---

## Behaviour Observed in the Reference

Timings below are measured from the video at 15 fps.

| Moment                                     | What happens                                                                                                                       |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Section not in view                        | Card in **identity mode** — portrait, monogram, socials, status badge, greeting, bio, CTA row                                      |
| First project card reaches the middle band | Card switches to **project mode**. Portrait, socials and status badge are removed; blurred cover image becomes the card background |
| Scrolling between projects                 | Card content and background swap to the newly active project                                                                       |
| Section exited (either direction)          | Card returns to identity mode                                                                                                      |

**Transition is sequential, not a crossfade.** The outgoing content fades fully out (~200 ms), the card sits nearly empty for roughly one frame, then the incoming content fades in (~200 ms). Total ~400 ms. Frame 12 of the extracted sequence shows the card almost completely empty mid-swap — this avoids two blurred images ghosting over each other, and is the behaviour to reproduce.

**The whole card fades**, background included — not just the text layer.

---

## Card Modes

|              | Identity mode                             | Project mode                               |
| ------------ | ----------------------------------------- | ------------------------------------------ |
| Background   | Portrait photo, grayscale, gradient scrim | Blurred project cover, scrim               |
| Monogram     | Visible, top-left                         | Visible, top-left                          |
| Socials      | Visible, top-right                        | **Hidden**                                 |
| Status badge | Visible                                   | **Hidden**                                 |
| Body         | Greeting, bio                             | Title, description, Year, Role, stack tags |
| Divider      | Above CTA row                             | Above CTA row                              |
| CTA row      | `Let's talk` + `Download CV`              | `Let's talk` only                          |
| Bottom-right | —                                         | Position counter `01 / 03`                 |

The container, its border, radius, padding and dimensions are **identical** in both modes. Only the contents and background change.

---

## Layout Stability

The two modes have different content volumes, and the card is `position: sticky` — any height change causes a visible jump.

- Card dimensions are **fixed**, not content-driven: `aspect-[3/4]` at `lg`, capped at `max-h-[calc(100svh-4rem)]`, as already specified in `@context/hero-spec.md`
- Both mode layouts render inside an absolutely positioned inner container filling the card. Content is anchored: monogram top, body block below it, divider and CTA row pinned to the bottom via `absolute inset-x-0 bottom-0`
- The description field is clamped to 2 lines (`line-clamp-2`) and the title to 1 (`line-clamp-1`). A long project title must never reflow the card
- Stack tags are limited to the first 3. A fourth would wrap on narrow cards; append `+N` if more exist

Verify with the longest and shortest project in the set before shipping — the card must not move by a single pixel between them.

---

## Background Image

### Do not CSS-blur a full-resolution image

`filter: blur(40px)` on a 1600px image is an expensive repaint that runs on every scroll frame while the card is sticky. Two approaches, in order of preference:

1. **Sanity LQIP.** `coverImage.asset->metadata.lqip` returns a base64 blur placeholder (~20px). Render it as a `background-image` scaled to fill with `filter: blur(24px) saturate(1.2)`. Blurring an already-tiny image is nearly free and the result is visually identical to blurring a large one.
2. **Sanity CDN transform.** Request the cover at `?w=64&blur=50` and let the CDN do the work. Slightly sharper result than LQIP, one extra request per project.

Either way: **never load the full-size cover into the card.** The card shows an atmospheric wash, not an image anyone reads.

### Contrast — the reference's one real flaw

In the video, the second project's cover is a light e-commerce screenshot. When it becomes the card background, the card turns pale and the white title drops to roughly 2:1 contrast — visibly hard to read in frames 12–15.

The fix is a **fixed, opaque-enough scrim that does not depend on the source image**:

```
/* beneath content, above blurred image */
background:
  linear-gradient(to top, rgb(10 11 14 / 0.92) 0%, rgb(10 11 14 / 0.72) 55%, rgb(10 11 14 / 0.55) 100%);
```

Plus `backdrop-filter: saturate(0.6)` on the scrim layer to pull vivid covers toward the palette.

Do **not** implement adaptive text colour based on image luminance. It is unpredictable, adds a colour-extraction step, and produces a card whose text colour flickers between projects. A fixed dark scrim is correct, and it is also what keeps the card consistent with the rest of the page.

Verify every project cover against the scrim before shipping. Target 4.5:1 for the title, 3:1 for muted metadata.

### Preloading

Blurred backgrounds must be ready before the swap or the card flashes empty. Since LQIP strings arrive with the initial GROQ query, all three are already in memory — assign them to state on mount, not on demand. If using the CDN-transform approach instead, prefetch all three covers when the section first enters the viewport.

---

## Project Mode Layout

Ref: `featured-projects.png`

Inside the card, top to bottom:

- **Monogram** — unchanged from identity mode, `absolute top-4 left-4`
- **Title** — `font-display text-2xl font-bold text-fg`, `line-clamp-1`
- **Description** — `text-sm text-fg-muted mt-2 leading-relaxed`, `line-clamp-2`. Source: first sentence of `problem`
- **Year block** — label `Year` in mono `text-[10px] tracking-widest uppercase text-fg-muted`, value below in `text-base text-fg`
- **Role block** — same treatment, label `Role`
- **Stack tags** — `flex flex-wrap gap-2`, each `rounded-full border border-border/60 bg-surface/70 backdrop-blur-sm px-3 py-1 text-[11px] font-medium text-fg`. Pill-shaped here, unlike the square tags on the main project cards — the reference uses pills and they read better over a blurred background
- **Divider** — `h-px bg-border/60`, above the bottom row
- **Bottom row** — `flex items-center justify-between`
  - Left: circular arrow button (`size-9 rounded-full border border-border/60 bg-surface/70`) + `Let's talk` pill
  - Right: **position counter** — active index in `font-mono text-xs font-semibold text-fg`, separator and total in `text-fg-muted`: `01` `/ 03`. Zero-padded to two digits.

Counter total comes from the length of the featured array, not a hardcoded `3`. If only two featured projects exist, it reads `01 / 02`.

---

## State & Detection

Extends the existing `SectionObserverProvider` from `@context/hero-spec.md`. **Do not add a third observer** — the per-card observers specified in `@context/featured-work-spec.md` already exist and already push a payload.

Widen the payload:

```ts
type ProjectCardPayload = {
  index: number // 0-based
  total: number
  title: string
  description: string
  year: string
  role: string
  stack: string[]
  lqip: string // base64 blur placeholder
}
```

Card mode derives from context, not from its own logic:

```ts
const mode = activeSection === 'work' && activePayload ? 'project' : 'identity'
```

**Between-card behaviour:** when scrolling through the gap between two project cards, no card owns the middle band. The last payload persists — the card must not fall back to identity mode mid-section. Only leaving the section entirely reverts it.

**Section exit:** `activeSection` changing away from `work` triggers the reverse transition. This must work in both directions — scrolling up from Career Timeline into Selected Work enters project mode at the _last_ project, not the first.

---

## GSAP Animations

```ts
gsap.registerPlugin(useGSAP)
```

Inside `useGSAP(() => { … }, { scope: cardRef, dependencies: [mode, activePayload?.index] })`.

### Project-to-project swap

Sequential, matching the reference:

```
tl = gsap.timeline()
tl.to(contentRef, { opacity: 0, duration: 0.2, ease: "power2.in" })
  .add(() => setRenderedPayload(activePayload))   // swap DOM at the empty point
  .fromTo(contentRef, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "power2.out" })
```

`contentRef` wraps **both** the blurred background layer and the content layer, so they fade together as the reference does.

Hold `renderedPayload` in state separately from `activePayload`. Swapping the DOM directly on `activePayload` change would make the outgoing content disappear instantly instead of fading.

### Mode change (identity ⇄ project)

Same sequential fade, slightly longer: `0.25s` out, `0.25s` in. The portrait and project background are different enough that a faster swap reads as a glitch.

### Rapid scrolling

The user can cross all three cards in under 400 ms. Kill any in-flight timeline before starting a new one:

```ts
tlRef.current?.kill()
```

Without this, fast scrolling queues transitions and the card lags several projects behind the viewport. Test by flinging the scroll wheel through the section — the card must land on the correct project immediately, never replay intermediate states.

### Reduced motion

`gsap.matchMedia()`. Under `reduce`: content swaps instantly at full opacity, no fades in either direction. The mode change still happens — it is information, not decoration.

---

## Responsive

| Breakpoint     | Behaviour                                                                                                                                                                                                                         |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lg` (1024px+) | Full behaviour as specified                                                                                                                                                                                                       |
| `< lg`         | **Feature does not apply.** The card is not sticky below `lg` — it scrolls away with the hero. Project mode never activates; the per-card observers should skip pushing payloads entirely rather than updating an off-screen card |

Guard the observer registration with a media query check so mobile does not run three `IntersectionObserver`s for a card nobody can see.

---

## Right Column — no change

Confirmed from the video: the project cards in the content column **scroll normally**. They do not pin, stack, or scale. The only scroll-linked effect is the existing `±6%` image parallax from `@context/featured-work-spec.md`.

The section eyebrow appears to remain visible at the top of the section as cards pass. If a sticky eyebrow is wanted, it is a separate small addition (`sticky top-20` on the header block) — not required by this spec.

---

## Acceptance Criteria

1. Card never changes height or position when swapping between projects or modes
2. Title and metadata meet 4.5:1 / 3:1 contrast against **every** project cover, including the lightest one
3. Flinging the scroll through the section lands the card on the correct project with no queued replay
4. Scrolling up into the section from below enters project mode on the last project
5. No full-resolution cover image is loaded into the card
6. Under `prefers-reduced-motion`, content still swaps — it simply cuts
7. Below `lg`, no project observers run

---

## References

- `@context/screenshots/featured-projects.png` — card in project mode
- `@context/screenshots/featured-projects-card-interaction.mp4` — scroll interaction
- `@context/featured-work-spec.md` — per-card observers, payload push, project cards (**readout section superseded**)
- `@context/hero-spec.md` — `SidebarCard`, identity mode, fixed dimensions, `SectionObserverProvider`
- `@context/portfolio-project-spec.md` — Design System, Motion Budget
- `@src/components/layout/SidebarCard.tsx` — extend with mode handling
- `@src/components/layout/card-modes/IdentityMode.tsx` — extract existing content
- `@src/components/layout/card-modes/ProjectMode.tsx` — create
- `@src/lib/section-observer.tsx` — widen payload type
