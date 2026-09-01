'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

// Shrinks the root to the middle 20% of the viewport, so "active" means "in the
// middle of the screen", not "anywhere on screen".
const ROOT_MARGIN = '-40% 0px -40% 0px'

export type SectionPayload = Record<string, unknown> | null

interface SectionObserverValue {
  activeSection: string | null
  activePayload: SectionPayload
  register: (element: Element, id: string) => () => void
  setPayload: (id: string, payload: SectionPayload) => void
}

const SectionObserverContext = createContext<SectionObserverValue | null>(null)

export function SectionObserverProvider({ children }: { children: ReactNode }) {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [activePayload, setActivePayload] = useState<SectionPayload>(null)

  const observerRef = useRef<IntersectionObserver | null>(null)
  const idsRef = useRef(new Map<Element, string>())
  const payloadsRef = useRef(new Map<string, SectionPayload>())
  const visibleRef = useRef(new Set<Element>())
  const activeSectionRef = useRef<string | null>(null)

  // Two sections can briefly share the middle band. Ties resolve by document
  // order so the active section steps by one rather than jumping.
  const resolveActive = useCallback(() => {
    const visible = [...visibleRef.current]
    if (visible.length === 0) return

    const first = visible.reduce((winner, candidate) =>
      winner.compareDocumentPosition(candidate) & Node.DOCUMENT_POSITION_PRECEDING
        ? candidate
        : winner,
    )

    const id = idsRef.current.get(first)
    if (!id) return

    // Written here rather than in an effect: `setPayload` reads it in the same
    // batch, and a section observer and a card observer routinely fire together
    // on a long jump. A ref that lagged a render would drop the payload pushed
    // alongside the section change and leave the previous one on screen.
    activeSectionRef.current = id

    setActiveSection(id)
    setActivePayload(payloadsRef.current.get(id) ?? null)
  }, [])

  const getObserver = useCallback(() => {
    if (observerRef.current) return observerRef.current

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visibleRef.current.add(entry.target)
          else visibleRef.current.delete(entry.target)
        }
        resolveActive()
      },
      { rootMargin: ROOT_MARGIN },
    )

    return observerRef.current
  }, [resolveActive])

  const register = useCallback(
    (element: Element, id: string) => {
      const observer = getObserver()
      idsRef.current.set(element, id)
      observer.observe(element)

      return () => {
        observer.unobserve(element)
        idsRef.current.delete(element)
        visibleRef.current.delete(element)
      }
    },
    [getObserver],
  )

  const setPayload = useCallback((id: string, payload: SectionPayload) => {
    payloadsRef.current.set(id, payload)
    setActivePayload((current) => (id === activeSectionRef.current ? payload : current))
  }, [])

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect()
      observerRef.current = null
    }
  }, [])

  const value = useMemo<SectionObserverValue>(
    () => ({ activeSection, activePayload, register, setPayload }),
    [activeSection, activePayload, register, setPayload],
  )

  return <SectionObserverContext.Provider value={value}>{children}</SectionObserverContext.Provider>
}

export function useSectionObserverContext() {
  const context = useContext(SectionObserverContext)
  if (!context) {
    throw new Error('useSectionObserverContext must be used inside a SectionObserverProvider')
  }
  return context
}

// `payload` runs through its own effect so pushing a new one never unobserves
// and re-observes the element.
export function useSectionObserver<T extends HTMLElement = HTMLElement>(
  id: string,
  payload: SectionPayload = null,
) {
  const { register, setPayload } = useSectionObserverContext()
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    return register(element, id)
  }, [register, id])

  useEffect(() => {
    setPayload(id, payload)
  }, [setPayload, id, payload])

  return ref
}
