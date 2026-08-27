'use client'

/**
 * This configuration is used to for the Sanity Studio that’s mounted on the `\app\studio\[[...tool]]\page.tsx` route
 */

import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import { apiVersion, dataset, projectId } from './sanity/env'
import { schema } from './sanity/schemaTypes'
import { SINGLETON_TYPES, structure } from './sanity/structure'

/** Actions that make no sense on a document that must exist exactly once. */
const SINGLETON_DISABLED_ACTIONS = ['duplicate', 'delete', 'unpublish'] as const

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  // Add and edit the content schema in the './sanity/schemaTypes' folder
  schema,
  document: {
    // Singletons are reachable only through the structure entry, so drop the
    // actions that would create a second copy or remove the only one.
    actions: (prev, context) =>
      SINGLETON_TYPES.includes(
        context.schemaType as (typeof SINGLETON_TYPES)[number]
      )
        ? prev.filter(
            (action) =>
              !SINGLETON_DISABLED_ACTIONS.includes(
                action.action as (typeof SINGLETON_DISABLED_ACTIONS)[number]
              )
          )
        : prev,
    // Keep singletons out of the global "create new" menu.
    newDocumentOptions: (prev) =>
      prev.filter(
        (template) =>
          !SINGLETON_TYPES.includes(
            template.templateId as (typeof SINGLETON_TYPES)[number]
          )
      ),
  },
  plugins: [
    structureTool({ structure }),
    // Vision is for querying with GROQ from inside the Studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({ defaultApiVersion: apiVersion }),
  ],
})
