import type { SanityImageSource } from '@sanity/image-url'

import type { ProjectCoverImage, ProjectThesis, ProjectVisibility } from '@/types/work'

export interface TriptychImage extends ProjectCoverImage {
  caption: string
}

export interface InspectionStep {
  prompt: string
  response: string
  field: string
}

/**
 * The hive app, as this section reads it. Narrower than `FeaturedProject` —
 * there is no cover image here — and wider by `approach`, because the block
 * states the physical constraint before the feature that answers it.
 */
export interface SideProject {
  _id: string
  title: string
  slug: string
  thesis: ProjectThesis
  company: string
  role: string
  year: string
  visibility: ProjectVisibility
  liveUrl?: string
  problem: string
  approach?: string
  // A dangling reference resolves to null, so guard on read.
  stack: (string | null)[] | null
}

export interface SideProjectData {
  eyebrow: string
  headline: string
  framingLine: string
  triptych: (TriptychImage & SanityImageSource)[] | null
  inspectionSteps: InspectionStep[] | null
  project: SideProject | null
}

export interface SideProjectSectionCopy {
  eyebrow: string
  headline: string
  framingLine: string
}

/**
 * A `type`, not an `interface`: only inferred object types get an implicit
 * index signature, and the payload has to satisfy `SectionPayload`'s
 * `Record<string, unknown>`.
 */
export type SideProjectPayload = {
  role: string
  meta: string
  stack: string[]
}
