import type { FamilyMember } from '../family/types'
import type { Food, MealReaction, MealTone } from '../food/types'
import type { MealKey as BudgetKey } from '../food/budget'

export type MealKey = 'breakfast' | 'lunch' | 'snack' | 'dinner'
export type ServedKey = MealKey | 'schoolLunch'

export type KitchenState =
  | 'hub'
  | 'planning-breakfast' | 'packing-school-lunch' | 'planning-lunch' | 'planning-snack' | 'planning-dinner'
  | 'end-of-day' | 'budgets' | 'family-settings' | 'kitchen-select' | 'tutorial'

export type MealConfig = {
  key: MealKey
  label: string
  emoji: string
  planState: KitchenState
  hasPlate: (m: FamilyMember) => boolean
  isRequired: (m: FamilyMember) => boolean
  serveLabel: string
}

export const MEAL_CONFIG: Record<MealKey, MealConfig> = {
  breakfast: {
    key: 'breakfast', label: 'breakfast', emoji: '🍳', planState: 'planning-breakfast',
    hasPlate: () => true, isRequired: () => true, serveLabel: '🍽 Serve breakfast',
  },
  lunch: {
    key: 'lunch', label: 'lunch', emoji: '🥗', planState: 'planning-lunch',
    hasPlate: () => true, isRequired: (m) => m.profile.lifeStage !== 'child', serveLabel: '🥗 Serve lunch',
  },
  snack: {
    key: 'snack', label: 'snack', emoji: '🍪', planState: 'planning-snack',
    hasPlate: () => true, isRequired: () => false, serveLabel: '🍪 Serve snack',
  },
  dinner: {
    key: 'dinner', label: 'dinner', emoji: '🍝', planState: 'planning-dinner',
    hasPlate: () => true, isRequired: () => true, serveLabel: '🍝 Serve dinner',
  },
}

export const BUDGET_LABELS: Record<BudgetKey, { emoji: string; label: string }> = {
  breakfast:   { emoji: '🍳', label: 'Breakfast' },
  schoolLunch: { emoji: '🎒', label: 'School lunch (per child)' },
  lunch:       { emoji: '🥗', label: 'Lunch at home' },
  snack:       { emoji: '🍪', label: 'Snack' },
  dinner:      { emoji: '🍝', label: 'Dinner' },
}

export function currentMealKey(state: KitchenState): MealKey | null {
  for (const meal of Object.values(MEAL_CONFIG)) if (state === meal.planState) return meal.key
  return null
}

export const reactionFor = (member: FamilyMember, food: Food): MealReaction =>
  food.reactions[member.profile.lifeStage]

const TONE_ORDER: MealTone[] = ['bad', 'poor', 'okay', 'ideal']
const worstTone = (tones: MealTone[]): MealTone => {
  for (const t of TONE_ORDER) if (tones.includes(t)) return t
  return 'ideal'
}

const COMBO_TONE_MESSAGE: Record<MealTone, string> = {
  ideal: 'Yum! Great plate.',
  okay:  'Decent combo.',
  poor:  'Not the right mix for me.',
  bad:   "There's something here I can't eat!",
}

/** Reaction to a whole plate: single food = its own reaction;
 *  combo = worst tone wins (one unsafe item spoils the plate). */
export function plateReaction(member: FamilyMember, foods: Food[]): MealReaction | null {
  if (foods.length === 0) return null
  if (foods.length === 1) return reactionFor(member, foods[0])
  const reactions = foods.map(f => reactionFor(member, f))
  const tone = worstTone(reactions.map(r => r.tone))
  const emojis = foods.map(f => f.emoji).join(' ')
  return { tone, message: `${emojis} — ${COMBO_TONE_MESSAGE[tone]}` }
}

export function dayMarkerFor(state: KitchenState): string {
  if (state === 'hub') return 'Kitchen'
  if (state === 'planning-breakfast') return '🍳 Breakfast'
  if (state === 'packing-school-lunch') return '🎒 School lunch'
  if (state === 'planning-lunch') return '🥗 Midday lunch'
  if (state === 'planning-snack') return '🍪 Snack'
  if (state === 'planning-dinner') return '🍝 Dinner'
  if (state === 'end-of-day') return '🌙 Bedtime'
  if (state === 'budgets') return '⚙ Budgets'
  if (state === 'family-settings') return '👨‍👩‍👧 Family'
  if (state === 'kitchen-select') return '🌍 Kitchens'
  if (state === 'tutorial') return '❔ How to play'
  return 'Day'
}
