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
}

export function FamilyMember({
  member,
  speechDelayMs = 0,
  speechMessage,
  speechTone,
  assignedFood,
  onPlateClick,
}: Props) {
  const message = speechMessage ?? member.morningGreeting
  const showPlate = assignedFood !== undefined

  return (
    <div className={`family-member family-member-${member.profile.lifeStage}`}>
      <SpeechBubble key={message} delayMs={speechDelayMs} tone={speechTone}>
        {message}
      </SpeechBubble>
      <div className="character" aria-hidden="true">{member.emoji}</div>
      <div className="name-label">{member.name}</div>
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
