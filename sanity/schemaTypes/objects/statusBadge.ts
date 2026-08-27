import { defineField, defineType } from 'sanity'

/**
 * The small badge at the top of the sidebar card's content block.
 *
 * Defaults to the Booksy line rather than "Available for work" — a stale or
 * untrue availability badge undercuts the rest of the page. The `available`
 * tone stays in the schema for whenever it is actually true.
 */
export const statusBadge = defineType({
  name: 'statusBadge',
  title: 'Status badge',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      initialValue: '→ Booksy · AI Native SWE · Sept 2026',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tone',
      title: 'Tone',
      type: 'string',
      initialValue: 'upcoming',
      options: {
        list: [
          { title: 'Upcoming (accent dot)', value: 'upcoming' },
          { title: 'Available (accent dot)', value: 'available' },
          { title: 'Hidden', value: 'none' },
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'label', subtitle: 'tone' },
  },
})
