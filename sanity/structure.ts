import type { StructureResolver } from 'sanity/structure'

/**
 * Document types that exist as exactly one document, edited in place.
 * Listed here so they can be filtered out of the generated list below and
 * rendered as a direct editor instead of a document list.
 */
export const SINGLETON_TYPES = ['heroSection'] as const

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .id('heroSection')
        .schemaType('heroSection')
        .title('Hero section')
        .child(
          S.editor()
            .id('heroSection')
            .schemaType('heroSection')
            .documentId('heroSection')
        ),
      S.divider(),
      ...S.documentTypeListItems().filter((item) => {
        const id = item.getId()
        return id ? !SINGLETON_TYPES.includes(id as (typeof SINGLETON_TYPES)[number]) : false
      }),
    ])
