'use client'

import { useCallback, useSyncExternalStore } from 'react'

// Always `false` on the server and the first client render, then correct after
// hydration. Safe for "render nothing below this breakpoint", wrong for anything
// that must be visible before hydration — use a CSS breakpoint for those.
export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    [query],
  )

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  )
}
