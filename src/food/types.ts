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
  reactions: Record<LifeStage, MealReaction>
}
