// Querying with "sanityFetch" will keep content automatically updated
// Before using it, import and render "<SanityLive />" in your layout, see
// https://github.com/sanity-io/next-sanity#live-content-api for more information.
import { defineLive } from 'next-sanity/live'

import { client } from './client'

/**
 * The `portfolio` dataset is public, so published content reads without
 * credentials — which is what `sanityFetch` assumes: it withholds the token
 * for the default `published` perspective. `serverToken` is here for drafts
 * and release versions, and is never shared with the browser.
 */
export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: process.env.SANITY_API_READ_TOKEN,
  // Live-previewing drafts standalone would mean shipping a token to the
  // browser. Drafts are previewed through the Studio's Presentation tool
  // instead, so opt out explicitly rather than living with the warning.
  browserToken: false,
})
