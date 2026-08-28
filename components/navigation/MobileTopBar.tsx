'use client'

import { useEffect, useState, type RefObject } from 'react'

interface MobileTopBarProps {
  monogram: string
  isOpen: boolean
  triggerRef: RefObject<HTMLButtonElement | null>
  onToggle: () => void
  onNavigateHome: () => void
}

const SCROLLED_AT = 32

export function MobileTopBar({
  monogram,
  isOpen,
  triggerRef,
  onToggle,
  onNavigateHome,
}: MobileTopBarProps) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    if (isOpen) return

    const onScroll = () => setIsScrolled(window.scrollY > SCROLLED_AT)
    onScroll()

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isOpen])

  return (
    <div
      className={`fixed inset-x-0 top-0 flex h-16 items-center justify-between px-4 transition-[background-color,border-color] duration-200 ${
        isOpen ? 'z-60' : 'z-40'
      } ${
        isScrolled
          ? 'border-b border-border bg-base/80 backdrop-blur-md'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <a
        href="#hero"
        tabIndex={isOpen ? -1 : undefined}
        onClick={(event) => {
          event.preventDefault()
          onNavigateHome()
        }}
        className="rounded-sm font-mono text-sm font-medium text-fg/80 transition-colors duration-200 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {monogram}
      </a>

      <button
        ref={triggerRef}
        type="button"
        onClick={onToggle}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        className="grid size-11 place-items-center rounded-full border border-border bg-surface/90 text-fg-muted backdrop-blur-sm transition-colors duration-200 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {/* Three bars, 6px between centres. Positioned with top/bottom rather
            than Tailwind translate utilities so GSAP owns `transform` outright. */}
        <span aria-hidden="true" className="relative block h-[13.5px] w-4.5">
          <span
            data-bar="top"
            className="absolute inset-x-0 top-0 h-[1.5px] rounded-full bg-current"
          />
          <span
            data-bar="middle"
            className="absolute inset-x-0 top-1.5 h-[1.5px] rounded-full bg-current"
          />
          <span
            data-bar="bottom"
            className="absolute inset-x-0 bottom-0 h-[1.5px] rounded-full bg-current"
          />
        </span>
      </button>
    </div>
  )
}
