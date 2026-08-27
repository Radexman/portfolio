'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { ReactNode } from 'react'

import { useSectionObserver } from '@/lib/section-observer'
import type { FeaturedWorkSectionCopy } from '@/types/work'

gsap.registerPlugin(useGSAP, ScrollTrigger)

/**
 * The client half of the Featured work section: the `<section>` element, its
 * registration with the shared section observer, and the header reveal.
 *
 * It exists so `FeaturedWorkSection` can stay a server component and do the
 * fetching — the two things that need the browser (an observer ref and GSAP)
 * are the only things that live here. The cards are passed through as children
 * and mount as their own client components.
 */
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

      // Elements render in their final state; gsap sets the "from" state before
      // paint. Under reduced motion this never runs, so nothing is ever hidden.
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
    { scope: sectionRef }
  )

  return (
    <section
      ref={sectionRef}
      id="work"
      className="section-padding relative bg-base py-24 lg:py-32"
    >
      <div data-work-header className="max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
          {copy.eyebrow}
        </p>
        <h2 className="mt-3 font-display text-4xl font-bold tracking-display text-fg md:text-5xl">
          {copy.headline}
        </h2>
        {copy.subheadline && (
          <p className="mt-3 max-w-xl text-base leading-relaxed text-fg-muted">
            {copy.subheadline}
          </p>
        )}
      </div>

      <div className="mt-16">{children}</div>
    </section>
  )
}
