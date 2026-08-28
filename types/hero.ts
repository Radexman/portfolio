import type { SanityImageSource } from '@sanity/image-url'

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
