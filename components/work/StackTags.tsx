const TAG_CLASS =
  'rounded-sm border border-border bg-surface px-2.5 py-1 font-mono text-[11px] tracking-wider text-fg-muted uppercase'

interface StackTagsProps {
  names: string[]
  /** Tags beyond this count collapse into a `+N` chip. Unset shows all of them. */
  max?: number
  /** Tags at or past this index are hidden below `md`, where the row would wrap. */
  mobileMax?: number
  /** Value for `data-card` on each chip, so a GSAP scope can target the row. */
  dataCard?: string
  className?: string
}

export function StackTags({ names, max, mobileMax, dataCard, className }: StackTagsProps) {
  if (names.length === 0) return null

  const visible = max === undefined ? names : names.slice(0, max)
  const hiddenCount = max === undefined ? 0 : names.length - max

  return (
    <ul className={`flex flex-wrap gap-2 ${className ?? ''}`}>
      {visible.map((name, index) => (
        <li
          key={name}
          data-card={dataCard}
          className={
            mobileMax !== undefined && index >= mobileMax
              ? `hidden md:block ${TAG_CLASS}`
              : TAG_CLASS
          }
        >
          {name}
        </li>
      ))}
      {hiddenCount > 0 && (
        <li data-card={dataCard} className={TAG_CLASS}>
          +{hiddenCount}
        </li>
      )}
    </ul>
  )
}
