import { CodeBlockIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

/**
 * The referenced half of a project's stack.
 *
 * Modelled as a document rather than a string array so the Skills section can
 * ask the inverse question — "which projects use this?" — without duplicating
 * the name in every project and hoping the spellings match.
 */
export const TECHNOLOGY_CATEGORIES = [
  { value: 'core', title: 'Core' },
  { value: 'styling', title: 'Styling & UI' },
  { value: 'backend', title: 'Backend & data' },
  { value: 'tooling', title: 'Tooling & infra' },
  { value: 'ai', title: 'AI & LLM' },
  { value: 'teaching', title: 'I teach' },
] as const

export const technology = defineType({
  name: 'technology',
  title: 'Technology',
  type: 'document',
  icon: CodeBlockIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'Written as it should render, e.g. "Next.js" not "nextjs"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      description: 'Controls which group it lands in on the Skills grid',
      options: { list: [...TECHNOLOGY_CATEGORIES], layout: 'radio' },
      initialValue: 'core',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'image',
      description: 'Optional. Not used by the Featured work section.',
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'category', media: 'icon' },
  },
  orderings: [
    {
      name: 'nameAsc',
      title: 'Name',
      by: [{ field: 'name', direction: 'asc' }],
    },
  ],
})
