import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // false because pages are statically generated with ISR (revalidate: 3600)
  // and sanityFetch drives live updates — the CDN would serve stale content.
  useCdn: false,
})
