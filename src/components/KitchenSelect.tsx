import { KITCHENS, type Kitchen, type KitchenId } from '../food/kitchens'
import './KitchenSelect.css'

type Props = {
  activeId: KitchenId
  onSelect: (id: KitchenId) => void
  onBack: () => void
}

export function KitchenSelect({ activeId, onSelect, onBack }: Props) {
  return (
    <section className="kitchen-select" aria-label="Choose a kitchen">
      <h2 className="kitchen-select-title">🌍 Choose your home kitchen</h2>
      <p className="kitchen-select-hint">Each culture solved nutrition differently — all are healthy. Your home kitchen is the pantry tab that opens first when you plan a meal — but you can always mix foods from every kitchen, just like real life.</p>
      <div className="kitchen-cards">
        {(Object.values(KITCHENS) as Kitchen[]).map(k => (
          <button key={k.id} type="button" className={`kitchen-card ${k.id === activeId ? 'kitchen-card-active' : ''}`} onClick={() => onSelect(k.id)}>
            <span className="kitchen-card-emoji" aria-hidden="true">{k.emoji}</span>
            <span className="kitchen-card-name">{k.name}</span>
            <span className="kitchen-card-tagline">{k.tagline}</span>
            {k.id === activeId && <span className="kitchen-card-current">✓ Current</span>}
          </button>
        ))}
      </div>
      <div className="kitchen-actions">
        <button type="button" className="primary-action" onClick={onBack}>← Back to kitchen</button>
      </div>
    </section>
  )
}
