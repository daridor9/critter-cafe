export type LifeStage = 'baby' | 'child' | 'adult' | 'elder'

export type BiologicalProfile = {
  lifeStage: LifeStage
  dailyCalories: number      // target intake (cal/day)
  bmrPerHour: number          // basal metabolic rate at rest (cal/hour)
  activityCalories: number    // typical extra cal/day from sustained activity
  // Macro targets per day (grams). Real-world rounded values.
  dailyProtein: number
  dailyCarbs: number
  dailyFat: number
}

export type FamilyMember = {
  id: string
  name: string
  emoji: string
  profile: BiologicalProfile
  morningGreeting: string
}
