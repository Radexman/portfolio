'use client'

import { Icon } from '@/components/icons'
import { CONTROL_SIZES, type ControlSize } from '@/components/navigation/control-size'
import { useTheme } from '@/lib/theme'

interface ThemeToggleProps {
  size?: ControlSize
  showTooltip?: boolean
}

// The label stays static and the icon carries the state. Announcing "switch to
// dark" would assert a light theme that is not in effect — nothing reads the
// value from `useTheme` yet. Restore a stateful label with the light palette.
export function ThemeToggle({ size = 'lg', showTooltip = true }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const nextTheme = theme === 'dark' ? 'light' : 'dark'
  const dimensions = CONTROL_SIZES[size]

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={`group relative grid ${dimensions.button} place-items-center rounded-full border border-border bg-surface/90 text-accent backdrop-blur-sm transition-colors duration-200 hover:border-accent/40 hover:bg-surface-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`}
    >
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} className={dimensions.icon} />
      {showTooltip && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-full mr-3 -translate-y-1/2 rounded border border-border bg-surface-raised px-2.5 py-1 font-mono text-[11px] tracking-wider whitespace-nowrap text-fg uppercase opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          {nextTheme}
        </span>
      )}
    </button>
  )
}
