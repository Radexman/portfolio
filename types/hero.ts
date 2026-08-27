import type { SanityImageSource } from '@sanity/image-url'

/**
 * Hand-written result types for `heroSectionQuery`.
 *
 * TypeGen is not configured (see context/coding-standards.md). If the schema
 * grows enough to justify it, generate these instead of maintaining them.
 * Optional fields mirror the schema: anything without `validation.required()`
 * can come back missing and must be guarded at the render site.
 */

export type SocialPlatform = 'github' | 'linkedin' | 'x' | 'email'

export type StatusTone = 'upcoming' | 'available' | 'none'

export interface CtaLink {
  label: string
  href: string
}

export interface SocialLink {
  platform: SocialPlatform
  url: string
}

export interface Stat {
  value: string
  label: string
}

export interface TickerItem {
  name: string
  isCurrent?: boolean
}

export interface StatusBadge {
  label: string
  tone: StatusTone
}

export interface CurrentFocus {
  label: string
  statement: string
  tags?: string[]
}

export interface HeroPortrait {
  alt: string
  asset?: { _ref: string; _type: string }
  /** Focal point chosen in Studio, 0–1 on both axes. */
  hotspot?: { x: number; y: number }
}

export interface HeroSection {
  eyebrow: string
  headlineLead: string
  headlineAccent: string
  subheadline: string
  portrait: (HeroPortrait & SanityImageSource) | null
  monogram: string
  cardGreeting: string
  cardBio: string
  statusBadge?: StatusBadge
  socials?: SocialLink[]
  primaryCta?: CtaLink
  secondaryCta?: CtaLink
  currentFocus?: CurrentFocus
  availabilityNote?: string
  workCta?: CtaLink
  stats: Stat[]
  ticker: TickerItem[]
  scrollCue?: string
}
