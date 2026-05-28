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

type PlanningState = 'idle' | 'planning' | 'served'

export function KitchenScene({ onExit }: Props) {
  const [state, setState] = useState<PlanningState>('idle')
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null)
  const [assignments, setAssignments] = useState<Record<string, string | null>>({})

  const budget = dailyBudgets.breakfast

  const findFood = (id: string | null | undefined): Food | undefined =>
    id ? defaultPantry.find(f => f.id === id) : undefined

  const getReaction = (memberId: string): MealReaction | undefined => {
    const member = defaultFamily.find(m => m.id === memberId)
    const food = findFood(assignments[memberId])
    if (!member || !food) return undefined
    return food.reactions[member.profile.lifeStage]
  }

  const totalCost = defaultFamily.reduce((sum, m) => {
    const food = findFood(assignments[m.id])
    return sum + (food?.cost ?? 0)
  }, 0)

  const totalMinutes = defaultFamily.reduce((sum, m) => {
    const food = findFood(assignments[m.id])
    return sum + (food?.prepMinutes ?? 0)
  }, 0)

  const allAssigned = defaultFamily.every(m => assignments[m.id])
  const overBudget = totalCost > budget.coins
  const overTime = totalMinutes > budget.minutes
  const canServe = allAssigned && !overBudget && !overTime

  const startPlanning = () => {
    setState('planning')
    setAssignments({})
    setSelectedFoodId(null)
  }

  const onPlateClick = (memberId: string) => {
    if (state !== 'planning' || selectedFoodId === null) return
    setAssignments(prev => ({ ...prev, [memberId]: selectedFoodId }))
  }

  const serve = () => {
    setState('served')
    setSelectedFoodId(null)
  }

  const reset = () => {
    setState('idle')
    setAssignments({})
    setSelectedFoodId(null)
  }

  const planningHint = (() => {
    if (overBudget && overTime) return 'Over budget AND over time — swap for something cheaper and faster.'
    if (overBudget) return 'Over budget — try a cheaper choice.'
    if (overTime) return 'Over time — try something faster.'
    if (!allAssigned && selectedFoodId) return 'Now tap a plate to serve it.'
    if (!allAssigned) return "Pick a food, then tap who you're serving."
    return 'Looks good — serve when ready.'
  })()

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
          const reaction = state === 'served' ? getReaction(member.id) : undefined
          const assignedFood = state === 'planning'
            ? (findFood(assignments[member.id]) ?? null)
            : undefined

          return (
            <FamilyMember
              key={member.id}
              member={member}
              speechDelayMs={200 * i}
              speechMessage={reaction?.message}
              speechTone={reaction?.tone}
              assignedFood={assignedFood}
              onPlateClick={() => onPlateClick(member.id)}
            />
          )
        })}
      </section>

      <div className="kitchen-floor" aria-hidden="true" />

      {state === 'idle' && (
        <div className="kitchen-actions">
          <button type="button" className="primary-action" onClick={startPlanning}>
            🍳 Plan breakfast
          </button>
        </div>
      )}

      {state === 'planning' && (
        <section className="pantry" aria-label="Pantry">
          <div className="budget-bar" aria-label="Budget tracker">
            <span className={overBudget ? 'budget-over' : ''} aria-label={`Spent ${totalCost} of ${budget.coins} coins`}>
              💰 {totalCost} / {budget.coins}
            </span>
            <span className="budget-divider" aria-hidden="true">·</span>
            <span className={overTime ? 'budget-over' : ''} aria-label={`Used ${totalMinutes} of ${budget.minutes} minutes`}>
              ⏱ {totalMinutes} / {budget.minutes} min
            </span>
          </div>
          <p className="pantry-hint">{planningHint}</p>
          <div className="pantry-row">
            {defaultPantry.map(food => (
              <button
                key={food.id}
                type="button"
                className={`pantry-item ${selectedFoodId === food.id ? 'pantry-item-selected' : ''}`}
                onClick={() => setSelectedFoodId(food.id)}
                aria-pressed={selectedFoodId === food.id}
                aria-label={`${food.name}, costs ${food.cost} coins, takes ${food.prepMinutes} minutes`}
              >
                <span className="pantry-item-emoji" aria-hidden="true">{food.emoji}</span>
                <span className="pantry-item-name">{food.name}</span>
                <span className="pantry-item-meta" aria-hidden="true">
                  💰 {food.cost} · ⏱ {food.prepMinutes}m
                </span>
              </button>
            ))}
          </div>
          <div className="kitchen-actions">
            <button
              type="button"
              className="primary-action"
              onClick={serve}
              disabled={!canServe}
            >
              🍽 Serve breakfast
            </button>
            <button type="button" className="secondary-action" onClick={reset}>
              Cancel
            </button>
          </div>
        </section>
      )}

      {state === 'served' && (
        <div className="kitchen-actions">
          <button type="button" className="primary-action" onClick={reset}>
            Plan another meal
          </button>
        </div>
      )}

      <footer className="kitchen-footer">
        {state === 'served' ? (
          <p><em>Green = great fit · yellow = okay · orange or red = not the right fit for that person.</em></p>
        ) : (
          <p><em>Coming soon:</em> name your family · shop at the market · build your Nutrient-dex</p>
        )}
      </footer>
    </main>
  )
}
