import Image from 'next/image'

import { urlFor } from '@/sanity/lib/image'
import type { TriptychImage } from '@/types/side-project'

const FRAME_CLASS =
  'relative aspect-[3/4] overflow-hidden rounded-card border border-border bg-surface transition-colors hover:border-accent/30'

/**
 * Three photographs under identical treatment, so they read as one statement
 * rather than a collage. No filter is applied here on purpose — the grade lives
 * in the source files, and `grayscale`/`sepia` would flatten all three equally.
 *
 * Below `md` this is a snap-scrolling row, never a vertical stack: the argument
 * depends on seeing the three together.
 */
export function Triptych({ images }: { images: TriptychImage[] }) {
  if (images.length === 0) return null

  return (
    <div
      data-side-project="triptych"
      className="-mx-6 triptych-row flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0"
    >
      {images.map((image, index) => {
        const url = image.asset
          ? urlFor(image).width(900).height(1200).quality(85).auto('format').url()
          : null

        const objectPosition = image.hotspot
          ? `${image.hotspot.x * 100}% ${image.hotspot.y * 100}%`
          : '50% 50%'

        return (
          <figure
            key={image.caption || index}
            data-triptych="figure"
            className="w-[70%] shrink-0 snap-center md:w-auto"
          >
            <div className={FRAME_CLASS}>
              {url ? (
                <Image
                  src={url}
                  alt={image.alt ?? ''}
                  fill
                  sizes="(min-width: 768px) 30vw, 70vw"
                  style={{ objectPosition }}
                  className="object-cover"
                />
              ) : (
                <div aria-hidden="true" className="absolute inset-0 grid place-items-center">
                  <span className="font-mono text-[11px] tracking-label text-fg-muted uppercase">
                    {'// photo pending'}
                  </span>
                </div>
              )}
            </div>
            <figcaption
              data-triptych="caption"
              className="mt-3 font-mono text-[11px] tracking-widest text-fg-muted lowercase"
            >
              {image.caption}
            </figcaption>
          </figure>
        )
      })}
    </div>
  )
}
