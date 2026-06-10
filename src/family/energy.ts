import type { FamilyMember } from './types'
import type { Food, MealTone } from '../food/types'

export type EnergyStatus = 'well-fed' | 'comfortable' | 'hungry' | 'starving'

export type Macros = { protein: number; carbs: number; fat: number }

export type EnergyReport = {
  consumed: number      // calories eaten today
  burned: number        // calories burned today (BMR * 24h + activity)
  target: number        // daily calorie need
  net: number           // consumed - burned (negative = deficit)
  ratioOfTarget: number // consumed / target
  status: EnergyStatus
  tone: MealTone        // maps to SpeechBubble tone
  verdict: string       // bedtime message tied to status
  macros: Macros        // grams eaten today
  macroTargets: Macros  // grams needed today
}

export function computeDayEnergy(member: FamilyMember, consumedFoods: Food[]): EnergyReport {
  const consumed = consumedFoods.reduce((sum, f) => sum + f.calories, 0)
  const macros: Macros = {
    protein: consumedFoods.reduce((s, f) => s + f.protein, 0),
    carbs:   consumedFoods.reduce((s, f) => s + f.carbs,   0),
    fat:     consumedFoods.reduce((s, f) => s + f.fat,     0),
  }
  const macroTargets: Macros = {
    protein: member.profile.dailyProtein,
    carbs:   member.profile.dailyCarbs,
    fat:     member.profile.dailyFat,
  }
  const bmrBurn = member.profile.bmrPerHour * 24
  const activityBurn = member.profile.activityCalories
  const burned = bmrBurn + activityBurn
  const target = member.profile.dailyCalories
  const net = consumed - burned
  const ratioOfTarget = target > 0 ? consumed / target : 0

  const { status, tone, verdict } = classify(ratioOfTarget, member.name)

  return { consumed, burned, target, net, ratioOfTarget, status, tone, verdict, macros, macroTargets }
}

/** How a character greets the morning after a day with this energy status.
 *  Used for day-to-day carry-over: yesterday's eating shows up in today's
 *  first speech bubble — visible consequence, never shame. */
export function morningAfter(status: EnergyStatus): { tone: MealTone; message: string } {
  switch (status) {
    case 'well-fed':    return { tone: 'ideal', message: 'Slept great — full of energy! 💪' }
    case 'comfortable': return { tone: 'okay',  message: "Morning! Could've eaten a bit more yesterday." }
    case 'hungry':      return { tone: 'poor',  message: 'I went to bed hungry last night... 😞' }
    case 'starving':    return { tone: 'bad',   message: 'So tired... I barely slept. I need real meals today.' }
  }
}

function classify(ratio: number, name: string): { status: EnergyStatus; tone: MealTone; verdict: string } {
  if (ratio >= 0.9) {
    return { status: 'well-fed',    tone: 'ideal', verdict: `${name} ends the day energized! 💪` }
  }
  if (ratio >= 0.6) {
    return { status: 'comfortable', tone: 'okay',  verdict: `${name} could have used more food.` }
  }
  if (ratio >= 0.3) {
    return { status: 'hungry',      tone: 'poor',  verdict: `${name} goes to bed hungry. 😞` }
  }
  return     { status: 'starving',  tone: 'bad',   verdict: `${name} is exhausted. Real bodies need many meals. 😟` }
}
