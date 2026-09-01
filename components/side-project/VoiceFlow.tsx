'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useRef } from 'react'

import { Icon } from '@/components/icons'
import type { InspectionStep } from '@/types/side-project'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const STEP_DURATION = 0.4
const STEP_STAGGER = 0.12

/**
 * A static rendering of the guided inspection. No microphone permission, no
 * speech recognition, no audio — a portfolio page that asks for mic access on
 * scroll is a page people close. A live demo belongs on the case study behind
 * an explicit button.
 */
export function VoiceFlow({ steps }: { steps: InspectionStep[] }) {
  const rootRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (steps.length === 0) return

      const mm = gsap.matchMedia()

      // Nothing is hidden at rest, so under reduced motion the steps and the
      // full-height connector are simply what renders.
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const timeline = gsap.timeline({
          scrollTrigger: { trigger: rootRef.current, start: 'top 85%', once: true },
        })

        // Deliberately slower than the reveals elsewhere: this should read as a
        // conversation unfolding, not a list rendering.
        timeline.from(
          '[data-voice="step"]',
          {
            opacity: 0,
            x: -8,
            duration: STEP_DURATION,
            ease: 'power3.out',
            stagger: STEP_STAGGER,
          },
          0,
        )

        timeline.from(
          '[data-voice="line"]',
          {
            scaleY: 0,
            transformOrigin: 'top',
            ease: 'none',
            duration: STEP_DURATION + STEP_STAGGER * (steps.length - 1),
          },
          0,
        )
      })

      return () => mm.revert()
    },
    { scope: rootRef, dependencies: [steps.length] },
  )

  if (steps.length === 0) return null

  return (
    <div ref={rootRef} className="relative mt-8 pl-4 md:pl-6">
      <span
        data-voice="line"
        aria-hidden="true"
        className="absolute inset-y-1 left-0 w-px origin-top bg-border"
      />

      <ol className="space-y-6">
        {steps.map((step) => (
          <li key={step.prompt} data-voice="step">
            <p className="flex items-center gap-2 font-mono text-xs tracking-wider text-fg-muted uppercase">
              <Icon name="volume" className="size-3.5 shrink-0" />
              {step.prompt}
            </p>
            <p className="mt-2 pl-4 font-display text-sm text-fg md:pl-6 md:text-[length:1rem]">
              &ldquo;{step.response}&rdquo;
            </p>
            <p className="mt-1 pl-4 font-mono text-[11px] text-accent md:pl-6">
              <span aria-hidden="true">→</span> {step.field}
            </p>
          </li>
        ))}
      </ol>
    </div>
  )
}
