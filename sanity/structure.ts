import type { StructureResolver } from 'sanity/structure'

/**
 * Document types that exist as exactly one document, edited in place.
 * Listed here so they can be filtered out of the generated list below and
 * rendered as a direct editor instead of a document list.
 */
export const SINGLETON_TYPES = ['heroSection', 'featuredWorkSection', 'sideProjectSection'] as const

/**
 * Types that already have a hand-built entry below. They are filtered out of
 * the generated tail so they do not appear twice; anything added to the schema
 * without an entry here still shows up automatically.
 */
const CURATED_TYPES = ['project', 'technology'] as const

const HIDDEN_FROM_GENERATED_LIST: readonly string[] = [...SINGLETON_TYPES, ...CURATED_TYPES]

export const structure: StructureResolver = (S) => {
  // Types with no hand-built entry yet, so a new schema is reachable the
  // moment it is registered. Empty today — every current type is curated.
  const generated = S.documentTypeListItems().filter((item) => {
    const id = item.getId()
    return id ? !HIDDEN_FROM_GENERATED_LIST.includes(id) : false
  })

  return S.list()
    .title('Content')
    .items([
      S.listItem()
        .id('heroSection')
        .schemaType('heroSection')
        .title('Hero section')
        .child(S.editor().id('heroSection').schemaType('heroSection').documentId('heroSection')),
      S.listItem()
        .id('featuredWorkSection')
        .schemaType('featuredWorkSection')
        .title('Featured work section')
        .child(
          S.editor()
            .id('featuredWorkSection')
            .schemaType('featuredWorkSection')
            .documentId('featuredWorkSection'),
        ),
      S.listItem()
        .id('sideProjectSection')
        .schemaType('sideProjectSection')
        .title('Side project section')
        .child(
          S.editor()
            .id('sideProjectSection')
            .schemaType('sideProjectSection')
            .documentId('sideProjectSection'),
        ),
      S.divider(),
      // Featured is a filtered view of the same documents, not a separate type:
      // promoting a project is a single toggle, and `order` decides the slots.
      S.listItem()
        .id('featuredProjects')
        .schemaType('project')
        .title('Featured projects')
        .child(
          S.documentTypeList('project')
            .title('Featured projects')
            .filter('_type == "project" && featured == true')
            .defaultOrdering([{ field: 'order', direction: 'asc' }]),
        ),
      S.listItem()
        .id('allProjects')
        .schemaType('project')
        .title('All projects')
        .child(
          S.documentTypeList('project')
            .title('All projects')
            .defaultOrdering([{ field: 'order', direction: 'asc' }]),
        ),
      S.listItem()
        .id('technologies')
        .schemaType('technology')
        .title('Technologies')
        .child(
          S.documentTypeList('technology')
            .title('Technologies')
            .defaultOrdering([{ field: 'name', direction: 'asc' }]),
        ),
      // Only show the divider when there is something below it.
      ...(generated.length > 0 ? [S.divider(), ...generated] : []),
    ])
}
