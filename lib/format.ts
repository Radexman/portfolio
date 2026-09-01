/**
 * Data shaping shared by the project cards. Promoted out of
 * `FeaturedProjectCard` when the side project block needed `hostnameOf` too —
 * a second copy of the link-row logic is how the two rows drift apart.
 */

/** The lead sentence of a `problem` field, used as the one-line card summary. */
export function firstSentence(text: string) {
  const match = /^[\s\S]*?[.!?](?=\s|$)/.exec(text.trim())
  return (match ? match[0] : text.trim()).trim()
}

/** A live URL as a bare domain. Falls back to the raw string if unparseable. */
export function hostnameOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}
