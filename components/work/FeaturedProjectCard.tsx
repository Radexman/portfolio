'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useRef } from 'react'

import { StackTags } from '@/components/work/StackTags'
import { THESIS_LABELS, VISIBILITY_FALLBACKS } from '@/content/work'
import { firstSentence, hostnameOf } from '@/lib/format'
import { useSectionObserverContext } from '@/lib/section-observer'
import { useMediaQuery } from '@/lib/use-media-query'
import { urlFor } from '@/sanity/lib/image'
import type { FeaturedProject } from '@/types/work'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const SECTION_ID = 'work'
const CARD_ROOT_MARGIN = '-45% 0px -45% 0px'
const MAX_TAGS_DESKTOP = 4
const MAX_TAGS_MOBILE = 3
const CARD_COVER_WIDTH = 480

// Each tile pins one step lower than the one before it. The step is roughly a
// fifth of the tile's height, so an arriving card covers about 80% of the one
// beneath and the stack keeps showing its own edges.
const STACK_TOP_REM = 6
const STACK_STEP_REM = 6
// Trailing space under each tile is what the stack scrolls through; without it
// the cards would pile up in a single flick.
const STACK_GAP = '45vh'

interface FeaturedProjectCardProps {
  project: FeaturedProject
  index: number
  total: number
}

export function FeaturedProjectCard({ project, index, total }: FeaturedProjectCardProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLElement>(null)
  const { setPayload } = useSectionObserverContext()

  // The sidebar card only enters project mode at lg, where it is sticky. Below
  // that there is nothing to update, so the observer never starts.
  const isDesktop = useMediaQuery('(min-width: 64rem)')

  const stack = useMemo(
    () => (project.stack ?? []).filter((name): name is string => Boolean(name)),
    [project.stack],
  )

  const problemLine = firstSentence(project.problem)

  // A deliberately small transform, not the full cover: the sidebar shows an
  // atmospheric wash, and Sanity's LQIP is a ~20px image that upscales to mush
  // rather than to something recognisable.
  const cardCover = project.coverImage?.asset
    ? urlFor(project.coverImage).width(CARD_COVER_WIDTH).quality(55).auto('format').url()
    : null

  const payload = useMemo(
    () => ({
      index,
      total,
      slug: project.slug,
      title: project.title,
      description: problemLine,
      year: project.year,
      role: project.role,
      stack,
      cover: cardCover,
    }),
    [
      index,
      total,
      project.slug,
      project.title,
      problemLine,
      project.year,
      project.role,
      stack,
      cardCover,
    ],
  )

  // Observes a sentinel, not the tile: the tile is sticky, and a sticky element
  // reports its pinned rect to IntersectionObserver, which would leave every
  // tile permanently "active" once stuck. The sentinel is an absolutely placed
  // band covering this project's share of the stack, so it scrolls normally.
  // Pushes on enter only — between two bands nothing owns the middle, and
  // clearing there would blank the sidebar on every scroll through a gap.
  useEffect(() => {
    const element = sentinelRef.current
    if (!element || !isDesktop) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setPayload(SECTION_ID, payload)
      },
      { rootMargin: CARD_ROOT_MARGIN },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [setPayload, payload, isDesktop])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-tile-inner]', {
          opacity: 0,
          y: 40,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: { trigger: cardRef.current, start: 'top 90%', once: true },
        })
      })

      return () => mm.revert()
    },
    { scope: cardRef },
  )

  const coverUrl = project.coverImage?.asset
    ? urlFor(project.coverImage).width(1600).quality(85).auto('format').url()
    : null

  const objectPosition = project.coverImage?.hotspot
    ? `${project.coverImage.hotspot.x * 100}% ${project.coverImage.hotspot.y * 100}%`
    : '50% 50%'

  const fallbackLabel = VISIBILITY_FALLBACKS[project.visibility]

  return (
    <>
      <div
        ref={sentinelRef}
        aria-hidden="true"
        style={{ top: `${(index / total) * 100}%`, height: `${100 / total}%` }}
        className="pointer-events-none absolute inset-x-0 hidden lg:block"
      />

      <article
        ref={cardRef}
        style={{ top: `${STACK_TOP_REM + index * STACK_STEP_REM}rem`, marginBottom: STACK_GAP }}
        className="relative max-lg:!mb-16 lg:sticky"
      >
        {/* The same two-layer shell as the sidebar card — outer frame, hairline
            inner frame — so the tiles read as cards rather than bare images. */}
        <Link
          data-tile-inner
          href={`/work/${project.slug}`}
          className="group block rounded-shell border border-border bg-surface p-2 shadow-card-stack transition-colors hover:border-accent"
        >
          <figure className="relative aspect-[16/10] overflow-hidden rounded-inner border border-border bg-surface">
            {coverUrl ? (
              <Image
                src={coverUrl}
                alt=""
                fill
                sizes="(min-width: 1024px) 62vw, 100vw"
                style={{ objectPosition }}
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            ) : (
              <div
                aria-hidden="true"
                className="absolute inset-0 grid place-items-center bg-surface-raised"
              >
                <span className="font-mono text-[11px] tracking-label text-fg-muted uppercase">
                  {'// screenshot pending'}
                </span>
              </div>
            )}
            <figcaption className="sr-only">
              {project.coverImage?.alt ?? `${project.title} — no screenshot yet`}
            </figcaption>
          </figure>

          <span className="sr-only">
            {project.title} — {THESIS_LABELS[project.thesis] ?? project.thesis}. {problemLine} Open
            the case study.
          </span>
        </Link>

        {/* Below lg the sidebar card never enters project mode, so the tile has
            to carry its own copy or the section is a wall of unlabelled images. */}
        <div className="mt-5 lg:hidden">
          <p className="font-mono text-xs tracking-[0.18em] text-accent uppercase">
            {THESIS_LABELS[project.thesis] ?? project.thesis}
          </p>

          <h3 className="mt-2 font-display text-2xl font-bold tracking-display text-fg md:text-3xl">
            {project.title}
          </h3>

          <p className="mt-2 font-mono text-[11px] tracking-widest text-fg-muted uppercase">
            {project.role} · {project.company} · {project.year}
          </p>

          <p className="mt-4 max-w-md leading-relaxed text-fg-muted">{problemLine}</p>

          <StackTags
            names={stack}
            max={MAX_TAGS_DESKTOP}
            mobileMax={MAX_TAGS_MOBILE}
            className="mt-5"
          />

          {project.designCredit && (
            <p className="mt-4 font-mono text-[11px] text-fg-muted">{project.designCredit}</p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-5">
            <Link
              href={`/work/${project.slug}`}
              className="font-mono text-xs tracking-widest text-fg uppercase underline decoration-accent underline-offset-4 transition-colors hover:text-accent"
            >
              <span aria-hidden="true">→</span> case study
              <span className="sr-only"> for {project.title}</span>
            </Link>

            {project.visibility === 'public' && project.liveUrl ? (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="font-mono text-xs tracking-widest text-fg-muted transition-colors hover:text-accent"
              >
                <span aria-hidden="true">↗</span> {hostnameOf(project.liveUrl)}
              </a>
            ) : (
              fallbackLabel && <p className="font-mono text-xs text-fg-muted">{fallbackLabel}</p>
            )}
          </div>
        </div>
      </article>
    </>
  )
}
