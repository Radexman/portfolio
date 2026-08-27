import { defineField, defineType } from 'sanity'

/**
 * A labelled link. Used for the card's primary/secondary CTAs and the
 * hero's "view selected work" link. `href` allows mailto: and in-page
 * anchors as well as absolute URLs.
 */
export const ctaLink = defineType({
  name: 'ctaLink',
  title: 'Call to action',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'href',
      title: 'Link',
      type: 'string',
      description: 'An absolute URL, a mailto: address, or an in-page anchor such as #work',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'label', subtitle: 'href' },
  },
})
