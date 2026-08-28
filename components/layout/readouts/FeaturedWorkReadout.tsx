'use client'

import type { FeaturedWorkPayload } from '@/types/work'

/**
 * The sidebar card's readout while the Featured work section is in view: whose
 * project is currently in the middle of the screen, and what it was built with.
 *
 * `min-h-[4.5rem]` is load-bearing. The hero's slot deliberately reserves no
 * height (reserving it there pushed the greeting into the middle of the card),
 * so the fixed height lives on the variants instead — without it the card
 * reflows every time the payload swaps.
 */
export function FeaturedWorkReadout({ payload }: { payload: FeaturedWorkPayload }) {
  return (
    <div className="min-h-18">
      <p className="font-display text-sm font-semibold text-fg">{payload.role}</p>
      <p className="mt-1 font-mono text-[11px] tracking-widest text-fg-muted uppercase">
        {payload.company} · {payload.year}
      </p>
      {payload.stack.length > 0 && (
        <p className="mt-2 line-clamp-2 font-mono text-[11px] text-fg-muted">
          {payload.stack.join(' · ')}
        </p>
      )}
    </div>
  )
}

/**
 * Narrows the untyped context payload. A section can only ever set its own
 * payload, but the context stores `Record<string, unknown>` for every section,
 * so the shape is checked before it is rendered rather than cast.
 */
export function isFeaturedWorkPayload(payload: unknown): payload is FeaturedWorkPayload {
  if (typeof payload !== 'object' || payload === null) return false
  const candidate = payload as Partial<FeaturedWorkPayload>
  return (
    typeof candidate.role === 'string' &&
    typeof candidate.company === 'string' &&
    typeof candidate.year === 'string' &&
    Array.isArray(candidate.stack)
  )
}
