'use client'

import Link from 'next/link'

import { Monogram } from '@/components/layout/card-modes/Monogram'
import { ArrowUpRightIcon } from '@/components/ui/SocialIcon'
import type { SectionPayload } from '@/lib/section-observer'
import type { ProjectCardPayload } from '@/types/work'

const MAX_TAGS = 3

const TAG_CLASS =
  'rounded-full border border-border/60 bg-surface/70 px-3.5 py-1.5 text-xs font-medium text-fg backdrop-blur-sm'

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function MetaBlock({ label, value }: { label: string; value: string }) {
  return (
    <div data-mode-item>
      <p className="font-mono text-xs tracking-widest text-fg/70 uppercase">{label}</p>
      {/* `text-base` is a colour in this palette, never a size — spell the size out. */}
      <p className="mt-1.5 text-[1.125rem] leading-snug text-fg">{value}</p>
    </div>
  )
}

export function ProjectMode({
  payload,
  monogram,
}: {
  payload: ProjectCardPayload
  monogram: string
}) {
  const visibleTags = payload.stack.slice(0, MAX_TAGS)
  const hiddenCount = payload.stack.length - visibleTags.length

  return (
    <>
      {payload.cover ? (
        <div
          aria-hidden="true"
          data-mode="bg"
          style={{ backgroundImage: `url(${payload.cover})` }}
          // Blurred far enough that the cover stops being a readable screenshot
          // and becomes a colour gradient taken from it — the point is the
          // project's atmosphere, not its UI. Saturation is pushed back up
          // because that much blur averages the colour away. The 110% scale
          // keeps the blur's soft edge outside the frame.
          className="absolute inset-0 scale-110 bg-cover bg-center blur-[28px] brightness-90 contrast-[0.9] saturate-[1.45]"
        />
      ) : (
        <div aria-hidden="true" data-mode="bg" className="absolute inset-0 bg-surface-raised" />
      )}

      {/* Weighted overlay over that gradient: it keeps the card in the palette
          and the type off the brighter parts of any cover. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-t from-base/90 via-base/55 via-55% to-base/42 backdrop-saturate-[0.7]"
      />

      <div className="absolute inset-0 flex flex-col overflow-hidden p-5">
        {/* Everything reads top-down on one rhythm; the leftover space collects
            below, above the divider. */}
        <div className="space-y-6">
          {/* The gap under the monogram is the card's only slack, so it is also
              what has to give: at mb-20 the content ran 30px past a 524px card
              and the CTA row was clipped. */}
          <div data-mode-item className="mb-10">
            <Monogram value={monogram} />
          </div>

          <h2
            data-mode-item
            className="line-clamp-1 font-display text-3xl font-bold tracking-display text-fg"
          >
            {payload.title}
          </h2>

          <p data-mode-item className="line-clamp-2 text-[18px] leading-relaxed text-fg/75">
            {payload.description}
          </p>

          <MetaBlock label="Year" value={payload.year} />
          <MetaBlock label="Role" value={payload.role} />

          {visibleTags.length > 0 && (
            <ul data-mode-item className="flex flex-wrap gap-2">
              {visibleTags.map((name) => (
                <li key={name} className={TAG_CLASS}>
                  {name}
                </li>
              ))}
              {hiddenCount > 0 && <li className={TAG_CLASS}>+{hiddenCount}</li>}
            </ul>
          )}
        </div>

        <div data-mode-item className="mt-auto pt-8">
          <hr className="mb-5 border-border/50" />

          <div className="flex items-center justify-between gap-3">
            {/* The card's action follows what it is showing: while a project is
                in view this is that project's case study, not the generic CTA. */}
            <div className="flex items-center gap-3">
              <Link
                href={`/work/${payload.slug}`}
                aria-hidden="true"
                tabIndex={-1}
                className="grid size-9 shrink-0 place-items-center rounded-full border border-border/60 bg-surface/70 text-fg transition-colors hover:border-accent hover:text-accent"
              >
                <ArrowUpRightIcon />
              </Link>
              <Link
                href={`/work/${payload.slug}`}
                className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium whitespace-nowrap text-base transition-opacity hover:opacity-90"
              >
                Case study
                <span className="sr-only"> for {payload.title}</span>
              </Link>
            </div>

            <p className="font-mono text-sm font-semibold text-fg">
              {pad(payload.index + 1)}
              <span className="font-normal text-fg/70"> / {pad(payload.total)}</span>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export function isProjectCardPayload(payload: SectionPayload): payload is ProjectCardPayload {
  if (!payload) return false
  const candidate = payload as Partial<ProjectCardPayload>
  return (
    typeof candidate.index === 'number' &&
    typeof candidate.total === 'number' &&
    typeof candidate.title === 'string' &&
    typeof candidate.description === 'string' &&
    typeof candidate.year === 'string' &&
    typeof candidate.role === 'string' &&
    Array.isArray(candidate.stack)
  )
}
