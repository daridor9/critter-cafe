import { MONEY_LIMITS, MINUTES_LIMITS, type MealKey as BudgetKey } from '../food/budget'
import { BUDGET_LABELS } from '../game/meals'
import './BudgetSettings.css'

type Props = {
  dailyMoney: number
  mealMinutes: Record<BudgetKey, number>
  onUpdateMoney: (delta: number) => void
  onUpdateMinutes: (key: BudgetKey, delta: number) => void
  onReset: () => void
  onBack: () => void
}

const BUDGET_ORDER: BudgetKey[] = ['breakfast', 'schoolLunch', 'lunch', 'snack', 'dinner']

export function BudgetSettings({ dailyMoney, mealMinutes, onUpdateMoney, onUpdateMinutes, onReset, onBack }: Props) {
  return (
    <section className="budget-settings" aria-label="Time and money settings">
      <h2 className="budget-settings-title">⚙ Time &amp; money</h2>
      <p className="budget-settings-hint">
        Money is spent at the 🛒 Market; cooking costs time. Tighter = harder puzzle. School-lunch time is per child.
      </p>
      <ul className="budget-list">
        <li className="budget-row budget-row-money">
          <span className="budget-meal-label"><span aria-hidden="true">💰</span> Daily shopping money</span>
          <BudgetStepper icon="💰" unit="coins" value={dailyMoney}
            onDec={() => onUpdateMoney(-MONEY_LIMITS.step)} onInc={() => onUpdateMoney(MONEY_LIMITS.step)}
            canDec={dailyMoney > MONEY_LIMITS.min} canInc={dailyMoney < MONEY_LIMITS.max} />
        </li>
        {BUDGET_ORDER.map(key => {
          const cfg = BUDGET_LABELS[key]
          const minutes = mealMinutes[key]
          return (
            <li key={key} className="budget-row">
              <span className="budget-meal-label"><span aria-hidden="true">{cfg.emoji}</span> {cfg.label}</span>
              <BudgetStepper icon="⏱" unit="min" value={minutes}
                onDec={() => onUpdateMinutes(key, -MINUTES_LIMITS.step)} onInc={() => onUpdateMinutes(key, MINUTES_LIMITS.step)}
                canDec={minutes > MINUTES_LIMITS.min} canInc={minutes < MINUTES_LIMITS.max} />
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
