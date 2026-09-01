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
import { urlFor } from '@/sanity/lib/image'
import type { FeaturedProject } from '@/types/work'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const SECTION_ID = 'work'
const CARD_ROOT_MARGIN = '-45% 0px -45% 0px'
const MAX_TAGS_DESKTOP = 4
const MAX_TAGS_MOBILE = 3

interface FeaturedProjectCardProps {
  project: FeaturedProject
  index: number
}

export function FeaturedProjectCard({ project, index }: FeaturedProjectCardProps) {
  const cardRef = useRef<HTMLElement>(null)
  const figureRef = useRef<HTMLElement>(null)
  const { setPayload } = useSectionObserverContext()

  const stack = useMemo(
    () => (project.stack ?? []).filter((name): name is string => Boolean(name)),
    [project.stack],
  )

  const payload = useMemo(
    () => ({
      role: project.role,
      company: project.company,
      year: project.year,
      stack,
    }),
    [project.role, project.company, project.year, stack],
  )

  // Pushes on enter only. Between two cards nothing owns the middle band, and
  // clearing there would flicker the readout on every scroll through a gap.
  useEffect(() => {
    const element = cardRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setPayload(SECTION_ID, payload)
      },
      { rootMargin: CARD_ROOT_MARGIN },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [setPayload, payload])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const timeline = gsap.timeline({
          defaults: { ease: 'power3.out' },
          scrollTrigger: {
            trigger: cardRef.current,
            start: 'top 75%',
            once: true,
          },
        })

        timeline
          .from('[data-card="figure"]', { opacity: 0, y: 40, duration: 0.7 }, 0)
          .from('[data-card="text"] > *', { opacity: 0, y: 24, duration: 0.5, stagger: 0.06 }, 0.15)
          .from('[data-card="tag"]', { opacity: 0, y: 12, duration: 0.4, stagger: 0.04 }, 0.4)
      })

      mm.add('(prefers-reduced-motion: no-preference) and (min-width: 48rem)', () => {
        gsap.fromTo(
          '[data-card="image"]',
          { yPercent: -6 },
          {
            yPercent: 6,
            ease: 'none',
            scrollTrigger: {
              trigger: figureRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.6,
            },
          },
        )
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
  const problemLine = firstSentence(project.problem)

  return (
    <article
      ref={cardRef}
      className={`relative grid items-center gap-8 border-t border-border py-12 lg:min-h-[70vh] lg:grid-cols-2 lg:gap-12 lg:py-16 ${
        index % 2 === 1 ? 'lg:[&>figure]:order-2' : ''
      }`}
    >
      <figure
        ref={figureRef}
        data-card="figure"
        className="relative aspect-[4/3] overflow-hidden rounded-card border border-border bg-surface transition-colors after:absolute after:inset-x-0 after:top-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-border after:to-transparent after:content-[''] hover:border-accent/40 md:aspect-[16/10]"
      >
        {coverUrl ? (
          <Image
            data-card="image"
            src={coverUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            style={{ objectPosition }}
            // Scaled up at rest so the parallax scrub never exposes an edge.
            className="scale-[1.08] object-cover"
          />
        ) : (
          <div
            data-card="image"
            aria-hidden="true"
            className="absolute inset-0 grid scale-[1.08] place-items-center bg-surface-raised"
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

      <div data-card="text" className="max-w-lg">
        <p className="font-mono text-[11px] tracking-widest text-fg-muted">
          {String(index + 1).padStart(2, '0')}
        </p>

        <p className="mt-4 font-mono text-xs tracking-[0.18em] text-accent uppercase">
          {THESIS_LABELS[project.thesis] ?? project.thesis}
        </p>

        <h3 className="mt-3 font-display text-2xl font-bold tracking-display text-fg md:text-3xl lg:text-4xl">
          {project.title}
        </h3>

        <p className="mt-3 font-mono text-[11px] tracking-widest text-fg-muted uppercase">
          {project.role} · {project.company} · {project.year}
        </p>

        <p className="mt-5 max-w-md leading-relaxed text-base text-fg-muted">{problemLine}</p>

        <StackTags
          names={stack}
          max={MAX_TAGS_DESKTOP}
          mobileMax={MAX_TAGS_MOBILE}
          dataCard="tag"
          className="mt-6"
        />

        {project.designCredit && (
          <p className="mt-4 font-mono text-[11px] text-fg-muted">{project.designCredit}</p>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-5">
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
  )
}
