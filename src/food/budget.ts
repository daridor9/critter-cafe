// The economy: money is spent at the market (stocking the pantry),
// cooking costs time. Each meal has a time budget; shopping has a
// daily money allowance. Unspent money carries over to tomorrow.

export type MealKey = 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'schoolLunch'

export const DEFAULT_MEAL_MINUTES: Record<MealKey, number> = {
  breakfast:   20,
  schoolLunch: 8,   // per child
  lunch:       30,
  snack:       8,
  dinner:      50,
}

export const DEFAULT_DAILY_MONEY = 40

export const MONEY_LIMITS   = { min: 10, max: 150, step: 5 }
export const MINUTES_LIMITS = { min: 1,  max: 120, step: 5 }
