import type { SanityImageSource } from '@sanity/image-url'

export type ProjectThesis =
  'architecture' | 'data-application' | 'ai-realtime' | 'product-thinking' | 'craft-i18n'

export type ProjectVisibility = 'public' | 'no-public-url' | 'anonymised'

export interface ProjectCoverImage {
  alt?: string
  asset?: { _ref: string; _type: string }
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
  // A dangling reference resolves to null, so guard on read.
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

export interface FeaturedWorkPayload {
  role: string
  company: string
  year: string
  stack: string[]
}
