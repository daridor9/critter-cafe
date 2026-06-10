import type { LifeStage } from '../family/types'

export type MealTone = 'ideal' | 'okay' | 'poor' | 'bad'

export type MealReaction = {
  tone: MealTone
  message: string
}

export type Food = {
  id: string
  name: string
  emoji: string
  cost: number         // in coins
  prepMinutes: number  // active hands-on prep time
  packable: boolean    // survives in a lunchbox?
  calories: number     // per serving
  protein: number      // grams per serving
  carbs: number        // grams per serving
  fat: number          // grams per serving
  funFact?: string     // shown on the Nutrient-dex card once discovered
  reactions: Record<LifeStage, MealReaction>
}
