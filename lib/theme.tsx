'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

export type Theme = 'dark' | 'light'

interface ThemeValue {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeValue | null>(null)

// State only — nothing reads `theme` to restyle yet. The light palette and the
// `<html>` attribute that would select it are a later feature; this exists so the
// toggle has somewhere to live in the meantime.
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [])

  const value = useMemo<ThemeValue>(() => ({ theme, toggleTheme, setTheme }), [theme, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used inside a ThemeProvider')
  }
  return context
}
