'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { useCallback, useRef } from 'react'

import { NavPillLink } from '@/components/navigation/NavPillLink'
import { ScrollToTopButton } from '@/components/navigation/ScrollToTopButton'
import { ThemeToggle } from '@/components/navigation/ThemeToggle'
import { NAV_ITEMS } from '@/lib/navigation'
import { useSectionObserverContext } from '@/lib/section-observer'

gsap.registerPlugin(useGSAP, ScrollToPlugin)

const INDICATOR_HEIGHT = 16

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function NavigationPill() {
  const { activeSection } = useSectionObserverContext()
  const wrapperRef = useRef<HTMLElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const indicatorRef = useRef<HTMLSpanElement>(null)

  const scrollToSection = useCallback((id: string | null) => {
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

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from(wrapperRef.current, {
          opacity: 0,
          x: 16,
          duration: 0.5,
          delay: 1.1,
          ease: 'power3.out',
        })

        gsap.from('[data-nav-id]', {
          opacity: 0,
          x: 8,
          duration: 0.3,
          delay: 1.2,
          stagger: 0.04,
          ease: 'power3.out',
        })
      })

      return () => mm.revert()
    },
    { scope: wrapperRef },
  )

  useGSAP(
    () => {
      const list = listRef.current
      const indicator = indicatorRef.current
      if (!list || !indicator) return

      const link = activeSection
        ? list.querySelector<HTMLElement>(`[data-nav-id="${activeSection}"]`)
        : null

      const duration = prefersReducedMotion() ? 0 : 0.35

      if (!link) {
        gsap.to(indicator, { opacity: 0, duration, overwrite: true })
        return
      }

      gsap.to(indicator, {
        y: link.offsetTop + (link.offsetHeight - INDICATOR_HEIGHT) / 2,
        opacity: 1,
        duration,
        ease: 'power3.out',
        overwrite: true,
      })
    },
    { scope: wrapperRef, dependencies: [activeSection] },
  )

  const showScrollToTop = activeSection !== null && activeSection !== 'hero'

  return (
    <nav
      ref={wrapperRef}
      aria-label="Section navigation"
      className="fixed inset-y-0 right-5 z-40 my-auto hidden h-fit flex-col items-center gap-3 md:flex lg:right-5"
    >
      <ThemeToggle />

      <ul
        ref={listRef}
        className="relative nav-rail flex flex-col items-center gap-1 rounded-full border border-border bg-surface/90 px-1 py-3 backdrop-blur-sm"
      >
        <span
          ref={indicatorRef}
          aria-hidden="true"
          className="absolute top-0 left-0 h-4 w-0.5 rounded-full bg-accent opacity-0"
        />

        {NAV_ITEMS.map((item) => (
          <NavPillLink
            key={item.id}
            item={item}
            isActive={item.id === activeSection}
            onNavigate={scrollToSection}
          />
        ))}
      </ul>

      <ScrollToTopButton visible={showScrollToTop} onClick={() => scrollToSection(null)} />
    </nav>
  )
}
