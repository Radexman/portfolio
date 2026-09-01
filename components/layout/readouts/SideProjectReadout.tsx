'use client'

import type { SideProjectPayload } from '@/types/side-project'

/**
 * Same shape as `FeaturedWorkReadout`, but the meta line is one pre-joined
 * string rather than company + year: here it reads "Hive Log · 2025 — present",
 * where the first half is the project, not the client.
 */
export function SideProjectReadout({ payload }: { payload: SideProjectPayload }) {
  return (
    // `min-h-18` is load-bearing: without it the card reflows on every swap.
    <div className="min-h-18">
      <p className="font-display text-sm font-semibold text-fg">{payload.role}</p>
      <p className="mt-1 font-mono text-[11px] tracking-widest text-fg-muted uppercase">
        {payload.meta}
      </p>
      {payload.stack.length > 0 && (
        <p className="mt-2 line-clamp-2 font-mono text-[11px] text-fg-muted">
          {payload.stack.join(' · ')}
        </p>
      )}
    </div>
  )
}

export function isSideProjectPayload(payload: unknown): payload is SideProjectPayload {
  if (typeof payload !== 'object' || payload === null) return false
  const candidate = payload as Partial<SideProjectPayload>
  return (
    typeof candidate.role === 'string' &&
    typeof candidate.meta === 'string' &&
    Array.isArray(candidate.stack)
  )
}
