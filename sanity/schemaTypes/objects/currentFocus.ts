import { defineArrayMember, defineField, defineType } from 'sanity'

export const currentFocus = defineType({
  name: 'currentFocus',
  title: 'Current focus',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      initialValue: 'CURRENT FOCUS',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'statement',
      title: 'Statement',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      options: { layout: 'tags' },
      validation: (rule) => rule.max(4),
    }),
  ],
  preview: {
    select: { title: 'statement', subtitle: 'label' },
  },
})
