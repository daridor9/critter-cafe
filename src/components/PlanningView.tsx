import { useState } from 'react'
import type { Food } from '../food/types'
import { KITCHENS, type KitchenId } from '../food/kitchens'
import './PlanningView.css'

export type MealTotals = { calories: number; protein: number; carbs: number; fat: number }

type Props = {
  ariaLabel: string
  homeKitchen: KitchenId
  selectedFoodId: string | null
  onSelectFood: (id: string) => void
  disableUnpackable: boolean
  /** Servings of this food still available to assign (stock minus reservations). */
  availableOf: (food: Food) => number
  /** True if some owned units of this food spoil by tomorrow morning. */
  useSoonOf: (food: Food) => boolean
  timeBudget: number
  totalMinutes: number
  overTime: boolean
  budgetLabel: string
  totals: MealTotals
  hint: string
  canServe: boolean
  serveLabel: string
  onServe: () => void
  onBack: () => void
  onMarket: () => void
}

export function PlanningView({
  ariaLabel, homeKitchen, selectedFoodId, onSelectFood, disableUnpackable, availableOf, useSoonOf,
  timeBudget, totalMinutes, overTime, budgetLabel,
  totals, hint, canServe, serveLabel, onServe, onBack, onMarket,
}: Props) {
  // Mixing cuisines is real life: tabs flip between pantries mid-meal.
  // Component remounts per planning session, so the tab opens on the
  // player's home kitchen each time.
  const [tab, setTab] = useState<KitchenId>(homeKitchen)
  const pantry = KITCHENS[tab].pantry

  return (
    <section className="pantry" aria-label={ariaLabel}>
      <div className="budget-bar" aria-label="Budget tracker">
        <span className={overTime ? 'budget-over' : ''}>⏱ {totalMinutes} / {timeBudget} min</span>
        <span className="budget-label">{budgetLabel}</span>
      </div>
      <div className="meal-totals" aria-label="Meal nutrition totals">
        <span className="meal-totals-label">Total this meal:</span>
        <span className="meal-totals-cal">🔥 {totals.calories} cal</span>
        <span className="macro-pill macro-protein">P {totals.protein}g</span>
        <span className="macro-pill macro-carbs">C {totals.carbs}g</span>
        <span className="macro-pill macro-fat">F {totals.fat}g</span>
      </div>
      <p className="pantry-hint">{hint}</p>
      <div className="pantry-tabs" role="tablist" aria-label="Kitchens">
        {Object.values(KITCHENS).map(k => (
          <button
            key={k.id}
            type="button"
            role="tab"
            aria-selected={tab === k.id}
            className={`pantry-tab ${tab === k.id ? 'pantry-tab-active' : ''}`}
            onClick={() => setTab(k.id)}
          >
            <span aria-hidden="true">{k.emoji}</span>
            <span className="pantry-tab-name">{k.name.replace(' Kitchen', '')}</span>
          </button>
        ))}
      </div>
      <div className="pantry-row">
        {pantry.map(food => (
          <PantryItem
            key={food.id}
            food={food}
            selected={selectedFoodId === food.id}
            unpackable={disableUnpackable && !food.packable}
            available={availableOf(food)}
            useSoon={useSoonOf(food)}
            onSelect={() => onSelectFood(food.id)}
          />
        ))}
      </div>
      <div className="kitchen-actions">
        <button type="button" className="primary-action" onClick={onServe} disabled={!canServe}>{serveLabel}</button>
        <button type="button" className="secondary-action" onClick={onMarket}>🛒 Market</button>
        <button type="button" className="secondary-action" onClick={onBack}>← Back to kitchen</button>
      </div>
    </section>
  )
}

type PantryItemProps = {
  food: Food
  selected: boolean
  unpackable: boolean
  available: number
  useSoon: boolean
  onSelect: () => void
}

function PantryItem({ food, selected, unpackable, available, useSoon, onSelect }: PantryItemProps) {
  const outOfStock = available <= 0
  const disabled = unpackable || outOfStock
  const className = [
    'pantry-item',
    selected ? 'pantry-item-selected' : '',
    disabled ? 'pantry-item-disabled' : '',
  ].filter(Boolean).join(' ')

  const title = unpackable ? "Doesn't travel well in a lunchbox"
    : outOfStock ? 'Out of stock — visit the 🛒 Market'
    : undefined

  return (
    <button type="button" className={className}
      onClick={() => !disabled && onSelect()} disabled={disabled}
      aria-pressed={selected}
      aria-label={unpackable ? `${food.name} — doesn't travel well, can't pack`
        : outOfStock ? `${food.name} — out of stock, buy more at the market`
        : `${food.name}, ${available} in pantry: ${food.calories} calories, ${food.protein}g protein, ${food.carbs}g carbs, ${food.fat}g fat. Takes ${food.prepMinutes} minutes.`}
      title={title}>
      <span className="pantry-stock-badge" aria-hidden="true">×{available}</span>
      {useSoon && available > 0 && (
        <span className="pantry-use-soon" title="Spoils tomorrow — use it today!">⏳ use today!</span>
      )}
      <span className="pantry-item-emoji" aria-hidden="true">{food.emoji}</span>
      <span className="pantry-item-name">{food.name}</span>
      <span className="pantry-item-meta" aria-hidden="true">🔥 {food.calories} cal · ⏱ {food.prepMinutes}m</span>
      <span className="pantry-item-macros" aria-hidden="true">
        <span className="macro-pill macro-protein">P {food.protein}g</span>
        <span className="macro-pill macro-carbs">C {food.carbs}g</span>
        <span className="macro-pill macro-fat">F {food.fat}g</span>
      </span>
    </button>
  )
}
