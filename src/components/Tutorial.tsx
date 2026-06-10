import './Tutorial.css'

type Props = {
  step: number
  onNext: () => void
  onSkip: () => void
  onFinish: () => void
}

const TUTORIAL_STEPS = [
  { title: 'Welcome to Critter Cafe!', body: 'You are the family nutritionist. Feed everyone right — the baby, the child, the adult, and the elder all have different needs.', emoji: '👨‍👩‍👧' },
  { title: 'Shop, then cook', body: 'Money is spent at the 🛒 Market to stock your pantry — meals can only use food you own. Cooking costs ⏱ time. Buy enough in the morning to last the whole day!', emoji: '🛒' },
  { title: 'Build plates with combos', body: 'Pick a food, tap a plate to add it. Tap again to remove. Combine items so each person gets enough calories and protein, carbs, and fat.', emoji: '🍽' },
  { title: 'Make it yours', body: 'Add family members and mix foods from the Mediterranean, East Asian, Latin American, and Levantine kitchens in any meal — just like real life. Everything saves automatically.', emoji: '🌍' },
]

export function Tutorial({ step, onNext, onSkip, onFinish }: Props) {
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
