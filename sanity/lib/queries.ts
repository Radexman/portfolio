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

/**
 * The Side project section: header copy, the three triptych photographs, the
 * referenced hive app and the inspection steps, in one round trip.
 *
 * `project` is dereferenced inline rather than fetched separately so the block
 * renders the same `project` document the More work bento will have to exclude
 * by `_id`. `approach` is projected here but not in `featuredWorkQuery` — this
 * block states the constraint and then the response, so it needs both.
 */
export const sideProjectQuery = defineQuery(`
  *[_type == "sideProjectSection"][0]{
    eyebrow,
    headline,
    framingLine,
    triptych[]{ alt, caption, asset, hotspot, crop },
    inspectionSteps[]{ prompt, response, field },
    project->{
      _id,
      title,
      "slug": slug.current,
      thesis,
      company,
      role,
      year,
      visibility,
      liveUrl,
      problem,
      approach,
      "stack": stack[]->name
    }
  }
`)
