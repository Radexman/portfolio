export function Monogram({ value }: { value: string }) {
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
