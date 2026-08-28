# Navigation Pill — Spec (Phase 1: Desktop & Tablet)

## Overview

Build the `NavigationPill` component — a fixed, vertically centered navigation rail anchored to the right edge of the viewport. It consists of three stacked elements:

1. A standalone circular **theme toggle** button on top
2. A **pill-shaped rail** containing one icon link per page section, with the icon for the section currently in view highlighted in `accent`
3. A standalone circular **scroll-to-top** button below

The pill is the page's only persistent navigation on desktop and tablet. It reads the active section from the existing `SectionObserverProvider` — it does **not** create a second observer.

Visual reference: `@context/screenshots/navigation-pill.png`

**Phase 1 (this spec):** `md` and above. **Phase 2 (separate spec):** a conventional hamburger navbar for `< md`, where this component does not render.

---

## Configuration

Navigation items are **not** CMS-managed. The section list is structural, not editorial — it changes only when a section is added or removed, which is a code change anyway. Consistent with the narrow-CMS scope decision in the project spec.

### `src/lib/navigation.ts`

```ts
export type NavItem = {
  id: string;        // must match the section's <section id="…">
  label: string;     // accessible name + tooltip text
  icon: IconName;
};

export const NAV_ITEMS: NavItem[] = [ … ];
```

| Order | `id`         | Label         | Icon             | Rationale                                                      |
| ----- | ------------ | ------------- | ---------------- | -------------------------------------------------------------- |
| 1     | `hero`       | Home          | `house`          |                                                                |
| 2     | `work`       | Selected work | `briefcase`      | Reads as commercial work unambiguously                         |
| 3     | `timeline`   | Career        | `git-branch`     | Two converging tracks — matches the section's actual structure |
| 4     | `teaching`   | Teaching      | `graduation-cap` |                                                                |
| 5     | `skills`     | Stack         | `braces`         | Code-flavoured; distinct from the grid icon below              |
| 6     | `more-work`  | More work     | `layout-grid`    | Literally what the bento is                                    |
| 7     | `beekeeping` | Side project  | `sprout`         | See note                                                       |
| 8     | `contact`    | Contact       | `send`           |                                                                |

> **Beekeeping icon:** use `sprout` or `leaf` — **not** a hexagon, honeycomb, or bee. The project spec allows one bee reference on the entire page, and that budget is spent on the triptych photo plus the hive app itself. A honeycomb icon here would be the second reference and tips the section from charming into twee.

### Icons

Inline SVG only. Create `src/components/icons/index.tsx` exporting each icon as a small React component, paths sourced from the Lucide set (MIT). **No `lucide-react` dependency** — eight icons do not justify a runtime package, and the project spec keeps the dependency list minimal.

All icons: `24×24` viewBox, `stroke="currentColor"`, `strokeWidth={1.5}`, `fill="none"`, `strokeLinecap="round"`, `strokeLinejoin="round"`.

---

## Component Requirements

- Files:
  - `src/components/navigation/NavigationPill.tsx` (client)
  - `src/components/navigation/NavPillLink.tsx`
  - `src/components/navigation/ThemeToggle.tsx`
  - `src/components/navigation/ScrollToTopButton.tsx`
  - `src/components/icons/index.tsx`
- Mounted once in `SplitLayout`, **outside** the grid columns so it is not clipped by the sticky card's stacking context
- Renders `null` below `md`

### Positioning

- Wrapper: `fixed right-5 lg:right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center gap-3`
- **Layout collision:** the right content column must reserve space so text never runs under the pill. Add `md:pr-20 lg:pr-24` to the content column in `SplitLayout`. Verify against the longest headline before shipping.

### Theme Toggle (top button)

- `size-11 rounded-full bg-surface border border-border grid place-items-center`
- Icon `size-[18px]`, `text-accent` — this button's icon is always accent-coloured, it is the one persistent spot of colour in the rail
- Icon swaps on theme: `sun` in dark mode (click to go light), `moon` in light mode
- Hover: `bg-surface-raised border-accent/40`
- `aria-label`: `"Switch to light theme"` / `"Switch to dark theme"` — updates with state
- Implementation: `next-themes` with `attribute="class"`, `defaultTheme="dark"`, `disableTransitionOnChange`. Its injected script prevents the flash of wrong theme on first paint, which a hand-rolled `useEffect` cannot.
- Guard against hydration mismatch: render the button with a neutral icon until `mounted` is true

> **Design system note:** the project spec currently states dark mode only. Adding this toggle means defining a full second palette — surfaces, borders, muted text, and an accent that holds contrast on white (`#00E5C7` on light backgrounds fails WCAG AA for text and will need a darker variant such as `#00A88F`). Worth also checking how the project screenshots read: they are all dark UIs, and they can look pasted-on against a light page. If light mode turns out not to be worth that work, keeping this button as a decorative-but-functional accent anchor is not an option — remove it rather than ship a toggle that does nothing.

### Navigation Pill (rail)

- Container: `flex flex-col items-center gap-1 rounded-full bg-surface border border-border px-1.5 py-3`
- Backdrop: `backdrop-blur-sm bg-surface/90` so content scrolling beneath reads as behind glass without a full glassmorphism treatment

**Each link (`NavPillLink`):**

- `relative size-10 rounded-full grid place-items-center transition-colors duration-200`
- Icon `size-[18px]`
- Default: `text-fg-muted`
- Hover: `text-fg bg-surface-raised`
- **Active:** `text-accent`. Plus a `2px` accent indicator: `absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-full bg-accent` — colour alone must not be the only active signal
- Renders as `<a href="#{id}">` — real anchors, so the nav works without JS and links are copyable
- `aria-current="true"` on the active item

**Tooltip:**

- Appears on hover and on keyboard focus, positioned to the **left** of the rail
- `absolute right-full mr-3 whitespace-nowrap rounded border border-border bg-surface-raised px-2.5 py-1 font-mono text-[11px] tracking-wider uppercase text-fg`
- Pointer-events none, `opacity` transition `150ms`
- Not a substitute for the accessible name — each link also carries an `aria-label` or visually hidden `<span>`

### Scroll-to-Top Button (bottom button)

- Same shape as the theme toggle: `size-11 rounded-full bg-surface border border-border grid place-items-center`
- Icon: `arrow-up`, `size-[18px]`, `text-fg-muted`, `hover:text-accent`
- **Hidden while the hero is in view.** Fades and lifts in once `activeSection !== "hero"`; fades out on return. Use `pointer-events-none` alongside `opacity-0` so it is not focusable while hidden.
- `aria-label="Back to top"`

---

## Active State

Subscribe to the existing context — **do not add another `IntersectionObserver`.**

```ts
const { activeSection } = useSectionObserver()
```

Every section registered in `NAV_ITEMS` must have a matching `<section id="…">` registered through `useSectionObserver`. Sections not yet built simply never become active; the link still scrolls correctly.

**Do not sync active state to the URL hash on scroll.** Rewriting the hash while the user scrolls pollutes browser history and breaks the back button. The hash changes only on click.

---

## Smooth Scrolling

Click handler uses GSAP's `ScrollToPlugin` — consistent with the rest of the project's animation layer and gives control that CSS `scroll-behavior` does not.

```ts
gsap.registerPlugin(useGSAP, ScrollToPlugin)

gsap.to(window, {
  scrollTo: { y: `#${id}`, autoKill: true },
  duration: 0.8,
  ease: 'power2.inOut',
})
```

- `autoKill: true` — if the user scrolls manually mid-animation, the tween aborts. Non-negotiable: hijacking a user who has decided to go somewhere else is exactly the scroll-jacking the motion budget forbids.
- Scroll-to-top uses the same call with `y: 0`
- `preventDefault()` on the anchor click, then update `window.location.hash` **after** the tween completes so the URL reflects the destination without causing a second jump
- Under `prefers-reduced-motion: reduce`: `duration: 0` — instant jump, no tween

---

## GSAP Animations

```ts
gsap.registerPlugin(useGSAP, ScrollToPlugin)
```

All animation inside `useGSAP(() => { … }, { scope: wrapperRef })`.

### Mount

Fires once, after the hero's load sequence has finished so the two don't compete:

| Target     | From                                | Duration | Delay  |
| ---------- | ----------------------------------- | -------- | ------ |
| Wrapper    | `opacity: 0, x: 16`                 | `0.5`    | `1.1s` |
| Rail links | `opacity: 0, x: 8`, `stagger: 0.04` | `0.3`    | `1.2s` |

Ease `power3.out`.

### Active indicator

The `2px` accent bar moves between items rather than cutting. On `activeSection` change, tween the indicator's `y` to the active link's offset: `duration: 0.35`, `ease: "power3.out"`. Render one shared indicator inside the rail, positioned absolutely — not one per link.

### Scroll-to-top visibility

`opacity: 0 → 1`, `y: 8 → 0`, `duration: 0.3`. Reverses on the way out.

### Reduced motion

Wrap in `gsap.matchMedia()`. Under `reduce`: no mount animation, indicator snaps instead of tweening, scroll is instant. Final states render immediately.

---

## Accessibility

- Wrapper is `<nav aria-label="Section navigation">`
- Links are real `<a>` elements in a `<ul>` / `<li>` structure
- Full keyboard operability: tab order follows visual order, tooltips appear on `:focus-visible`
- Visible focus ring on every interactive element: `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`
- Active state signalled by colour **and** the indicator bar **and** `aria-current`
- Minimum hit target `40×40` — met by `size-10` and `size-11`
- Icons are decorative (`aria-hidden="true"`); the accessible name comes from the label

---

## Responsive

| Breakpoint        | Behaviour                                                                         |
| ----------------- | --------------------------------------------------------------------------------- |
| `lg` (1024px+)    | Full pill, `right-6`, tooltips enabled                                            |
| `md` (768–1023px) | Full pill, `right-5`, tooltips enabled, content column padding reduced to `pr-20` |
| `< md`            | **Renders `null`.** Replaced by the hamburger navbar in Phase 2.                  |

At heights below `640px` the pill plus both buttons may exceed the viewport. Cap the rail with `max-h-[70svh] overflow-y-auto` and hide the scrollbar (`scrollbar-width: none`) rather than shrinking the hit targets.

---

## Out of Scope

- **Phase 2: mobile navigation** — hamburger trigger, full-screen or sheet menu, focus trap, body scroll lock. Separate spec. The theme toggle and back-to-top will need equivalents there; do not duplicate this component's logic, extract shared pieces when Phase 2 is written.
- The light theme palette itself — this spec covers the toggle control, not the second set of tokens
- Section registration — each section spec registers its own id via `useSectionObserver`

---

## References

- `@context/screenshots/navigation-pill.png` — visual reference
- `@context/portfolio-project-spec.md` — Design System, Layout Architecture, Motion Budget, section list
- `@context/hero-spec.md` — `SplitLayout`, `SectionObserverProvider`, `useSectionObserver`
- `@src/app/globals.css` — theme tokens
- `@src/lib/navigation.ts` — create
- `@src/lib/section-observer.tsx` — consume, do not modify
- `@src/components/navigation/` — create all four components
- `@src/components/icons/index.tsx` — create
