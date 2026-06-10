import type { BiologicalProfile, LifeStage } from './types'

// Per-stage defaults used when the player adds a new family member.
// Same physiology values as the starting family.

export const STAGE_PROFILES: Record<LifeStage, Omit<BiologicalProfile, 'lifeStage'>> = {
  baby:  { dailyCalories: 700,  bmrPerHour: 25, activityCalories: 100, dailyProtein: 15, dailyCarbs: 90,  dailyFat: 30 },
  child: { dailyCalories: 1800, bmrPerHour: 50, activityCalories: 600, dailyProtein: 40, dailyCarbs: 250, dailyFat: 70 },
  adult: { dailyCalories: 2200, bmrPerHour: 65, activityCalories: 700, dailyProtein: 60, dailyCarbs: 290, dailyFat: 75 },
  elder: { dailyCalories: 1800, bmrPerHour: 55, activityCalories: 500, dailyProtein: 50, dailyCarbs: 230, dailyFat: 60 },
}

export const STAGE_DEFAULTS: Record<LifeStage, { emoji: string; label: string; greeting: string }> = {
  baby:  { emoji: '👶', label: 'Baby',  greeting: 'Bah! 🍼' },
  child: { emoji: '🧒', label: 'Child', greeting: "I'm starving! 🥞" },
  adult: { emoji: '🧑', label: 'Adult', greeting: 'Morning. What are we having?' },
  elder: { emoji: '🧓', label: 'Elder', greeting: 'Something gentle today, please.' },
}

export const EMOJI_BY_STAGE: Record<LifeStage, string[]> = {
  baby:  ['👶', '👶🏻', '👶🏽', '👶🏾'],
  child: ['🧒', '👦', '👧', '🧒🏻', '🧒🏽', '🧒🏾'],
  adult: ['🧑', '👨', '👩', '🧑🏻', '🧑🏽', '🧑🏾', '👨‍🦱', '👩‍🦰'],
  elder: ['🧓', '👴', '👵', '🧓🏻', '🧓🏽', '🧓🏾'],
}

export const MAX_FAMILY_SIZE = 8
