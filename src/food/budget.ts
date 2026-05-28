export type MealBudget = {
  coins: number
  minutes: number
}

export const dailyBudgets: Record<'breakfast' | 'lunch' | 'dinner', MealBudget> = {
  breakfast: { coins: 8, minutes: 15 },
  lunch:     { coins: 10, minutes: 25 },
  dinner:    { coins: 14, minutes: 45 },
}
