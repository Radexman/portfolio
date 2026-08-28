'use client'

import type { RefObject } from 'react'

import { Icon } from '@/components/icons'
import { NAV_ITEMS } from '@/lib/navigation'

interface MobileMenuPanelProps {
  activeSection: string | null
  backdropRef: RefObject<HTMLDivElement | null>
  panelRef: RefObject<HTMLDivElement | null>
  onSelect: (id: string) => void
  onClose: () => void
}

export function MobileMenuPanel({
  activeSection,
  backdropRef,
  panelRef,
  onSelect,
  onClose,
}: MobileMenuPanelProps) {
  return (
    <div
      ref={backdropRef}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-base/70 backdrop-blur-md"
    >
      <div
        ref={panelRef}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        onClick={(event) => event.stopPropagation()}
        className="absolute top-16 right-4 menu-scroll max-h-[calc(100svh-6rem)] w-[min(15rem,calc(100vw-2rem))] origin-top-right rounded-2xl border border-border bg-surface/95 p-2 backdrop-blur-xl"
      >
        <nav>
          <ul>
            {NAV_ITEMS.map((item) => {
              const isActive = item.id === activeSection

              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    data-menu-item
                    aria-current={isActive ? 'true' : undefined}
                    onClick={(event) => {
                      event.preventDefault()
                      onSelect(item.id)
                    }}
                    className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-200 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent ${
                      isActive
                        ? 'bg-accent/8 text-accent'
                        : 'text-fg-muted hover:bg-surface-raised hover:text-fg active:bg-surface-raised active:text-fg'
                    }`}
                  >
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-accent"
                      />
                    )}
                    <Icon name={item.icon} className="size-4.5 shrink-0" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </div>
  )
}
