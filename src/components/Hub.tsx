import './Hub.css'

export type HubCard = {
  emoji: string
  name: string
  served: boolean
  foodEmojis: string[]
  onClick: () => void
}

type Props = {
  cards: HubCard[]
  anythingServed: boolean
  onEndOfDay: () => void
  onKitchenSelect: () => void
  onBudgets: () => void
  onFamily: () => void
  onTutorial: () => void
  onResetDay: () => void
}

export function Hub({ cards, anythingServed, onEndOfDay, onKitchenSelect, onBudgets, onFamily, onTutorial, onResetDay }: Props) {
  return (
    <section className="hub" aria-label="Kitchen menu">
      <p className="hub-title">What would you like to plan?</p>
      <div className="meal-cards">
        {cards.map(card => <MealCard key={card.name} {...card} />)}
      </div>
      <div className="kitchen-actions hub-actions">
        <button type="button" className="primary-action" onClick={onEndOfDay}>🌙 See end of day</button>
        <button type="button" className="secondary-action" onClick={onKitchenSelect}>🌍 Switch kitchen</button>
        <button type="button" className="secondary-action" onClick={onBudgets}>⚙ Adjust budgets</button>
        <button type="button" className="secondary-action" onClick={onFamily}>👨‍👩‍👧 Edit family</button>
        <button type="button" className="secondary-action" onClick={onTutorial}>❔ Tutorial</button>
        {anythingServed && <button type="button" className="secondary-action" onClick={onResetDay}>🔄 Reset day</button>}
      </div>
    </section>
  )
}

function MealCard({ emoji, name, served, foodEmojis, onClick }: HubCard) {
  return (
    <button type="button" className={`meal-card ${served ? 'meal-card-served' : ''}`} onClick={onClick}
      aria-label={served ? `${name}, already served. Tap to revise.` : `${name}, not yet planned. Tap to plan.`}>
      <span className="meal-card-emoji" aria-hidden="true">{emoji}</span>
      <span className="meal-card-name">{name}</span>
      <span className="meal-card-status">{served ? <>✓ {foodEmojis.length > 0 ? foodEmojis.join(' ') : 'served'}</> : 'Not yet'}</span>
    </button>
  )
}
