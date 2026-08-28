'use client'

import { useCallback, useSyncExternalStore } from 'react'

/**
 * Subscribes to a CSS media query.
 *
 * Always `false` on the server and on the first client render, then correct
 * after hydration — so it never causes a mismatch. That makes it safe for
 * "render nothing below this breakpoint", and wrong for anything that must be
 * visible before hydration; use a CSS breakpoint for those.
 */
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
