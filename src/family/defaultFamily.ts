import type { FamilyMember } from './types'

// Values chosen so BMR * 24h + activity ≈ daily calorie target,
// matching real-world physiology in round, kid-friendly numbers.

export const defaultFamily: FamilyMember[] = [
  {
    id: 'baby',
    name: 'Baby',
    emoji: '👶',
    profile: {
      lifeStage: 'baby',
      dailyCalories: 700,
      bmrPerHour: 25,
      activityCalories: 100,
    },
    morningGreeting: 'Bah! 🍼',
  },
  {
    id: 'child',
    name: 'Child',
    emoji: '🧒',
    profile: {
      lifeStage: 'child',
      dailyCalories: 1800,
      bmrPerHour: 50,
      activityCalories: 600,  // school play + general kid energy
    },
    morningGreeting: "I'm starving! 🥞",
  },
  {
    id: 'adult',
    name: 'Adult',
    emoji: '🧑',
    profile: {
      lifeStage: 'adult',
      dailyCalories: 2200,
      bmrPerHour: 65,
      activityCalories: 700,  // work + commute + life
    },
    morningGreeting: 'Coffee, then strategy.',
  },
  {
    id: 'elder',
    name: 'Elder',
    emoji: '🧓',
    profile: {
      lifeStage: 'elder',
      dailyCalories: 1800,
      bmrPerHour: 55,
      activityCalories: 500,  // walking, gardening, slower pace
    },
    morningGreeting: 'Slept poorly. Something gentle today.',
  },
]
