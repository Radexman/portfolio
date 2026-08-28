import type { ProjectThesis, ProjectVisibility } from '@/types/work'

// Duplicated from the `project` schema rather than imported: that file pulls in
// the `sanity` package, which would drag the Studio runtime into the browser
// bundle. Typed against the unions, so a change there fails the build here.
export const THESIS_LABELS: Record<ProjectThesis, string> = {
  architecture: 'architecture',
  'data-application': 'data application',
  'ai-realtime': 'ai & real-time',
  'product-thinking': 'product thinking',
  'craft-i18n': 'craft & localisation',
}

// `null` means the project links out normally.
export const VISIBILITY_FALLBACKS: Record<ProjectVisibility, string | null> = {
  public: null,
  'no-public-url': 'Internal platform — no public URL',
  anonymised: 'Client work — details on request',
}
