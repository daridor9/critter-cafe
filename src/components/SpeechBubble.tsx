import type { ReactNode } from 'react'
import './SpeechBubble.css'

type Props = {
  children: ReactNode
  delayMs?: number
}

export function SpeechBubble({ children, delayMs = 0 }: Props) {
  return (
    <div
      className="speech-bubble"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <p>{children}</p>
      <span className="speech-bubble-tail" aria-hidden="true" />
    </div>
  )
}
