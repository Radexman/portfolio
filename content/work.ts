import type { ProjectThesis, ProjectVisibility } from '@/types/work'

/**
 * Display labels for the closed lists in the `project` schema.
 *
 * Duplicated from `sanity/schemaTypes/documents/project.ts` on purpose: that
 * file imports the `sanity` package, and pulling it into a client component to
 * read two strings would drag the whole Studio runtime into the browser bundle.
 * The values are typed against `ProjectThesis` / `ProjectVisibility`, so a
 * change to either union fails the build here rather than rendering blank.
 */
export const THESIS_LABELS: Record<ProjectThesis, string> = {
  architecture: 'architecture',
  'data-application': 'data application',
  'ai-realtime': 'ai & real-time',
  'product-thinking': 'product thinking',
  'craft-i18n': 'craft & localisation',
}

/**
 * What the link row says when there is no public URL. `null` means the project
 * links out normally. Stating the reason reads as deliberate; an absent link
 * reads as an oversight.
 */
export const VISIBILITY_FALLBACKS: Record<ProjectVisibility, string | null> = {
  public: null,
  'no-public-url': 'Internal platform — no public URL',
  anonymised: 'Client work — details on request',
}
