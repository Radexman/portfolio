import { defineField, defineType } from 'sanity'

/**
 * The three photographs only read as one statement if they share treatment.
 * The grade belongs in the source files, not in CSS: a `grayscale`/`sepia`
 * filter flattens all three equally, including the one that was already fine,
 * and looks like a filter rather than a grade.
 *
 * Declared as `type: 'image'` rather than an object wrapping one, so `urlFor()`
 * takes the array member directly — the same shape as `project.coverImage`.
 */
export const triptychImage = defineType({
  name: 'triptychImage',
  title: 'Triptych image',
  type: 'image',
  options: { hotspot: true },
  fields: [
    defineField({
      name: 'alt',
      title: 'Alternative text',
      type: 'string',
      description: 'Describes the photograph for screen readers',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
      description: 'One lowercase word — "building", "teaching", "beekeeping"',
      validation: (rule) =>
        rule.required().custom((value) => {
          if (typeof value !== 'string' || !/^[a-z]+$/.test(value)) {
            return 'One lowercase word, letters only'
          }
          return true
        }),
    }),
  ],
  preview: {
    select: { title: 'caption', subtitle: 'alt', media: 'asset' },
  },
})
