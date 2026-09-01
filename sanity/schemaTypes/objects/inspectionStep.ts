import { defineField, defineType } from 'sanity'

/**
 * One exchange in the guided voice inspection. Rendered statically — there is
 * no microphone and no speech recognition on this page.
 */
export const inspectionStep = defineType({
  name: 'inspectionStep',
  title: 'Inspection step',
  type: 'object',
  fields: [
    defineField({
      name: 'prompt',
      title: 'Prompt',
      type: 'string',
      description: 'What the app asks aloud, e.g. "Queen sighted?"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'response',
      title: 'Response',
      type: 'string',
      description: 'A representative spoken answer, e.g. "Yes, and there\'s fresh brood"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'field',
      title: 'Field',
      type: 'string',
      description: 'The structured record it fills, e.g. "queen_sighted: true, brood: fresh"',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'prompt', subtitle: 'field' },
  },
})
