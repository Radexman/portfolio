import { BulbOutlineIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

/**
 * Singleton. A third sibling of `heroSection` and `featuredWorkSection` rather
 * than a field on a `homePage` document: that document does not exist here, and
 * inventing it now would mean migrating two already-published singletons.
 *
 * The hive app itself is a normal `project` document, referenced rather than
 * copied, so the section and the More work bento read the same source.
 */
export const sideProjectSection = defineType({
  name: 'sideProjectSection',
  title: 'Side project section',
  type: 'document',
  icon: BulbOutlineIcon,
  groups: [
    { name: 'copy', title: 'Copy', default: true },
    { name: 'triptych', title: 'Triptych' },
    { name: 'voiceFlow', title: 'Voice flow' },
  ],
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      description:
        'Mono label above the headline. Muted here, not accent — this reads as an aside.',
      group: 'copy',
      initialValue: 'Side project',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      group: 'copy',
      initialValue: 'Built for the one user I could interview any time',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'framingLine',
      title: 'Framing line',
      type: 'text',
      rows: 2,
      description: 'One line. States what makes this section different from the client work above.',
      group: 'copy',
      initialValue: 'The only project on this page where I was also the user.',
      validation: (rule) => rule.required().max(180),
    }),
    defineField({
      name: 'triptych',
      title: 'Triptych',
      type: 'array',
      description:
        'Exactly three, in order: two things the page already argued, then the one that ties them together.',
      group: 'triptych',
      of: [defineArrayMember({ type: 'triptychImage' })],
      // "Exactly three" is a warning, not an error, so the section can publish
      // before the photographs are shot — the triptych simply does not render
      // until they exist. Tighten to `rule.required().length(3)` once it ships.
      validation: (rule) => [rule.max(3), rule.length(3).warning()],
    }),
    defineField({
      name: 'project',
      title: 'Project',
      type: 'reference',
      description: 'The hive app. Referenced so the More work bento can exclude it by id.',
      group: 'copy',
      to: [{ type: 'project' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'inspectionSteps',
      title: 'Inspection steps',
      type: 'array',
      description: 'Up to five. Rendered as a static list — no microphone, no speech recognition.',
      group: 'voiceFlow',
      of: [defineArrayMember({ type: 'inspectionStep' })],
      validation: (rule) => rule.max(5),
    }),
  ],
  preview: {
    select: { subtitle: 'headline' },
    prepare({ subtitle }) {
      return { title: 'Side project section', subtitle }
    },
  },
})
