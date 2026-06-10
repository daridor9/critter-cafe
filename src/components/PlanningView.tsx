import type { Food } from '../food/types'
import type { MealBudget } from '../food/budget'
import './PlanningView.css'

export type MealTotals = { calories: number; protein: number; carbs: number; fat: number }

type Props = {
  ariaLabel: string
  pantry: Food[]
  selectedFoodId: string | null
  onSelectFood: (id: string) => void
  disableUnpackable: boolean
  budget: MealBudget
  totalCost: number
  totalMinutes: number
  overBudget: boolean
  overTime: boolean
  budgetLabel: string
  totals: MealTotals
  hint: string
  canServe: boolean
  serveLabel: string
  onServe: () => void
  onBack: () => void
}

export function PlanningView({
  ariaLabel, pantry, selectedFoodId, onSelectFood, disableUnpackable,
  budget, totalCost, totalMinutes, overBudget, overTime, budgetLabel,
  totals, hint, canServe, serveLabel, onServe, onBack,
}: Props) {
  return (
    <section className="pantry" aria-label={ariaLabel}>
      <div className="budget-bar" aria-label="Budget tracker">
        <span className={overBudget ? 'budget-over' : ''}>💰 {totalCost} / {budget.coins}</span>
        <span className="budget-divider" aria-hidden="true">·</span>
        <span className={overTime ? 'budget-over' : ''}>⏱ {totalMinutes} / {budget.minutes} min</span>
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
      <div className="pantry-row">
        {pantry.map(food => (
          <PantryItem
            key={food.id}
            food={food}
            selected={selectedFoodId === food.id}
            disabled={disableUnpackable && !food.packable}
            onSelect={() => onSelectFood(food.id)}
          />
        ))}
      </div>
      <div className="kitchen-actions">
        <button type="button" className="primary-action" onClick={onServe} disabled={!canServe}>{serveLabel}</button>
        <button type="button" className="secondary-action" onClick={onBack}>← Back to kitchen</button>
      </div>
    </section>
  )
}

type PantryItemProps = { food: Food; selected: boolean; disabled: boolean; onSelect: () => void }

function PantryItem({ food, selected, disabled, onSelect }: PantryItemProps) {
  const className = ['pantry-item', selected ? 'pantry-item-selected' : '', disabled ? 'pantry-item-disabled' : ''].filter(Boolean).join(' ')
  return (
    <button type="button" className={className}
      onClick={() => !disabled && onSelect()} disabled={disabled}
      aria-pressed={selected}
      aria-label={disabled ? `${food.name} — doesn't travel well, can't pack`
        : `${food.name}: ${food.calories} calories, ${food.protein}g protein, ${food.carbs}g carbs, ${food.fat}g fat. Costs ${food.cost} coins, takes ${food.prepMinutes} minutes.`}
      title={disabled ? "Doesn't travel well in a lunchbox" : undefined}>
      <span className="pantry-item-emoji" aria-hidden="true">{food.emoji}</span>
      <span className="pantry-item-name">{food.name}</span>
      <span className="pantry-item-meta" aria-hidden="true">🔥 {food.calories} cal · 💰 {food.cost} · ⏱ {food.prepMinutes}m</span>
      <span className="pantry-item-macros" aria-hidden="true">
        <span className="macro-pill macro-protein">P {food.protein}g</span>
        <span className="macro-pill macro-carbs">C {food.carbs}g</span>
        <span className="macro-pill macro-fat">F {food.fat}g</span>
      </span>
    </button>
  )
}
