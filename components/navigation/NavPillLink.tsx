'use client'

import { Icon } from '@/components/icons'
import type { NavItem } from '@/lib/navigation'

interface NavPillLinkProps {
  item: NavItem
  isActive: boolean
  onNavigate: (id: string) => void
}

export function NavPillLink({ item, isActive, onNavigate }: NavPillLinkProps) {
  return (
    <li>
      <a
        href={`#${item.id}`}
        data-nav-id={item.id}
        aria-label={item.label}
        aria-current={isActive ? 'true' : undefined}
        onClick={(event) => {
          event.preventDefault()
          onNavigate(item.id)
        }}
        className={`group relative grid size-10 place-items-center rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
          isActive ? 'text-accent' : 'text-fg-muted hover:bg-surface-raised hover:text-fg'
        }`}
      >
        <Icon name={item.icon} className="size-4.5" />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-full mr-3 -translate-y-1/2 rounded border border-border bg-surface-raised px-2.5 py-1 font-mono text-[11px] tracking-wider whitespace-nowrap text-fg uppercase opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          {item.label}
        </span>
      </a>
    </li>
  )
}
