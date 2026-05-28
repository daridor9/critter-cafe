export type MealBudget = {
  coins: number
  minutes: number
}

export type MealKey = 'breakfast' | 'lunch' | 'dinner' | 'schoolLunch'

export const dailyBudgets: Record<MealKey, MealBudget> = {
  breakfast:   { coins: 8,  minutes: 15 },
  lunch:       { coins: 10, minutes: 25 },
  dinner:      { coins: 14, minutes: 45 },
  schoolLunch: { coins: 3,  minutes: 5  },  // packed lunch, just the child
}
