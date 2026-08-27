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

/**
 * The Featured work section: its header copy and the three projects beneath it.
 *
 * One query rather than two so the section makes a single round trip. `stack`
 * is dereferenced to names here — the card shows the first four and the
 * sidebar readout shows all of them, so both need the resolved list.
 *
 * `coverImage` is projected whole for the same reason as the hero portrait:
 * `urlFor()` needs the asset reference plus the hotspot to honour the focal
 * point chosen in Studio.
 */
export const featuredWorkQuery = defineQuery(`{
  "section": *[_type == "featuredWorkSection"][0]{
    eyebrow,
    headline,
    subheadline
  },
  "projects": *[_type == "project" && featured == true] | order(order asc)[0...3]{
    _id,
    title,
    "slug": slug.current,
    thesis,
    company,
    role,
    year,
    visibility,
    liveUrl,
    coverImage,
    problem,
    designCredit,
    "stack": stack[]->name
  }
}`)
