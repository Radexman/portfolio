# Current Feature: Foundation — Cleanup, Dependencies, Theme & Env

## Status

In Progress

## Goals

**1. Strip create-next-app boilerplate**

- `app/page.tsx` — replace the template landing page with a minimal placeholder
- `app/layout.tsx` — drop Geist fonts, replace placeholder metadata ("Create Next App"), keep `lang="en"`
- `public/` — remove unused template SVGs (`next.svg`, `vercel.svg`, and the other template assets)
- `app/globals.css` — remove the white/black `:root` defaults and the `prefers-color-scheme` block

**2. Install the dependencies the spec calls for**

- `gsap` + `@gsap/react` (the `useGSAP` hook) — the only animation library
- Deferred on purpose: `@vercel/analytics` (does nothing until deployed) and `schema-dts` (nothing emits JSON-LD yet)
- Confirm already present and sufficient: `next-sanity`, `sanity`, `@sanity/vision`, `@sanity/image-url`, `styled-components` (Sanity peer dep)
- No component library, no state manager, no form library — every dependency justifies itself

**3. Fonts via `next/font/google`**

- Inter Tight (display/headings), Inter (body), JetBrains Mono (metadata/labels)
- `display: 'swap'`, subsets `latin` + `latin-ext` (Polish diacritics in "Radosław Siek")
- Exposed as CSS variables on `<html>`, consumed by the `@theme` block

**4. Design tokens in `app/globals.css`**

- Tailwind v4 `@theme` block — no `tailwind.config.*` file
- Palette: `base #0A0B0E` · `surface #121419` · `surface-raised #191C23` · `border #252932` · `fg #E8E6E3` · `fg-muted #8A8F9A` · `accent #00E5C7`
- Font tokens mapped to the three `next/font` variables
- Radius scale: `4px` small elements, `8px` cards
- Base body styles: `base` background, `fg` text, Inter, `1.6` line-height
- **Dark only** — no `dark:` variants, no `prefers-color-scheme`, no toggle

**5. Environment files**

- `.env.example` — committed, every key from the spec, each with a comment saying exactly where to get the value
- `.env.local` — filled in with the values that exist; already has `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET`
- Keys: `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION`, `SANITY_API_READ_TOKEN`, `NEXT_PUBLIC_SITE_URL`
- Verify `.env.local` stays git-ignored and `.env.example` does not

**Done when:** `npm run build` and `npm run lint` pass, the page renders on the `base` background in Inter with no template content left, `/studio` still loads, and `.env.example` documents all five keys.

## Notes

### Settled

- **Spec file:** @context/features/cleanup-spec.md — full detail lives there.
- **Analytics:** deferred to the deploy phase, not installed here.
- **Animation:** gsap + `@gsap/react` only. The stale `LazyMotion` line in @context/project-overview.md has been corrected; no reference to the Motion library remains in the docs.
- **gsap licensing:** verified — the public `gsap` package is free for commercial use and now includes the formerly Club-only plugins. No paid tier needed.

### Constraints carried from the spec

- Tailwind v4 only — creating `tailwind.config.ts` is a spec violation
- `@theme` lives in `app/globals.css` (root `app/`, not `src/app/`)
- One accent colour only; no secondary, no gradients
- Text is `#E8E6E3`, never `#FFF`; background is `#0A0B0E`, never pure black

### Out of scope for this feature

Sanity schemas (`project` / `technology` / `testimonial`), Studio structure, seeding content, the grid texture / grain overlay, and any component work. Those are the rest of Phase 1 and Phase 2.

### Follow-ups noticed earlier, not part of these goals

- `sanity/lib/client.ts` has `useCdn: true`; the spec plans ISR (`revalidate: 3600`), which wants `false`
- `app/layout.tsx` does not render `<SanityLive />`, so `sanityFetch` won't live-update

Both are small and touch files this feature already opens — say the word and I'll fold them in.

## History
