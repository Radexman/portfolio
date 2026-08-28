# Coding Standards

## Repository layout

A **single** Next.js 16 app at the repo root (App Router, React 19, Tailwind v4), with Sanity Studio v5 **embedded** in the same app at `/studio`. There is no monorepo, no workspaces, and no `src/` directory.

```
app/                      # routes, layouts, globals.css
  studio/[[...tool]]/     # embedded Sanity Studio
components/[feature]/     # React components
content/                  # typed constants (timeline, copy, skill groups)
lib/                      # utilities
types/                    # shared types
sanity/
  env.ts                  # asserts NEXT_PUBLIC_SANITY_* at import time
  schemaTypes/index.ts    # schema registry
  structure.ts            # Studio desk structure
  lib/                    # client.ts, live.ts, image.ts
sanity.config.ts          # Studio config (basePath: '/studio')
sanity.cli.ts             # sanity CLI config
context/                  # project docs (this file)
```

Path alias: `@/*` → repo root (e.g. `@/sanity/lib/client`, `@/components/...`).

## Commands

```bash
npm run dev      # next dev (:3000) — Studio at :3000/studio
npm run build    # next build
npm run lint     # eslint
npx tsc --noEmit # type-check
```

## TypeScript

- Strict mode enabled
- No `any` types - use proper typing or `unknown`
- Define interfaces for all props, API responses, and data models
- Use type inference where obvious, explicit types where helpful

## React

- Functional components only (no class components)
- Use hooks for state and side effects
- Keep components focused - one job per component
- Extract reusable logic into custom hooks

## Next.js

- Server components by default
- Only use `'use client'` when needed (interactivity, hooks, browser APIs) — push it to the leaves, not to whole sections
- Fetch data directly in server components
- Dynamic routes for item/collection pages (`/work/[slug]`), with `generateStaticParams` + `generateMetadata`
- Server Actions / API routes: none are needed for this site (there is no form and no mutation surface). Add one only with a stated reason.
- Next 16 differs from older versions in places — check `node_modules/next/dist/docs/` before writing route-level APIs (see AGENTS.md)

## Sanity

- Only content that **changes** lives in Sanity: `project`, `technology`, `testimonial`. Static copy, timeline, headings and stat numbers live in `content/` as typed constants.
- Schemas go in `sanity/schemaTypes/`, one file per document type, registered in `sanity/schemaTypes/index.ts`
- Use `defineType` / `defineField` / `defineArrayMember`; give each document type an `@sanity/icons` icon
- Read data through `sanityFetch` from `sanity/lib/live.ts`. `<SanityLive />` must be rendered once in `app/layout.tsx` for it to work. Don't scatter ad-hoc `client.fetch` calls for page data.
- GROQ queries live in one place (`sanity/lib/queries.ts`) and are wrapped in `defineQuery`
- Images: `next/image` + `urlFor()` from `sanity/lib/image.ts`, always with explicit `sizes`
- Studio structure (Featured Projects / All Projects / Technologies / Testimonials) lives in `sanity/structure.ts`
- **TypeGen is not configured.** Query result types are hand-written in `types/` for now. If the schema grows enough to justify it, add `sanity schema extract` + `sanity typegen generate` as a `prebuild` step and stop hand-writing them — don't half-adopt it.

## Tailwind CSS v4

**CRITICAL**: We are using Tailwind CSS v4, which uses CSS-based configuration.

- **DO NOT** create `tailwind.config.ts` or `tailwind.config.js` files (those are for v3)
- All theme configuration must be done in CSS using the `@theme` directive in `app/globals.css`
- Use CSS custom properties for colors, spacing, etc.
- No JavaScript-based config allowed

```css
@import 'tailwindcss';

@theme {
  --color-accent: #00e5c7;
}
```

## Styling

- Tailwind CSS for all styling
- **No component library** — no Ark UI, no shadcn, no Radix. Every dependency has to justify itself on a site this small.
- No inline styles
- **Dark only.** There is no light mode and no toggle — don't add `dark:` variants or `prefers-color-scheme` blocks.
- Design tokens (palette, fonts) come from the table in @context/project-overview.md and are defined once in `app/globals.css`

## Naming

- Components: PascalCase (`SidebarCard.tsx`)
- Files: Match component name or kebab-case
- Functions: camelCase
- Constants: SCREAMING_SNAKE_CASE
- Types/Interfaces: PascalCase (no prefix)

## Error Handling

- Sanity fetches can fail or return empty — render a sensible empty state, never a crashed section
- Optional CMS fields (`liveUrl`, `gallery`, `designCredit`) must be guarded at the render site, not assumed present
- No toast layer, no zod, no form validation — there is no form on this site

## Testing

**Not yet installed.** Vitest gets added when the first real utility or data-shaping function lands; until then `/feature test` has nothing to run.

When it is added:

- **Vitest**, node environment
- **Scope**: utilities (`lib/`) and data transforms only — no component tests
- Colocate tests next to source as `*.test.ts` (e.g. `lib/format.ts` → `lib/format.test.ts`)
- Scripts: `npm test` (one-shot), `npm run test:watch`, `npm run test:coverage`

## Code Quality

- No commented-out code unless specified
- No unused imports or variables
- Keep functions under 50 lines when possible

## Environment

`.env.local` (git-ignored):

| Variable                         | Status                    | Used by                             |
| -------------------------------- | ------------------------- | ----------------------------------- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`  | required                  | `sanity/env.ts` (throws if missing) |
| `NEXT_PUBLIC_SANITY_DATASET`     | required                  | `sanity/env.ts` (throws if missing) |
| `NEXT_PUBLIC_SANITY_API_VERSION` | optional                  | defaults to `2026-08-27`            |
| `SANITY_API_READ_TOKEN`          | needed for drafts/preview | not wired up yet                    |
| `NEXT_PUBLIC_SITE_URL`           | needed for metadata/OG    | not wired up yet                    |

`sanity.cli.ts` reads the same `NEXT_PUBLIC_SANITY_*` vars, so the CLI works from the repo root with no separate Studio env file.
