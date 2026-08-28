import { FeaturedProjectCard } from '@/components/work/FeaturedProjectCard'
import { FeaturedWorkShell } from '@/components/work/FeaturedWorkShell'
import { sanityFetch } from '@/sanity/lib/live'
import { featuredWorkQuery } from '@/sanity/lib/queries'
import type { FeaturedWorkData, FeaturedWorkSectionCopy } from '@/types/work'

// Used when the singleton has not been published yet.
const FALLBACK_COPY: FeaturedWorkSectionCopy = {
  eyebrow: 'Selected work',
  headline: 'Three systems, three different problems',
}

export async function FeaturedWorkSection() {
  const { data } = await sanityFetch({ query: featuredWorkQuery })
  const { section, projects } = (data ?? {}) as Partial<FeaturedWorkData>

  if (!projects || projects.length === 0) return null

  return (
    <FeaturedWorkShell copy={section ?? FALLBACK_COPY}>
      {projects.map((project, index) => (
        <FeaturedProjectCard key={project._id} project={project} index={index} />
      ))}
    </FeaturedWorkShell>
  )
}
