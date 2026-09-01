'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useRef, useState } from 'react'

import { IdentityMode, type IdentityModeProps } from '@/components/layout/card-modes/IdentityMode'
import { isProjectCardPayload, ProjectMode } from '@/components/layout/card-modes/ProjectMode'
import { useSectionObserverContext } from '@/lib/section-observer'
import { useMediaQuery } from '@/lib/use-media-query'
import { prefersReducedMotion } from '@/lib/use-smooth-scroll'
import type { ProjectCardPayload } from '@/types/work'

gsap.registerPlugin(useGSAP)

const WORK_SECTION_ID = 'work'
const SWAP_DURATION = 0.2
const MODE_DURATION = 0.25

type CardMode = 'identity' | 'project'

interface RenderedState {
  mode: CardMode
  payload: ProjectCardPayload | null
}

// One string per distinct card state, so an unchanged payload never re-triggers
// the fade.
function stateKey({ mode, payload }: RenderedState) {
  return mode === 'project' && payload ? `project:${payload.index}` : 'identity'
}

export function SidebarCard(props: IdentityModeProps) {
  const cardRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const entranceRef = useRef<gsap.core.Timeline | null>(null)
  const hasSwappedRef = useRef(false)

  const { activeSection, activePayload } = useSectionObserverContext()

  // Project mode is a desktop idea: below lg the card is not sticky, it scrolls
  // away with the hero, and it stays the identity card. Gated here rather than
  // relying on the observers not registering — a payload pushed at desktop
  // width survives a resize down, and would otherwise follow the card into a
  // breakpoint the whole interaction was never meant for.
  const isDesktop = useMediaQuery('(min-width: 64rem)')

  const projectPayload =
    isDesktop && activeSection === WORK_SECTION_ID && isProjectCardPayload(activePayload)
      ? activePayload
      : null

  const next: RenderedState = projectPayload
    ? { mode: 'project', payload: projectPayload }
    : { mode: 'identity', payload: null }

  const [rendered, setRendered] = useState<RenderedState>({ mode: 'identity', payload: null })

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from(cardRef.current, {
          opacity: 0,
          x: -12,
          duration: 0.5,
          ease: 'power2.out',
        })
      })

      return () => mm.revert()
    },
    { scope: cardRef },
  )

  // Phase 1 — fade the outgoing card out, then commit the swap at the empty
  // point. Keeping this on the wrapper is what gives the reference's blank
  // frame between two projects instead of a crossfade.
  useGSAP(
    () => {
      const element = contentRef.current
      if (!element || stateKey(next) === stateKey(rendered)) return

      // Rapid scrolling can cross all three cards inside one transition. Killing
      // the in-flight timeline is what stops the card lagging projects behind.
      timelineRef.current?.kill()

      const commit = () => setRendered(next)

      // `prefersReducedMotion()` rather than `gsap.matchMedia()`: a matchMedia
      // context reverts on teardown, which would snap the outgoing content back
      // to full opacity for a frame every time the swap is interrupted.
      if (prefersReducedMotion()) {
        gsap.set(element, { opacity: 1 })
        commit()
        return
      }

      // A mode change swaps a portrait for a project wash — too different to
      // read as anything but a glitch at the between-projects speed.
      const duration = next.mode === rendered.mode ? SWAP_DURATION : MODE_DURATION

      timelineRef.current = gsap
        .timeline()
        .to(element, { opacity: 0, duration, ease: 'power2.in' })
        .call(commit)
    },
    { scope: cardRef, dependencies: [next.mode, next.payload?.index, isDesktop] },
  )

  // Phase 2 — the entrance, keyed on what is actually rendered. It has to be a
  // separate pass: the incoming elements do not exist until React commits, so a
  // selector added to the outgoing timeline would resolve to the old DOM.
  useGSAP(
    () => {
      const element = contentRef.current
      if (!element) return

      // The card has its own mount tween; the first render is not a swap.
      if (!hasSwappedRef.current) {
        hasSwappedRef.current = true
        return
      }

      if (prefersReducedMotion()) {
        gsap.set(element, { opacity: 1 })
        return
      }

      entranceRef.current?.kill()
      entranceRef.current = gsap
        .timeline()
        .set(element, { opacity: 1 })
        .fromTo(
          '[data-mode="bg"]',
          { opacity: 0, scale: 1.12 },
          { opacity: 1, scale: 1, duration: 0.7, ease: 'power2.out' },
          0,
        )
        .fromTo(
          '[data-mode-item]',
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.45, stagger: 0.06, ease: 'power3.out' },
          0.08,
        )
    },
    { scope: cardRef, dependencies: [rendered.mode, rendered.payload?.index] },
  )

  return (
    <article
      ref={cardRef}
      className="relative w-full rounded-shell border border-border bg-surface/40 p-2 lg:max-h-[calc(100svh-4rem)]"
    >
      <div className="relative isolate min-h-[calc(100svh-13rem)] overflow-hidden rounded-inner border border-border/60 bg-surface md:aspect-[4/3] md:min-h-0 lg:aspect-[3/4]">
        {/* Both layers fade together: the wrapper holds the background and the
            content, so the card is briefly empty at the swap point rather than
            ghosting one project over the next. */}
        <div ref={contentRef} className="absolute inset-0">
          {rendered.mode === 'project' && rendered.payload ? (
            <ProjectMode payload={rendered.payload} monogram={props.monogram} />
          ) : (
            <IdentityMode {...props} />
          )}
        </div>
      </div>
    </article>
  )
}
