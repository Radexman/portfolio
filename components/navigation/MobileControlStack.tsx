'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useRef } from 'react'

import { ScrollToTopButton } from '@/components/navigation/ScrollToTopButton'
import { ThemeToggle } from '@/components/navigation/ThemeToggle'
import { prefersReducedMotion } from '@/lib/use-smooth-scroll'

interface MobileControlStackProps {
  hidden: boolean
  showScrollToTop: boolean
  onScrollToTop: () => void
}

// Both controls share one 44px slot in the corner. The theme toggle rests in it
// and lifts one button-height clear when the arrow claims the slot beneath it.
const LIFT = -52

export function MobileControlStack({
  hidden,
  showScrollToTop,
  onScrollToTop,
}: MobileControlStackProps) {
  const themeRef = useRef<HTMLDivElement>(null)
  const arrowRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const reduce = prefersReducedMotion()

      gsap.to(themeRef.current, {
        y: showScrollToTop ? LIFT : 0,
        duration: reduce ? 0 : showScrollToTop ? 0.8 : 0.4,
        ease: showScrollToTop ? 'elastic.out(1, 0.55)' : 'back.in(1.7)',
        overwrite: true,
      })

      // Scale on the wrapper composes with the button's own opacity tween.
      gsap.to(arrowRef.current, {
        scale: showScrollToTop ? 1 : 0.4,
        duration: reduce ? 0 : showScrollToTop ? 0.7 : 0.25,
        ease: showScrollToTop ? 'back.out(2.4)' : 'power2.in',
        overwrite: true,
      })
    },
    { dependencies: [showScrollToTop] },
  )

  return (
    <div
      // `invisible` rather than opacity alone: the buttons must leave the tab
      // order while the panel owns focus.
      className={`fixed right-4 bottom-4 z-40 size-11 transition-opacity duration-200 ${
        hidden ? 'invisible opacity-0' : 'opacity-100'
      }`}
    >
      <div ref={arrowRef} className="absolute inset-0">
        <ScrollToTopButton size="lg" visible={showScrollToTop} onClick={onScrollToTop} />
      </div>
      <div ref={themeRef} className="absolute inset-0">
        <ThemeToggle size="lg" showTooltip={false} />
      </div>
    </div>
  )
}
