import { UserIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

/**
 * Singleton. Surfaced in the Studio via sanity/structure.ts with a fixed
 * document id, and create/delete actions are removed in sanity.config.ts.
 *
 * This is a deliberate expansion of the otherwise narrow CMS scope: hero copy
 * is the thing that gets rewritten most often, so it belongs in Studio rather
 * than in a constant.
 */
export const heroSection = defineType({
  name: 'heroSection',
  title: 'Hero section',
  type: 'document',
  icon: UserIcon,
  groups: [
    { name: 'card', title: 'Sidebar card', default: true },
    { name: 'content', title: 'Hero content' },
  ],
  fields: [
    // ---------------------------------------------------------------- card
    defineField({
      name: 'portrait',
      title: 'Portrait',
      type: 'image',
      group: 'card',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'monogram',
      title: 'Monogram',
      type: 'string',
      description: 'Two characters, top-left of the card',
      group: 'card',
      initialValue: 'RS',
      validation: (rule) => rule.required().max(2),
    }),
    defineField({
      name: 'cardGreeting',
      title: 'Greeting',
      type: 'string',
      group: 'card',
      initialValue: "Hey, I'm Radosław",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'cardBio',
      title: 'Bio',
      type: 'text',
      rows: 3,
      description: 'Two lines at card width',
      group: 'card',
      validation: (rule) => rule.required().max(160),
    }),
    defineField({
      name: 'statusBadge',
      title: 'Status badge',
      type: 'statusBadge',
      group: 'card',
    }),
    defineField({
      name: 'socials',
      title: 'Social links',
      type: 'array',
      group: 'card',
      of: [defineArrayMember({ type: 'socialLink' })],
      validation: (rule) => rule.max(4),
    }),
    defineField({
      name: 'primaryCta',
      title: 'Primary CTA',
      type: 'ctaLink',
      group: 'card',
    }),
    defineField({
      name: 'secondaryCta',
      title: 'Secondary CTA',
      type: 'ctaLink',
      description: 'Optional. Leave empty to hide.',
      group: 'card',
    }),

    // ------------------------------------------------------------- content
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      description: 'Mono label above the headline',
      group: 'content',
      initialValue: '/ PORTFOLIO · 2026',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'headlineLead',
      title: 'Headline — lead',
      type: 'string',
      description: 'Renders in the primary text colour',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'headlineAccent',
      title: 'Headline — accent',
      type: 'string',
      description: 'Renders in the accent colour, on its own line',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'subheadline',
      title: 'Subheadline',
      type: 'text',
      rows: 3,
      group: 'content',
      validation: (rule) => rule.required().max(220),
    }),
    defineField({
      name: 'currentFocus',
      title: 'Current focus',
      type: 'currentFocus',
      group: 'content',
    }),
    defineField({
      name: 'availabilityNote',
      title: 'Availability note',
      type: 'string',
      description: 'Optional. Sits left of the work CTA. Leave empty to hide.',
      group: 'content',
    }),
    defineField({
      name: 'workCta',
      title: 'Work CTA',
      type: 'ctaLink',
      group: 'content',
    }),
    defineField({
      name: 'stats',
      title: 'Stats',
      type: 'array',
      description: 'Exactly four. No "years of experience".',
      group: 'content',
      of: [defineArrayMember({ type: 'stat' })],
      validation: (rule) => rule.required().length(4),
    }),
    defineField({
      name: 'ticker',
      title: 'Company ticker',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({ type: 'tickerItem' })],
      validation: (rule) => rule.required().min(2),
    }),
    defineField({
      name: 'scrollCue',
      title: 'Scroll cue',
      type: 'string',
      group: 'content',
      initialValue: 'scroll to inspect',
    }),
  ],
  preview: {
    select: { title: 'headlineLead', media: 'portrait' },
    prepare({ title, media }) {
      return { title: 'Hero section', subtitle: title, media }
    },
  },
})
