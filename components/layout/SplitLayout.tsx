import type { ReactNode } from 'react'

import { NavigationPill } from '@/components/navigation/NavigationPill'
import { SectionObserverProvider } from '@/lib/section-observer'
import { ThemeProvider } from '@/lib/theme'

interface SplitLayoutProps {
  sidebar: ReactNode
  children: ReactNode
}

export function SplitLayout({ sidebar, children }: SplitLayoutProps) {
  return (
    <ThemeProvider>
      <SectionObserverProvider>
        <div className="relative min-h-svh bg-base lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:items-start">
          <div className="relative px-6 pt-6 md:px-12 lg:sticky lg:top-0 lg:flex lg:h-svh lg:items-center lg:px-8 lg:py-8 lg:after:absolute lg:after:inset-y-0 lg:after:right-0 lg:after:w-px lg:after:bg-border lg:after:content-['']">
            {sidebar}
          </div>
          <main className="relative min-w-0">{children}</main>
        </div>
        <NavigationPill />
      </SectionObserverProvider>
    </ThemeProvider>
  )
}
