import type { ReactNode } from 'react'

import { MobileNav } from '@/components/navigation/MobileNav'
import { NavigationPill } from '@/components/navigation/NavigationPill'
import { SectionObserverProvider } from '@/lib/section-observer'
import { ThemeProvider } from '@/lib/theme'

interface SplitLayoutProps {
  sidebar: ReactNode
  monogram: string
  children: ReactNode
}

export function SplitLayout({ sidebar, monogram, children }: SplitLayoutProps) {
  return (
    <ThemeProvider>
      <SectionObserverProvider>
        <div className="relative min-h-svh bg-base lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:items-start">
          <div className="relative px-6 pt-20 max-md:min-h-svh md:px-12 md:pt-6 lg:sticky lg:top-0 lg:flex lg:h-svh lg:items-center lg:px-8 lg:py-8 lg:after:absolute lg:after:inset-y-0 lg:after:right-0 lg:after:w-px lg:after:bg-border lg:after:content-['']">
            {sidebar}
          </div>
          <main className="relative min-w-0">{children}</main>
        </div>
        <NavigationPill />
        <MobileNav monogram={monogram} />
      </SectionObserverProvider>
    </ThemeProvider>
  )
}
