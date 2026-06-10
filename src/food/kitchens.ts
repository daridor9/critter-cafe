import type { Food } from './types'
import { defaultPantry } from './pantry'
import { eastAsianPantry } from './pantryEastAsian'
import { latinPantry } from './pantryLatin'
import { levantPantry } from './pantryLevant'

export type KitchenId = 'mediterranean' | 'eastAsian' | 'latin' | 'levant'

export type Kitchen = {
  id: KitchenId
  name: string
  emoji: string
  tagline: string
  pantry: Food[]
}

export const KITCHENS: Record<KitchenId, Kitchen> = {
  mediterranean: {
    id: 'mediterranean',
    name: 'Mediterranean Kitchen',
    emoji: '🫒',
    tagline: 'Olive oil, fish, beans, and fresh vegetables — famously heart-healthy.',
    pantry: defaultPantry,
  },
  eastAsian: {
    id: 'eastAsian',
    name: 'East Asian Kitchen',
    emoji: '🍜',
    tagline: 'Rice, noodles, soy, and fish — light, balanced, and full of variety.',
    pantry: eastAsianPantry,
  },
  latin: {
    id: 'latin',
    name: 'Latin American Kitchen',
    emoji: '🌮',
    tagline: 'Beans + rice = complete protein. Corn, avocado, and bright flavors.',
    pantry: latinPantry,
  },
  levant: {
    id: 'levant',
    name: 'Levantine Kitchen',
    emoji: '🥙',
    tagline: 'Hummus, tahini, pita, and fresh chopped salads — the Eastern Mediterranean home table.',
    pantry: levantPantry,
  },
}

export const DEFAULT_KITCHEN: KitchenId = 'mediterranean'
