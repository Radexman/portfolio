import { FeaturedProjectCard } from '@/components/work/FeaturedProjectCard'
import { FeaturedWorkShell } from '@/components/work/FeaturedWorkShell'
import { sanityFetch } from '@/sanity/lib/live'
import { featuredWorkQuery } from '@/sanity/lib/queries'
import type { FeaturedWorkData, FeaturedWorkSectionCopy } from '@/types/work'

/**
 * Section B. Three stacked full-width cards, alternating which side the
 * screenshot sits on.
 *
 * Deliberately not a bento: three items in a bento is three boxes with extra
 * CSS. Bento belongs on the case study pages and in the More work archive,
 * where the content is genuinely heterogeneous.
 */

/** Used when the singleton has not been published yet. */
const FALLBACK_COPY: FeaturedWorkSectionCopy = {
  eyebrow: 'Selected work',
  headline: 'Three systems, three different problems',
}

export async function FeaturedWorkSection() {
  const { data } = await sanityFetch({ query: featuredWorkQuery })
  const { section, projects } = (data ?? {}) as Partial<FeaturedWorkData>

  // Nothing published yet: skip the section rather than rendering a header
  // over an empty space. The hero's "View selected work" CTA is a same-page
  // anchor, so it simply has nothing to scroll to until a project exists.
  if (!projects || projects.length === 0) return null

  return (
    <FeaturedWorkShell copy={section ?? FALLBACK_COPY}>
      {/* Whatever exists renders — the section is never padded to three. */}
      {projects.map((project, index) => (
        <FeaturedProjectCard
          key={project._id}
          project={project}
          index={index}
        />
      ))}
    </FeaturedWorkShell>
  )
}
