'use client'

import type { FeaturedWorkPayload } from '@/types/work'

export function FeaturedWorkReadout({ payload }: { payload: FeaturedWorkPayload }) {
  return (
    // `min-h-18` is load-bearing: without it the card reflows on every swap.
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
