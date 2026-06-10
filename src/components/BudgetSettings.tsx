import type { MealBudget, MealKey as BudgetKey } from '../food/budget'
import { BUDGET_LIMITS } from '../food/budget'
import { BUDGET_LABELS } from '../game/meals'
import './BudgetSettings.css'

type Props = {
  budgets: Record<BudgetKey, MealBudget>
  onUpdate: (key: BudgetKey, field: 'coins' | 'minutes', delta: number) => void
  onReset: () => void
  onBack: () => void
}

const BUDGET_ORDER: BudgetKey[] = ['breakfast', 'schoolLunch', 'lunch', 'snack', 'dinner']

export function BudgetSettings({ budgets, onUpdate, onReset, onBack }: Props) {
  return (
    <section className="budget-settings" aria-label="Budget settings">
      <h2 className="budget-settings-title">⚙ Adjust your daily budgets</h2>
      <p className="budget-settings-hint">Bigger budget = more freedom; tighter budget = harder puzzle. School lunch budget is per child.</p>
      <ul className="budget-list">
        {BUDGET_ORDER.map(key => {
          const cfg = BUDGET_LABELS[key]
          const b = budgets[key]
          return (
            <li key={key} className="budget-row">
              <span className="budget-meal-label"><span aria-hidden="true">{cfg.emoji}</span> {cfg.label}</span>
              <BudgetStepper icon="💰" unit="coins" value={b.coins}
                onDec={() => onUpdate(key, 'coins', -BUDGET_LIMITS.coins.step)} onInc={() => onUpdate(key, 'coins', BUDGET_LIMITS.coins.step)}
                canDec={b.coins > BUDGET_LIMITS.coins.min} canInc={b.coins < BUDGET_LIMITS.coins.max} />
              <BudgetStepper icon="⏱" unit="min" value={b.minutes}
                onDec={() => onUpdate(key, 'minutes', -BUDGET_LIMITS.minutes.step)} onInc={() => onUpdate(key, 'minutes', BUDGET_LIMITS.minutes.step)}
                canDec={b.minutes > BUDGET_LIMITS.minutes.min} canInc={b.minutes < BUDGET_LIMITS.minutes.max} />
            </li>
          )
        })}
      </ul>
      <div className="kitchen-actions">
        <button type="button" className="primary-action" onClick={onBack}>← Back to kitchen</button>
        <button type="button" className="secondary-action" onClick={onReset}>🔄 Reset to defaults</button>
      </div>
    </section>
  )
}

type BudgetStepperProps = { icon: string; unit: string; value: number; onDec: () => void; onInc: () => void; canDec: boolean; canInc: boolean }

function BudgetStepper({ icon, unit, value, onDec, onInc, canDec, canInc }: BudgetStepperProps) {
  return (
    <div className="budget-stepper">
      <span className="budget-stepper-icon" aria-hidden="true">{icon}</span>
      <button type="button" className="budget-stepper-button" onClick={onDec} disabled={!canDec} aria-label={`Decrease ${unit}`}>−</button>
      <span className="budget-stepper-value">{value}</span>
      <button type="button" className="budget-stepper-button" onClick={onInc} disabled={!canInc} aria-label={`Increase ${unit}`}>+</button>
      <span className="budget-stepper-unit">{unit}</span>
    </div>
  )
}
