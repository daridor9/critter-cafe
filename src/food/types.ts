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
  cost: number         // in coins (simple abstract currency)
  prepMinutes: number  // active hands-on prep time
  reactions: Record<LifeStage, MealReaction>
}
