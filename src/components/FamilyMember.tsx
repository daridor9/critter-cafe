import type { FamilyMember as FamilyMemberType } from '../family/types'
import type { Food, MealTone } from '../food/types'
import { SpeechBubble } from './SpeechBubble'
import './FamilyMember.css'

type Macros = { protein: number; carbs: number; fat: number }

type Props = {
  member: FamilyMemberType
  speechDelayMs?: number
  speechMessage?: string
  speechTone?: MealTone
  // Combo meals: a plate can hold 0+ foods.
  //   undefined → no plate (member not in current planning context)
  //   []        → empty plate
  //   [...]     → filled plate
  assignedFoods?: Food[]
  onPlateClick?: () => void
  caloriesConsumed?: number
  macrosConsumed?: Macros
  macroTargets?: Macros
}

export function FamilyMember({
  member,
  speechDelayMs = 0,
  speechMessage,
  speechTone,
  assignedFoods,
  onPlateClick,
  caloriesConsumed,
  macrosConsumed,
  macroTargets,
}: Props) {
  const message = speechMessage ?? member.morningGreeting
  const showPlate = assignedFoods !== undefined
  const filled = (assignedFoods?.length ?? 0) > 0
  const showCalories = caloriesConsumed !== undefined
  const showMacros = macrosConsumed !== undefined && macroTargets !== undefined
  const target = member.profile.dailyCalories
  const ratio = showCalories ? caloriesConsumed / target : 0
  const energyClass = ratio >= 0.9 ? 'energy-good'
    : ratio >= 0.6 ? 'energy-okay'
    : ratio >= 0.3 ? 'energy-low'
    : 'energy-empty'

  return (
    <div className={`family-member family-member-${member.profile.lifeStage}`}>
      <SpeechBubble key={message} delayMs={speechDelayMs} tone={speechTone}>
        {message}
      </SpeechBubble>
      <div className="character" aria-hidden="true">{member.emoji}</div>
      <div className="name-label">{member.name}</div>
      {showCalories && (
        <div
          className={`energy-strip ${energyClass}`}
          aria-label={`${caloriesConsumed} of ${target} calories eaten today`}
        >
          <span className="energy-text">🔥 {caloriesConsumed} / {target}</span>
          <span className="energy-bar" aria-hidden="true">
            <span
              className="energy-fill"
              style={{ width: `${Math.min(100, ratio * 100)}%` }}
            />
          </span>
        </div>
      )}
      {showMacros && (
        <div
          className="macro-strip"
          aria-label={`Protein ${macrosConsumed.protein} of ${macroTargets.protein} grams, carbs ${macrosConsumed.carbs} of ${macroTargets.carbs} grams, fat ${macrosConsumed.fat} of ${macroTargets.fat} grams.`}
        >
          <span className="macro-mini macro-protein">P {macrosConsumed.protein}/{macroTargets.protein}</span>
          <span className="macro-mini macro-carbs">C {macrosConsumed.carbs}/{macroTargets.carbs}</span>
          <span className="macro-mini macro-fat">F {macrosConsumed.fat}/{macroTargets.fat}</span>
        </div>
      )}
      {showPlate && (
        <button
          type="button"
          className={`plate ${filled ? 'plate-filled' : 'plate-empty'}`}
          onClick={onPlateClick}
          aria-label={
            filled
              ? `${member.name}'s plate has ${assignedFoods!.map(f => f.name).join(', ')}. Tap a food to add or remove.`
              : `${member.name}'s plate: empty. Pick a food first, then tap to assign.`
          }
        >
          {filled ? (
            <span className={`plate-foods plate-foods-${Math.min(5, assignedFoods!.length)}`}>
              {assignedFoods!.map((f, i) => (
                <span key={`${f.id}-${i}`} className="plate-food" title={f.name}>{f.emoji}</span>
              ))}
            </span>
          ) : (
            <span className="plate-empty-mark">+</span>
          )}
        </button>
      )}
    </div>
  )
}
