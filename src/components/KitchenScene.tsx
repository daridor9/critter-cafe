import { useState } from 'react'
import { defaultFamily } from '../family/defaultFamily'
import { defaultPantry } from '../food/pantry'
import { dailyBudgets } from '../food/budget'
import { computeDayEnergy } from '../family/energy'
import type { FamilyMember } from '../family/types'
import type { Food, MealReaction, MealTone } from '../food/types'
import { FamilyMember as FamilyMemberView } from './FamilyMember'
import './KitchenScene.css'

type Props = {
  onExit: () => void
}

type MealKey = 'breakfast' | 'lunch' | 'dinner'

type KitchenState =
  | 'idle'
  | 'planning-breakfast' | 'breakfast-served'
  | 'packing-school-lunch' | 'school-lunch-packed'
  | 'planning-lunch' | 'lunch-served'
  | 'planning-dinner' | 'dinner-served'
  | 'end-of-day'

const CHILD_ID = 'child'

// Ordered list lets us ask "are we past state X?" cleanly.
const STATE_ORDER: KitchenState[] = [
  'idle',
  'planning-breakfast', 'breakfast-served',
  'packing-school-lunch', 'school-lunch-packed',
  'planning-lunch', 'lunch-served',
  'planning-dinner', 'dinner-served',
  'end-of-day',
]
const isAtOrAfter = (current: KitchenState, target: KitchenState) =>
  STATE_ORDER.indexOf(current) >= STATE_ORDER.indexOf(target)

type MealConfig = {
  key: MealKey
  label: string
  emoji: string
  planState: KitchenState
  servedState: KitchenState
  participates: (m: FamilyMember) => boolean  // who's actually home to eat
  serveLabel: string
}

const MEAL_CONFIG: Record<MealKey, MealConfig> = {
  breakfast: {
    key: 'breakfast', label: 'breakfast', emoji: '🍳',
    planState: 'planning-breakfast', servedState: 'breakfast-served',
    participates: () => true,
    serveLabel: '🍽 Serve breakfast',
  },
  lunch: {
    key: 'lunch', label: 'lunch', emoji: '🥗',
    planState: 'planning-lunch', servedState: 'lunch-served',
    participates: (m) => m.id !== CHILD_ID,  // child is at school
    serveLabel: '🥗 Serve lunch',
  },
  dinner: {
    key: 'dinner', label: 'dinner', emoji: '🍝',
    planState: 'planning-dinner', servedState: 'dinner-served',
    participates: () => true,
    serveLabel: '🍝 Serve dinner',
  },
}

function currentMealKey(state: KitchenState): MealKey | null {
  for (const meal of Object.values(MEAL_CONFIG)) {
    if (state === meal.planState || state === meal.servedState) return meal.key
  }
  return null
}

const reactionFor = (member: FamilyMember, food: Food): MealReaction =>
  food.reactions[member.profile.lifeStage]

export function KitchenScene({ onExit }: Props) {
  const [state, setState] = useState<KitchenState>('idle')
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null)
  const [mealAssignments, setMealAssignments] = useState<Record<MealKey, Record<string, string | null>>>({
    breakfast: {}, lunch: {}, dinner: {},
  })
  const [schoolLunchFood, setSchoolLunchFood] = useState<string | null>(null)

  const findFood = (id: string | null | undefined): Food | undefined =>
    id ? defaultPantry.find(f => f.id === id) : undefined

  // ---- progress flags ----
  const breakfastEaten   = isAtOrAfter(state, 'breakfast-served')
  const schoolLunchPacked = isAtOrAfter(state, 'school-lunch-packed')
  const lunchEaten       = isAtOrAfter(state, 'lunch-served')
  const dinnerEaten      = isAtOrAfter(state, 'dinner-served')

  // ---- per-character consumed foods (drives calorie counter + day energy) ----
  const consumedFoodsFor = (memberId: string): Food[] => {
    const foods: Food[] = []
    if (breakfastEaten) {
      const f = findFood(mealAssignments.breakfast[memberId])
      if (f) foods.push(f)
    }
    if (memberId === CHILD_ID && schoolLunchPacked) {
      const f = findFood(schoolLunchFood)
      if (f) foods.push(f)
    }
    if (memberId !== CHILD_ID && lunchEaten) {
      const f = findFood(mealAssignments.lunch[memberId])
      if (f) foods.push(f)
    }
    if (dinnerEaten) {
      const f = findFood(mealAssignments.dinner[memberId])
      if (f) foods.push(f)
    }
    return foods
  }

  const caloriesFor = (memberId: string): number =>
    consumedFoodsFor(memberId).reduce((sum, f) => sum + f.calories, 0)

  // ---- current meal context (if any) ----
  const currentMeal = currentMealKey(state)
  const currentConfig = currentMeal ? MEAL_CONFIG[currentMeal] : null
  const currentAssignments = currentMeal ? mealAssignments[currentMeal] : null
  const currentParticipants = currentConfig ? defaultFamily.filter(currentConfig.participates) : []

  // ---- meal budgets ----
  const isPlanningMeal = currentMeal !== null && state === currentConfig?.planState
  const isPackingSchoolLunch = state === 'packing-school-lunch'

  const activeBudget = isPackingSchoolLunch
    ? dailyBudgets.schoolLunch
    : (isPlanningMeal ? dailyBudgets[currentMeal!] : dailyBudgets.breakfast)

  const mealTotalCost = currentParticipants.reduce((sum, m) => {
    const food = findFood(currentAssignments?.[m.id])
    return sum + (food?.cost ?? 0)
  }, 0)
  const mealTotalMinutes = currentParticipants.reduce((sum, m) => {
    const food = findFood(currentAssignments?.[m.id])
    return sum + (food?.prepMinutes ?? 0)
  }, 0)
  const schoolLunchCost = findFood(schoolLunchFood)?.cost ?? 0
  const schoolLunchMinutes = findFood(schoolLunchFood)?.prepMinutes ?? 0

  const totalCost = isPackingSchoolLunch ? schoolLunchCost : mealTotalCost
  const totalMinutes = isPackingSchoolLunch ? schoolLunchMinutes : mealTotalMinutes

  const overBudget = totalCost > activeBudget.coins
  const overTime = totalMinutes > activeBudget.minutes

  const allMealAssigned = currentConfig
    ? currentParticipants.every(m => currentAssignments?.[m.id])
    : false
  const canServeMeal = allMealAssigned && !overBudget && !overTime
  const canPackSchoolLunch = schoolLunchFood !== null && !overBudget && !overTime

  // ---- transitions ----
  const startPlanning = (mealKey: MealKey) => {
    setState(MEAL_CONFIG[mealKey].planState)
    setMealAssignments(prev => ({ ...prev, [mealKey]: {} }))
    setSelectedFoodId(null)
  }
  const serveMeal = () => {
    if (!currentConfig) return
    setState(currentConfig.servedState)
    setSelectedFoodId(null)
  }
  const startPackingSchoolLunch = () => {
    setState('packing-school-lunch')
    setSchoolLunchFood(null)
    setSelectedFoodId(null)
  }
  const packSchoolLunch = () => {
    setState('school-lunch-packed')
    setSelectedFoodId(null)
  }
  const goToEndOfDay = () => setState('end-of-day')
  const reset = () => {
    setState('idle')
    setMealAssignments({ breakfast: {}, lunch: {}, dinner: {} })
    setSchoolLunchFood(null)
    setSelectedFoodId(null)
  }

  const onPlateClick = (memberId: string) => {
    if (selectedFoodId === null) return
    if (isPlanningMeal && currentMeal && currentConfig?.participates(defaultFamily.find(m => m.id === memberId)!)) {
      setMealAssignments(prev => ({
        ...prev,
        [currentMeal]: { ...prev[currentMeal], [memberId]: selectedFoodId },
      }))
    } else if (isPackingSchoolLunch && memberId === CHILD_ID) {
      const food = findFood(selectedFoodId)
      if (food?.packable) setSchoolLunchFood(selectedFoodId)
    }
  }

  // ---- speech bubble: show each member's LATEST meal reaction ----
  const speechFor = (memberId: string): { message?: string; tone?: MealTone } => {
    const member = defaultFamily.find(m => m.id === memberId)
    if (!member) return {}

    if (state === 'end-of-day') {
      const report = computeDayEnergy(member, consumedFoodsFor(memberId))
      return { message: report.verdict, tone: report.tone }
    }

    if (dinnerEaten) {
      const food = findFood(mealAssignments.dinner[memberId])
      if (food) {
        const r = reactionFor(member, food)
        return { message: `For dinner: ${r.message}`, tone: r.tone }
      }
    }

    if (memberId !== CHILD_ID && lunchEaten) {
      const food = findFood(mealAssignments.lunch[memberId])
      if (food) {
        const r = reactionFor(member, food)
        return { message: `For lunch: ${r.message}`, tone: r.tone }
      }
    }

    if (memberId === CHILD_ID && schoolLunchPacked) {
      const food = findFood(schoolLunchFood)
      if (food) {
        const r = reactionFor(member, food)
        return { message: `For lunch: ${r.message}`, tone: r.tone }
      }
    }

    if (breakfastEaten) {
      const food = findFood(mealAssignments.breakfast[memberId])
      if (food) {
        const r = reactionFor(member, food)
        return { message: r.message, tone: r.tone }
      }
    }

    return {}
  }

  // ---- plate logic: show plate only for the current planning context ----
  const plateFor = (memberId: string): Food | undefined | null => {
    if (isPlanningMeal && currentMeal && currentConfig?.participates(defaultFamily.find(m => m.id === memberId)!)) {
      return findFood(currentAssignments?.[memberId]) ?? null
    }
    if (isPackingSchoolLunch && memberId === CHILD_ID) {
      return findFood(schoolLunchFood) ?? null
    }
    return undefined
  }

  // ---- planning hint ----
  const planningHint = (() => {
    if (isPlanningMeal && currentConfig) {
      if (overBudget && overTime) return `Over budget AND over time — swap for something cheaper and faster.`
      if (overBudget) return `Over budget — try cheaper picks.`
      if (overTime) return `Over time — try something faster.`
      if (!allMealAssigned && selectedFoodId) return `Now tap a plate to serve it.`
      if (!allMealAssigned) {
        const remaining = currentParticipants.filter(m => !currentAssignments?.[m.id]).map(m => m.name).join(', ')
        return `Pick a food, then tap a plate. Still to serve: ${remaining}.`
      }
      return `Looks good — serve ${currentConfig.label} when ready.`
    }
    if (isPackingSchoolLunch) {
      const selected = findFood(selectedFoodId)
      if (overBudget && overTime) return "Too expensive AND too slow for the lunchbox."
      if (overBudget) return "Too expensive for the lunchbox."
      if (overTime) return "Too slow to prep before school."
      if (selected && !selected.packable) return "That won't travel well — pick something packable."
      if (!schoolLunchFood && selectedFoodId) return "Now tap the lunchbox to pack it."
      if (!schoolLunchFood) return "Pick something packable for the child's school lunch."
      return 'Looks good — pack it when ready.'
    }
    return ''
  })()

  // ---- pantry rendering ----
  const renderPantryItem = (food: Food) => {
    const isSelected = selectedFoodId === food.id
    const itemDisabled = isPackingSchoolLunch && !food.packable
    const className = [
      'pantry-item',
      isSelected ? 'pantry-item-selected' : '',
      itemDisabled ? 'pantry-item-disabled' : '',
    ].filter(Boolean).join(' ')

    return (
      <button
        key={food.id}
        type="button"
        className={className}
        onClick={() => !itemDisabled && setSelectedFoodId(food.id)}
        disabled={itemDisabled}
        aria-pressed={isSelected}
        aria-label={itemDisabled
          ? `${food.name} — doesn't travel well, can't pack`
          : `${food.name}, ${food.calories} calories, costs ${food.cost} coins, takes ${food.prepMinutes} minutes`}
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

  // ---- per-character UI flags ----
  const showCalories = state !== 'idle' && state !== 'planning-breakfast'

  const dayReports = state === 'end-of-day'
    ? defaultFamily.map(m => ({ member: m, report: computeDayEnergy(m, consumedFoodsFor(m.id)) }))
    : []
  const everyoneFed = dayReports.every(r => r.report.status === 'well-fed' || r.report.status === 'comfortable')

  return (
    <main className="kitchen-scene">
      <header className="kitchen-header">
        <div className="header-left">
          <span className="day-marker">{dayMarkerFor(state)}</span>
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
            <FamilyMemberView
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
          <button type="button" className="primary-action" onClick={() => startPlanning('breakfast')}>
            🍳 Plan breakfast
          </button>
        </div>
      )}

      {(isPlanningMeal || isPackingSchoolLunch) && (
        <section className="pantry" aria-label={isPackingSchoolLunch ? 'School-lunch pantry' : `${currentConfig?.label} pantry`}>
          <div className="budget-bar" aria-label="Budget tracker">
            <span className={overBudget ? 'budget-over' : ''}>💰 {totalCost} / {activeBudget.coins}</span>
            <span className="budget-divider" aria-hidden="true">·</span>
            <span className={overTime ? 'budget-over' : ''}>⏱ {totalMinutes} / {activeBudget.minutes} min</span>
            <span className="budget-label">
              {isPackingSchoolLunch ? '🎒 lunchbox' : `${currentConfig?.emoji} ${currentConfig?.label}`}
            </span>
          </div>
          <p className="pantry-hint">{planningHint}</p>
          <div className="pantry-row">{defaultPantry.map(renderPantryItem)}</div>
          <div className="kitchen-actions">
            {isPlanningMeal && currentConfig ? (
              <button type="button" className="primary-action" onClick={serveMeal} disabled={!canServeMeal}>
                {currentConfig.serveLabel}
              </button>
            ) : (
              <button type="button" className="primary-action" onClick={packSchoolLunch} disabled={!canPackSchoolLunch}>
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
          <button type="button" className="primary-action" onClick={startPackingSchoolLunch}>
            🎒 Pack school lunch
          </button>
          <button type="button" className="secondary-action" onClick={reset}>🔄 Replay day</button>
        </div>
      )}

      {state === 'school-lunch-packed' && (
        <div className="kitchen-actions">
          <button type="button" className="primary-action" onClick={() => startPlanning('lunch')}>
            🥗 Plan lunch at home
          </button>
          <button type="button" className="secondary-action" onClick={reset}>🔄 Replay day</button>
        </div>
      )}

      {state === 'lunch-served' && (
        <div className="kitchen-actions">
          <button type="button" className="primary-action" onClick={() => startPlanning('dinner')}>
            🍝 Plan dinner
          </button>
          <button type="button" className="secondary-action" onClick={reset}>🔄 Replay day</button>
        </div>
      )}

      {state === 'dinner-served' && (
        <div className="kitchen-actions">
          <button type="button" className="primary-action" onClick={goToEndOfDay}>
            🌙 See end of day
          </button>
          <button type="button" className="secondary-action" onClick={reset}>🔄 Replay day</button>
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
              : "Even with breakfast, lunch, dinner, and a packed school lunch, single-item meals aren't enough fuel for most bodies. Combo meals (yogurt + bread + apple together on one plate) are the next step — coming soon."}
          </p>
          <div className="kitchen-actions">
            <button type="button" className="primary-action" onClick={reset}>
              🔄 Start the day over
            </button>
          </div>
        </section>
      )}

      <footer className="kitchen-footer">
        {state === 'breakfast-served' && (
          <p><em>Breakfast eaten. Now pack the child off to school — what goes in the lunchbox?</em></p>
        )}
        {state === 'school-lunch-packed' && (
          <p><em>Lunchbox packed, child off to school. Now plan lunch for everyone still at home.</em></p>
        )}
        {state === 'lunch-served' && (
          <p><em>Lunch done. Time for dinner planning — the whole family will be home again.</em></p>
        )}
        {state === 'dinner-served' && (
          <p><em>Dinner eaten. Fast-forward to see how the day balanced out.</em></p>
        )}
        {(isPlanningMeal || isPackingSchoolLunch) && (
          <p><em>Green = ideal · yellow = okay · orange or red = wrong fit.</em></p>
        )}
        {state === 'idle' && (
          <p><em>Coming soon:</em> name your family · combo meals · shop at the market · Nutrient-dex</p>
        )}
      </footer>
    </main>
  )
}

function dayMarkerFor(state: KitchenState): string {
  if (state === 'idle') return '☀ Day 1 — Morning'
  if (state === 'planning-breakfast' || state === 'breakfast-served') return '☀ Morning'
  if (state === 'packing-school-lunch' || state === 'school-lunch-packed') return '🎒 Off to school'
  if (state === 'planning-lunch' || state === 'lunch-served') return '🕛 Midday'
  if (state === 'planning-dinner' || state === 'dinner-served') return '🌆 Evening'
  if (state === 'end-of-day') return '🌙 Bedtime'
  return '☀ Day 1'
}
