import { defineField, defineType } from 'sanity'

export const tickerItem = defineType({
  name: 'tickerItem',
  title: 'Ticker item',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'isCurrent',
      title: 'Current',
      type: 'boolean',
      description: 'Renders in the accent colour',
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: 'name', isCurrent: 'isCurrent' },
    prepare({ title, isCurrent }) {
      return {
        title,
        subtitle: isCurrent ? 'Current' : undefined,
      }
    },
  },
})
