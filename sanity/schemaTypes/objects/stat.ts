import { defineField, defineType } from 'sanity'

/**
 * `value` is a string, not a number, so suffixes like "200+" survive. The
 * count-up in the hero parses the leading digits and preserves the rest.
 */
export const stat = defineType({
  name: 'stat',
  title: 'Stat',
  type: 'object',
  fields: [
    defineField({
      name: 'value',
      title: 'Value',
      type: 'string',
      description: 'e.g. "5" or "200+"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'e.g. "production systems" — rendered uppercase in mono',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'value', subtitle: 'label' },
  },
})
