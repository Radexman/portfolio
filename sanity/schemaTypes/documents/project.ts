import { CaseIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

/**
 * Each featured project has to argue something different. Three cards sharing
 * a Next.js + CMS + Azure stack blur into one unless the eyebrow says what the
 * project is about, so `thesis` is a closed list rather than free text.
 */
export const PROJECT_THESES = [
  { value: 'architecture', title: 'Architecture' },
  { value: 'data-application', title: 'Data application' },
  { value: 'ai-realtime', title: 'AI & real-time' },
  { value: 'product-thinking', title: 'Product thinking' },
  { value: 'craft-i18n', title: 'Craft & localisation' },
] as const

/**
 * Some work has no public URL by design — BRAIN is an internal platform behind
 * SSO. Modelling that as a field means the card renders the right fallback
 * automatically instead of the component carrying a per-project exception.
 */
export const PROJECT_VISIBILITIES = [
  { value: 'public', title: 'Public — live URL' },
  { value: 'no-public-url', title: 'Internal platform — no public URL' },
  { value: 'anonymised', title: 'Anonymised — details on request' },
] as const

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  icon: CaseIcon,
  groups: [
    { name: 'card', title: 'Card', default: true },
    { name: 'media', title: 'Media' },
    { name: 'caseStudy', title: 'Case study' },
  ],
  fields: [
    // ---------------------------------------------------------------- card
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'card',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'Becomes /work/<slug>',
      group: 'card',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description:
        'Renders in the three Featured work slots. Everything else falls through to More work.',
      group: 'card',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description:
        'Ascending. Controls ordering within Featured and within the archive.',
      group: 'card',
      validation: (rule) => rule.required().integer().min(0),
    }),
    defineField({
      name: 'thesis',
      title: 'Thesis',
      type: 'string',
      description:
        'The mono eyebrow. What this project argues that the others do not.',
      group: 'card',
      options: { list: [...PROJECT_THESES] },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'company',
      title: 'Company',
      type: 'string',
      group: 'card',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      description:
        'Honest scope, e.g. "Sole frontend owner" or "Four key features". An accurate smaller claim beats an inflated one.',
      group: 'card',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'string',
      description: 'e.g. "2025" or "2024–2025"',
      group: 'card',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'stack',
      title: 'Stack',
      type: 'array',
      description:
        'The first four render as tags on the card; all of them render in the sidebar readout.',
      group: 'card',
      of: [
        defineArrayMember({ type: 'reference', to: [{ type: 'technology' }] }),
      ],
      validation: (rule) => rule.required().min(1).unique(),
    }),
    defineField({
      name: 'visibility',
      title: 'Visibility',
      type: 'string',
      description:
        'Drives the link row. Never publish an *.azurewebsites.net URL.',
      group: 'card',
      options: { list: [...PROJECT_VISIBILITIES], layout: 'radio' },
      initialValue: 'public',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'liveUrl',
      title: 'Live URL',
      type: 'url',
      description:
        'Only used when visibility is "public". A verified custom domain.',
      group: 'card',
      hidden: ({ document }) => document?.visibility !== 'public',
      validation: (rule) =>
        rule.custom((value, context) => {
          if (context.document?.visibility === 'public' && !value) {
            return 'A public project needs a live URL'
          }
          if (typeof value === 'string' && value.includes('azurewebsites.net')) {
            return 'Never publish an *.azurewebsites.net URL — use the verified custom domain'
          }
          return true
        }),
    }),

    // --------------------------------------------------------------- media
    defineField({
      name: 'coverImage',
      title: 'Cover image',
      type: 'image',
      description:
        'The card screenshot. UI is publishable, data never is — capture against seeded mock data, and never blur.',
      group: 'media',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text',
          type: 'string',
          description: 'Describes the screenshot for screen readers',
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      description: 'Case study images. Not read by the Featured work section.',
      group: 'media',
      of: [defineArrayMember({ type: 'image', options: { hotspot: true } })],
    }),

    // ---------------------------------------------------------- case study
    defineField({
      name: 'problem',
      title: 'Problem',
      type: 'text',
      rows: 4,
      description:
        'The first sentence renders as the card line, so make it stand alone.',
      group: 'caseStudy',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'approach',
      title: 'Approach',
      type: 'text',
      rows: 4,
      group: 'caseStudy',
    }),
    defineField({
      name: 'outcome',
      title: 'Outcome',
      type: 'text',
      rows: 4,
      group: 'caseStudy',
    }),
    defineField({
      name: 'designCredit',
      title: 'Design credit',
      type: 'string',
      description:
        'e.g. "Design: client-supplied". Stating it reads as confident, not defensive.',
      group: 'caseStudy',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      company: 'company',
      year: 'year',
      featured: 'featured',
      media: 'coverImage',
    },
    prepare({ title, company, year, featured, media }) {
      return {
        title: featured ? `★ ${title}` : title,
        subtitle: [company, year].filter(Boolean).join(' · '),
        media,
      }
    },
  },
  orderings: [
    {
      name: 'orderAsc',
      title: 'Order',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
})
