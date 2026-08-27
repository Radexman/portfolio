'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useRef, useState, type ReactNode } from 'react'

import {
  FeaturedWorkReadout,
  isFeaturedWorkPayload,
} from '@/components/layout/readouts/FeaturedWorkReadout'
import {
  useSectionObserverContext,
  type SectionPayload,
} from '@/lib/section-observer'
import { useMediaQuery } from '@/lib/use-media-query'

gsap.registerPlugin(useGSAP)

/**
 * The contextual half of the sidebar card: it reflects whichever section is in
 * the middle of the viewport.
 *
 * Variants are a map keyed by section id rather than a chain of conditionals —
 * later sections add an entry and nothing here changes. A section with no entry
 * renders nothing, which is the correct behaviour for the hero.
 *
 * Each variant is responsible for its own fixed height. The slot itself must
 * not reserve any, or the card's greeting is pushed off-centre at the hero.
 */
const READOUT_VARIANTS: Record<
  string,
  (payload: SectionPayload) => ReactNode | null
> = {
  work: (payload) =>
    isFeaturedWorkPayload(payload) ? (
      <FeaturedWorkReadout payload={payload} />
    ) : null,
}

export function CardReadout() {
  const { activeSection, activePayload } = useSectionObserverContext()
  const containerRef = useRef<HTMLDivElement>(null)

  // Below lg the card is not sticky — it scrolls away before any section the
  // readout could describe is in view, so it renders nothing rather than
  // filling a container the reader will never see again.
  const isDesktop = useMediaQuery('(min-width: 64rem)')

  const [displayed, setDisplayed] = useState<ReactNode | null>(null)
  const [displayedKey, setDisplayedKey] = useState<string | null>(null)

  const variant = activeSection ? READOUT_VARIANTS[activeSection] : undefined
  const next = variant ? variant(activePayload) : null
  // Identity of the rendered content, so an unchanged payload does not
  // re-trigger the crossfade on every context update.
  const nextKey = next ? `${activeSection}:${JSON.stringify(activePayload)}` : null

  useGSAP(
    () => {
      const element = containerRef.current
      if (!element || nextKey === displayedKey) return

      const commit = () => {
        setDisplayed(next)
        setDisplayedKey(nextKey)
      }

      const mm = gsap.matchMedia()

      // The readout still swaps under reduced motion — it just cuts.
      mm.add('(prefers-reduced-motion: reduce)', () => {
        commit()
      })

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const timeline = gsap.timeline()

        // Nothing on screen yet means there is nothing to fade out.
        if (displayedKey) {
          timeline.to(element, {
            opacity: 0,
            duration: 0.12,
            ease: 'power2.in',
          })
        }

        timeline.call(commit)

        if (nextKey) {
          timeline.fromTo(
            element,
            { opacity: 0, y: 4 },
            { opacity: 1, y: 0, duration: 0.18, ease: 'power2.out' }
          )
        } else {
          // Emptied, not hidden — leave the slot in a clean state for next time.
          timeline.set(element, { opacity: 1, y: 0 })
        }
      })

      return () => mm.revert()
    },
    // `isDesktop` is a dependency because the container does not exist until it
    // flips true after hydration — without it the first swap would find no ref.
    { scope: containerRef, dependencies: [nextKey, isDesktop] }
  )

  if (!isDesktop) return null

  return <div ref={containerRef}>{displayed}</div>
}
