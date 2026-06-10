import { useEffect, useState } from 'react'
import { defaultFamily } from '../family/defaultFamily'
import { STAGE_PROFILES, STAGE_DEFAULTS, MAX_FAMILY_SIZE } from '../family/stages'
import { computeDayEnergy } from '../family/energy'
import type { FamilyMember, LifeStage } from '../family/types'
import type { Food, MealTone } from '../food/types'
import { KITCHENS, DEFAULT_KITCHEN, type KitchenId } from '../food/kitchens'
import { DEFAULT_BUDGETS, BUDGET_LIMITS, type MealBudget, type MealKey as BudgetKey } from '../food/budget'
import {
  MEAL_CONFIG, currentMealKey, plateReaction, dayMarkerFor,
  type KitchenState, type MealKey, type ServedKey,
} from '../game/meals'
import {
  loadSaved, saveState, makeId, emptyMealAssignments, initialServed,
  type MealAssignmentsMap, type Plate,
} from '../game/persistence'
import { FamilyMember as FamilyMemberView } from './FamilyMember'
import { Hub, type HubCard } from './Hub'
import { PlanningView } from './PlanningView'
import { EndOfDayReport } from './EndOfDayReport'
import { BudgetSettings } from './BudgetSettings'
import { FamilySettings } from './FamilySettings'
import { KitchenSelect } from './KitchenSelect'
import { Tutorial } from './Tutorial'
import './KitchenScene.css'

type Props = { onExit: () => void }

export function KitchenScene({ onExit }: Props) {
  const saved = loadSaved()

  const [state, setState] = useState<KitchenState>(saved.tutorialSeen ? 'hub' : 'tutorial')
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null)
  const [mealAssignments, setMealAssignments] = useState<MealAssignmentsMap>(saved.mealAssignments ?? emptyMealAssignments())
  const [schoolLunches, setSchoolLunches] = useState<Record<string, Plate>>(saved.schoolLunches ?? {})
  const [mealsServed, setMealsServed] = useState<Record<ServedKey, boolean>>(saved.mealsServed ?? initialServed())
  const [budgets, setBudgets] = useState<Record<BudgetKey, MealBudget>>(saved.budgets ?? DEFAULT_BUDGETS)
  const [family, setFamily] = useState<FamilyMember[]>(saved.family ?? defaultFamily)
  const [kitchenId, setKitchenId] = useState<KitchenId>(saved.kitchenId ?? DEFAULT_KITCHEN)
  const [day, setDay] = useState<number>(saved.day ?? 1)
  const [tutorialSeen, setTutorialSeen] = useState<boolean>(saved.tutorialSeen ?? false)
  const [tutorialStep, setTutorialStep] = useState(0)

  useEffect(() => {
    saveState({ mealAssignments, schoolLunches, mealsServed, budgets, family, kitchenId, day, tutorialSeen })
  }, [mealAssignments, schoolLunches, mealsServed, budgets, family, kitchenId, day, tutorialSeen])

  const kitchen = KITCHENS[kitchenId]
  const pantry = kitchen.pantry
  const findFood = (id: string | null | undefined): Food | undefined =>
    id ? pantry.find(f => f.id === id) : undefined

  const childMembers = family.filter(m => m.profile.lifeStage === 'child')
  const numChildren = Math.max(1, childMembers.length)

  const foodsOnPlate = (mealKey: MealKey, memberId: string): Food[] =>
    (mealAssignments[mealKey]?.[memberId] ?? []).map(findFood).filter((f): f is Food => Boolean(f))
  const schoolLunchFoodsFor = (memberId: string): Food[] =>
    (schoolLunches[memberId] ?? []).map(findFood).filter((f): f is Food => Boolean(f))

  // ---- per-character consumed foods (whole day) ----
  const consumedFoodsFor = (memberId: string): Food[] => {
    const member = family.find(m => m.id === memberId)
    const foods: Food[] = []
    if (mealsServed.breakfast) foods.push(...foodsOnPlate('breakfast', memberId))
    if (member?.profile.lifeStage === 'child') {
      const home = mealsServed.lunch ? foodsOnPlate('lunch', memberId) : []
      if (home.length > 0) foods.push(...home)
      else if (mealsServed.schoolLunch) foods.push(...schoolLunchFoodsFor(memberId))
    } else if (mealsServed.lunch) {
      foods.push(...foodsOnPlate('lunch', memberId))
    }
    if (mealsServed.snack) foods.push(...foodsOnPlate('snack', memberId))
    if (mealsServed.dinner) foods.push(...foodsOnPlate('dinner', memberId))
    return foods
  }
  const caloriesFor = (memberId: string): number => consumedFoodsFor(memberId).reduce((s, f) => s + f.calories, 0)
  const macrosFor = (memberId: string) => {
    const foods = consumedFoodsFor(memberId)
    return {
      protein: foods.reduce((s, f) => s + f.protein, 0),
      carbs:   foods.reduce((s, f) => s + f.carbs,   0),
      fat:     foods.reduce((s, f) => s + f.fat,     0),
    }
  }
  const macroTargetsFor = (memberId: string) => {
    const m = family.find(x => x.id === memberId)
    return m ? { protein: m.profile.dailyProtein, carbs: m.profile.dailyCarbs, fat: m.profile.dailyFat }
             : { protein: 0, carbs: 0, fat: 0 }
  }

  // ---- current planning context ----
  const currentMeal = currentMealKey(state)
  const currentConfig = currentMeal ? MEAL_CONFIG[currentMeal] : null
  const currentPlateMembers = currentConfig ? family.filter(currentConfig.hasPlate) : []
  const currentRequiredMembers = currentConfig ? family.filter(currentConfig.isRequired) : []

  const isPlanningMeal = currentMeal !== null
  const isPackingSchoolLunch = state === 'packing-school-lunch'

  // School-lunch budget scales with number of children.
  const scaledSchoolBudget: MealBudget = {
    coins: budgets.schoolLunch.coins * numChildren,
    minutes: budgets.schoolLunch.minutes * numChildren,
  }
  const activeBudget = isPackingSchoolLunch ? scaledSchoolBudget : (currentMeal ? budgets[currentMeal] : budgets.breakfast)

  const sumPlate = (foods: Food[], field: 'cost' | 'prepMinutes' | 'calories' | 'protein' | 'carbs' | 'fat'): number =>
    foods.reduce((s, f) => s + (f[field] ?? 0), 0)

  const mealTotalCost = currentMeal ? currentPlateMembers.reduce((s, m) => s + sumPlate(foodsOnPlate(currentMeal, m.id), 'cost'), 0) : 0
  const mealTotalMinutes = currentMeal ? currentPlateMembers.reduce((s, m) => s + sumPlate(foodsOnPlate(currentMeal, m.id), 'prepMinutes'), 0) : 0
  const schoolTotalCost = childMembers.reduce((s, m) => s + sumPlate(schoolLunchFoodsFor(m.id), 'cost'), 0)
  const schoolTotalMinutes = childMembers.reduce((s, m) => s + sumPlate(schoolLunchFoodsFor(m.id), 'prepMinutes'), 0)

  const totalCost = isPackingSchoolLunch ? schoolTotalCost : mealTotalCost
  const totalMinutes = isPackingSchoolLunch ? schoolTotalMinutes : mealTotalMinutes
  const overBudget = totalCost > activeBudget.coins
  const overTime = totalMinutes > activeBudget.minutes

  const sumAllField = (field: 'calories' | 'protein' | 'carbs' | 'fat'): number => {
    if (isPackingSchoolLunch) return childMembers.reduce((s, m) => s + sumPlate(schoolLunchFoodsFor(m.id), field), 0)
    if (!currentMeal) return 0
    return currentPlateMembers.reduce((s, m) => s + sumPlate(foodsOnPlate(currentMeal, m.id), field), 0)
  }
  const mealTotals = {
    calories: sumAllField('calories'),
    protein:  sumAllField('protein'),
    carbs:    sumAllField('carbs'),
    fat:      sumAllField('fat'),
  }

  const allRequiredAssigned = currentRequiredMembers.every(m => (mealAssignments[currentMeal!]?.[m.id]?.length ?? 0) > 0)
  const anyPlateFilled = currentMeal ? currentPlateMembers.some(m => (mealAssignments[currentMeal]?.[m.id]?.length ?? 0) > 0) : false
  const canServeMeal = (currentConfig?.key === 'snack' ? anyPlateFilled : allRequiredAssigned) && !overBudget && !overTime
  const anySchoolLunchFilled = childMembers.some(m => (schoolLunches[m.id]?.length ?? 0) > 0)
  const canPackSchoolLunch = anySchoolLunchFilled && !overBudget && !overTime

  // ---- transitions ----
  const startPlanning = (mealKey: MealKey) => { setState(MEAL_CONFIG[mealKey].planState); setSelectedFoodId(null) }
  const startPackingSchoolLunch = () => { setState('packing-school-lunch'); setSelectedFoodId(null) }
  const serveMeal = () => { if (!currentConfig) return; setMealsServed(p => ({ ...p, [currentConfig.key]: true })); setState('hub'); setSelectedFoodId(null) }
  const packSchoolLunch = () => { setMealsServed(p => ({ ...p, schoolLunch: true })); setState('hub'); setSelectedFoodId(null) }
  const backToHub = () => { setState('hub'); setSelectedFoodId(null) }

  const clearDay = () => {
    setMealAssignments(emptyMealAssignments())
    setSchoolLunches({})
    setMealsServed(initialServed())
    setSelectedFoodId(null)
  }
  const resetDay = () => { clearDay(); setState('hub') }
  const startNextDay = () => { clearDay(); setDay(d => d + 1); setState('hub') }
  const switchKitchen = (id: KitchenId) => {
    if (id !== kitchenId) { setKitchenId(id); clearDay(); setDay(1) }
    setState('hub')
  }

  const onPlateClick = (memberId: string) => {
    if (selectedFoodId === null) return
    const member = family.find(m => m.id === memberId)
    if (!member) return
    if (isPlanningMeal && currentMeal && currentConfig?.hasPlate(member)) {
      setMealAssignments(prev => {
        const cur = prev[currentMeal]?.[memberId] ?? []
        const next = cur.includes(selectedFoodId) ? cur.filter(id => id !== selectedFoodId) : [...cur, selectedFoodId]
        return { ...prev, [currentMeal]: { ...prev[currentMeal], [memberId]: next } }
      })
    } else if (isPackingSchoolLunch && member.profile.lifeStage === 'child') {
      const food = findFood(selectedFoodId)
      if (food?.packable) {
        setSchoolLunches(prev => {
          const cur = prev[memberId] ?? []
          const next = cur.includes(selectedFoodId) ? cur.filter(id => id !== selectedFoodId) : [...cur, selectedFoodId]
          return { ...prev, [memberId]: next }
        })
      }
    }
  }

  // ---- budgets ----
  const updateBudget = (key: BudgetKey, field: 'coins' | 'minutes', delta: number) => {
    const limits = BUDGET_LIMITS[field]
    setBudgets(prev => ({ ...prev, [key]: { ...prev[key], [field]: Math.max(limits.min, Math.min(limits.max, prev[key][field] + delta)) } }))
  }

  // ---- family ----
  const updateFamilyMember = (id: string, patch: Partial<{ name: string; emoji: string }>) =>
    setFamily(prev => prev.map(m => m.id === id ? { ...m, ...patch } : m))
  const addMember = (stage: LifeStage) => {
    if (family.length >= MAX_FAMILY_SIZE) return
    const d = STAGE_DEFAULTS[stage]
    const sameStageCount = family.filter(m => m.profile.lifeStage === stage).length
    setFamily(prev => [...prev, {
      id: makeId(),
      name: sameStageCount > 0 ? `${d.label} ${sameStageCount + 1}` : d.label,
      emoji: d.emoji,
      profile: { lifeStage: stage, ...STAGE_PROFILES[stage] },
      morningGreeting: d.greeting,
    }])
  }
  const removeMember = (id: string) => { if (family.length > 1) setFamily(prev => prev.filter(m => m.id !== id)) }

  // ---- speech ----
  const speechFor = (memberId: string): { message?: string; tone?: MealTone } => {
    const member = family.find(m => m.id === memberId)
    if (!member) return {}
    if (state === 'end-of-day') {
      const report = computeDayEnergy(member, consumedFoodsFor(memberId))
      return { message: report.verdict, tone: report.tone }
    }
    if (mealsServed.dinner) {
      const r = plateReaction(member, foodsOnPlate('dinner', memberId))
      if (r) return { message: `For dinner: ${r.message}`, tone: r.tone }
    }
    if (mealsServed.snack) {
      const r = plateReaction(member, foodsOnPlate('snack', memberId))
      if (r) return { message: `Snack: ${r.message}`, tone: r.tone }
    }
    if (member.profile.lifeStage === 'child') {
      const home = mealsServed.lunch ? foodsOnPlate('lunch', memberId) : []
      if (home.length > 0) { const r = plateReaction(member, home); if (r) return { message: `For lunch: ${r.message}`, tone: r.tone } }
      if (mealsServed.schoolLunch) { const r = plateReaction(member, schoolLunchFoodsFor(memberId)); if (r) return { message: `For lunch: ${r.message}`, tone: r.tone } }
    } else if (mealsServed.lunch) {
      const r = plateReaction(member, foodsOnPlate('lunch', memberId))
      if (r) return { message: `For lunch: ${r.message}`, tone: r.tone }
    }
    if (mealsServed.breakfast) {
      const r = plateReaction(member, foodsOnPlate('breakfast', memberId))
      if (r) return { message: r.message, tone: r.tone }
    }
    return {}
  }

  // ---- plates ----
  const plateFor = (memberId: string): Food[] | undefined => {
    if (isPlanningMeal && currentMeal && currentConfig) {
      const member = family.find(m => m.id === memberId)
      if (member && currentConfig.hasPlate(member)) return foodsOnPlate(currentMeal, memberId)
    }
    if (isPackingSchoolLunch) {
      const member = family.find(m => m.id === memberId)
      if (member?.profile.lifeStage === 'child') return schoolLunchFoodsFor(memberId)
    }
    return undefined
  }

  // ---- hint ----
  const planningHint = (() => {
    if (isPlanningMeal && currentConfig) {
      if (overBudget && overTime) return `Over budget AND over time — swap for cheaper/faster, or raise the budget in ⚙ settings.`
      if (overBudget) return `Over budget — try cheaper picks, or raise it in ⚙ settings.`
      if (overTime) return `Over time — try faster picks, or raise it in ⚙ settings.`
      if (currentConfig.key === 'snack' && !anyPlateFilled) return 'Pick a food and tap a plate. Snacks are optional — fill the plates of whoever wants one.'
      if (!allRequiredAssigned && selectedFoodId) return `Tap a plate to add this food (tap it again on a plate to remove).`
      if (currentConfig.key !== 'snack' && !allRequiredAssigned) {
        const remaining = currentRequiredMembers.filter(m => !mealAssignments[currentMeal!]?.[m.id]?.length).map(m => m.name).join(', ')
        const childNote = currentMeal === 'lunch' && childMembers.some(c => (mealAssignments.lunch?.[c.id]?.length ?? 0) === 0)
          ? " Kids' plates are optional — fill them only if they're home instead of at school."
          : ''
        return `Pick a food, then tap a plate. Still to serve: ${remaining}.${childNote}`
      }
      return `Looks good — add more items to a plate, or serve ${currentConfig.label} when ready.`
    }
    if (isPackingSchoolLunch) {
      const selected = findFood(selectedFoodId)
      if (overBudget && overTime) return "Too expensive AND too slow for the lunchboxes."
      if (overBudget) return "Too expensive for the lunchboxes."
      if (overTime) return "Too slow to prep before school."
      if (selected && !selected.packable) return "That won't travel well — pick something packable."
      if (!anySchoolLunchFilled && selectedFoodId) return "Tap a child's lunchbox to pack it (multiple items welcome)."
      if (!anySchoolLunchFilled) return "Pick something packable for the kids' school lunches."
      return 'Looks good — add more, or pack it when ready.'
    }
    return ''
  })()

  const anythingServed = Object.values(mealsServed).some(Boolean)
  const showCalories = anythingServed || state === 'end-of-day'

  const dayReports = state === 'end-of-day' ? family.map(m => ({ member: m, report: computeDayEnergy(m, consumedFoodsFor(m.id)) })) : []
  const everyoneFed = dayReports.every(r => r.report.status === 'well-fed' || r.report.status === 'comfortable')

  const mealCardEmojis = (mealKey: MealKey): string[] =>
    family.filter(MEAL_CONFIG[mealKey].hasPlate).flatMap(m => foodsOnPlate(mealKey, m.id).map(f => f.emoji))
  const schoolCardEmojis = (): string[] => childMembers.flatMap(m => schoolLunchFoodsFor(m.id).map(f => f.emoji))

  const hubCards: HubCard[] = [
    { emoji: '🍳', name: 'Breakfast',     served: mealsServed.breakfast,   foodEmojis: mealsServed.breakfast ? mealCardEmojis('breakfast') : [], onClick: () => startPlanning('breakfast') },
    { emoji: '🎒', name: 'School lunch',  served: mealsServed.schoolLunch, foodEmojis: mealsServed.schoolLunch ? schoolCardEmojis() : [],        onClick: startPackingSchoolLunch },
    { emoji: '🥗', name: 'Lunch at home', served: mealsServed.lunch,       foodEmojis: mealsServed.lunch ? mealCardEmojis('lunch') : [],         onClick: () => startPlanning('lunch') },
    { emoji: '🍪', name: 'Snack',         served: mealsServed.snack,       foodEmojis: mealsServed.snack ? mealCardEmojis('snack') : [],         onClick: () => startPlanning('snack') },
    { emoji: '🍝', name: 'Dinner',        served: mealsServed.dinner,      foodEmojis: mealsServed.dinner ? mealCardEmojis('dinner') : [],       onClick: () => startPlanning('dinner') },
  ]

  const finishTutorial = () => { setTutorialSeen(true); setState('hub'); setTutorialStep(0) }

  return (
    <main className="kitchen-scene">
      <header className="kitchen-header">
        <button type="button" className="back-button"
          onClick={() => { if (state === 'hub' || state === 'tutorial') onExit(); else backToHub() }}
          aria-label={state === 'hub' ? 'Back to title screen' : 'Back to kitchen'}>
          ← {state === 'hub' || state === 'tutorial' ? 'Title' : 'Kitchen'}
        </button>
        <div className="header-center">
          <span className="day-marker">Day {day} · {dayMarkerFor(state)}</span>
          <span className="kitchen-subtitle">{kitchen.name} {kitchen.emoji}</span>
        </div>
        <button type="button" className="brand-mark brand-mark-button" onClick={onExit} aria-label="Back to title screen">Critter Cafe</button>
      </header>

      <section className="family-row" aria-label="Family">
        {family.map((member, i) => {
          const { message, tone } = speechFor(member.id)
          return (
            <FamilyMemberView key={member.id} member={member} speechDelayMs={120 * i}
              speechMessage={message} speechTone={tone}
              assignedFoods={plateFor(member.id)} onPlateClick={() => onPlateClick(member.id)}
              caloriesConsumed={showCalories ? caloriesFor(member.id) : undefined}
              macrosConsumed={showCalories ? macrosFor(member.id) : undefined}
              macroTargets={showCalories ? macroTargetsFor(member.id) : undefined} />
          )
        })}
      </section>

      <div className="kitchen-floor" aria-hidden="true" />

      {state === 'hub' && (
        <Hub cards={hubCards} anythingServed={anythingServed}
          onEndOfDay={() => setState('end-of-day')}
          onKitchenSelect={() => setState('kitchen-select')}
          onBudgets={() => setState('budgets')}
          onFamily={() => setState('family-settings')}
          onTutorial={() => { setTutorialStep(0); setState('tutorial') }}
          onResetDay={resetDay} />
      )}

      {(isPlanningMeal || isPackingSchoolLunch) && (
        <PlanningView
          ariaLabel={isPackingSchoolLunch ? 'School-lunch pantry' : `${currentConfig?.label} pantry`}
          pantry={pantry}
          selectedFoodId={selectedFoodId}
          onSelectFood={setSelectedFoodId}
          disableUnpackable={isPackingSchoolLunch}
          budget={activeBudget}
          totalCost={totalCost} totalMinutes={totalMinutes}
          overBudget={overBudget} overTime={overTime}
          budgetLabel={isPackingSchoolLunch ? `🎒 ${numChildren} lunchbox${numChildren > 1 ? 'es' : ''}` : `${currentConfig?.emoji} ${currentConfig?.label}`}
          totals={mealTotals}
          hint={planningHint}
          canServe={isPackingSchoolLunch ? canPackSchoolLunch : canServeMeal}
          serveLabel={isPackingSchoolLunch ? '🎒 Pack lunches' : (currentConfig?.serveLabel ?? 'Serve')}
          onServe={isPackingSchoolLunch ? packSchoolLunch : serveMeal}
          onBack={backToHub} />
      )}

      {state === 'end-of-day' && (
        <EndOfDayReport day={day} reports={dayReports} everyoneFed={everyoneFed}
          onNextDay={startNextDay} onBack={backToHub} />
      )}

      {state === 'kitchen-select' && (
        <KitchenSelect activeId={kitchenId} onSelect={switchKitchen} onBack={backToHub} />
      )}

      {state === 'budgets' && (
        <BudgetSettings budgets={budgets} onUpdate={updateBudget}
          onReset={() => setBudgets(DEFAULT_BUDGETS)} onBack={backToHub} />
      )}

      {state === 'family-settings' && (
        <FamilySettings family={family} onUpdate={updateFamilyMember} onAdd={addMember} onRemove={removeMember}
          onReset={() => setFamily(defaultFamily)} onBack={backToHub}
          canRemove={family.length > 1} canAdd={family.length < MAX_FAMILY_SIZE} />
      )}

      {state === 'tutorial' && (
        <Tutorial step={tutorialStep} onNext={() => setTutorialStep(s => s + 1)} onSkip={finishTutorial} onFinish={finishTutorial} />
      )}

      <footer className="kitchen-footer">
        {state === 'hub' && <p><em>Pick any meal. Build combo plates, add family, switch kitchens — your progress saves automatically.</em></p>}
        {(isPlanningMeal || isPackingSchoolLunch) && <p><em>Green = ideal · yellow = okay · orange or red = wrong fit. Tap a food twice on one plate to remove it.</em></p>}
      </footer>
    </main>
  )
}
