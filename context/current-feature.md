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
