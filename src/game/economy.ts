import type { Food } from '../food/types'
import { shelfLifeOf } from '../food/shelfLife'

// Pantry stock as dated batches: each purchase remembers the day it was
// bought and the price paid. Cooking consumes oldest-first (real-life
// skill); returns refund newest-first at the price actually paid (no
// buy-on-sale-refund-at-full-price arbitrage); mornings expire anything
// past its shelf life.

export type Batch = { day: number; n: number; paid: number }
export type StockBatches = Record<string, Batch[]>

export const ownedCount = (stock: StockBatches, foodId: string): number =>
  (stock[foodId] ?? []).reduce((s, b) => s + b.n, 0)

export const totalUnits = (stock: StockBatches): number =>
  Object.values(stock).reduce((s, list) => s + list.reduce((x, b) => x + b.n, 0), 0)

export function addPurchase(stock: StockBatches, foodId: string, day: number, paid: number): StockBatches {
  const list = [...(stock[foodId] ?? [])]
  const last = list[list.length - 1]
  if (last && last.day === day && last.paid === paid) {
    list[list.length - 1] = { ...last, n: last.n + 1 }
  } else {
    list.push({ day, n: 1, paid })
  }
  return { ...stock, [foodId]: list }
}

/** Return one unit (newest batch first). Yields the refund actually paid. */
export function removeNewest(stock: StockBatches, foodId: string): { next: StockBatches; refund: number } | null {
  const list = stock[foodId] ?? []
  if (list.length === 0) return null
  const newest = list[list.length - 1]
  const refund = newest.paid
  const nextList = newest.n > 1
    ? [...list.slice(0, -1), { ...newest, n: newest.n - 1 }]
    : list.slice(0, -1)
  return { next: { ...stock, [foodId]: nextList }, refund }
}

/** Consume served units, oldest batches first. */
export function consumeFIFO(stock: StockBatches, foodIds: string[]): StockBatches {
  const next: StockBatches = { ...stock }
  for (const id of foodIds) {
    const list = [...(next[id] ?? [])]
    if (list.length === 0) continue
    const oldest = list[0]
    if (oldest.n > 1) list[0] = { ...oldest, n: oldest.n - 1 }
    else list.shift()
    next[id] = list
  }
  return next
}

export type SpoiledItem = { foodId: string; n: number; coinsWasted: number }

/** Bin everything past its shelf life as of `today`.
 *  A batch bought on day D with shelf life S is good through day D+S-1. */
export function expireBatches(stock: StockBatches, today: number): { next: StockBatches; spoiled: SpoiledItem[] } {
  const next: StockBatches = {}
  const spoiled: SpoiledItem[] = []
  for (const [foodId, list] of Object.entries(stock)) {
    const shelf = shelfLifeOf(foodId)
    const keep: Batch[] = []
    let n = 0, coins = 0
    for (const b of list) {
      if (today - b.day >= shelf) { n += b.n; coins += b.n * b.paid }
      else keep.push(b)
    }
    if (keep.length > 0) next[foodId] = keep
    if (n > 0) spoiled.push({ foodId, n, coinsWasted: coins })
  }
  return { next, spoiled }
}

/** True if any owned batch of this food will spoil by tomorrow morning. */
export function expiresTomorrow(stock: StockBatches, foodId: string, today: number): boolean {
  const shelf = shelfLifeOf(foodId)
  if (!Number.isFinite(shelf)) return false
  return (stock[foodId] ?? []).some(b => (today + 1) - b.day >= shelf)
}

// ---- daily specials ----
// Deterministic from the day number: same day, same deals. The kid-sized
// version of seasonal prices — teaches opportunistic shopping.
export function specialsForDay(day: number, foods: Food[], count = 3): Set<string> {
  // 1-coin foods can't get cheaper — only pricier items go on sale.
  const pool = foods.filter(f => f.cost >= 2)
  const ids = new Set<string>()
  let i = 0
  while (ids.size < count && i < pool.length * 2) {
    ids.add(pool[(day * 7 + i * 13) % pool.length].id)
    i++
  }
  return ids
}

export const priceOf = (food: Food, specials: ReadonlySet<string>): number =>
  specials.has(food.id) ? Math.max(1, Math.ceil(food.cost / 2)) : food.cost
