import { useEffect, useState } from 'react'
import { defaultFamily } from '../family/defaultFamily'
import {
  STAGE_PROFILES, STAGE_DEFAULTS, EMOJI_BY_STAGE, MAX_FAMILY_SIZE,
} from '../family/stages'
import { KITCHENS, DEFAULT_KITCHEN, type KitchenId } from '../food/kitchens'
import { DEFAULT_BUDGETS, BUDGET_LIMITS, type MealBudget, type MealKey as BudgetKey } from '../food/budget'
import { computeDayEnergy } from '../family/energy'
import type { FamilyMember, LifeStage } from '../family/types'
import type { Food, MealReaction, MealTone } from '../food/types'
import { FamilyMember as FamilyMemberView } from './FamilyMember'
import './KitchenScene.css'

type Props = { onExit: () => void }

type MealKey = 'breakfast' | 'lunch' | 'snack' | 'dinner'
type ServedKey = MealKey | 'schoolLunch'

type KitchenState =
  | 'hub'
  | 'planning-breakfast' | 'packing-school-lunch' | 'planning-lunch' | 'planning-snack' | 'planning-dinner'
  | 'end-of-day' | 'budgets' | 'family-settings' | 'kitchen-select' | 'tutorial'

type MealConfig = {
  key: MealKey
  label: string
  emoji: string
  planState: KitchenState
  hasPlate: (m: FamilyMember) => boolean
  isRequired: (m: FamilyMember) => boolean
  serveLabel: string
}

const MEAL_CONFIG: Record<MealKey, MealConfig> = {
  breakfast: {
    key: 'breakfast', label: 'breakfast', emoji: '🍳', planState: 'planning-breakfast',
    hasPlate: () => true, isRequired: () => true, serveLabel: '🍽 Serve breakfast',
  },
  lunch: {
    key: 'lunch', label: 'lunch', emoji: '🥗', planState: 'planning-lunch',
    hasPlate: () => true, isRequired: (m) => m.profile.lifeStage !== 'child', serveLabel: '🥗 Serve lunch',
  },
  snack: {
    key: 'snack', label: 'snack', emoji: '🍪', planState: 'planning-snack',
    hasPlate: () => true, isRequired: () => false, serveLabel: '🍪 Serve snack',
  },
  dinner: {
    key: 'dinner', label: 'dinner', emoji: '🍝', planState: 'planning-dinner',
    hasPlate: () => true, isRequired: () => true, serveLabel: '🍝 Serve dinner',
  },
}

const BUDGET_LABELS: Record<BudgetKey, { emoji: string; label: string }> = {
  breakfast:   { emoji: '🍳', label: 'Breakfast' },
  schoolLunch: { emoji: '🎒', label: 'School lunch (per child)' },
  lunch:       { emoji: '🥗', label: 'Lunch at home' },
  snack:       { emoji: '🍪', label: 'Snack' },
  dinner:      { emoji: '🍝', label: 'Dinner' },
}

function currentMealKey(state: KitchenState): MealKey | null {
  for (const meal of Object.values(MEAL_CONFIG)) if (state === meal.planState) return meal.key
  return null
}

const reactionFor = (member: FamilyMember, food: Food): MealReaction => food.reactions[member.profile.lifeStage]

const TONE_ORDER: MealTone[] = ['bad', 'poor', 'okay', 'ideal']
const worstTone = (tones: MealTone[]): MealTone => {
  for (const t of TONE_ORDER) if (tones.includes(t)) return t
  return 'ideal'
}
const COMBO_TONE_MESSAGE: Record<MealTone, string> = {
  ideal: 'Yum! Great plate.',
  okay:  'Decent combo.',
  poor:  'Not the right mix for me.',
  bad:   "There's something here I can't eat!",
}
function plateReaction(member: FamilyMember, foods: Food[]): MealReaction | null {
  if (foods.length === 0) return null
  if (foods.length === 1) return reactionFor(member, foods[0])
  const reactions = foods.map(f => reactionFor(member, f))
  const tone = worstTone(reactions.map(r => r.tone))
  const emojis = foods.map(f => f.emoji).join(' ')
  return { tone, message: `${emojis} — ${COMBO_TONE_MESSAGE[tone]}` }
}

let _idCounter = 0
const makeId = (): string => globalThis.crypto?.randomUUID?.() ?? `m-${Date.now()}-${_idCounter++}`

// ===== persistence =====
const STORAGE_KEY = 'critter-cafe-state'
const STORAGE_VERSION = 3

type Plate = string[]
type MealAssignmentsMap = Record<MealKey, Record<string, Plate>>

type SavedState = {
  version: number
  mealAssignments: MealAssignmentsMap
  schoolLunches: Record<string, Plate>
  mealsServed: Record<ServedKey, boolean>
  budgets: Record<BudgetKey, MealBudget>
  family: FamilyMember[]
  kitchenId: KitchenId
  day: number
  tutorialSeen: boolean
}

const emptyMealAssignments = (): MealAssignmentsMap => ({ breakfast: {}, lunch: {}, snack: {}, dinner: {} })
const initialServed = (): Record<ServedKey, boolean> => ({ breakfast: false, schoolLunch: false, lunch: false, snack: false, dinner: false })

function loadSaved(): Partial<SavedState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as SavedState
    if (parsed.version !== STORAGE_VERSION) return {}
    return parsed
  } catch { return {} }
}

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
    const data: SavedState = {
      version: STORAGE_VERSION,
      mealAssignments, schoolLunches, mealsServed, budgets, family, kitchenId, day, tutorialSeen,
    }
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
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
  const mealCalories = sumAllField('calories')
  const mealProtein = sumAllField('protein')
  const mealCarbs = sumAllField('carbs')
  const mealFat = sumAllField('fat')

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
  const goToEndOfDay = () => setState('end-of-day')

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
  const resetBudgets = () => setBudgets(DEFAULT_BUDGETS)

  // ---- family ----
  const updateFamilyMember = (id: string, patch: Partial<{ name: string; emoji: string }>) =>
    setFamily(prev => prev.map(m => m.id === id ? { ...m, ...patch } : m))
  const addMember = (stage: LifeStage) => {
    if (family.length >= MAX_FAMILY_SIZE) return
    const d = STAGE_DEFAULTS[stage]
    const sameStageCount = family.filter(m => m.profile.lifeStage === stage).length
    const member: FamilyMember = {
      id: makeId(),
      name: sameStageCount > 0 ? `${d.label} ${sameStageCount + 1}` : d.label,
      emoji: d.emoji,
      profile: { lifeStage: stage, ...STAGE_PROFILES[stage] },
      morningGreeting: d.greeting,
    }
    setFamily(prev => [...prev, member])
  }
  const removeMember = (id: string) => { if (family.length > 1) setFamily(prev => prev.filter(m => m.id !== id)) }
  const resetFamily = () => setFamily(defaultFamily)

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

  const renderPantryItem = (food: Food) => {
    const isSelected = selectedFoodId === food.id
    const itemDisabled = isPackingSchoolLunch && !food.packable
    const className = ['pantry-item', isSelected ? 'pantry-item-selected' : '', itemDisabled ? 'pantry-item-disabled' : ''].filter(Boolean).join(' ')
    return (
      <button key={food.id} type="button" className={className}
        onClick={() => !itemDisabled && setSelectedFoodId(food.id)} disabled={itemDisabled}
        aria-pressed={isSelected}
        aria-label={itemDisabled ? `${food.name} — doesn't travel well, can't pack`
          : `${food.name}: ${food.calories} calories, ${food.protein}g protein, ${food.carbs}g carbs, ${food.fat}g fat. Costs ${food.cost} coins, takes ${food.prepMinutes} minutes.`}
        title={itemDisabled ? "Doesn't travel well in a lunchbox" : undefined}>
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

  const anythingServed = Object.values(mealsServed).some(Boolean)
  const showCalories = anythingServed || state === 'end-of-day'

  const dayReports = state === 'end-of-day' ? family.map(m => ({ member: m, report: computeDayEnergy(m, consumedFoodsFor(m.id)) })) : []
  const everyoneFed = dayReports.every(r => r.report.status === 'well-fed' || r.report.status === 'comfortable')

  const mealCardEmojis = (mealKey: MealKey): string[] => family.filter(MEAL_CONFIG[mealKey].hasPlate).flatMap(m => foodsOnPlate(mealKey, m.id).map(f => f.emoji))
  const schoolCardEmojis = (): string[] => childMembers.flatMap(m => schoolLunchFoodsFor(m.id).map(f => f.emoji))

  const finishTutorial = () => { setTutorialSeen(true); setState('hub'); setTutorialStep(0) }

  return (
    <main className="kitchen-scene">
      <header className="kitchen-header">
        <button type="button" className="back-button"
          onClick={() => { if (state === 'hub' || state === 'tutorial') onExit(); else { setState('hub'); setSelectedFoodId(null) } }}
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
        <section className="hub" aria-label="Kitchen menu">
          <p className="hub-title">What would you like to plan?</p>
          <div className="meal-cards">
            <MealCard emoji="🍳" name="Breakfast" served={mealsServed.breakfast} foodEmojis={mealsServed.breakfast ? mealCardEmojis('breakfast') : []} onClick={() => startPlanning('breakfast')} />
            <MealCard emoji="🎒" name="School lunch" served={mealsServed.schoolLunch} foodEmojis={mealsServed.schoolLunch ? schoolCardEmojis() : []} onClick={startPackingSchoolLunch} />
            <MealCard emoji="🥗" name="Lunch at home" served={mealsServed.lunch} foodEmojis={mealsServed.lunch ? mealCardEmojis('lunch') : []} onClick={() => startPlanning('lunch')} />
            <MealCard emoji="🍪" name="Snack" served={mealsServed.snack} foodEmojis={mealsServed.snack ? mealCardEmojis('snack') : []} onClick={() => startPlanning('snack')} />
            <MealCard emoji="🍝" name="Dinner" served={mealsServed.dinner} foodEmojis={mealsServed.dinner ? mealCardEmojis('dinner') : []} onClick={() => startPlanning('dinner')} />
          </div>
          <div className="kitchen-actions hub-actions">
            <button type="button" className="primary-action" onClick={goToEndOfDay}>🌙 See end of day</button>
            <button type="button" className="secondary-action" onClick={() => setState('kitchen-select')}>🌍 Switch kitchen</button>
            <button type="button" className="secondary-action" onClick={() => setState('budgets')}>⚙ Adjust budgets</button>
            <button type="button" className="secondary-action" onClick={() => setState('family-settings')}>👨‍👩‍👧 Edit family</button>
            <button type="button" className="secondary-action" onClick={() => { setTutorialStep(0); setState('tutorial') }}>❔ Tutorial</button>
            {anythingServed && <button type="button" className="secondary-action" onClick={resetDay}>🔄 Reset day</button>}
          </div>
        </section>
      )}

      {(isPlanningMeal || isPackingSchoolLunch) && (
        <section className="pantry" aria-label={isPackingSchoolLunch ? 'School-lunch pantry' : `${currentConfig?.label} pantry`}>
          <div className="budget-bar" aria-label="Budget tracker">
            <span className={overBudget ? 'budget-over' : ''}>💰 {totalCost} / {activeBudget.coins}</span>
            <span className="budget-divider" aria-hidden="true">·</span>
            <span className={overTime ? 'budget-over' : ''}>⏱ {totalMinutes} / {activeBudget.minutes} min</span>
            <span className="budget-label">{isPackingSchoolLunch ? `🎒 ${numChildren} lunchbox${numChildren > 1 ? 'es' : ''}` : `${currentConfig?.emoji} ${currentConfig?.label}`}</span>
          </div>
          <div className="meal-totals" aria-label="Meal nutrition totals">
            <span className="meal-totals-label">Total this meal:</span>
            <span className="meal-totals-cal">🔥 {mealCalories} cal</span>
            <span className="macro-pill macro-protein">P {mealProtein}g</span>
            <span className="macro-pill macro-carbs">C {mealCarbs}g</span>
            <span className="macro-pill macro-fat">F {mealFat}g</span>
          </div>
          <p className="pantry-hint">{planningHint}</p>
          <div className="pantry-row">{pantry.map(renderPantryItem)}</div>
          <div className="kitchen-actions">
            {isPlanningMeal && currentConfig
              ? <button type="button" className="primary-action" onClick={serveMeal} disabled={!canServeMeal}>{currentConfig.serveLabel}</button>
              : <button type="button" className="primary-action" onClick={packSchoolLunch} disabled={!canPackSchoolLunch}>🎒 Pack lunches</button>}
            <button type="button" className="secondary-action" onClick={() => { setState('hub'); setSelectedFoodId(null) }}>← Back to kitchen</button>
          </div>
        </section>
      )}

      {state === 'end-of-day' && (
        <section className="day-summary" aria-label="End of day energy report">
          <h2 className="day-summary-title">🌙 End of Day {day}</h2>
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
                  <span className="energy-row-macros">
                    <span className={macroClass(report.macros.protein, report.macroTargets.protein)}>P <strong>{report.macros.protein}</strong> / {report.macroTargets.protein}g</span>
                    <span className={macroClass(report.macros.carbs, report.macroTargets.carbs)}>C <strong>{report.macros.carbs}</strong> / {report.macroTargets.carbs}g</span>
                    <span className={macroClass(report.macros.fat, report.macroTargets.fat)}>F <strong>{report.macros.fat}</strong> / {report.macroTargets.fat}g</span>
                  </span>
                  <span className="energy-row-bmr">metabolism ~{member.profile.bmrPerHour} cal/hr + activity {member.profile.activityCalories}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="day-summary-lesson">
            {everyoneFed
              ? "Everyone made it through the day with enough fuel. That's a balanced day — well done!"
              : "Try combo plates (several items per person) and add snacks to fill the gaps. Real bodies need a steady stream of food across the day."}
          </p>
          <div className="kitchen-actions">
            <button type="button" className="primary-action" onClick={startNextDay}>☀ Start Day {day + 1}</button>
            <button type="button" className="secondary-action" onClick={() => setState('hub')}>← Back to kitchen</button>
          </div>
        </section>
      )}

      {state === 'kitchen-select' && (
        <section className="kitchen-select" aria-label="Choose a kitchen">
          <h2 className="kitchen-select-title">🌍 Choose your kitchen</h2>
          <p className="kitchen-select-hint">Each culture solved nutrition differently — all are healthy. Switching starts a fresh Day 1 with that kitchen's foods.</p>
          <div className="kitchen-cards">
            {(Object.values(KITCHENS)).map(k => (
              <button key={k.id} type="button" className={`kitchen-card ${k.id === kitchenId ? 'kitchen-card-active' : ''}`} onClick={() => switchKitchen(k.id)}>
                <span className="kitchen-card-emoji" aria-hidden="true">{k.emoji}</span>
                <span className="kitchen-card-name">{k.name}</span>
                <span className="kitchen-card-tagline">{k.tagline}</span>
                {k.id === kitchenId && <span className="kitchen-card-current">✓ Current</span>}
              </button>
            ))}
          </div>
          <div className="kitchen-actions">
            <button type="button" className="primary-action" onClick={() => setState('hub')}>← Back to kitchen</button>
          </div>
        </section>
      )}

      {state === 'budgets' && (
        <section className="budget-settings" aria-label="Budget settings">
          <h2 className="budget-settings-title">⚙ Adjust your daily budgets</h2>
          <p className="budget-settings-hint">Bigger budget = more freedom; tighter budget = harder puzzle. School lunch budget is per child.</p>
          <ul className="budget-list">
            {(['breakfast', 'schoolLunch', 'lunch', 'snack', 'dinner'] as const).map(key => {
              const cfg = BUDGET_LABELS[key]; const b = budgets[key]
              return (
                <li key={key} className="budget-row">
                  <span className="budget-meal-label"><span aria-hidden="true">{cfg.emoji}</span> {cfg.label}</span>
                  <BudgetStepper icon="💰" unit="coins" value={b.coins}
                    onDec={() => updateBudget(key, 'coins', -BUDGET_LIMITS.coins.step)} onInc={() => updateBudget(key, 'coins', BUDGET_LIMITS.coins.step)}
                    canDec={b.coins > BUDGET_LIMITS.coins.min} canInc={b.coins < BUDGET_LIMITS.coins.max} />
                  <BudgetStepper icon="⏱" unit="min" value={b.minutes}
                    onDec={() => updateBudget(key, 'minutes', -BUDGET_LIMITS.minutes.step)} onInc={() => updateBudget(key, 'minutes', BUDGET_LIMITS.minutes.step)}
                    canDec={b.minutes > BUDGET_LIMITS.minutes.min} canInc={b.minutes < BUDGET_LIMITS.minutes.max} />
                </li>
              )
            })}
          </ul>
          <div className="kitchen-actions">
            <button type="button" className="primary-action" onClick={() => setState('hub')}>← Back to kitchen</button>
            <button type="button" className="secondary-action" onClick={resetBudgets}>🔄 Reset to defaults</button>
          </div>
        </section>
      )}

      {state === 'family-settings' && (
        <FamilySettings family={family} onUpdate={updateFamilyMember} onAdd={addMember} onRemove={removeMember} onReset={resetFamily} onBack={() => setState('hub')} canRemove={family.length > 1} canAdd={family.length < MAX_FAMILY_SIZE} />
      )}

      {state === 'tutorial' && (
        <TutorialOverlay step={tutorialStep} onNext={() => setTutorialStep(s => s + 1)} onSkip={finishTutorial} onFinish={finishTutorial} />
      )}

      <footer className="kitchen-footer">
        {state === 'hub' && <p><em>Pick any meal. Build combo plates, add family, switch kitchens — your progress saves automatically.</em></p>}
        {(isPlanningMeal || isPackingSchoolLunch) && <p><em>Green = ideal · yellow = okay · orange or red = wrong fit. Tap a food twice on one plate to remove it.</em></p>}
      </footer>
    </main>
  )
}

type MealCardProps = { emoji: string; name: string; served: boolean; foodEmojis: string[]; onClick: () => void }
function MealCard({ emoji, name, served, foodEmojis, onClick }: MealCardProps) {
  return (
    <button type="button" className={`meal-card ${served ? 'meal-card-served' : ''}`} onClick={onClick}
      aria-label={served ? `${name}, already served. Tap to revise.` : `${name}, not yet planned. Tap to plan.`}>
      <span className="meal-card-emoji" aria-hidden="true">{emoji}</span>
      <span className="meal-card-name">{name}</span>
      <span className="meal-card-status">{served ? <>✓ {foodEmojis.length > 0 ? foodEmojis.join(' ') : 'served'}</> : 'Not yet'}</span>
    </button>
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

type FamilySettingsProps = {
  family: FamilyMember[]
  onUpdate: (id: string, patch: Partial<{ name: string; emoji: string }>) => void
  onAdd: (stage: LifeStage) => void
  onRemove: (id: string) => void
  onReset: () => void
  onBack: () => void
  canRemove: boolean
  canAdd: boolean
}
function FamilySettings({ family, onUpdate, onAdd, onRemove, onReset, onBack, canRemove, canAdd }: FamilySettingsProps) {
  const stages: LifeStage[] = ['baby', 'child', 'adult', 'elder']
  return (
    <section className="family-settings" aria-label="Family settings">
      <h2 className="family-settings-title">👨‍👩‍👧 Your family</h2>
      <p className="family-settings-hint">Add or remove people, name them, and pick an emoji. Life stages decide nutrition needs — a baby and an adult need different food, whatever you call them.</p>
      <ul className="family-edit-list">
        {family.map(m => (
          <li key={m.id} className="family-edit-row">
            <span className="family-edit-stage">{m.profile.lifeStage}</span>
            <span className="family-edit-emoji" aria-hidden="true">{m.emoji}</span>
            <label className="family-edit-name-field">
              <span className="visually-hidden">Name for {m.profile.lifeStage}</span>
              <input type="text" value={m.name} onChange={(e) => onUpdate(m.id, { name: e.target.value.slice(0, 20) })} className="family-edit-name-input" placeholder={m.profile.lifeStage} maxLength={20} />
            </label>
            {canRemove && <button type="button" className="family-remove-button" onClick={() => onRemove(m.id)} aria-label={`Remove ${m.name}`}>✕</button>}
            <div className="family-edit-emoji-row">
              {(EMOJI_BY_STAGE[m.profile.lifeStage] ?? [m.emoji]).map(e => (
                <button key={e} type="button" className={`family-edit-emoji-button ${m.emoji === e ? 'is-active' : ''}`} onClick={() => onUpdate(m.id, { emoji: e })} aria-label={`Use emoji ${e}`}>{e}</button>
              ))}
            </div>
          </li>
        ))}
      </ul>
      <div className="family-add-row">
        <span className="family-add-label">{canAdd ? 'Add a family member:' : 'Family is full (max 8).'}</span>
        {canAdd && stages.map(s => (
          <button key={s} type="button" className="family-add-button" onClick={() => onAdd(s)}>
            {STAGE_DEFAULTS[s].emoji} + {STAGE_DEFAULTS[s].label}
          </button>
        ))}
      </div>
      <div className="kitchen-actions">
        <button type="button" className="primary-action" onClick={onBack}>← Back to kitchen</button>
        <button type="button" className="secondary-action" onClick={onReset}>🔄 Reset to defaults</button>
      </div>
    </section>
  )
}

type TutorialOverlayProps = { step: number; onNext: () => void; onSkip: () => void; onFinish: () => void }
const TUTORIAL_STEPS = [
  { title: 'Welcome to Critter Cafe!', body: 'You are the family nutritionist. Feed everyone right — the baby, the child, the adult, and the elder all have different needs.', emoji: '👨‍👩‍👧' },
  { title: 'Each meal has a budget', body: 'Money (💰 coins) and time (⏱ minutes). Pick foods within both. Foods are cheap, fast, or healthy — rarely all three.', emoji: '💰' },
  { title: 'Build plates with combos', body: 'Pick a food, tap a plate to add it. Tap again to remove. Combine items so each person gets enough calories and protein, carbs, and fat.', emoji: '🍽' },
  { title: 'Make it yours', body: 'Add family members, switch between Mediterranean, East Asian, and Latin American kitchens, and play across many days. Everything saves automatically.', emoji: '🌍' },
]
function TutorialOverlay({ step, onNext, onSkip, onFinish }: TutorialOverlayProps) {
  const current = TUTORIAL_STEPS[step]
  const isLast = step === TUTORIAL_STEPS.length - 1
  if (!current) return null
  return (
    <div className="tutorial-overlay" role="dialog" aria-modal="true" aria-label="Tutorial">
      <div className="tutorial-card">
        <div className="tutorial-emoji" aria-hidden="true">{current.emoji}</div>
        <h2 className="tutorial-title">{current.title}</h2>
        <p className="tutorial-body">{current.body}</p>
        <div className="tutorial-dots" aria-hidden="true">
          {TUTORIAL_STEPS.map((_, i) => <span key={i} className={`tutorial-dot ${i === step ? 'is-active' : ''}`} />)}
        </div>
        <div className="kitchen-actions tutorial-actions">
          {!isLast && <button type="button" className="primary-action" onClick={onNext}>Next →</button>}
          {isLast && <button type="button" className="primary-action" onClick={onFinish}>Got it! Let's cook.</button>}
          {!isLast && <button type="button" className="secondary-action" onClick={onSkip}>Skip</button>}
        </div>
      </div>
    </div>
  )
}

function macroClass(actual: number, target: number): string {
  const ratio = target > 0 ? actual / target : 0
  if (ratio >= 0.9) return 'macro-pill macro-good'
  if (ratio >= 0.5) return 'macro-pill macro-okay'
  if (ratio >= 0.2) return 'macro-pill macro-low'
  return 'macro-pill macro-empty'
}

function dayMarkerFor(state: KitchenState): string {
  if (state === 'hub') return 'Kitchen'
  if (state === 'planning-breakfast') return '🍳 Breakfast'
  if (state === 'packing-school-lunch') return '🎒 School lunch'
  if (state === 'planning-lunch') return '🥗 Midday lunch'
  if (state === 'planning-snack') return '🍪 Snack'
  if (state === 'planning-dinner') return '🍝 Dinner'
  if (state === 'end-of-day') return '🌙 Bedtime'
  if (state === 'budgets') return '⚙ Budgets'
  if (state === 'family-settings') return '👨‍👩‍👧 Family'
  if (state === 'kitchen-select') return '🌍 Kitchens'
  if (state === 'tutorial') return '❔ How to play'
  return 'Day'
}
