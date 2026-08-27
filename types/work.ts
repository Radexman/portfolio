import type { SanityImageSource } from '@sanity/image-url'

/**
 * Hand-written result types for `featuredWorkQuery`.
 *
 * TypeGen is not configured (see context/coding-standards.md). If the schema
 * grows enough to justify it, generate these instead of maintaining them.
 * Optional fields mirror the schema: anything without `validation.required()`
 * can come back missing and must be guarded at the render site.
 */

/** Mirrors `PROJECT_THESES` in sanity/schemaTypes/documents/project.ts. */
export type ProjectThesis =
  | 'architecture'
  | 'data-application'
  | 'ai-realtime'
  | 'product-thinking'
  | 'craft-i18n'

/** Mirrors `PROJECT_VISIBILITIES` in the same file. */
export type ProjectVisibility = 'public' | 'no-public-url' | 'anonymised'

export interface ProjectCoverImage {
  alt?: string
  asset?: { _ref: string; _type: string }
  /** Focal point chosen in Studio, 0–1 on both axes. */
  hotspot?: { x: number; y: number }
}

export interface FeaturedProject {
  _id: string
  title: string
  slug: string
  thesis: ProjectThesis
  company: string
  role: string
  year: string
  visibility: ProjectVisibility
  liveUrl?: string
  coverImage: (ProjectCoverImage & SanityImageSource) | null
  problem: string
  designCredit?: string
  /** `stack[]->name`. A dangling reference resolves to null, so guard on read. */
  stack: (string | null)[] | null
}

export interface FeaturedWorkSectionCopy {
  eyebrow: string
  headline: string
  subheadline?: string
}

export interface FeaturedWorkData {
  section: FeaturedWorkSectionCopy | null
  projects: FeaturedProject[] | null
}

/**
 * What a project card pushes to the sidebar card when it takes the middle band.
 * Shaped for display, not for storage — the readout renders it verbatim.
 */
export interface FeaturedWorkPayload {
  role: string
  company: string
  year: string
  stack: string[]
}
