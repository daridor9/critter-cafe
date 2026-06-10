import type { FamilyMember } from '../family/types'
import type { EnergyStatus } from '../family/energy'
import type { MealBudget, MealKey as BudgetKey } from '../food/budget'
import type { KitchenId } from '../food/kitchens'
import type { MealKey, ServedKey } from './meals'

export type Plate = string[]  // food IDs
export type MealAssignmentsMap = Record<MealKey, Record<string, Plate>>

// Version 3 schema. dexSeen and carryOver were added later but are
// optional-on-load (default [] / {}), so no version bump was needed.
export type SavedState = {
  version: number
  mealAssignments: MealAssignmentsMap
  schoolLunches: Record<string, Plate>
  mealsServed: Record<ServedKey, boolean>
  budgets: Record<BudgetKey, MealBudget>
  family: FamilyMember[]
  kitchenId: KitchenId
  day: number
  tutorialSeen: boolean
  dexSeen: string[]                         // food IDs ever served (Nutrient-dex)
  carryOver: Record<string, EnergyStatus>   // yesterday's end status per member
}

const STORAGE_KEY = 'critter-cafe-state'
const STORAGE_VERSION = 3

export const emptyMealAssignments = (): MealAssignmentsMap =>
  ({ breakfast: {}, lunch: {}, snack: {}, dinner: {} })

export const initialServed = (): Record<ServedKey, boolean> =>
  ({ breakfast: false, schoolLunch: false, lunch: false, snack: false, dinner: false })

export function loadSaved(): Partial<SavedState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as SavedState
    if (parsed.version !== STORAGE_VERSION) return {}
    return parsed
  } catch { return {} }
}

export function saveState(data: Omit<SavedState, 'version'>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, ...data }))
  } catch {}
}

let _idCounter = 0
export const makeId = (): string =>
  globalThis.crypto?.randomUUID?.() ?? `m-${Date.now()}-${_idCounter++}`
