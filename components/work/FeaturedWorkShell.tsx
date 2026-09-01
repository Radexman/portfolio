'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { ReactNode } from 'react'

import { useSectionObserver } from '@/lib/section-observer'
import type { FeaturedWorkSectionCopy } from '@/types/work'

gsap.registerPlugin(useGSAP, ScrollTrigger)

// Exists so FeaturedWorkSection can stay a server component and do the fetching.
export function FeaturedWorkShell({
  copy,
  children,
}: {
  copy: FeaturedWorkSectionCopy
  children: ReactNode
}) {
  const sectionRef = useSectionObserver<HTMLElement>('work')

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      // Elements render in their final state and gsap sets the "from" before
      // paint, so under reduced motion nothing is ever hidden.
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-work-header] > *', {
          opacity: 0,
          y: 24,
          duration: 0.6,
          ease: 'power3.out',
          stagger: 0.08,
          scrollTrigger: {
            trigger: '[data-work-header]',
            start: 'top 80%',
            once: true,
          },
        })
      })

      return () => mm.revert()
    },
    { scope: sectionRef },
  )

  return (
    <section ref={sectionRef} id="work" className="relative bg-base section-padding py-24 lg:py-32">
      <div data-work-header className="max-w-2xl">
        <p className="font-mono text-xs tracking-[0.18em] text-accent uppercase">{copy.eyebrow}</p>
        <h2 className="mt-3 font-display text-4xl font-bold tracking-display text-fg md:text-5xl">
          {copy.headline}
        </h2>
        {copy.subheadline && (
          <p className="mt-3 max-w-xl leading-relaxed text-base text-fg-muted">
            {copy.subheadline}
          </p>
        )}
      </div>

      {/* One shared containing block for every tile: a sticky element releases
          when its own parent scrolls out, so tiles must be siblings here rather
          than each sitting in its own wrapper, or the first would unpin before
          the last arrived. */}
      <div className="relative mt-16">
        {children}
        {/* A real element, not padding: sticky containment clamps to the content
            box, so padding-bottom would not extend the stack's dwell — and this
            also stops the last tile's margin collapsing out of the list. */}
        <div aria-hidden="true" className="hidden lg:block lg:h-[60vh]" />
      </div>
    </section>
  )
}
