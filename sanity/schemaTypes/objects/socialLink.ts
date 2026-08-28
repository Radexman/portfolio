import { defineField, defineType } from 'sanity'

/**
 * Icons are inline SVG mapped from `platform` in code — deliberately no icon
 * image field, so the card never waits on an image request to render its
 * social buttons.
 */
export const socialLink = defineType({
  name: 'socialLink',
  title: 'Social link',
  type: 'object',
  fields: [
    defineField({
      name: 'platform',
      title: 'Platform',
      type: 'string',
      options: {
        list: [
          { title: 'GitHub', value: 'github' },
          { title: 'LinkedIn', value: 'linkedin' },
          { title: 'X', value: 'x' },
          { title: 'Email', value: 'email' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      validation: (rule) => rule.required().uri({ scheme: ['http', 'https', 'mailto'] }),
    }),
  ],
  preview: {
    select: { title: 'platform', subtitle: 'url' },
  },
})
