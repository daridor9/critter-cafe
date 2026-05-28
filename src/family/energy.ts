import type { FamilyMember } from './types'
import type { Food, MealTone } from '../food/types'

export type EnergyStatus = 'well-fed' | 'comfortable' | 'hungry' | 'starving'

export type EnergyReport = {
  consumed: number      // calories eaten today
  burned: number        // calories burned today (BMR * hours + activity)
  target: number        // daily calorie need
  net: number           // consumed - burned (negative = deficit)
  ratioOfTarget: number // consumed / target
  status: EnergyStatus
  tone: MealTone        // maps to SpeechBubble tone
  verdict: string       // bedtime message tied to status
}

/**
 * Compute a character's energy report for the whole day.
 * For MVP we assume a full 24-hour burn (BMR * 24h + their typical activity)
 * so the end-of-day verdict shows what their body needed vs. what we fed it.
 */
export function computeDayEnergy(member: FamilyMember, consumedFoods: Food[]): EnergyReport {
  const consumed = consumedFoods.reduce((sum, f) => sum + f.calories, 0)
  const bmrBurn = member.profile.bmrPerHour * 24
  const activityBurn = member.profile.activityCalories
  const burned = bmrBurn + activityBurn
  const target = member.profile.dailyCalories
  const net = consumed - burned
  const ratioOfTarget = target > 0 ? consumed / target : 0

  const { status, tone, verdict } = classify(ratioOfTarget, member.name)

  return { consumed, burned, target, net, ratioOfTarget, status, tone, verdict }
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
