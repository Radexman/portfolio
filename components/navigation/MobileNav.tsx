'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useCallback, useEffect, useRef, useState } from 'react'

import { MobileControlStack } from '@/components/navigation/MobileControlStack'
import { MobileMenuPanel } from '@/components/navigation/MobileMenuPanel'
import { MobileTopBar } from '@/components/navigation/MobileTopBar'
import { prefersReducedMotion, useSmoothScroll } from '@/lib/use-smooth-scroll'
import { useSectionObserverContext } from '@/lib/section-observer'

gsap.registerPlugin(useGSAP)

const BAR_TOP = '[data-bar="top"]'
const BAR_MIDDLE = '[data-bar="middle"]'
const BAR_BOTTOM = '[data-bar="bottom"]'

// `closing` exists so the panel can play its exit before it unmounts — the open
// state alone would rip it out of the DOM mid-animation.
type MenuState = 'closed' | 'open' | 'closing'

export function MobileNav({ monogram }: { monogram: string }) {
  const { activeSection } = useSectionObserverContext()
  const scrollToSection = useSmoothScroll()

  const [menuState, setMenuState] = useState<MenuState>('closed')
  const isMenuOpen = menuState !== 'closed'

  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const pendingScrollRef = useRef<string | null>(null)
  const hasOpenedRef = useRef(false)

  const close = useCallback(() => {
    setMenuState((current) => (current === 'open' ? 'closing' : current))
  }, [])

  const toggle = useCallback(() => {
    setMenuState((current) => (current === 'open' ? 'closing' : 'open'))
  }, [])

  const selectItem = useCallback(
    (id: string) => {
      pendingScrollRef.current = id
      close()
    },
    [close],
  )

  useGSAP(
    () => {
      const reduce = prefersReducedMotion()

      if (menuState === 'closed') {
        gsap.set([BAR_TOP, BAR_MIDDLE, BAR_BOTTOM], { y: 0, rotate: 0, opacity: 1 })
        return
      }

      if (menuState === 'open') {
        const barDuration = reduce ? 0 : 0.25
        const tl = gsap.timeline()

        tl.to(BAR_TOP, { y: 6, rotate: 45, duration: barDuration, ease: 'power2.inOut' }, 0)
        tl.to(BAR_MIDDLE, { opacity: 0, duration: barDuration, ease: 'power2.inOut' }, 0)
        tl.to(BAR_BOTTOM, { y: -6, rotate: -45, duration: barDuration, ease: 'power2.inOut' }, 0)

        if (reduce) {
          tl.set(backdropRef.current, { opacity: 1 }, 0)
            .set(panelRef.current, { opacity: 1, scale: 1, y: 0 }, 0)
            .set('[data-menu-item]', { opacity: 1, x: 0 }, 0)
          return
        }

        tl.fromTo(
          backdropRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.25, ease: 'power3.out' },
          0,
        )
          .fromTo(
            panelRef.current,
            { opacity: 0, scale: 0.94, y: -8 },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 0.3,
              ease: 'back.out(1.4)',
              transformOrigin: 'top right',
            },
            0.05,
          )
          .fromTo(
            '[data-menu-item]',
            { opacity: 0, x: 8 },
            { opacity: 1, x: 0, duration: 0.25, stagger: 0.035, ease: 'power3.out' },
            0.12,
          )
        return
      }

      const barDuration = reduce ? 0 : 0.25
      const tl = gsap.timeline({ onComplete: () => setMenuState('closed') })

      tl.to(
        [BAR_TOP, BAR_MIDDLE, BAR_BOTTOM],
        { y: 0, rotate: 0, opacity: 1, duration: barDuration, ease: 'power2.inOut' },
        0,
      )

      if (reduce) {
        tl.set([backdropRef.current, panelRef.current, '[data-menu-item]'], { opacity: 0 }, 0)
        return
      }

      tl.to('[data-menu-item]', { opacity: 0, duration: 0.15, ease: 'power2.in' }, 0)
        .to(
          panelRef.current,
          {
            opacity: 0,
            scale: 0.94,
            y: -8,
            duration: 0.18,
            ease: 'power2.in',
            transformOrigin: 'top right',
          },
          0,
        )
        .to(backdropRef.current, { opacity: 0, duration: 0.15, ease: 'power2.in' }, 0)
    },
    { scope: containerRef, dependencies: [menuState] },
  )

  // Declared before the pending-scroll effect below: React runs cleanups first,
  // so the body is unlocked and scrollY restored before the tween starts.
  useEffect(() => {
    if (!isMenuOpen) return

    const body = document.body
    const scrollY = window.scrollY
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    const previous = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
    }

    // position: fixed rather than overflow alone — iOS Safari scrolls the body
    // regardless of overflow, which is why scrollY has to be restored by hand.
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`

    return () => {
      Object.assign(body.style, previous)
      window.scrollTo(0, scrollY)
    }
  }, [isMenuOpen])

  useEffect(() => {
    if (menuState !== 'closed') return

    const id = pendingScrollRef.current
    if (!id) return

    pendingScrollRef.current = null
    scrollToSection(id)
  }, [menuState, scrollToSection])

  useEffect(() => {
    if (menuState === 'open') {
      hasOpenedRef.current = true
      panelRef.current?.querySelector<HTMLAnchorElement>('[data-menu-item]')?.focus()
      return
    }

    if (menuState === 'closed' && hasOpenedRef.current) {
      hasOpenedRef.current = false
      triggerRef.current?.focus()
    }
  }, [menuState])

  useEffect(() => {
    if (!isMenuOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
        return
      }

      if (event.key !== 'Tab') return

      const trigger = triggerRef.current
      const items = panelRef.current
        ? Array.from(panelRef.current.querySelectorAll<HTMLElement>('[data-menu-item]'))
        : []
      if (!trigger || items.length === 0) return

      const focusables = [trigger, ...items]
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement as HTMLElement | null

      if (!active || !focusables.includes(active)) {
        event.preventDefault()
        first.focus()
      } else if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isMenuOpen, close])

  // Rotating to landscape can cross the breakpoint. Closing without the exit
  // animation is deliberate: the panel is already hidden by then, and leaving
  // the body locked with no visible close control is the failure to avoid.
  // Only the crossing matters — the trigger is md:hidden, so the menu can never
  // already be open above the breakpoint.
  useEffect(() => {
    const query = window.matchMedia('(min-width: 768px)')

    const onChange = () => {
      if (query.matches) setMenuState('closed')
    }

    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const showScrollToTop = activeSection !== null && activeSection !== 'hero'

  return (
    <div ref={containerRef} className="md:hidden">
      <MobileTopBar
        monogram={monogram}
        isOpen={isMenuOpen}
        triggerRef={triggerRef}
        onToggle={toggle}
        onNavigateHome={() => scrollToSection('hero')}
      />

      <MobileControlStack
        hidden={isMenuOpen}
        showScrollToTop={showScrollToTop}
        onScrollToTop={() => scrollToSection(null)}
      />

      {isMenuOpen && (
        <MobileMenuPanel
          activeSection={activeSection}
          backdropRef={backdropRef}
          panelRef={panelRef}
          onSelect={selectItem}
          onClose={close}
        />
      )}
    </div>
  )
}
