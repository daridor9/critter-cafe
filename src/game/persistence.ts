import type { FamilyMember } from '../family/types'
import type { EnergyStatus } from '../family/energy'
import { DEFAULT_MEAL_MINUTES, DEFAULT_DAILY_MONEY, type MealKey as BudgetKey } from '../food/budget'
import type { KitchenId } from '../food/kitchens'
import type { MealKey, ServedKey } from './meals'

export type Plate = string[]  // food IDs
export type MealAssignmentsMap = Record<MealKey, Record<string, Plate>>

export type SavedState = {
  version: number
  mealAssignments: MealAssignmentsMap
  schoolLunches: Record<string, Plate>
  mealsServed: Record<ServedKey, boolean>
  mealMinutes: Record<BudgetKey, number>
  dailyMoney: number
  wallet: number
  stock: Record<string, number>          // foodId -> servings owned
  dayStartWallet: number                  // snapshots for "reset day" rollback
  dayStartStock: Record<string, number>
  family: FamilyMember[]
  kitchenId: KitchenId
  day: number
  tutorialSeen: boolean
  dexSeen: string[]
  carryOver: Record<string, EnergyStatus>
}

const STORAGE_KEY = 'critter-cafe-state'
const STORAGE_VERSION = 4

export const emptyMealAssignments = (): MealAssignmentsMap =>
  ({ breakfast: {}, lunch: {}, snack: {}, dinner: {} })

export const initialServed = (): Record<ServedKey, boolean> =>
  ({ breakfast: false, schoolLunch: false, lunch: false, snack: false, dinner: false })

/** v3 saves predate the market economy (per-meal coin budgets, no stock).
 *  Migrate what's precious — family, kitchen, day, tutorial, dex, carry-over —
 *  and start the current day fresh with an empty pantry and a full wallet. */
type SavedStateV3 = {
  version: number
  budgets?: Record<BudgetKey, { coins: number; minutes: number }>
  family?: FamilyMember[]
  kitchenId?: KitchenId
  day?: number
  tutorialSeen?: boolean
  dexSeen?: string[]
  carryOver?: Record<string, EnergyStatus>
}

function migrateV3(old: SavedStateV3): Partial<SavedState> {
  const mealMinutes = { ...DEFAULT_MEAL_MINUTES }
  if (old.budgets) {
    for (const key of Object.keys(mealMinutes) as BudgetKey[]) {
      const m = old.budgets[key]?.minutes
      if (typeof m === 'number') mealMinutes[key] = m
    }
  }
  return {
    family: old.family,
    kitchenId: old.kitchenId,
    day: old.day,
    tutorialSeen: old.tutorialSeen,
    dexSeen: old.dexSeen,
    carryOver: old.carryOver,
    mealMinutes,
    dailyMoney: DEFAULT_DAILY_MONEY,
    wallet: DEFAULT_DAILY_MONEY,
    dayStartWallet: DEFAULT_DAILY_MONEY,
    stock: {},
    dayStartStock: {},
  }
}

export function loadSaved(): Partial<SavedState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as SavedState
    if (parsed.version === STORAGE_VERSION) return parsed
    if (parsed.version === 3) return migrateV3(parsed as unknown as SavedStateV3)
    return {}
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
