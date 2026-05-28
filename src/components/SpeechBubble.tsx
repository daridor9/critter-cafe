import type { ReactNode } from 'react'
import type { MealTone } from '../food/types'
import './SpeechBubble.css'

type Props = {
  children: ReactNode
  delayMs?: number
  tone?: MealTone
}

export function SpeechBubble({ children, delayMs = 0, tone }: Props) {
  return (
    <div
      className="speech-bubble"
      data-tone={tone}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <p>{children}</p>
      <span className="speech-bubble-tail" aria-hidden="true" />
    </div>
  )
}
