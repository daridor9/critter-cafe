import type { FamilyMember } from './types'

// Calorie + macro targets per life stage — real-world rounded.
// BMR * 24h + activity ≈ daily calorie target.

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
      dailyProtein: 15,
      dailyCarbs: 90,
      dailyFat: 30,
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
      activityCalories: 600,
      dailyProtein: 40,
      dailyCarbs: 250,
      dailyFat: 70,
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
      activityCalories: 700,
      dailyProtein: 60,
      dailyCarbs: 290,
      dailyFat: 75,
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
      activityCalories: 500,
      dailyProtein: 50,
      dailyCarbs: 230,
      dailyFat: 60,
    },
    morningGreeting: 'Slept poorly. Something gentle today.',
  },
]
