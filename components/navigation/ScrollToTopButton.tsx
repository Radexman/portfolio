'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useRef } from 'react'

import { Icon } from '@/components/icons'
import { CONTROL_SIZES, type ControlSize } from '@/components/navigation/control-size'

interface ScrollToTopButtonProps {
  visible: boolean
  onClick: () => void
  size?: ControlSize
}

export function ScrollToTopButton({ visible, onClick, size = 'lg' }: ScrollToTopButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dimensions = CONTROL_SIZES[size]

  useGSAP(
    () => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      gsap.to(buttonRef.current, {
        opacity: visible ? 1 : 0,
        y: visible ? 0 : 8,
        duration: reduce ? 0 : 0.3,
        ease: 'power3.out',
        overwrite: true,
      })
    },
    { dependencies: [visible] },
  )

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      aria-label="Back to top"
      aria-hidden={!visible}
      tabIndex={visible ? undefined : -1}
      className={`grid ${dimensions.button} place-items-center rounded-full border border-border bg-surface/90 text-fg-muted opacity-0 backdrop-blur-sm transition-colors duration-200 hover:border-accent/40 hover:bg-surface-raised hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
        visible ? '' : 'pointer-events-none'
      }`}
    >
      <Icon name="arrow-up" className={dimensions.icon} />
    </button>
  )
}
