export type LifeStage = 'baby' | 'child' | 'adult' | 'elder'

export type BiologicalProfile = {
  lifeStage: LifeStage
  dailyCalories: number      // target intake (cal/day)
  bmrPerHour: number          // basal metabolic rate at rest (cal/hour)
  activityCalories: number    // typical extra cal/day from sustained activity
                              // (school for the child, work for the adult, etc.)
}

export type FamilyMember = {
  id: string
  name: string
  emoji: string
  profile: BiologicalProfile
  morningGreeting: string
}
