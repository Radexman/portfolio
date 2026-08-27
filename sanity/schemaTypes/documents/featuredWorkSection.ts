import { BlockContentIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

/**
 * Singleton. Only the section's own header copy lives here — the three cards
 * beneath it come from `project` documents, so this document holds nothing
 * that would go stale when the projects change.
 *
 * Kept as a sibling of `heroSection` rather than folded into it: that document
 * is named for the hero and its field groups are hero-specific, and merging
 * both into one `homePage` would mean migrating already-published content.
 */
export const featuredWorkSection = defineType({
  name: 'featuredWorkSection',
  title: 'Featured work section',
  type: 'document',
  icon: BlockContentIcon,
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      description: 'Mono label above the headline',
      initialValue: 'Selected work',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      initialValue: 'Three systems, three different problems',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'subheadline',
      title: 'Subheadline',
      type: 'text',
      rows: 2,
      description: 'Optional. One line — it renders at max-w-xl.',
      validation: (rule) => rule.max(180),
    }),
  ],
  preview: {
    select: { subtitle: 'headline' },
    prepare({ subtitle }) {
      return { title: 'Featured work section', subtitle }
    },
  },
})
