# Portfolio — Project Specification

**Author:** Radosław Siek
**Product:** Personal portfolio for a frontend engineer / programming coach
**Status:** Replaces the existing cyberpunk portfolio entirely

---

## Problem (Core Idea)

My current portfolio is heavily cyberpunk and reads as junior. It has no CMS, so adding a project means editing code and committing resized images. I now have five production systems behind me (four shipped solo), two years of teaching programming, and a September start at Booksy as an AI Native Software Engineer — the site no longer represents what I do.

This project delivers a dark, technical, restrained portfolio that keeps the spirit of the old one but lands as professional and confident. Projects live in Sanity so adding one is a ten-minute job in Studio rather than a code change.

The structural idea: a **two-column scroll layout** where a persistent card on the left (1/3 width) stays with the reader through the entire page, and the content column on the right (2/3) scrolls past it. The card is not decorative — it is a **contextual readout** whose lower half changes to reflect whichever section is currently in view.

**The thesis the whole page argues:** _I build interfaces, I teach people to build them, and I'm moving into AI-native engineering._

Everything on the page serves that one sentence. Anything that doesn't gets cut.

---

## Users

- **Hiring managers and recruiters** — skimming for 30 seconds. Need scale and credibility immediately: how many systems, how much ownership, where I work now.
- **Senior engineers on interview panels** — looking for evidence of judgement, not a technology list. They read one case study properly and ignore the rest.
- **Fellow developers** — arriving from a repo, a talk, or a link. Want to see the work and the craft of the site itself.
- **Future me** — the person who has to add a project while ramping up at a new job. If it takes more than fifteen minutes, it won't happen.

---

## Tech Stack

| Layer           | Technology                                              |
| --------------- | ------------------------------------------------------- |
| Framework       | Next.js 15+ (App Router) + TypeScript                   |
| Styling         | Tailwind CSS v4                                         |
| CMS             | Sanity v3 (embedded Studio at `/studio`)                |
| Content queries | GROQ via `next-sanity`                                  |
| Images          | `next/image` + Sanity image CDN (`@sanity/image-url`)   |
| Motion          | gsap, useGSAP                                           |
| Fonts           | `next/font/google` — Inter Tight, Inter, JetBrains Mono |
| Deployment      | Vercel                                                  |
| Analytics       | Vercel Analytics (optional)                             |

**Deliberately not used:** no component library, no state manager, no animation library beyond gsap, no form library (there is no form). This site is small; every dependency should justify itself.

---

## Design System

Dark, technical, restrained. Cyberpunk expressed through **texture and typography**, not neon glow. The failure mode to avoid is neon-on-black plus glitch text plus scanlines — that reads as someone who just discovered CSS filters. The mature version is restraint plus one strong moment.

### Color Palette

| Name           | Hex       | Tailwind token   | Usage                                                   |
| -------------- | --------- | ---------------- | ------------------------------------------------------- |
| Base           | `#0A0B0E` | `base`           | Page background — near-black, never pure black          |
| Surface        | `#121419` | `surface`        | Cards, panels                                           |
| Surface Raised | `#191C23` | `surface-raised` | Hover states, nested panels                             |
| Border         | `#252932` | `border`         | Hairline borders, dividers, grid lines                  |
| Text Primary   | `#E8E6E3` | `fg`             | Headings and body — slightly warm off-white, not `#FFF` |
| Text Muted     | `#8A8F9A` | `fg-muted`       | Labels, metadata, captions                              |
| Accent         | `#00E5C7` | `accent`         | The single accent — CTAs, active states, timeline nodes |

**One accent only.** No secondary magenta, no gradient pairs. The accent should feel rationed: if it appears more than ~8 times on screen at once, it is overused.

Defined as CSS custom properties in `globals.css` and exposed through Tailwind v4's `@theme` block.

### Typography

| Role               | Font               | Notes                                                |
| ------------------ | ------------------ | ---------------------------------------------------- |
| Display / Headings | **Inter Tight**    | 600–700, `-0.02em` tracking, large clamp sizes       |
| Body               | **Inter**          | 400–500, `1.6` line-height                           |
| Mono / Utility     | **JetBrains Mono** | 400–500, uppercase with `0.08em` tracking for labels |

The mono-versus-sans contrast does most of the "developer aesthetic" work. Mono is used for **every** piece of metadata: section eyebrows, dates, stack tags, stat captions, card readouts, filter labels. Never for body copy.

### UI Style

- Hairline `1px` borders in Border color — the primary structural device
- Faint grid or dot texture on the page background at `0.02–0.04` opacity
- Subtle grain overlay welcome; heavy glow is not
- Radius: `4px` small elements, `8px` cards, pill only on the status badge
- Generous vertical rhythm — `120px+` between sections on desktop
- No glassmorphism, no colored drop shadows, no gradient text
- Dark mode only — there is no toggle

---

## CMS: Sanity

### Scope decision — deliberately narrow

Only content that **changes** lives in Sanity. Everything stable lives in code.

**In Sanity:** `project`, `technology`, `testimonial`
**In code:** timeline, teaching copy, about text, section headings, skill group definitions, stat numbers, all static copy

This is roughly 20% of the schema work for 90% of the value. Modeling the About paragraph as Portable Text costs real time in schema and query plumbing to save a one-line constant edit. Not worth it.

### Schemas

```
project
  - title (string)
  - slug (slug)
  - featured (boolean)          → renders in the 3 featured slots
  - order (number)              → controls ordering within featured and archive
  - thesis (string)             → the mono eyebrow: "architecture" | "data application" | "ai & real-time"
  - company (string)
  - role (string)               → honest scope, e.g. "Sole frontend owner" / "Four key features"
  - year (string)
  - stack (array of refs → technology)
  - visibility (string)         → "public" | "no-public-url" | "anonymised"
  - liveUrl (url, optional)     → omitted when visibility ≠ "public"
  - coverImage (image, hotspot)
  - gallery (array of image)
  - problem (text)              → separate fields, not one blob — see note
  - approach (text)
  - outcome (text)
  - designCredit (string, opt)  → e.g. "Design: client-supplied"

technology
  - name (string)
  - category (string)           → "core" | "styling" | "backend" | "tooling" | "ai" | "teaching"
  - icon (image, optional)

testimonial
  - author (string)
  - context (string)            → "Student, age 14" / "Engineering lead, Hued.me"
  - quote (text)
  - source (string)             → "teaching" | "engineering" — controls which section it renders in
```

**Why `problem` / `approach` / `outcome` are three fields, not one rich-text blob:** a single blob lets you write a paragraph that sounds fine and says nothing. Three labelled fields force the problem to be stated before the solution — which is the difference between a case study and a screenshot dump.

**Why `visibility` is a field:** BRAIN has no public URL by design (internal platform behind SSO). Modelled as a field, the template renders `Internal platform — no public URL` automatically instead of the code carrying a special case.

**Why `role` is free text and required:** every project card states scope explicitly. Some projects are solo; one is four features inside a larger platform. Accurate smaller claims beat inflated ones, and an interviewer will find out.

### Studio

Embedded at `/studio` via `next-sanity/studio`. Structure: Featured Projects (filtered `featured == true`, ordered), All Projects, Technologies, Testimonials.

---

## Layout Architecture

```
┌──────────────────┬─────────────────────────────────────┐
│                  │  A. HERO                            │
│   STICKY CARD    │     headline · stats · ticker       │
│   (33%)          ├─────────────────────────────────────┤
│                  │  B. FEATURED WORK (3 stacked)       │
│  ┌────────────┐  ├─────────────────────────────────────┤
│  │  portrait  │  │  C. CAREER TIMELINE (two tracks)    │
│  └────────────┘  ├─────────────────────────────────────┤
│  name / role     │  D. TEACHING (visual break)         │
│  status badge    ├─────────────────────────────────────┤
│                  │  E. SKILLS (filter grid)            │
│  ─── readout ─── ├─────────────────────────────────────┤
│  [ contextual ]  │  F. MORE WORK (bento, filterable)   │
│                  ├─────────────────────────────────────┤
│  socials  [CTA]  │  G. BEEKEEPING                      │
│                  ├─────────────────────────────────────┤
│                  │  H. ABOUT + CONTACT                 │
└──────────────────┴─────────────────────────────────────┘
```

CSS Grid, `grid-template-columns: 1fr 2fr` at `lg+`. The card column contains a `position: sticky` element that never leaves the viewport on desktop.

---

## The Sticky Card — the signature element

The piece the whole layout hangs on. Most implementations of this pattern make the card static, and it becomes wasted real estate after the first screen. This one **reacts to the section in view**, which is cyberpunk as a functional HUD readout rather than as decoration.

### Persistent region (never changes)

- Portrait, hairline border, `8px` radius
- `Radosław Siek`
- Mono role line: `Frontend Engineer · Programming Coach`
- Status badge: `→ Booksy · AI Native SWE · Sept 2026` — accent dot, future tense
- Socials: GitHub, LinkedIn, email (inline SVG)
- One primary CTA: `Let's talk`

**No "Available for work" badge.** I'm not available, and a stale availability badge is the fastest way to look unserious.

### Contextual readout (swaps on scroll)

Fixed-height block above the socials. Content crossfades — `~200ms` opacity plus `4px` translate — when the active section changes. Height is fixed so the card never reflows or jumps.

| Active section | Readout                                                |
| -------------- | ------------------------------------------------------ |
| Hero           | `5 production systems` / `4 shipped solo`              |
| Featured work  | Active project's stack tags + role line                |
| Timeline       | Focused role as a mono block: company, dates, one line |
| Teaching       | `200+ students` / `2 years` / `Python · Scratch · JS`  |
| Skills         | Hovered technology + its project count                 |
| More work      | `9 projects` / `5 production`                          |
| Beekeeping     | `Python · FastAPI · PDF` / `6 hives`                   |
| Contact        | Email + `usually replies within a day`                 |

### Implementation

- A `SectionObserverProvider` (React Context) holds `{ activeSection, activePayload }`
- Each `<section>` registers via a `useSectionObserver(id, payload)` hook wrapping a single shared `IntersectionObserver` (`rootMargin: "-40% 0px -40% 0px"` so the active section is whatever occupies the middle band)
- Featured project cards and skill tags push richer payloads on enter/hover
- The card subscribes to context and renders the matching readout variant
- Readout variants are plain components in a map keyed by section id — no conditional soup

**This is the highest-risk component in the build.** Build it first, before any styling work, and verify the swap behaviour feels useful rather than gimmicky. If it feels gimmicky, the layout premise is wrong and better to know early.

---

## Sections

### A. Hero

- Headline, max 3 lines, Inter Tight at a large clamp. One phrase highlighted in accent.
  Draft: _I build interfaces, teach people to build them, and I'm heading into AI-native engineering._
- One-sentence subhead in muted
- **Stat row** — count up on first view, mono labels:
  `5` production systems · `4` shipped solo · `7` languages shipped · `2` years teaching
  **No "years of experience" stat.** It is the one number that works against me, and every other number makes it irrelevant.
- **Company ticker** in mono: `Giganci Programowania · Jointhubs · Hued.me · Booksy` — the current employer is marked by the accent colour alone, no arrow
  Not client logos — those are the clients' IP, not mine.
- Subtle scroll cue

**Signature moment lives here.** Candidate: an animated hairline grid / circuit-trace SVG behind the headline that draws itself over `~1.2s` on load, then sits still. Alternative worth prototyping: a small "ask my portfolio" widget backed by an LLM — ties the aesthetic to something real and demonstrates the AI-native positioning instead of claiming it. Pick one. Everything else on the page stays calm by comparison.

### B. Featured work

Three full-width stacked cards, ~`70vh` each, alternating image side. **Not a bento** — three items in a bento is just three boxes with extra CSS.

Each card: mono thesis eyebrow · title · one-line problem · screenshot in a bordered frame with slight parallax · four stack tags · `→ case study`.

Sourced from Sanity: `*[_type == "project" && featured == true] | order(order asc)[0...3]`.

The three, with their theses:

1. **MB Group** — `architecture`. Four brands, six domains, one build; brand resolved at runtime from the Host header. 63 test suites.
2. **Debt Exchange** — `data application`. A financial marketplace inside a CMS page. Server-side pagination and sorting across nine columns, table state in the URL, responsive table-to-cards.
3. **BRAIN** — `ai & real-time`. Natural-language querying over a business database with streamed responses and a visible SQL preview.

Each has a distinct thesis on purpose: three cards sharing a Next.js + CMS + Azure stack will blur into one unless each argues something different.

### C. Career timeline

**Two parallel tracks that converge.** A strictly chronological list reads as job-hopping across four employers in a year. Two tracks read as depth in two disciplines — which is what actually happened, since teaching ran alongside everything.

- Left rail: **teaching** — Giganci Programowania, 2+ years
- Right rail: **engineering** — Jointhubs → Hued.me → Booksy
- Rails converge at the Booksy node

Each node: role, company, dates, one line of what I owned, three stack tags. All metadata mono. No paragraphs — depth lives in the case studies.

Booksy node styled as **upcoming**: outlined not filled, dashed connector, `starting Sept 2026`. Owning the future date reads as confident; hiding it doesn't.

Motion: inline SVG path animated via `stroke-dashoffset` tied to scroll progress, so the line draws itself as the reader descends. Active node lights in accent and drives the card readout.

Data lives in a typed constant in `content/timeline.ts` — it changes once a year.

### D. Teaching

**Deliberate visual break.** Lighter surface, or a distinctly different grid and rhythm. This section should not look like the rest — it signals a second discipline rather than more of the same. It is the differentiator, so it gets real space rather than a bullet in About.

- Count-ups: students taught, years, languages taught
- What I teach, as a mono list — kept visually separate from the build stack
- One or two testimonials (`source == "teaching"`)
- Classroom photo
- One line set larger: _Teaching a twelve-year-old to debug and reviewing a colleague's PR are the same skill at different resolutions._

### E. Skills

Dense mono tag grid. **No progress bars, no percentages, no star ratings** — nobody believes "React 87%".

The section is a **filter**, not a display. Each `technology` knows which projects reference it, so the claim and the evidence are the same interaction. It also scales: adding projects in Sanity makes this section more substantial with no editing.

Groups, mono comment headers:

- `// core` — TypeScript, React 19, Next.js, App Router, Server Components
- `// styling & ui` — Tailwind, Panda CSS, Ark UI, accessibility
- `// backend & data` — Node, REST, JSON-LD, Zod, Python
- `// tooling & infra` — Azure, Bicep, CI/CD, pnpm, Vitest
- `// ai & llm` — small now; the slot exists so growth is visible
- `// i teach` — visually distinct row: Python, Scratch, JavaScript, HTML/CSS

**Interaction:** hover → project count in the sticky card. Click → filters the bento below. Filter state in `useState`; no URL sync needed for a single-page filter.

### F. More work (bento)

**Where a bento actually earns its keep** — 6+ heterogeneous items at varying sizes (`2x1`, `1x1`, `2x2`).

ITP, GT Air & Ocean, side projects. Each tile: title, one line, two stack tags. Non-matching tiles dim when a skill filter is active.

Sourced from `*[_type == "project" && featured != true] | order(order asc)`.

### G. Beekeeping

Its own section, contrasting on purpose. This is a self-initiated product built for a real domain with a real user — which is rarer and harder to fake than another client build.

- **Triptych**: three images, identical treatment — same aspect ratio, same crop distance, unified grading toward the palette. Mono captions `building` / `teaching` / `beekeeping`. Plain rectangles, hairline borders. **No hexagon frames.**
- The hive-management app as a real project card: Python microservice, PDF generation from inspection records
- Framing line: _the only project on this page where I was also the user_
- **One bee reference maximum.** No honeycomb backgrounds, no hive-mind copy, no hexagon anything. Charming once, twee twice — and twee is what stands between cyberpunk and professional.

### H. About + contact

Short. First person, four or five sentences, no adjectives, no "passionate about clean code."

Contact framed as `open to interesting conversations`, not a job funnel. Email, GitHub, LinkedIn. No contact form — a mailto link is honest and has no spam surface.

---

## Case study pages (`/work/[slug]`)

Generated from Sanity for every project.

- Hero: title, thesis eyebrow, role, year, live link (or the `visibility` fallback)
- **Bento grid** of the case study itself — this is where bento belongs, because the content is genuinely heterogeneous: hero shot, a metric tile, a code snippet, an architecture note, a "what was hard" tile, gallery images
- `problem` / `approach` / `outcome` as three clearly separated blocks
- Full stack list
- `designCredit` line where applicable
- Prev/next project navigation

`generateStaticParams` over all slugs. `generateMetadata` per project with OG image from `coverImage`.

---

## Motion Budget

Lots of **coordinated** animation, few **distinct** effects. Four effects reused everywhere — that is what makes a site feel designed rather than assembled.

1. Fade-and-rise on section entry — `16px`, `400ms`, ease-out, **once**, never re-triggered
2. Stagger — `40ms` between children, any list or tag group
3. Count-up — only the two stat rows
4. Scroll-linked path draw — timeline only

Plus the one hero signature moment on load. Page transitions via the View Transitions API for `/` → `/work/[slug]`.

**Non-negotiable:**

- `prefers-reduced-motion: reduce` disables all of it
- Nothing animates on hover except color and border
- No scroll-jacking, no smooth-scroll hijacking, no custom cursor
- Reveal animations never delay content becoming readable
- gsap is browser-only: it is imported inside `'use client'` components and driven by `useGSAP` — animation should not cost the first paint

---

## Components

| Component                 | Notes                                               |
| ------------------------- | --------------------------------------------------- |
| `SidebarCard`             | Sticky card shell; persistent region + readout slot |
| `CardReadout`             | Variant map keyed by section id                     |
| `SectionObserverProvider` | Context + shared IntersectionObserver               |
| `StatRow`                 | Count-up numbers with mono labels                   |
| `FeaturedProjectCard`     | Full-width, alternating image side, parallax frame  |
| `TimelineTrack`           | Two-rail converging timeline, SVG path draw         |
| `TimelineNode`            | Past / current / upcoming variants                  |
| `SkillTag`                | Mono tag; hover and active states                   |
| `SkillGrid`               | Grouped tags, owns filter state                     |
| `BentoGrid` / `BentoTile` | Variable-size tiles, dim on filter miss             |
| `Triptych`                | Three-image row, unified treatment                  |
| `SectionHeading`          | Mono eyebrow + display heading                      |
| `StackTags`               | Shared tag row from `technology` refs               |

---

## Responsive

- **`lg` (1024px+)** — the 1/3 – 2/3 sticky split
- **`md`** — card becomes a full-width header block, scrolls away normally
- **`< md`** — card is the full-screen hero, then scrolls away. **Not sticky** — it would eat a third of a 380px viewport. After it leaves, a slim sticky bottom bar appears: name, current section label, `Let's talk`. Preserves the "info always available" intent at mobile cost.
- Timeline collapses to a single rail with a track label on each node
- Bento collapses to one column
- Featured cards stop alternating; image always above text

---

## Performance & SEO

- Static generation throughout; ISR on Sanity content (`revalidate: 3600`) — this content changes monthly at most
- `next/image` for every image, Sanity CDN transforms, explicit `sizes`
- `next/font/google` with `display: swap`, subset to `latin` + `latin-ext` (Polish diacritics in names)
- Metadata API per page; OG images from Sanity covers
- JSON-LD `Person` and `CreativeWork` via `schema-dts`
- Semantic landmarks, visible keyboard focus, real heading hierarchy
- `lang="en"`
- Lighthouse target: 95+ across the board. A portfolio that argues for frontend craft and scores 60 on performance argues against itself.

---

## Content Rules — confidentiality

Every screenshot on this site comes from client work. These rules are not optional.

**UI is publishable, data never is.** For any screenshot showing records, run the app locally against seeded fake data and capture that.

Specifically:

- **Debt exchange** — real company names, NIP numbers, invoice amounts and enforcement stages. Mock data only. Never blur.
- **BRAIN chat** — real order numbers and third-party client order references. Mock data only. Never screenshot an expanded SQL preview.
- **ITP job modal** — real vacancy with a real hourly rate. Replace with a fictional posting.
- **Any editor / admin screenshot** — never with real submissions, CVs, subscriber lists, or asset filenames.
- **Never publish `*.azurewebsites.net` URLs** — not as links, not in copy, not visible in a screenshot address bar. Use verified custom domains only.
- Prose describes the _shape_ of data (column names, field types), never values.

Confirmed public links: `grupatransportowa.pl`, `gtairandocean.com`. Others pending verification. BRAIN has none by design.

---

## Environment Variables

```
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=
NEXT_PUBLIC_SANITY_API_VERSION=
SANITY_API_READ_TOKEN=
NEXT_PUBLIC_SITE_URL=
```

---

## Development Phases

### Phase 1 — Foundation

Next.js + TypeScript + Tailwind v4 setup · design tokens in `@theme` · fonts · Sanity project, schemas, embedded Studio · seed 2–3 projects

### Phase 2 — The sticky card

`SectionObserverProvider`, `SidebarCard`, `CardReadout`, the two-column grid, and enough dummy sections to test the swap. **Built and validated before any other section.** If the readout feels gimmicky, the layout premise is wrong.

### Phase 3 — Core sections

Hero + stats · featured work from Sanity · timeline · teaching · skills grid · bento · beekeeping · about/contact

### Phase 4 — Case studies

`/work/[slug]`, case-study bento, static params, per-project metadata, prev/next

### Phase 5 — Motion

The four effects, hero signature moment, View Transitions, reduced-motion pass

### Phase 6 — Content & polish

Real screenshots with mocked data · verified live links · testimonials · Lighthouse · keyboard and screen-reader pass · deploy

---

## Notes

- All visible copy in **English**. Code, schema keys and component names in English.
- Copy register: plain, confident, no adjectives, no filler. The raw facts are stronger than any framing — five production systems, four solo, two years teaching. Write it flat.
- **No dark/light toggle.** Dark only.
- **No CV download as primary CTA**, no "looking for opportunities" — I'm not.
- Featured ordering is `order` in Sanity so it can change per audience without a deploy. Default: MB Group → Debt Exchange → BRAIN. For AI-native roles: BRAIN first.
- The Grupa Transportowa work is presented at **feature level** (`Debt Exchange`), not site level, because my scope there was four features rather than the whole platform. Accurate and stronger.
- Teaching is the section most likely to get cut when the build drags. Don't — it's the only section here that no other frontend portfolio has.
- Prototype reference: `portfolio-v0-prompt.md` and the resulting v0 screenshots, used as visual reference per section.
