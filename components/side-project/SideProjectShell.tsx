'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { ReactNode } from 'react'

import { useSectionObserver } from '@/lib/section-observer'
import type { SideProjectPayload, SideProjectSectionCopy } from '@/types/side-project'

gsap.registerPlugin(useGSAP, ScrollTrigger)

interface SideProjectShellProps {
  copy: SideProjectSectionCopy
  // Built once on the server, so its identity is stable across re-renders and
  // it can go straight into the observer hook without memoising.
  payload: SideProjectPayload | null
  children: ReactNode
}

// Exists so SideProjectSection can stay a server component and do the fetching.
export function SideProjectShell({ copy, payload, children }: SideProjectShellProps) {
  const sectionRef = useSectionObserver<HTMLElement>('beekeeping', payload)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      // Elements render in their final state and gsap sets the "from" before
      // paint, so under reduced motion nothing is ever hidden.
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-side-project="header"] > *', {
          opacity: 0,
          y: 24,
          duration: 0.6,
          ease: 'power3.out',
          stagger: 0.08,
          scrollTrigger: {
            trigger: '[data-side-project="header"]',
            start: 'top 80%',
            once: true,
          },
        })

        const triptych = gsap.timeline({
          defaults: { ease: 'power3.out' },
          scrollTrigger: {
            trigger: '[data-side-project="triptych"]',
            start: 'top 75%',
            once: true,
          },
        })

        // Left to right. The stagger is what makes three images read as a
        // sequence rather than a grid appearing at once.
        triptych
          .from('[data-triptych="figure"]', { opacity: 0, y: 32, duration: 0.7, stagger: 0.1 }, 0)
          .from('[data-triptych="caption"]', { opacity: 0, y: 8, duration: 0.4, stagger: 0.1 }, 0.2)

        gsap.from('[data-side-project="block"]', {
          opacity: 0,
          y: 24,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '[data-side-project="block"]',
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
    <section
      ref={sectionRef}
      id="beekeeping"
      className="relative border-t border-border bg-base section-padding py-24 lg:py-32"
    >
      <div data-side-project="header" className="max-w-4xl">
        {/* Muted, not accent: this section is an aside, not another pitch. */}
        <p className="font-mono text-xs tracking-[0.18em] text-fg-muted uppercase">
          {copy.eyebrow}
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold tracking-display text-fg md:text-4xl">
          {copy.headline}
        </h2>
        <p className="mt-4 max-w-xl leading-relaxed text-fg-muted">{copy.framingLine}</p>
      </div>

      {/* More air above the triptych than the section's own rhythm gives. */}
      <div className="mt-14 max-w-4xl md:mt-16">{children}</div>
    </section>
  )
}
