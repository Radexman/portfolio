'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

import { useSectionObserver } from '@/lib/section-observer'
import type { HeroSection as HeroSectionData, TickerItem } from '@/types/hero'

gsap.registerPlugin(useGSAP)

function parseStatValue(value: string) {
  const match = /^(\d+)(.*)$/.exec(value.trim())
  if (!match) return null
  return { target: Number(match[1]), suffix: match[2] }
}

function TickerTrack({ items }: { items: TickerItem[] }) {
  return (
    <span className="flex shrink-0 items-center">
      {items.map((item, index) => (
        <span key={`${item.name}-${index}`} className="flex items-center">
          <span
            className={
              item.isCurrent
                ? 'font-display text-2xl font-semibold text-accent md:text-3xl'
                : 'font-display text-2xl font-semibold text-fg-muted md:text-3xl'
            }
          >
            {item.name}
          </span>
          <span aria-hidden="true" className="px-6 text-fg-muted">
            ·
          </span>
        </span>
      ))}
    </span>
  )
}

export function HeroSection({ hero }: { hero: HeroSectionData }) {
  const sectionRef = useSectionObserver<HTMLElement>('hero')

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const timeline = gsap.timeline({
          defaults: { ease: 'power2.out' },
        })

        timeline
          .from(
            '[data-hero="eyebrow"]',
            {
              opacity: 0,
              y: 8,
              duration: 0.4,
            },
            0.12,
          )
          .from(
            '[data-hero="headline"]',
            {
              opacity: 0,
              y: 16,
              duration: 0.6,
              ease: 'expo.out',
            },
            0.2,
          )
          .from(
            '[data-hero="subheadline"]',
            {
              opacity: 0,
              y: 16,
              duration: 0.6,
              ease: 'expo.out',
            },
            0.32,
          )
          .from(
            '[data-hero="focus"]',
            {
              opacity: 0,
              y: 12,
              duration: 0.45,
            },
            0.44,
          )
          .from(
            '[data-hero="availability"]',
            {
              opacity: 0,
              y: 12,
              duration: 0.45,
            },
            0.52,
          )
          .from(
            '[data-hero="stat"]',
            {
              opacity: 0,
              y: 12,
              duration: 0.45,
              stagger: 0.06,
            },
            0.6,
          )
          .from(
            '[data-hero="ticker"]',
            {
              opacity: 0,
              duration: 0.7,
            },
            0.86,
          )
          .from(
            '[data-hero="scroll-cue"]',
            {
              opacity: 0,
              duration: 0.4,
            },
            1,
          )

        const counters = gsap.utils.toArray<HTMLElement>('[data-countup]')

        for (const counter of counters) {
          const parsed = parseStatValue(counter.dataset.countup ?? '')
          if (!parsed) continue

          const proxy = { value: 0 }

          timeline.to(
            proxy,
            {
              value: parsed.target,
              duration: 1.2,
              ease: 'power2.out',
              onUpdate: () => {
                counter.textContent = `${Math.round(proxy.value)}${parsed.suffix}`
              },
            },
            0.6,
          )
        }
      })

      return () => mm.revert()
    },
    { scope: sectionRef },
  )

  const { currentFocus, workCta, availabilityNote } = hero

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative flex min-h-svh flex-col justify-center section-padding py-24 lg:py-0"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 page-grid" />
        <div className="absolute inset-0 hero-glow" />
      </div>

      <div className="relative max-w-2xl">
        <p
          data-hero="eyebrow"
          className="font-mono text-xs tracking-[0.18em] text-fg-muted uppercase"
        >
          {hero.eyebrow}
        </p>

        <h1
          data-hero="headline"
          className="mt-6 font-display text-4xl leading-[0.95] font-bold tracking-display md:text-6xl lg:text-7xl"
        >
          <span className="text-fg">{hero.headlineLead}</span>
          <span className="mt-1 block text-accent">{hero.headlineAccent}</span>
        </h1>

        <p
          data-hero="subheadline"
          className="mt-6 max-w-lg leading-relaxed text-fg-muted md:text-lg"
        >
          {hero.subheadline}
        </p>

        {currentFocus && (
          <div
            data-hero="focus"
            className="mt-10 max-w-md border border-l-2 border-border border-l-accent bg-surface/60 p-5 shadow-offset-accent"
          >
            <p className="flex items-center gap-2">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
              <span className="font-mono text-[11px] tracking-label text-fg-muted uppercase">
                {currentFocus.label}
              </span>
            </p>
            <p className="mt-2 font-display font-semibold text-fg">{currentFocus.statement}</p>
            {currentFocus.tags && currentFocus.tags.length > 0 && (
              <p className="mt-2 font-mono text-[11px] tracking-label text-fg-muted uppercase">
                {currentFocus.tags.join(' · ')}
              </p>
            )}
          </div>
        )}

        {(availabilityNote ?? workCta) && (
          <div
            data-hero="availability"
            className="mt-6 flex max-w-md flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            {availabilityNote && (
              <p className="font-mono text-xs text-fg-muted">{availabilityNote}</p>
            )}
            {workCta && (
              <a
                href={workCta.href}
                className="font-mono text-xs text-fg underline decoration-accent underline-offset-4 transition-colors hover:text-accent"
              >
                {workCta.label} <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
        )}

        <dl className="mt-12 grid max-w-lg grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 sm:gap-y-0">
          {hero.stats.map((item) => (
            <div key={item.label} data-hero="stat">
              <dd
                data-countup={item.value}
                className="font-display text-4xl font-bold text-fg tabular-nums"
              >
                {item.value}
              </dd>
              <dt className="mt-1 font-mono text-[10px] tracking-label text-fg-muted uppercase">
                {item.label}
              </dt>
            </div>
          ))}
        </dl>
      </div>

      {hero.ticker.length > 0 && (
        <div data-hero="ticker" className="relative mt-12 overflow-hidden marquee-mask">
          <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
            {/* Rendered twice so the -50% keyframe lands on a seamless seam. */}
            <TickerTrack items={hero.ticker} />
            <TickerTrack items={hero.ticker} />
          </div>
        </div>
      )}

      {hero.scrollCue && (
        <p
          data-hero="scroll-cue"
          className="mt-16 flex items-center gap-2 font-mono text-xs text-fg-muted lg:absolute lg:bottom-8 lg:mt-0"
        >
          {hero.scrollCue}
          <span aria-hidden="true" className="inline-block animate-scroll-cue">
            ↓
          </span>
        </p>
      )}
    </section>
  )
}
