import { type SchemaTypeDefinition } from 'sanity'

import { heroSection } from './documents/heroSection'
import { ctaLink } from './objects/ctaLink'
import { currentFocus } from './objects/currentFocus'
import { socialLink } from './objects/socialLink'
import { stat } from './objects/stat'
import { statusBadge } from './objects/statusBadge'
import { tickerItem } from './objects/tickerItem'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    // documents
    heroSection,
    // objects
    ctaLink,
    currentFocus,
    socialLink,
    stat,
    statusBadge,
    tickerItem,
  ],
}
