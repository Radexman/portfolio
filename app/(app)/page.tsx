import Link from 'next/link'

import { SidebarCard } from '@/components/layout/SidebarCard'
import { SplitLayout } from '@/components/layout/SplitLayout'
import { FeaturedWorkSection } from '@/components/sections/FeaturedWorkSection'
import { HeroSection } from '@/components/sections/HeroSection'
import { sanityFetch } from '@/sanity/lib/live'
import { heroSectionQuery } from '@/sanity/lib/queries'
import type { HeroSection as HeroSectionData } from '@/types/hero'

// This content changes monthly at most.
export const revalidate = 3600

export default async function HomePage() {
  const { data } = await sanityFetch({ query: heroSectionQuery })
  const hero = data as HeroSectionData | null

  // The singleton may not exist yet (fresh dataset, or an unpublished draft).
  // Render a usable empty state rather than crashing the page.
  if (!hero) {
    return (
      <main className="section-padding flex min-h-svh items-center">
        <div className="max-w-md">
          <p className="font-mono text-xs uppercase tracking-label text-fg-muted">
            {'// no content'}
          </p>
          <h1 className="mt-4 font-display text-3xl font-semibold text-fg">
            Hero section not published
          </h1>
          <p className="mt-3 text-fg-muted">
            Open{' '}
            <Link
              href="/studio"
              className="text-accent underline underline-offset-4"
            >
              the Studio
            </Link>{' '}
            and publish the hero section document to populate this page.
          </p>
        </div>
      </main>
    )
  }

  return (
    <SplitLayout
      sidebar={
        <SidebarCard
          portrait={hero.portrait}
          monogram={hero.monogram}
          cardGreeting={hero.cardGreeting}
          cardBio={hero.cardBio}
          statusBadge={hero.statusBadge}
          socials={hero.socials}
          primaryCta={hero.primaryCta}
          secondaryCta={hero.secondaryCta}
        />
      }
    >
      <HeroSection hero={hero} />
      <FeaturedWorkSection />
    </SplitLayout>
  )
}
