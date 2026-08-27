import type { ReactNode } from 'react'

import { SectionObserverProvider } from '@/lib/section-observer'

interface SplitLayoutProps {
  /** The persistent card. Sticky and vertically centred at lg+ only. */
  sidebar: ReactNode
  /** Page sections, in order. Each renders its own <section id="…">. */
  children: ReactNode
}

/**
 * The page's structural split: a 1/3 card column and a 2/3 content column.
 *
 * Built once here and reused by every later section — sections mount into the
 * content column and never re-create the grid.
 *
 * Below lg the grid collapses to a single column and the card scrolls away
 * with the page. It is deliberately never sticky there: at 380px wide it would
 * permanently occupy a third of the viewport.
 */
export function SplitLayout({ sidebar, children }: SplitLayoutProps) {
  return (
    <SectionObserverProvider>
      <div className="relative min-h-svh bg-base lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:items-start">
        <div className="relative px-6 pt-6 md:px-12 lg:sticky lg:top-0 lg:flex lg:h-svh lg:items-center lg:px-8 lg:py-8 lg:after:absolute lg:after:inset-y-0 lg:after:right-0 lg:after:w-px lg:after:bg-border lg:after:content-['']">
          {sidebar}
        </div>
        <main className="relative min-w-0">{children}</main>
      </div>
    </SectionObserverProvider>
  )
}
