export type LifeStage = 'baby' | 'child' | 'adult' | 'elder'

export type BiologicalProfile = {
  lifeStage: LifeStage
}

export type FamilyMember = {
  id: string
  name: string
  emoji: string
  profile: BiologicalProfile
  morningGreeting: string
}
