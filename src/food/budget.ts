export type MealBudget = {
  coins: number
  minutes: number
}

export type MealKey = 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'schoolLunch'

// Generous-but-still-constraining defaults. Player can tweak in-game via
// the ⚙ Adjust budgets settings page.
export const DEFAULT_BUDGETS: Record<MealKey, MealBudget> = {
  breakfast:   { coins: 12, minutes: 20 },
  schoolLunch: { coins: 5,  minutes: 8  },
  lunch:       { coins: 15, minutes: 30 },
  snack:       { coins: 6,  minutes: 8  },
  dinner:      { coins: 20, minutes: 50 },
}

export const dailyBudgets = DEFAULT_BUDGETS

export const BUDGET_LIMITS = {
  coins:   { min: 1, max: 50, step: 1 },
  minutes: { min: 1, max: 120, step: 5 },
}
