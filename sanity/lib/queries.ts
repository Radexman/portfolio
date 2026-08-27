import { defineQuery } from 'next-sanity'

/**
 * All GROQ for the site lives here, wrapped in `defineQuery` so the strings
 * stay greppable and are ready for TypeGen if it is ever adopted.
 *
 * `portrait` is projected whole rather than flattened to a URL: `urlFor()`
 * needs the asset reference plus the hotspot/crop metadata to honour the
 * focal point chosen in Studio.
 */
export const heroSectionQuery = defineQuery(`
  *[_type == "heroSection"][0]{
    eyebrow,
    headlineLead,
    headlineAccent,
    subheadline,
    portrait,
    monogram,
    cardGreeting,
    cardBio,
    statusBadge{ label, tone },
    socials[]{ platform, url },
    primaryCta{ label, href },
    secondaryCta{ label, href },
    currentFocus{ label, statement, tags },
    availabilityNote,
    workCta{ label, href },
    stats[]{ value, label },
    ticker[]{ name, isCurrent },
    scrollCue
  }
`)
