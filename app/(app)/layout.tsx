import type { ReactNode } from 'react'

import { SanityLive } from '@/sanity/lib/live'

/**
 * Layout for the public site only.
 *
 * `<SanityLive />` lives here rather than in the root layout so it never
 * mounts on /studio — the Studio manages its own realtime connection and does
 * not need the Live Content listener.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <SanityLive />
    </>
  )
}
