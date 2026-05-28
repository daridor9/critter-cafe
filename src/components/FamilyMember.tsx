import type { FamilyMember as FamilyMemberType } from '../family/types'
import { SpeechBubble } from './SpeechBubble'
import './FamilyMember.css'

type Props = {
  member: FamilyMemberType
  speechDelayMs?: number
}

export function FamilyMember({ member, speechDelayMs = 0 }: Props) {
  return (
    <div className={`family-member family-member-${member.profile.lifeStage}`}>
      <SpeechBubble delayMs={speechDelayMs}>{member.morningGreeting}</SpeechBubble>
      <div className="character" aria-hidden="true">{member.emoji}</div>
      <div className="name-label">{member.name}</div>
    </div>
  )
}
