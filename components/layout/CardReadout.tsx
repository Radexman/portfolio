'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useRef, useState, type ReactNode } from 'react'

import {
  isSideProjectPayload,
  SideProjectReadout,
} from '@/components/layout/readouts/SideProjectReadout'
import { useSectionObserverContext, type SectionPayload } from '@/lib/section-observer'
import { useMediaQuery } from '@/lib/use-media-query'

gsap.registerPlugin(useGSAP)

// Each variant carries its own fixed height. The slot must not reserve any, or
// the card's greeting is pushed off-centre at the hero.
// `work` is deliberately absent: Selected work replaces the whole card via
// `ProjectMode` rather than filling this slot.
const READOUT_VARIANTS: Record<string, (payload: SectionPayload) => ReactNode | null> = {
  beekeeping: (payload) =>
    isSideProjectPayload(payload) ? <SideProjectReadout payload={payload} /> : null,
}

export function CardReadout() {
  const { activeSection, activePayload } = useSectionObserverContext()
  const containerRef = useRef<HTMLDivElement>(null)

  const isDesktop = useMediaQuery('(min-width: 64rem)')

  const [displayed, setDisplayed] = useState<ReactNode | null>(null)
  const [displayedKey, setDisplayedKey] = useState<string | null>(null)

  const variant = activeSection ? READOUT_VARIANTS[activeSection] : undefined
  const next = variant ? variant(activePayload) : null
  // Content identity, so an unchanged payload does not re-trigger the crossfade.
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

      // Still swaps under reduced motion — it just cuts.
      mm.add('(prefers-reduced-motion: reduce)', () => {
        commit()
      })

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const timeline = gsap.timeline()

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
            { opacity: 1, y: 0, duration: 0.18, ease: 'power2.out' },
          )
        } else {
          timeline.set(element, { opacity: 1, y: 0 })
        }
      })

      return () => mm.revert()
    },
    // `isDesktop` must stay in the deps: the container does not exist until it
    // flips true after hydration, and the first swap would find no ref.
    { scope: containerRef, dependencies: [nextKey, isDesktop] },
  )

  if (!isDesktop) return null

  return <div ref={containerRef}>{displayed}</div>
}
