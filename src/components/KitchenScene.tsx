import { useState } from 'react'
import { defaultFamily } from '../family/defaultFamily'
import { defaultPantry } from '../food/pantry'
import { dailyBudgets } from '../food/budget'
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

  // Active budget + totals depend on which meal we're planning.
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
      if (food?.packable) {
        setLunchFood(selectedFoodId)
      }
    }
  }

  // ---- speech bubble logic ----
  // After breakfast served, bubbles show breakfast reactions through every later state.
  // After lunch packed, child's bubble shows the lunch reaction instead.
  const showsBreakfastReactions =
    state === 'breakfast-served' || state === 'packing-lunch' || state === 'lunch-packed'

  const speechFor = (memberId: string): { message?: string; tone?: MealReaction['tone'] } => {
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
      : `${food.name}, costs ${food.cost} coins, takes ${food.prepMinutes} minutes`

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
          💰 {food.cost} · ⏱ {food.prepMinutes}m
        </span>
      </button>
    )
  }

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
            <span className={overBudget ? 'budget-over' : ''} aria-label={`Spent ${totalCost} of ${activeBudget.coins} coins`}>
              💰 {totalCost} / {activeBudget.coins}
            </span>
            <span className="budget-divider" aria-hidden="true">·</span>
            <span className={overTime ? 'budget-over' : ''} aria-label={`Used ${totalMinutes} of ${activeBudget.minutes} minutes`}>
              ⏱ {totalMinutes} / {activeBudget.minutes} min
            </span>
            {isLunch && <span className="budget-label">🎒 lunchbox</span>}
          </div>
          <p className="pantry-hint">{planningHint}</p>
          <div className="pantry-row">{defaultPantry.map(renderPantryItem)}</div>
          <div className="kitchen-actions">
            {isBreakfast ? (
              <button
                type="button"
                className="primary-action"
                onClick={serveBreakfast}
                disabled={!canServeBreakfast}
              >
                🍽 Serve breakfast
              </button>
            ) : (
              <button
                type="button"
                className="primary-action"
                onClick={packLunch}
                disabled={!canPackLunch}
              >
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
          <button type="button" className="primary-action" onClick={reset}>
            🔄 Start the morning over
          </button>
        </div>
      )}

      <footer className="kitchen-footer">
        {state === 'breakfast-served' && (
          <p><em>Breakfast eaten. Now pack the child off to school — what goes in the lunchbox?</em></p>
        )}
        {state === 'lunch-packed' && (
          <p><em>Lunchbox packed, family fed. Morning routine done.</em></p>
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
