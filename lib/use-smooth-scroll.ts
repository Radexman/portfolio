'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { useCallback } from 'react'

gsap.registerPlugin(useGSAP, ScrollToPlugin)

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Both nav layers scroll through this. `null` means the top of the page; an id
// that does not resolve is a no-op, so links to unbuilt sections do nothing
// rather than jumping to the top.
export function useSmoothScroll() {
  return useCallback((id: string | null) => {
    const target = id ? document.getElementById(id) : null
    if (id && !target) return

    gsap.to(window, {
      scrollTo: { y: target ?? 0, autoKill: true },
      duration: prefersReducedMotion() ? 0 : 0.8,
      ease: 'power2.inOut',
      overwrite: true,
      onComplete: () => {
        if (id) window.location.hash = id
      },
    })
  }, [])
}
