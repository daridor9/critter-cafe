import type { FamilyMember } from './types'

export const defaultFamily: FamilyMember[] = [
  {
    id: 'baby',
    name: 'Baby',
    emoji: '👶',
    profile: { lifeStage: 'baby' },
    morningGreeting: 'Bah! 🍼',
  },
  {
    id: 'child',
    name: 'Child',
    emoji: '🧒',
    profile: { lifeStage: 'child' },
    morningGreeting: "I'm starving! 🥞",
  },
  {
    id: 'adult',
    name: 'Adult',
    emoji: '🧑',
    profile: { lifeStage: 'adult' },
    morningGreeting: 'Coffee, then strategy.',
  },
  {
    id: 'elder',
    name: 'Elder',
    emoji: '🧓',
    profile: { lifeStage: 'elder' },
    morningGreeting: 'Slept poorly. Something gentle today.',
  },
]
