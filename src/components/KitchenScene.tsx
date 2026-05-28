import { useState } from 'react'
import { defaultFamily } from '../family/defaultFamily'
import { defaultPantry } from '../food/pantry'
import { dailyBudgets } from '../food/budget'
import { computeDayEnergy } from '../family/energy'
import type { Food, MealReaction } from '../food/types'
import { FamilyMember } from './FamilyMember'
import './KitchenScene.css'

type Props = {
  onExit: () => void
}

type KitchenState =
  | 'idle'
  | 'planning-breakfast'
  | 'breakfast-served'
  | 'packing-lunch'
  | 'lunch-packed'
  | 'end-of-day'

const CHILD_ID = 'child'

export function KitchenScene({ onExit }: Props) {
  const [state, setState] = useState<KitchenState>('idle')
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null)
  const [breakfastAssignments, setBreakfastAssignments] = useState<Record<string, string | null>>({})
  const [lunchFood, setLunchFood] = useState<string | null>(null)

  const findFood = (id: string | null | undefined): Food | undefined =>
    id ? defaultPantry.find(f => f.id === id) : undefined

  const getBreakfastReaction = (memberId: string): MealReaction | undefined => {
    const member = defaultFamily.find(m => m.id === memberId)
    const food = findFood(breakfastAssignments[memberId])
    if (!member || !food) return undefined
    return food.reactions[member.profile.lifeStage]
  }

  const getLunchReaction = (): MealReaction | undefined => {
    const child = defaultFamily.find(m => m.id === CHILD_ID)
    const food = findFood(lunchFood)
    if (!child || !food) return undefined
    return food.reactions[child.profile.lifeStage]
  }

  // ---- consumed-foods per member (drives calorie counter + day energy) ----
  const consumedFoodsFor = (memberId: string): Food[] => {
    const foods: Food[] = []
    // Breakfast counts once it's been served.
    if (state !== 'idle' && state !== 'planning-breakfast') {
      const f = findFood(breakfastAssignments[memberId])
      if (f) foods.push(f)
    }
    // School lunch counts only for the child, once packed (they eat it at school).
    if ((state === 'lunch-packed' || state === 'end-of-day') && memberId === CHILD_ID) {
      const f = findFood(lunchFood)
      if (f) foods.push(f)
    }
    return foods
  }

  const caloriesFor = (memberId: string): number =>
    consumedFoodsFor(memberId).reduce((sum, f) => sum + f.calories, 0)

  // ---- meal budgets ----
  const isBreakfast = state === 'planning-breakfast'
  const isLunch = state === 'packing-lunch'
  const activeBudget = isLunch ? dailyBudgets.schoolLunch : dailyBudgets.breakfast

  const breakfastTotalCost = defaultFamily.reduce((sum, m) => {
    const food = findFood(breakfastAssignments[m.id])
    return sum + (food?.cost ?? 0)
  }, 0)
  const breakfastTotalMinutes = defaultFamily.reduce((sum, m) => {
    const food = findFood(breakfastAssignments[m.id])
    return sum + (food?.prepMinutes ?? 0)
  }, 0)
  const lunchTotalCost = findFood(lunchFood)?.cost ?? 0
  const lunchTotalMinutes = findFood(lunchFood)?.prepMinutes ?? 0

  const totalCost = isLunch ? lunchTotalCost : breakfastTotalCost
  const totalMinutes = isLunch ? lunchTotalMinutes : breakfastTotalMinutes

  const overBudget = totalCost > activeBudget.coins
  const overTime = totalMinutes > activeBudget.minutes

  const allBreakfastAssigned = defaultFamily.every(m => breakfastAssignments[m.id])
  const canServeBreakfast = allBreakfastAssigned && !overBudget && !overTime
  const canPackLunch = lunchFood !== null && !overBudget && !overTime

  // ---- transitions ----
  const startPlanningBreakfast = () => {
    setState('planning-breakfast')
    setBreakfastAssignments({})
    setSelectedFoodId(null)
  }
  const serveBreakfast = () => {
    setState('breakfast-served')
    setSelectedFoodId(null)
  }
  const startPackingLunch = () => {
    setState('packing-lunch')
    setLunchFood(null)
    setSelectedFoodId(null)
  }
  const packLunch = () => {
    setState('lunch-packed')
    setSelectedFoodId(null)
  }
  const goToEndOfDay = () => {
    setState('end-of-day')
  }
  const reset = () => {
    setState('idle')
    setBreakfastAssignments({})
    setLunchFood(null)
    setSelectedFoodId(null)
  }

  const onPlateClick = (memberId: string) => {
    if (selectedFoodId === null) return
    if (state === 'planning-breakfast') {
      setBreakfastAssignments(prev => ({ ...prev, [memberId]: selectedFoodId }))
    } else if (state === 'packing-lunch' && memberId === CHILD_ID) {
      const food = findFood(selectedFoodId)
      if (food?.packable) setLunchFood(selectedFoodId)
    }
  }

  // ---- speech bubble logic ----
  const showsBreakfastReactions =
    state === 'breakfast-served' || state === 'packing-lunch' || state === 'lunch-packed'

  const speechFor = (memberId: string): { message?: string; tone?: MealReaction['tone'] } => {
    if (state === 'end-of-day') {
      const member = defaultFamily.find(m => m.id === memberId)
      if (!member) return {}
      const report = computeDayEnergy(member, consumedFoodsFor(memberId))
      return { message: report.verdict, tone: report.tone }
    }
    if (state === 'lunch-packed' && memberId === CHILD_ID) {
      const r = getLunchReaction()
      return { message: r ? `For lunch: ${r.message}` : undefined, tone: r?.tone }
    }
    if (showsBreakfastReactions) {
      const r = getBreakfastReaction(memberId)
      return { message: r?.message, tone: r?.tone }
    }
    return {}
  }

  // ---- plate logic ----
  const plateFor = (memberId: string): Food | undefined | null => {
    if (isBreakfast) return findFood(breakfastAssignments[memberId]) ?? null
    if ((state === 'packing-lunch' || state === 'lunch-packed') && memberId === CHILD_ID) {
      return findFood(lunchFood) ?? null
    }
    return undefined
  }

  // ---- planning hint ----
  const planningHint = (() => {
    if (isBreakfast) {
      if (overBudget && overTime) return 'Over budget AND over time — swap for something cheaper and faster.'
      if (overBudget) return 'Over budget — try a cheaper choice.'
      if (overTime) return 'Over time — try something faster.'
      if (!allBreakfastAssigned && selectedFoodId) return 'Now tap a plate to serve it.'
      if (!allBreakfastAssigned) return "Pick a food, then tap who you're serving."
      return 'Looks good — serve when ready.'
    }
    if (isLunch) {
      const selected = findFood(selectedFoodId)
      if (overBudget && overTime) return "Too expensive AND too slow for the lunchbox."
      if (overBudget) return "Too expensive for the lunchbox."
      if (overTime) return "Too slow to prep before school."
      if (selected && !selected.packable) return "That won't travel well — pick something packable."
      if (!lunchFood && selectedFoodId) return "Now tap the lunchbox to pack it."
      if (!lunchFood) return "Pick something packable for the child's school lunch."
      return 'Looks good — pack it when ready.'
    }
    return ''
  })()

  // ---- pantry rendering ----
  const renderPantryItem = (food: Food) => {
    const isSelected = selectedFoodId === food.id
    const itemDisabled = isLunch && !food.packable
    const className = [
      'pantry-item',
      isSelected ? 'pantry-item-selected' : '',
      itemDisabled ? 'pantry-item-disabled' : '',
    ].filter(Boolean).join(' ')

    const ariaLabel = itemDisabled
      ? `${food.name} — doesn't travel well, can't pack`
      : `${food.name}, ${food.calories} calories, costs ${food.cost} coins, takes ${food.prepMinutes} minutes`

    return (
      <button
        key={food.id}
        type="button"
        className={className}
        onClick={() => !itemDisabled && setSelectedFoodId(food.id)}
        disabled={itemDisabled}
        aria-pressed={isSelected}
        aria-label={ariaLabel}
        title={itemDisabled ? "Doesn't travel well in a lunchbox" : undefined}
      >
        <span className="pantry-item-emoji" aria-hidden="true">{food.emoji}</span>
        <span className="pantry-item-name">{food.name}</span>
        <span className="pantry-item-meta" aria-hidden="true">
          🔥 {food.calories} · 💰 {food.cost} · ⏱ {food.prepMinutes}m
        </span>
      </button>
    )
  }

  // ---- show calorie counters once breakfast has been served onwards ----
  const showCalories = state !== 'idle' && state !== 'planning-breakfast'

  // ---- end-of-day reports ----
  const dayReports = state === 'end-of-day'
    ? defaultFamily.map(m => ({ member: m, report: computeDayEnergy(m, consumedFoodsFor(m.id)) }))
    : []
  const everyoneFed = dayReports.every(r => r.report.status === 'well-fed' || r.report.status === 'comfortable')

  return (
    <main className="kitchen-scene">
      <header className="kitchen-header">
        <div className="header-left">
          <span className="day-marker">☀ Day 1 — Morning</span>
          <span className="kitchen-subtitle">Mediterranean Kitchen 🫒</span>
        </div>
        <button
          type="button"
          className="brand-mark brand-mark-button"
          onClick={onExit}
          aria-label="Back to title screen"
        >
          Critter Cafe
        </button>
      </header>

      <section className="family-row" aria-label="Family">
        {defaultFamily.map((member, i) => {
          const { message, tone } = speechFor(member.id)
          return (
            <FamilyMember
              key={member.id}
              member={member}
              speechDelayMs={200 * i}
              speechMessage={message}
              speechTone={tone}
              assignedFood={plateFor(member.id)}
              onPlateClick={() => onPlateClick(member.id)}
              caloriesConsumed={showCalories ? caloriesFor(member.id) : undefined}
            />
          )
        })}
      </section>

      <div className="kitchen-floor" aria-hidden="true" />

      {state === 'idle' && (
        <div className="kitchen-actions">
          <button type="button" className="primary-action" onClick={startPlanningBreakfast}>
            🍳 Plan breakfast
          </button>
        </div>
      )}

      {(isBreakfast || isLunch) && (
        <section className="pantry" aria-label={isLunch ? 'School-lunch pantry' : 'Breakfast pantry'}>
          <div className="budget-bar" aria-label="Budget tracker">
            <span className={overBudget ? 'budget-over' : ''}>💰 {totalCost} / {activeBudget.coins}</span>
            <span className="budget-divider" aria-hidden="true">·</span>
            <span className={overTime ? 'budget-over' : ''}>⏱ {totalMinutes} / {activeBudget.minutes} min</span>
            {isLunch && <span className="budget-label">🎒 lunchbox</span>}
          </div>
          <p className="pantry-hint">{planningHint}</p>
          <div className="pantry-row">{defaultPantry.map(renderPantryItem)}</div>
          <div className="kitchen-actions">
            {isBreakfast ? (
              <button type="button" className="primary-action" onClick={serveBreakfast} disabled={!canServeBreakfast}>
                🍽 Serve breakfast
              </button>
            ) : (
              <button type="button" className="primary-action" onClick={packLunch} disabled={!canPackLunch}>
                🎒 Pack it
              </button>
            )}
            <button type="button" className="secondary-action" onClick={reset}>
              Cancel
            </button>
          </div>
        </section>
      )}

      {state === 'breakfast-served' && (
        <div className="kitchen-actions">
          <button type="button" className="primary-action" onClick={startPackingLunch}>
            🎒 Pack school lunch
          </button>
          <button type="button" className="secondary-action" onClick={reset}>
            🔄 Replay morning
          </button>
        </div>
      )}

      {state === 'lunch-packed' && (
        <div className="kitchen-actions">
          <button type="button" className="primary-action" onClick={goToEndOfDay}>
            🌙 See end of day
          </button>
          <button type="button" className="secondary-action" onClick={reset}>
            🔄 Replay morning
          </button>
        </div>
      )}

      {state === 'end-of-day' && (
        <section className="day-summary" aria-label="End of day energy report">
          <h2 className="day-summary-title">🌙 End of Day 1</h2>
          <ul className="energy-list">
            {dayReports.map(({ member, report }) => (
              <li key={member.id} className={`energy-row energy-row-${report.status}`}>
                <span className="energy-row-who">
                  <span className="energy-row-emoji" aria-hidden="true">{member.emoji}</span>
                  <span className="energy-row-name">{member.name}</span>
                </span>
                <span className="energy-row-stats">
                  <span>🔥 in <strong>{report.consumed}</strong> cal</span>
                  <span>💪 burned <strong>{report.burned}</strong> cal</span>
                  <span>🎯 needed <strong>{report.target}</strong></span>
                  <span className="energy-row-bmr">
                    metabolism ~{member.profile.bmrPerHour} cal/hr + activity {member.profile.activityCalories}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <p className="day-summary-lesson">
            {everyoneFed
              ? "Everyone made it through Day 1 with enough fuel. Real bodies need lots of food — that's a balanced day."
              : "A single breakfast and one packed lunch isn't enough fuel for a real body all day long. Tomorrow we'll add lunch at home, dinner, and snacks — and bigger meals with several foods at once."}
          </p>
          <div className="kitchen-actions">
            <button type="button" className="primary-action" onClick={reset}>
              🔄 Start the morning over
            </button>
          </div>
        </section>
      )}

      <footer className="kitchen-footer">
        {state === 'breakfast-served' && (
          <p><em>Breakfast eaten. Now pack the child off to school — what goes in the lunchbox?</em></p>
        )}
        {state === 'lunch-packed' && (
          <p><em>Morning routine done. Time fast-forwards: who has enough fuel for the day?</em></p>
        )}
        {(isBreakfast || isLunch) && (
          <p><em>Green = ideal · yellow = okay · orange or red = wrong fit.</em></p>
        )}
        {state === 'idle' && (
          <p><em>Coming soon:</em> name your family · shop at the market · build your Nutrient-dex</p>
        )}
      </footer>
    </main>
  )
}
