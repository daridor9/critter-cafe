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
type ServedKey = MealKey | 'schoolLunch'

type KitchenState =
  | 'hub'
  | 'planning-breakfast'
  | 'packing-school-lunch'
  | 'planning-lunch'
  | 'planning-dinner'
  | 'end-of-day'

const CHILD_ID = 'child'

type MealConfig = {
  key: MealKey
  label: string
  emoji: string
  planState: KitchenState
  hasPlate: (m: FamilyMember) => boolean    // who shows a plate (can be assigned)
  isRequired: (m: FamilyMember) => boolean  // who MUST be assigned to enable Serve
  serveLabel: string
}

const MEAL_CONFIG: Record<MealKey, MealConfig> = {
  breakfast: {
    key: 'breakfast', label: 'breakfast', emoji: '🍳',
    planState: 'planning-breakfast',
    hasPlate: () => true,
    isRequired: () => true,
    serveLabel: '🍽 Serve breakfast',
  },
  lunch: {
    key: 'lunch', label: 'lunch', emoji: '🥗',
    planState: 'planning-lunch',
    hasPlate: () => true,                      // child has an optional plate at home lunch
    isRequired: (m) => m.id !== CHILD_ID,      // but only baby + adult + elder are required
    serveLabel: '🥗 Serve lunch',
  },
  dinner: {
    key: 'dinner', label: 'dinner', emoji: '🍝',
    planState: 'planning-dinner',
    hasPlate: () => true,
    isRequired: () => true,
    serveLabel: '🍝 Serve dinner',
  },
}

function currentMealKey(state: KitchenState): MealKey | null {
  for (const meal of Object.values(MEAL_CONFIG)) {
    if (state === meal.planState) return meal.key
  }
  return null
}

const reactionFor = (member: FamilyMember, food: Food): MealReaction =>
  food.reactions[member.profile.lifeStage]

export function KitchenScene({ onExit }: Props) {
  const [state, setState] = useState<KitchenState>('hub')
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null)
  const [mealAssignments, setMealAssignments] = useState<Record<MealKey, Record<string, string | null>>>({
    breakfast: {}, lunch: {}, dinner: {},
  })
  const [schoolLunchFood, setSchoolLunchFood] = useState<string | null>(null)
  const [mealsServed, setMealsServed] = useState<Record<ServedKey, boolean>>({
    breakfast: false, schoolLunch: false, lunch: false, dinner: false,
  })

  const findFood = (id: string | null | undefined): Food | undefined =>
    id ? defaultPantry.find(f => f.id === id) : undefined

  // ---- per-character consumed foods ----
  // Child special-case: home lunch and school lunch are mutually exclusive (same noon).
  // If child has a home-lunch assignment, that's what she ate; otherwise the packed lunch.
  const consumedFoodsFor = (memberId: string): Food[] => {
    const foods: Food[] = []

    if (mealsServed.breakfast) {
      const f = findFood(mealAssignments.breakfast[memberId])
      if (f) foods.push(f)
    }

    if (memberId === CHILD_ID) {
      const homeLunch = mealsServed.lunch ? findFood(mealAssignments.lunch[CHILD_ID]) : undefined
      if (homeLunch) {
        foods.push(homeLunch)
      } else if (mealsServed.schoolLunch) {
        const f = findFood(schoolLunchFood)
        if (f) foods.push(f)
      }
    } else if (mealsServed.lunch) {
      const f = findFood(mealAssignments.lunch[memberId])
      if (f) foods.push(f)
    }

    if (mealsServed.dinner) {
      const f = findFood(mealAssignments.dinner[memberId])
      if (f) foods.push(f)
    }

    return foods
  }

  const caloriesFor = (memberId: string): number =>
    consumedFoodsFor(memberId).reduce((sum, f) => sum + f.calories, 0)

  // ---- current meal context ----
  const currentMeal = currentMealKey(state)
  const currentConfig = currentMeal ? MEAL_CONFIG[currentMeal] : null
  const currentAssignments = currentMeal ? mealAssignments[currentMeal] : null
  const currentPlateMembers = currentConfig ? defaultFamily.filter(currentConfig.hasPlate) : []
  const currentRequiredMembers = currentConfig ? defaultFamily.filter(currentConfig.isRequired) : []

  const isPlanningMeal = currentMeal !== null
  const isPackingSchoolLunch = state === 'packing-school-lunch'

  // ---- budget logic ----
  const activeBudget = isPackingSchoolLunch
    ? dailyBudgets.schoolLunch
    : (currentMeal ? dailyBudgets[currentMeal] : dailyBudgets.breakfast)

  const mealTotalCost = currentPlateMembers.reduce((sum, m) => {
    const food = findFood(currentAssignments?.[m.id])
    return sum + (food?.cost ?? 0)
  }, 0)
  const mealTotalMinutes = currentPlateMembers.reduce((sum, m) => {
    const food = findFood(currentAssignments?.[m.id])
    return sum + (food?.prepMinutes ?? 0)
  }, 0)
  const schoolLunchCost = findFood(schoolLunchFood)?.cost ?? 0
  const schoolLunchMinutes = findFood(schoolLunchFood)?.prepMinutes ?? 0

  const totalCost = isPackingSchoolLunch ? schoolLunchCost : mealTotalCost
  const totalMinutes = isPackingSchoolLunch ? schoolLunchMinutes : mealTotalMinutes
  const overBudget = totalCost > activeBudget.coins
  const overTime = totalMinutes > activeBudget.minutes

  const allRequiredAssigned = currentRequiredMembers.every(m => currentAssignments?.[m.id])
  const canServeMeal = allRequiredAssigned && !overBudget && !overTime
  const canPackSchoolLunch = schoolLunchFood !== null && !overBudget && !overTime

  // ---- transitions ----
  const startPlanning = (mealKey: MealKey) => {
    setState(MEAL_CONFIG[mealKey].planState)
    setSelectedFoodId(null)
  }
  const startPackingSchoolLunch = () => {
    setState('packing-school-lunch')
    setSelectedFoodId(null)
  }
  const serveMeal = () => {
    if (!currentConfig) return
    setMealsServed(prev => ({ ...prev, [currentConfig.key]: true }))
    setState('hub')
    setSelectedFoodId(null)
  }
  const packSchoolLunch = () => {
    setMealsServed(prev => ({ ...prev, schoolLunch: true }))
    setState('hub')
    setSelectedFoodId(null)
  }
  const goToEndOfDay = () => setState('end-of-day')
  const reset = () => {
    setState('hub')
    setMealAssignments({ breakfast: {}, lunch: {}, dinner: {} })
    setSchoolLunchFood(null)
    setMealsServed({ breakfast: false, schoolLunch: false, lunch: false, dinner: false })
    setSelectedFoodId(null)
  }

  const onPlateClick = (memberId: string) => {
    if (selectedFoodId === null) return
    const member = defaultFamily.find(m => m.id === memberId)
    if (!member) return
    if (isPlanningMeal && currentMeal && currentConfig?.hasPlate(member)) {
      setMealAssignments(prev => ({
        ...prev,
        [currentMeal]: { ...prev[currentMeal], [memberId]: selectedFoodId },
      }))
    } else if (isPackingSchoolLunch && memberId === CHILD_ID) {
      const food = findFood(selectedFoodId)
      if (food?.packable) setSchoolLunchFood(selectedFoodId)
    }
  }

  // ---- speech bubbles: most recent eaten meal wins ----
  const speechFor = (memberId: string): { message?: string; tone?: MealTone } => {
    const member = defaultFamily.find(m => m.id === memberId)
    if (!member) return {}

    if (state === 'end-of-day') {
      const report = computeDayEnergy(member, consumedFoodsFor(memberId))
      return { message: report.verdict, tone: report.tone }
    }

    if (mealsServed.dinner) {
      const food = findFood(mealAssignments.dinner[memberId])
      if (food) {
        const r = reactionFor(member, food)
        return { message: `For dinner: ${r.message}`, tone: r.tone }
      }
    }

    // Lunch — for child, home lunch wins over school lunch (same noon slot)
    if (memberId === CHILD_ID) {
      const homeLunch = mealsServed.lunch ? findFood(mealAssignments.lunch[CHILD_ID]) : undefined
      if (homeLunch) {
        const r = reactionFor(member, homeLunch)
        return { message: `For lunch: ${r.message}`, tone: r.tone }
      }
      if (mealsServed.schoolLunch) {
        const food = findFood(schoolLunchFood)
        if (food) {
          const r = reactionFor(member, food)
          return { message: `For lunch: ${r.message}`, tone: r.tone }
        }
      }
    } else if (mealsServed.lunch) {
      const food = findFood(mealAssignments.lunch[memberId])
      if (food) {
        const r = reactionFor(member, food)
        return { message: `For lunch: ${r.message}`, tone: r.tone }
      }
    }

    if (mealsServed.breakfast) {
      const food = findFood(mealAssignments.breakfast[memberId])
      if (food) {
        const r = reactionFor(member, food)
        return { message: r.message, tone: r.tone }
      }
    }
    return {}
  }

  // ---- plates: visible only during the current planning context ----
  const plateFor = (memberId: string): Food | undefined | null => {
    if (isPlanningMeal && currentMeal && currentConfig) {
      const member = defaultFamily.find(m => m.id === memberId)
      if (member && currentConfig.hasPlate(member)) {
        return findFood(currentAssignments?.[memberId]) ?? null
      }
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
      if (!allRequiredAssigned && selectedFoodId) return `Now tap a plate to serve it.`
      if (!allRequiredAssigned) {
        const remaining = currentRequiredMembers
          .filter(m => !currentAssignments?.[m.id])
          .map(m => m.name).join(', ')
        const childNote = currentMeal === 'lunch' && !currentAssignments?.[CHILD_ID]
          ? " Child's plate is optional — fill it if she's home for lunch instead of at school."
          : ''
        return `Pick a food, then tap a plate. Still to serve: ${remaining}.${childNote}`
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

  const anythingServed = mealsServed.breakfast || mealsServed.schoolLunch || mealsServed.lunch || mealsServed.dinner
  const showCalories = anythingServed || state === 'end-of-day'

  const dayReports = state === 'end-of-day'
    ? defaultFamily.map(m => ({ member: m, report: computeDayEnergy(m, consumedFoodsFor(m.id)) }))
    : []
  const everyoneFed = dayReports.every(r => r.report.status === 'well-fed' || r.report.status === 'comfortable')

  // For hub meal cards: show the foods that were actually assigned and served.
  const mealCardEmojis = (mealKey: MealKey): string[] =>
    defaultFamily
      .filter(MEAL_CONFIG[mealKey].hasPlate)
      .map(m => findFood(mealAssignments[mealKey][m.id])?.emoji)
      .filter((e): e is string => Boolean(e))

  return (
    <main className="kitchen-scene">
      <header className="kitchen-header">
        <button
          type="button"
          className="back-button"
          onClick={() => {
            if (state === 'hub') onExit()
            else { setState('hub'); setSelectedFoodId(null) }
          }}
          aria-label={state === 'hub' ? 'Back to title screen' : 'Back to kitchen'}
        >
          ← {state === 'hub' ? 'Title' : 'Kitchen'}
        </button>
        <div className="header-center">
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

      {state === 'hub' && (
        <section className="hub" aria-label="Kitchen menu">
          <p className="hub-title">What would you like to plan?</p>
          <div className="meal-cards">
            <MealCard
              emoji={MEAL_CONFIG.breakfast.emoji}
              name="Breakfast"
              served={mealsServed.breakfast}
              foodEmojis={mealsServed.breakfast ? mealCardEmojis('breakfast') : []}
              onClick={() => startPlanning('breakfast')}
            />
            <MealCard
              emoji="🎒"
              name="School lunch"
              served={mealsServed.schoolLunch}
              foodEmojis={mealsServed.schoolLunch && schoolLunchFood ? [findFood(schoolLunchFood)?.emoji ?? ''] : []}
              onClick={startPackingSchoolLunch}
            />
            <MealCard
              emoji={MEAL_CONFIG.lunch.emoji}
              name="Lunch at home"
              served={mealsServed.lunch}
              foodEmojis={mealsServed.lunch ? mealCardEmojis('lunch') : []}
              onClick={() => startPlanning('lunch')}
            />
            <MealCard
              emoji={MEAL_CONFIG.dinner.emoji}
              name="Dinner"
              served={mealsServed.dinner}
              foodEmojis={mealsServed.dinner ? mealCardEmojis('dinner') : []}
              onClick={() => startPlanning('dinner')}
            />
          </div>
          <div className="kitchen-actions">
            <button type="button" className="primary-action" onClick={goToEndOfDay}>
              🌙 See end of day
            </button>
            {anythingServed && (
              <button type="button" className="secondary-action" onClick={reset}>
                🔄 Reset the day
              </button>
            )}
          </div>
        </section>
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
          </div>
        </section>
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
        {state === 'hub' && (
          <p><em>Pick any meal to plan or replan. Order doesn't matter — go to end-of-day anytime to see how the day balanced out.</em></p>
        )}
        {(isPlanningMeal || isPackingSchoolLunch) && (
          <p><em>Green = ideal · yellow = okay · orange or red = wrong fit.</em></p>
        )}
      </footer>
    </main>
  )
}

type MealCardProps = {
  emoji: string
  name: string
  served: boolean
  foodEmojis: string[]
  onClick: () => void
}

function MealCard({ emoji, name, served, foodEmojis, onClick }: MealCardProps) {
  return (
    <button
      type="button"
      className={`meal-card ${served ? 'meal-card-served' : ''}`}
      onClick={onClick}
      aria-label={served ? `${name}, already served. Tap to revise.` : `${name}, not yet planned. Tap to plan.`}
    >
      <span className="meal-card-emoji" aria-hidden="true">{emoji}</span>
      <span className="meal-card-name">{name}</span>
      <span className="meal-card-status">
        {served ? (
          <>✓ {foodEmojis.length > 0 ? foodEmojis.join(' ') : 'served'}</>
        ) : (
          'Not yet'
        )}
      </span>
    </button>
  )
}

function dayMarkerFor(state: KitchenState): string {
  if (state === 'hub') return '☀ Day 1 — Kitchen'
  if (state === 'planning-breakfast') return '🍳 Breakfast'
  if (state === 'packing-school-lunch') return '🎒 School lunch'
  if (state === 'planning-lunch') return '🥗 Midday lunch'
  if (state === 'planning-dinner') return '🍝 Dinner'
  if (state === 'end-of-day') return '🌙 Bedtime'
  return '☀ Day 1'
}
