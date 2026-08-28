'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import Image from 'next/image'
import { useRef } from 'react'

import { CardReadout } from '@/components/layout/CardReadout'
import {
  ArrowUpRightIcon,
  DocumentIcon,
  SOCIAL_ORDER,
  SocialIcon,
  socialLabel,
} from '@/components/ui/SocialIcon'
import { urlFor } from '@/sanity/lib/image'
import type { HeroSection } from '@/types/hero'

gsap.registerPlugin(useGSAP)

type SidebarCardProps = Pick<
  HeroSection,
  | 'portrait'
  | 'monogram'
  | 'cardGreeting'
  | 'cardBio'
  | 'statusBadge'
  | 'socials'
  | 'primaryCta'
  | 'secondaryCta'
>

function Monogram({ value }: { value: string }) {
  const [first, ...rest] = value
  return (
    <span className="inline-flex items-center gap-1.5" aria-hidden="true">
      <span className="font-display text-[19px] leading-none font-bold tracking-[-0.06em] text-fg">
        {first}
        <span className="text-fg/35">{rest.join('')}</span>
      </span>
    </span>
  )
}

export function SidebarCard({
  portrait,
  monogram,
  cardGreeting,
  cardBio,
  statusBadge,
  socials,
  primaryCta,
  secondaryCta,
}: SidebarCardProps) {
  const cardRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from(cardRef.current, {
          opacity: 0,
          x: -12,
          duration: 0.5,
          ease: 'power2.out',
        })
      })

      return () => mm.revert()
    },
    { scope: cardRef },
  )

  // A Sanity image field exists as soon as alt text is typed, with no asset
  // until a file is uploaded — check the asset, never the object.
  const portraitUrl = portrait?.asset
    ? urlFor(portrait).width(900).quality(85).auto('format').url()
    : null

  const objectPosition = portrait?.hotspot
    ? `${portrait.hotspot.x * 100}% ${portrait.hotspot.y * 100}%`
    : '50% 50%'

  const orderedSocials = socials
    ? [...socials].sort(
        (a, b) => SOCIAL_ORDER.indexOf(a.platform) - SOCIAL_ORDER.indexOf(b.platform),
      )
    : []

  const showBadge = statusBadge && statusBadge.tone !== 'none'

  return (
    <article
      ref={cardRef}
      className="relative w-full rounded-shell border border-border bg-surface/40 p-2 lg:max-h-[calc(100svh-4rem)]"
    >
      <div className="relative isolate min-h-[calc(100svh-13rem)] overflow-hidden rounded-inner border border-border/60 bg-surface md:aspect-[4/3] md:min-h-0 lg:aspect-[3/4]">
        {portraitUrl ? (
          <Image
            src={portraitUrl}
            alt={portrait?.alt ?? ''}
            fill
            priority
            sizes="(min-width: 1024px) 33vw, 100vw"
            style={{ objectPosition }}
            className="object-cover contrast-110 grayscale"
          />
        ) : (
          <div aria-hidden="true" className="absolute inset-0 bg-surface-raised" />
        )}

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-base via-base/75 to-transparent"
        />

        {/* The mobile top bar carries the monogram below md; two of them would
            sit within 60px of each other. */}
        <div className="absolute top-5 left-5 max-md:hidden">
          <Monogram value={monogram} />
        </div>

        {orderedSocials.length > 0 && (
          <ul className="absolute top-5 right-5 flex flex-col gap-2.5">
            {orderedSocials.map((social) => (
              <li key={social.platform}>
                <a
                  href={social.url}
                  target={social.platform === 'email' ? undefined : '_blank'}
                  rel={social.platform === 'email' ? undefined : 'noreferrer noopener'}
                  aria-label={socialLabel(social.platform)}
                  className="grid size-10 place-items-center rounded-full border border-border bg-surface-raised text-fg-muted transition-colors duration-200 hover:border-accent hover:text-accent"
                >
                  <SocialIcon platform={social.platform} />
                </a>
              </li>
            ))}
          </ul>
        )}

        {/* A full 48px capsule pushed 20px past the left edge: the parent's
            overflow-hidden clips its left half into long curves, and the 20px
            left padding re-centres the label in what still shows. */}
        {showBadge && (
          <div className="absolute top-[44%] -left-5 flex w-12 -translate-y-1/2 flex-col items-center gap-3 rounded-full border border-border bg-surface-raised/90 py-4 pl-5">
            <span className="rotate-180 font-sans text-[11px] leading-none font-medium text-fg [writing-mode:vertical-rl]">
              {statusBadge.label}
            </span>
            <span
              aria-hidden="true"
              className="size-2 shrink-0 animate-status-pulse rounded-full bg-accent"
            />
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 p-5">
          <h2 className="flex items-center font-display text-2xl font-semibold text-fg">
            {cardGreeting}
            <span
              aria-hidden="true"
              className="ml-1.5 inline-block h-6 w-0.5 animate-caret bg-fg"
            />
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-fg-muted">{cardBio}</p>

          {/* Takes no space when empty — reserving height here pushed the
              greeting off-centre at the hero. */}
          <CardReadout />

          <hr className="my-4 border-border/70" />

          {(primaryCta ?? secondaryCta) && (
            <div className="flex items-center gap-3">
              {primaryCta && (
                <>
                  <a
                    href={primaryCta.href}
                    aria-label={primaryCta.label}
                    tabIndex={-1}
                    className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-base transition-opacity hover:opacity-90 max-sm:hidden"
                  >
                    <ArrowUpRightIcon />
                  </a>
                  <a
                    href={primaryCta.href}
                    className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium whitespace-nowrap text-base transition-opacity hover:opacity-90"
                  >
                    {primaryCta.label}
                  </a>
                </>
              )}
              {secondaryCta && (
                <a
                  href={secondaryCta.href}
                  className="inline-flex items-center gap-2 text-sm font-semibold whitespace-nowrap text-fg transition-colors hover:text-accent"
                >
                  <DocumentIcon />
                  {secondaryCta.label}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
