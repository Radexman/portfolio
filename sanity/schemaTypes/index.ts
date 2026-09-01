import { type SchemaTypeDefinition } from 'sanity'

import { featuredWorkSection } from './documents/featuredWorkSection'
import { heroSection } from './documents/heroSection'
import { project } from './documents/project'
import { sideProjectSection } from './documents/sideProjectSection'
import { technology } from './documents/technology'
import { ctaLink } from './objects/ctaLink'
import { currentFocus } from './objects/currentFocus'
import { inspectionStep } from './objects/inspectionStep'
import { socialLink } from './objects/socialLink'
import { stat } from './objects/stat'
import { statusBadge } from './objects/statusBadge'
import { tickerItem } from './objects/tickerItem'
import { triptychImage } from './objects/triptychImage'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    // documents
    heroSection,
    featuredWorkSection,
    sideProjectSection,
    project,
    technology,
    // objects
    ctaLink,
    currentFocus,
    inspectionStep,
    socialLink,
    stat,
    statusBadge,
    tickerItem,
    triptychImage,
  ],
}
