import { useEffect, useState } from 'react'
import { defaultFamily } from '../family/defaultFamily'
import { STAGE_PROFILES, STAGE_DEFAULTS, MAX_FAMILY_SIZE } from '../family/stages'
import { computeDayEnergy, morningAfter, type EnergyStatus } from '../family/energy'
import type { FamilyMember, LifeStage } from '../family/types'
import type { Food, MealTone } from '../food/types'
import { KITCHENS, DEFAULT_KITCHEN, ALL_FOODS, findFoodById, type KitchenId } from '../food/kitchens'
import {
  DEFAULT_MEAL_MINUTES, DEFAULT_DAILY_MONEY, MONEY_LIMITS, MINUTES_LIMITS,
  type MealKey as BudgetKey,
} from '../food/budget'
import {
  MEAL_CONFIG, currentMealKey, plateReaction, dayMarkerFor,
  type KitchenState, type MealKey, type ServedKey,
} from '../game/meals'
import {
  ownedCount, totalUnits, addPurchase, removeNewest, consumeFIFO,
  expireBatches, expiresTomorrow, specialsForDay, priceOf,
  type StockBatches,
} from '../game/economy'
import {
  loadSaved, saveState, makeId, emptyMealAssignments, initialServed,
  type MealAssignmentsMap, type Plate, type SpoilageReport,
} from '../game/persistence'
import { FamilyMember as FamilyMemberView } from './FamilyMember'
import { Hub, type HubCard } from './Hub'
import { Market } from './Market'
import { PlanningView } from './PlanningView'
import { EndOfDayReport } from './EndOfDayReport'
import { BudgetSettings } from './BudgetSettings'
import { FamilySettings } from './FamilySettings'
import { KitchenSelect } from './KitchenSelect'
import { NutrientDex } from './NutrientDex'
import { Tutorial } from './Tutorial'
import './KitchenScene.css'

type Props = { onExit: () => void }

const MEAL_KEYS: MealKey[] = ['breakfast', 'lunch', 'snack', 'dinner']

export function KitchenScene({ onExit }: Props) {
  const saved = loadSaved()

  const [state, setState] = useState<KitchenState>(saved.tutorialSeen ? 'hub' : 'tutorial')
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null)
  const [mealAssignments, setMealAssignments] = useState<MealAssignmentsMap>(saved.mealAssignments ?? emptyMealAssignments())
  const [schoolLunches, setSchoolLunches] = useState<Record<string, Plate>>(saved.schoolLunches ?? {})
  const [mealsServed, setMealsServed] = useState<Record<ServedKey, boolean>>(saved.mealsServed ?? initialServed())
  const [mealMinutes, setMealMinutes] = useState<Record<BudgetKey, number>>(saved.mealMinutes ?? DEFAULT_MEAL_MINUTES)
  const [dailyMoney, setDailyMoney] = useState<number>(saved.dailyMoney ?? DEFAULT_DAILY_MONEY)
  const [wallet, setWallet] = useState<number>(saved.wallet ?? DEFAULT_DAILY_MONEY)
  const [stockBatches, setStockBatches] = useState<StockBatches>(saved.stockBatches ?? {})
  const [dayStartWallet, setDayStartWallet] = useState<number>(saved.dayStartWallet ?? saved.wallet ?? DEFAULT_DAILY_MONEY)
  const [dayStartStockBatches, setDayStartStockBatches] = useState<StockBatches>(saved.dayStartStockBatches ?? saved.stockBatches ?? {})
  const [lastSpoilage, setLastSpoilage] = useState<SpoilageReport | null>(saved.lastSpoilage ?? null)
  const [family, setFamily] = useState<FamilyMember[]>(saved.family ?? defaultFamily)
  const [kitchenId, setKitchenId] = useState<KitchenId>(saved.kitchenId ?? DEFAULT_KITCHEN)
  const [day, setDay] = useState<number>(saved.day ?? 1)
  const [tutorialSeen, setTutorialSeen] = useState<boolean>(saved.tutorialSeen ?? false)
  const [tutorialStep, setTutorialStep] = useState(0)
  const [dexSeen, setDexSeen] = useState<string[]>(saved.dexSeen ?? [])
  const [carryOver, setCarryOver] = useState<Record<string, EnergyStatus>>(saved.carryOver ?? {})

  useEffect(() => {
    saveState({
      mealAssignments, schoolLunches, mealsServed, mealMinutes, dailyMoney,
      wallet, stockBatches, dayStartWallet, dayStartStockBatches, lastSpoilage,
      family, kitchenId, day, tutorialSeen, dexSeen, carryOver,
    })
  }, [mealAssignments, schoolLunches, mealsServed, mealMinutes, dailyMoney,
      wallet, stockBatches, dayStartWallet, dayStartStockBatches, lastSpoilage,
      family, kitchenId, day, tutorialSeen, dexSeen, carryOver])

  const kitchen = KITCHENS[kitchenId]
  // Meals can mix foods from any kitchen — resolve ids globally.
  const findFood = (id: string | null | undefined): Food | undefined =>
    id ? findFoodById(id) : undefined

  const childMembers = family.filter(m => m.profile.lifeStage === 'child')
  const numChildren = Math.max(1, childMembers.length)

  const foodsOnPlate = (mealKey: MealKey, memberId: string): Food[] =>
    (mealAssignments[mealKey]?.[memberId] ?? []).map(findFood).filter((f): f is Food => Boolean(f))
  const schoolLunchFoodsFor = (memberId: string): Food[] =>
    (schoolLunches[memberId] ?? []).map(findFood).filter((f): f is Food => Boolean(f))

  // ---- stock & reservations ----
  // Stock is consumed when a meal is SERVED. While planning, units sitting
  // on unserved plates are "reserved": still in the pantry, but not
  // assignable twice.
  const reservedCount = (foodId: string): number => {
    let n = 0
    for (const mk of MEAL_KEYS) {
      if (mealsServed[mk]) continue
      for (const m of family) n += (mealAssignments[mk]?.[m.id] ?? []).filter(id => id === foodId).length
    }
    if (!mealsServed.schoolLunch) {
      for (const c of childMembers) n += (schoolLunches[c.id] ?? []).filter(id => id === foodId).length
    }
    return n
  }
  const availableOf = (foodId: string): number => ownedCount(stockBatches, foodId) - reservedCount(foodId)

  // Daily specials: deterministic from the day number.
  const specials = specialsForDay(day, ALL_FOODS)
  const priceOfFood = (food: Food): number => priceOf(food, specials)

  const buyFood = (food: Food) => {
    const price = priceOfFood(food)
    if (wallet < price) return
    setWallet(w => w - price)
    setStockBatches(prev => addPurchase(prev, food.id, day, price))
  }
  const sellFood = (food: Food) => {
    if (ownedCount(stockBatches, food.id) <= reservedCount(food.id)) return
    const result = removeNewest(stockBatches, food.id)
    if (!result) return
    setStockBatches(result.next)
    setWallet(w => w + result.refund)
  }
  const consumeStock = (ids: string[]) => {
    if (ids.length === 0) return
    setStockBatches(prev => consumeFIFO(prev, ids))
  }

  const totalStockUnits = totalUnits(stockBatches)

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

  // ---- time budget (cooking costs time; money was spent at the market) ----
  const activeTimeBudget = isPackingSchoolLunch
    ? mealMinutes.schoolLunch * numChildren
    : (currentMeal ? mealMinutes[currentMeal] : mealMinutes.breakfast)

  const sumPlate = (foods: Food[], field: 'prepMinutes' | 'calories' | 'protein' | 'carbs' | 'fat'): number =>
    foods.reduce((s, f) => s + (f[field] ?? 0), 0)

  const totalMinutes = isPackingSchoolLunch
    ? childMembers.reduce((s, m) => s + sumPlate(schoolLunchFoodsFor(m.id), 'prepMinutes'), 0)
    : (currentMeal ? currentPlateMembers.reduce((s, m) => s + sumPlate(foodsOnPlate(currentMeal, m.id), 'prepMinutes'), 0) : 0)
  const overTime = totalMinutes > activeTimeBudget

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
  const canServeMeal = (currentConfig?.key === 'snack' ? anyPlateFilled : allRequiredAssigned) && !overTime
  const anySchoolLunchFilled = childMembers.some(m => (schoolLunches[m.id]?.length ?? 0) > 0)
  const canPackSchoolLunch = anySchoolLunchFilled && !overTime

  // ---- transitions ----
  const startPlanning = (mealKey: MealKey) => { setState(MEAL_CONFIG[mealKey].planState); setSelectedFoodId(null) }
  const startPackingSchoolLunch = () => { setState('packing-school-lunch'); setSelectedFoodId(null) }
  const discoverFoods = (ids: string[]) => {
    if (ids.length > 0) setDexSeen(prev => Array.from(new Set([...prev, ...ids])))
  }
  const serveMeal = () => {
    if (!currentConfig || !currentMeal) return
    const ids = currentPlateMembers.flatMap(m => mealAssignments[currentMeal]?.[m.id] ?? [])
    discoverFoods(ids)
    consumeStock(ids)
    setMealsServed(p => ({ ...p, [currentConfig.key]: true }))
    setState('hub'); setSelectedFoodId(null)
  }
  const packSchoolLunch = () => {
    const ids = childMembers.flatMap(m => schoolLunches[m.id] ?? [])
    discoverFoods(ids)
    consumeStock(ids)
    setMealsServed(p => ({ ...p, schoolLunch: true }))
    setState('hub'); setSelectedFoodId(null)
  }
  const backToHub = () => { setState('hub'); setSelectedFoodId(null) }

  const clearDay = () => {
    setMealAssignments(emptyMealAssignments())
    setSchoolLunches({})
    setMealsServed(initialServed())
    setSelectedFoodId(null)
  }
  // Reset day = roll back the whole day's transaction: meals, stock, wallet.
  const resetDay = () => {
    clearDay()
    setWallet(dayStartWallet)
    setStockBatches(JSON.parse(JSON.stringify(dayStartStockBatches)))
    setState('hub')
  }
  const startNextDay = () => {
    // Yesterday's eating becomes today's morning state.
    const next: Record<string, EnergyStatus> = {}
    for (const m of family) next[m.id] = computeDayEnergy(m, consumedFoodsFor(m.id)).status
    setCarryOver(next)
    clearDay()
    // Overnight, anything past its shelf life spoils.
    const newDay = day + 1
    const { next: freshStock, spoiled } = expireBatches(stockBatches, newDay)
    setStockBatches(freshStock)
    setDayStartStockBatches(JSON.parse(JSON.stringify(freshStock)))
    setLastSpoilage(spoiled.length > 0
      ? { day: newDay, items: spoiled.map(s => ({ foodId: s.foodId, n: s.n, coinsWasted: s.coinsWasted })) }
      : null)
    // Morning allowance lands; leftover money carries over.
    const newWallet = wallet + dailyMoney
    setWallet(newWallet)
    setDayStartWallet(newWallet)
    setDay(newDay)
    setState('hub')
  }
  // Home kitchen is a preference (header + default pantry tab) — meals mix
  // freely across cuisines, so switching never resets anything.
  const switchKitchen = (id: KitchenId) => {
    setKitchenId(id)
    setState('hub')
  }

  const onPlateClick = (memberId: string) => {
    if (selectedFoodId === null) return
    const member = family.find(m => m.id === memberId)
    if (!member) return
    if (isPlanningMeal && currentMeal && currentConfig?.hasPlate(member)) {
      const cur = mealAssignments[currentMeal]?.[memberId] ?? []
      const removing = cur.includes(selectedFoodId)
      if (!removing && availableOf(selectedFoodId) <= 0) return
      const next = removing ? cur.filter(id => id !== selectedFoodId) : [...cur, selectedFoodId]
      setMealAssignments(prev => ({ ...prev, [currentMeal]: { ...prev[currentMeal], [memberId]: next } }))
    } else if (isPackingSchoolLunch && member.profile.lifeStage === 'child') {
      const food = findFood(selectedFoodId)
      if (!food?.packable) return
      const cur = schoolLunches[memberId] ?? []
      const removing = cur.includes(selectedFoodId)
      if (!removing && availableOf(selectedFoodId) <= 0) return
      const next = removing ? cur.filter(id => id !== selectedFoodId) : [...cur, selectedFoodId]
      setSchoolLunches(prev => ({ ...prev, [memberId]: next }))
    }
  }

  // ---- settings ----
  const updateDailyMoney = (delta: number) =>
    setDailyMoney(v => Math.max(MONEY_LIMITS.min, Math.min(MONEY_LIMITS.max, v + delta)))
  const updateMealMinutes = (key: BudgetKey, delta: number) =>
    setMealMinutes(prev => ({ ...prev, [key]: Math.max(MINUTES_LIMITS.min, Math.min(MINUTES_LIMITS.max, prev[key] + delta)) }))
  const resetBudgets = () => { setMealMinutes(DEFAULT_MEAL_MINUTES); setDailyMoney(DEFAULT_DAILY_MONEY) }

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
    // Nothing eaten yet today — carry over yesterday's energy as the morning mood.
    const yesterday = carryOver[memberId]
    if (yesterday) {
      const m = morningAfter(yesterday)
      return { message: m.message, tone: m.tone }
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
    if (!isPlanningMeal && !isPackingSchoolLunch) return ''
    if (totalStockUnits === 0 && !anyPlateFilled && !anySchoolLunchFilled) {
      return 'Your pantry is empty — visit the 🛒 Market first.'
    }
    const selected = findFood(selectedFoodId)
    if (isPlanningMeal && currentConfig) {
      if (overTime) return `Over time — try faster picks, or raise it in ⚙ settings.`
      if (selected && availableOf(selected.id) <= 0 && !anyPlateHasSelected()) {
        return `No more ${selected.name} in the pantry — pick another food or buy more at the 🛒 Market.`
      }
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
    // school lunch packing
    if (overTime) return "Too slow to prep before school."
    if (selected && !selected.packable) return "That won't travel well — pick something packable."
    if (!anySchoolLunchFilled && selectedFoodId) return "Tap a child's lunchbox to pack it (multiple items welcome)."
    if (!anySchoolLunchFilled) return "Pick something packable for the kids' school lunches."
    return 'Looks good — add more, or pack it when ready.'
  })()

  function anyPlateHasSelected(): boolean {
    if (!selectedFoodId) return false
    if (currentMeal) {
      return currentPlateMembers.some(m => (mealAssignments[currentMeal]?.[m.id] ?? []).includes(selectedFoodId))
    }
    return childMembers.some(c => (schoolLunches[c.id] ?? []).includes(selectedFoodId))
  }

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

  // Spoilage banner: only for the morning it happened.
  const spoilageNote = (lastSpoilage && lastSpoilage.day === day && lastSpoilage.items.length > 0)
    ? `🗑 Spoiled overnight: ${lastSpoilage.items.map(i => `${findFoodById(i.foodId)?.emoji ?? '🍽'}×${i.n}`).join(' ')} — ${lastSpoilage.items.reduce((s, i) => s + i.coinsWasted, 0)} coins wasted. Buy fresh food closer to when you'll cook it!`
    : null

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
          <span className="kitchen-subtitle">{kitchen.name} {kitchen.emoji} · 💰 {wallet}</span>
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
          wallet={wallet}
          pantryEmpty={totalStockUnits === 0 && !anythingServed}
          spoilageNote={spoilageNote}
          onMarket={() => setState('market')}
          onEndOfDay={() => setState('end-of-day')}
          onKitchenSelect={() => setState('kitchen-select')}
          onBudgets={() => setState('budgets')}
          onFamily={() => setState('family-settings')}
          onDex={() => setState('nutrient-dex')}
          onTutorial={() => { setTutorialStep(0); setState('tutorial') }}
          onResetDay={resetDay} />
      )}

      {state === 'market' && (
        <Market
          wallet={wallet}
          homeKitchen={kitchenId}
          ownedOf={(id) => ownedCount(stockBatches, id)}
          reservedOf={reservedCount}
          specials={specials}
          priceOf={priceOfFood}
          onBuy={buyFood}
          onSell={sellFood}
          onBack={backToHub} />
      )}

      {(isPlanningMeal || isPackingSchoolLunch) && (
        <PlanningView
          ariaLabel={isPackingSchoolLunch ? 'School-lunch pantry' : `${currentConfig?.label} pantry`}
          homeKitchen={kitchenId}
          selectedFoodId={selectedFoodId}
          onSelectFood={setSelectedFoodId}
          disableUnpackable={isPackingSchoolLunch}
          availableOf={(food) => availableOf(food.id)}
          useSoonOf={(food) => expiresTomorrow(stockBatches, food.id, day)}
          timeBudget={activeTimeBudget}
          totalMinutes={totalMinutes}
          overTime={overTime}
          budgetLabel={isPackingSchoolLunch ? `🎒 ${numChildren} lunchbox${numChildren > 1 ? 'es' : ''}` : `${currentConfig?.emoji} ${currentConfig?.label}`}
          totals={mealTotals}
          hint={planningHint}
          canServe={isPackingSchoolLunch ? canPackSchoolLunch : canServeMeal}
          serveLabel={isPackingSchoolLunch ? '🎒 Pack lunches' : (currentConfig?.serveLabel ?? 'Serve')}
          onServe={isPackingSchoolLunch ? packSchoolLunch : serveMeal}
          onMarket={() => setState('market')}
          onBack={backToHub} />
      )}

      {state === 'end-of-day' && (
        <EndOfDayReport day={day} reports={dayReports} everyoneFed={everyoneFed}
          onNextDay={startNextDay} onBack={backToHub} />
      )}

      {state === 'kitchen-select' && (
        <KitchenSelect activeId={kitchenId} onSelect={switchKitchen} onBack={backToHub} />
      )}

      {state === 'nutrient-dex' && (
        <NutrientDex seen={new Set(dexSeen)} onBack={backToHub} />
      )}

      {state === 'budgets' && (
        <BudgetSettings dailyMoney={dailyMoney} mealMinutes={mealMinutes}
          onUpdateMoney={updateDailyMoney} onUpdateMinutes={updateMealMinutes}
          onReset={resetBudgets} onBack={backToHub} />
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
        {state === 'hub' && <p><em>Shop at the market, build combo plates from any cuisine, and keep everyone fueled. Leftover coins carry over to tomorrow.</em></p>}
        {state === 'market' && <p><em>Cheap staples fill bellies; pricier fresh foods balance them. You can return unused food for a full refund.</em></p>}
        {(isPlanningMeal || isPackingSchoolLunch) && <p><em>Green = ideal · yellow = okay · orange or red = wrong fit. ×N shows how many servings you own.</em></p>}
      </footer>
    </main>
  )
}
