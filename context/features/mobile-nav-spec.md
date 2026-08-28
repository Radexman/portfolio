# Mobile Navigation — Spec (Phase 2: Mobile)

## Overview

Build the mobile navigation layer that replaces `NavigationPill` below the `md` breakpoint. It has three fixed elements plus one overlay:

1. A minimal **top bar** — monogram on the left, hamburger trigger on the right
2. A **bottom-right control stack** — theme toggle and scroll-to-top, matching the desktop pill's two circular buttons
3. A **menu panel** that opens from the hamburger, anchored to the top-right, listing every page section with its icon and active state

This is Phase 2 of the navigation work. Phase 1 (`@context/navigation-pill-spec.md`) covers `md` and above. The two never render simultaneously.

Visual references:

- `@context/screenshots/mobile-pill.png` — the resting state: hamburger top-right, two circular buttons bottom-right
- `@context/screenshots/mobile-hero.png` — the controls in context over the hero card
- `@context/screenshots/hamburger-modal.png` — the open menu panel

> **Two deviations from the reference screenshots**, both deliberate:
> - **No date/time display.** The `Fri, Aug 28 10:55` block in the top bar is not built.
> - **No second gear button** below the hamburger. The reference shows a settings-style icon there; the only settings control is the theme toggle in the bottom stack.

---

## Configuration

Reuses `NAV_ITEMS` from `@src/lib/navigation.ts` unchanged. The mobile menu and the desktop pill are two presentations of one list — if they ever diverge, the bug is that something imported a copy.

The reference screenshot shows template labels (About, Education, Services, Testimonials). Ignore those; render `NAV_ITEMS` as defined:

| Order | `id` | Label | Icon |
| --- | --- | --- | --- |
| 1 | `hero` | Home | `house` |
| 2 | `work` | Selected work | `briefcase` |
| 3 | `timeline` | Career | `git-branch` |
| 4 | `teaching` | Teaching | `graduation-cap` |
| 5 | `skills` | Stack | `braces` |
| 6 | `more-work` | More work | `layout-grid` |
| 7 | `beekeeping` | Side project | `sprout` |
| 8 | `contact` | Contact | `send` |

---

## Refactor First

Before building anything new, extract the pieces Phase 1 already solved. Do **not** duplicate their logic.

| Extract to | From | Notes |
| --- | --- | --- |
| `src/components/navigation/ThemeToggle.tsx` | Phase 1 | Already standalone — add a `size` prop (`"md"` \| `"lg"`) |
| `src/components/navigation/ScrollToTopButton.tsx` | Phase 1 | Already standalone — same `size` prop |
| `src/lib/use-smooth-scroll.ts` | Phase 1 click handler | Shared hook wrapping the `ScrollToPlugin` tween, `autoKill: true`, reduced-motion branch |

Both nav layers then call one scroll implementation. A second copy will drift.

---

## Component Requirements

- Files:
  - `src/components/navigation/MobileNav.tsx` (client, orchestrates all three parts)
  - `src/components/navigation/MobileTopBar.tsx`
  - `src/components/navigation/MobileMenuPanel.tsx`
  - `src/components/navigation/MobileControlStack.tsx`
- Mounted in `SplitLayout` alongside `NavigationPill`, outside the grid columns
- Renders `null` at `md` and above

### Top Bar

Ref: `mobile-hero.png`

- `fixed top-0 inset-x-0 z-40 md:hidden flex items-center justify-between px-4 h-16`
- Background: transparent at scroll position 0; once scrolled past `32px`, fades to `bg-base/80 backdrop-blur-md border-b border-border`. Transition `200ms`.
- **Left:** monogram — `RS`, `font-mono text-sm font-medium text-fg/80`, links to `#hero`
- **Right:** hamburger trigger

> The hero's `SidebarCard` renders its own monogram at `top-4 left-4`. Hide it below `md` (`max-md:hidden`) — otherwise two monograms stack within 60px of each other. See `@context/hero-spec.md`.

### Hamburger Trigger

- `size-11 rounded-full bg-surface/90 backdrop-blur-sm border border-border grid place-items-center`
- Icon: two `18px` horizontal bars, `1.5px` stroke, `6px` apart, `text-fg-muted`
- On open, morphs to an X: top bar rotates `45°` and translates down `3px`, bottom bar rotates `-45°` and translates up `3px`. Animate with GSAP, `duration: 0.25`, `ease: "power2.inOut"`. Do not swap SVGs.
- `aria-label="Open menu"` / `"Close menu"`, `aria-expanded`, `aria-controls="mobile-menu"`

### Control Stack (bottom-right)

Ref: `mobile-pill.png`

- `fixed right-4 bottom-4 z-40 md:hidden flex flex-col items-center gap-2`
- **Theme toggle** on top, **scroll-to-top** below — same vertical order as the desktop pill so muscle memory carries across breakpoints
- Both `size-11 rounded-full bg-surface/90 backdrop-blur-sm border border-border`
- Theme toggle icon stays `text-accent`; scroll-to-top is `text-fg-muted`
- Scroll-to-top hidden while `activeSection === "hero"`, same as desktop: `opacity-0 pointer-events-none` and unfocusable
- Hidden entirely while the menu is open — the menu has its own close affordance and the stack would sit under the backdrop

### Menu Panel

Ref: `hamburger-modal.png`

**Backdrop:**

- `fixed inset-0 z-50 bg-base/70 backdrop-blur-md`
- Click anywhere on the backdrop closes the menu

**Panel:**

- `absolute top-16 right-4 w-[min(15rem,calc(100vw-2rem))] rounded-2xl border border-border bg-surface/95 backdrop-blur-xl p-2 origin-top-right`
- Anchored to the top-right, below the trigger — **not** full-screen. The reference is a compact dropdown, and a full-screen takeover would be a heavier interaction than this page needs.
- Contains a `<ul>` of nav items

**Each item:**

- `flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors`
- Icon `size-[18px]`, label `text-sm font-medium`
- Default: `text-fg-muted`
- Hover / press: `text-fg bg-surface-raised`
- **Active:** `text-accent bg-accent/8`, plus a `2px` accent bar at the left edge — colour alone is not sufficient
- `aria-current="true"` on the active item
- Real `<a href="#{id}">` elements

**On item click:** close the panel first, then run the smooth scroll after the close animation resolves (`~200ms`). Scrolling behind a still-open overlay looks broken.

---

## Open / Close Behaviour

| Trigger | Result |
| --- | --- |
| Hamburger click | Toggles |
| Backdrop click | Closes |
| `Escape` key | Closes, returns focus to the trigger |
| Nav item click | Closes, then scrolls |
| Viewport crosses to `md+` | Closes immediately and unlocks scroll |

That last row matters: rotating a phone to landscape can cross the breakpoint. If the panel stays mounted while the desktop pill appears, the page ends up with a locked body and no visible close control.

### Body Scroll Lock

While open:

- `document.body.style.overflow = "hidden"`
- Compensate for scrollbar width where present to prevent layout shift
- Preserve and restore `scrollY` on close — iOS Safari is the failure case; verify there specifically

### Focus Management

- On open, move focus to the first nav item
- Trap focus within the panel: `Tab` from the last item wraps to the close button, `Shift+Tab` from the close button wraps to the last item
- On close, return focus to the hamburger trigger
- Hand-roll the trap — the project carries no component library, and this is one `keydown` handler over a queried list of focusable children
- `role="dialog"`, `aria-modal="true"`, `aria-label="Site navigation"`, `id="mobile-menu"`

---

## GSAP Animations

```ts
gsap.registerPlugin(useGSAP, ScrollToPlugin);
```

All animation inside `useGSAP(() => { … }, { scope: containerRef, dependencies: [isOpen] })`.

### Open

| Target | From → To | Duration | Position |
| --- | --- | --- | --- |
| Backdrop | `opacity: 0 → 1` | `0.25` | `0` |
| Panel | `opacity: 0 → 1`, `scale: 0.94 → 1`, `y: -8 → 0` | `0.3` | `0.05` |
| Items | `opacity: 0 → 1`, `x: 8 → 0`, `stagger: 0.035` | `0.25` | `0.12` |

Panel eases with `back.out(1.4)` for a slight settle; everything else `power3.out`. Transform origin is the top-right corner so the panel reads as growing out of the trigger.

### Close

Reverse at `0.6×` duration, no stagger — closing should feel immediate. `ease: "power2.in"`.

### Hamburger morph

Runs in parallel with open/close, `duration: 0.25`, `ease: "power2.inOut"`.

### Top bar background

Not a scroll-scrubbed tween — a class toggle driven by a `scrollY > 32` check with a `200ms` CSS transition. Cheaper than a `ScrollTrigger` for a binary state.

### Reduced motion

`gsap.matchMedia()`. Under `reduce`: panel and backdrop cut in and out at final opacity, no scale or stagger, hamburger swaps state without rotating, scroll is instant.

---

## Accessibility

- Panel is `<nav>` inside the dialog wrapper
- Every control has a visible focus ring: `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`
- Minimum hit target `44×44` — `size-11` meets it; menu rows exceed it via padding
- Icons `aria-hidden="true"`; accessible names come from the visible labels
- Active state carries colour, the indicator bar, and `aria-current`
- The whole nav works without JS: anchors resolve natively, and the panel is open-by-default in a `<details>`-less no-JS state only if that is trivial — otherwise accept graceful degradation to the in-page anchors, since this is a portfolio and not a public service

---

## Responsive

| Breakpoint | Behaviour |
| --- | --- |
| `md` (768px+) | Renders `null`. `NavigationPill` takes over. |
| `< md` | Top bar, control stack, and menu panel active |
| `< 380px` | Panel width falls back to `calc(100vw-2rem)`; labels never truncate — if one would, shorten the label in `NAV_ITEMS` rather than clipping |
| Landscape, `height < 480px` | Panel gets `max-h-[calc(100svh-6rem)] overflow-y-auto`, scrollbar hidden |

Use `svh` units throughout, not `vh` — mobile browser chrome makes `vh` unreliable.

---

## Out of Scope

- The light theme palette (Phase 1 flagged this; still open)
- Section registration — each section spec registers its own id
- Any gesture handling: no swipe-to-open, no edge gestures. They conflict with browser back-navigation gestures on both platforms.

---

## References

- `@context/screenshots/mobile-pill.png` — resting state
- `@context/screenshots/mobile-hero.png` — controls in context
- `@context/screenshots/hamburger-modal.png` — open menu panel
- `@context/navigation-pill-spec.md` — Phase 1, shared `NAV_ITEMS`, icons, scroll behaviour
- `@context/hero-spec.md` — `SplitLayout`, `SectionObserverProvider`, mobile card behaviour, monogram conflict
- `@context/portfolio-project-spec.md` — Design System, Motion Budget
- `@src/lib/navigation.ts` — consume, do not modify
- `@src/lib/use-smooth-scroll.ts` — extract from Phase 1
- `@src/components/navigation/MobileNav.tsx` — create
- `@src/components/navigation/MobileTopBar.tsx` — create
- `@src/components/navigation/MobileMenuPanel.tsx` — create
- `@src/components/navigation/MobileControlStack.tsx` — create
