import type { FamilyMember as FamilyMemberType } from '../family/types'
import type { Food, MealTone } from '../food/types'
import { SpeechBubble } from './SpeechBubble'
import './FamilyMember.css'

type Props = {
  member: FamilyMemberType
  speechDelayMs?: number
  speechMessage?: string
  speechTone?: MealTone
  assignedFood?: Food | null
  onPlateClick?: () => void
  caloriesConsumed?: number
}

export function FamilyMember({
  member,
  speechDelayMs = 0,
  speechMessage,
  speechTone,
  assignedFood,
  onPlateClick,
  caloriesConsumed,
}: Props) {
  const message = speechMessage ?? member.morningGreeting
  const showPlate = assignedFood !== undefined
  const showCalories = caloriesConsumed !== undefined
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
      {showPlate && (
        <button
          type="button"
          className={`plate ${assignedFood ? 'plate-filled' : 'plate-empty'}`}
          onClick={onPlateClick}
          aria-label={
            assignedFood
              ? `${member.name}'s plate: ${assignedFood.name}. Tap to change.`
              : `${member.name}'s plate: empty. Pick a food first, then tap to assign.`
          }
        >
          {assignedFood ? assignedFood.emoji : '+'}
        </button>
      )}
    </div>
  )
}
