import type { ReactNode } from 'react'

import { SanityLive } from '@/sanity/lib/live'

// `<SanityLive />` lives here rather than the root layout so it never mounts on
// /studio, which manages its own realtime connection.
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <SanityLive />
    </>
  )
}
