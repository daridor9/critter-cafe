import { KITCHENS } from '../food/kitchens'
import { STAGE_DEFAULTS } from '../family/stages'
import type { Food } from '../food/types'
import type { LifeStage } from '../family/types'
import './NutrientDex.css'

type Props = {
  seen: ReadonlySet<string>
  onBack: () => void
}

const STAGES: LifeStage[] = ['baby', 'child', 'adult', 'elder']

export function NutrientDex({ seen, onBack }: Props) {
  const kitchens = Object.values(KITCHENS)
  const total = kitchens.reduce((s, k) => s + k.pantry.length, 0)
  const found = kitchens.reduce((s, k) => s + k.pantry.filter(f => seen.has(f.id)).length, 0)

  return (
    <section className="dex" aria-label="Nutrient-dex">
      <h2 className="dex-title">📔 Nutrient-dex</h2>
      <p className="dex-hint">
        Every food you serve gets discovered and recorded here. <strong>{found} / {total}</strong> foods found so far — explore other kitchens to find them all!
      </p>
      {kitchens.map(k => {
        const kFound = k.pantry.filter(f => seen.has(f.id)).length
        return (
          <div key={k.id} className="dex-kitchen">
            <h3 className="dex-kitchen-title">
              <span aria-hidden="true">{k.emoji}</span> {k.name}
              <span className="dex-count">{kFound} / {k.pantry.length}</span>
            </h3>
            <div className="dex-grid">
              {k.pantry.map(f =>
                seen.has(f.id)
                  ? <DexCard key={f.id} food={f} />
                  : <UnknownCard key={f.id} />
              )}
            </div>
          </div>
        )
      })}
      <div className="kitchen-actions">
        <button type="button" className="primary-action" onClick={onBack}>← Back to kitchen</button>
      </div>
    </section>
  )
}

function DexCard({ food }: { food: Food }) {
  const idealFor = STAGES.filter(s => food.reactions[s].tone === 'ideal')
  const carefulWith = STAGES.filter(s => food.reactions[s].tone === 'bad')
  return (
    <div className="dex-card">
      <span className="dex-card-emoji" aria-hidden="true">{food.emoji}</span>
      <span className="dex-card-name">{food.name}</span>
      <span className="dex-card-meta">🔥 {food.calories} cal · 💰 {food.cost} · ⏱ {food.prepMinutes}m</span>
      <span className="dex-card-macros">
        <span className="macro-pill macro-protein">P {food.protein}g</span>
        <span className="macro-pill macro-carbs">C {food.carbs}g</span>
        <span className="macro-pill macro-fat">F {food.fat}g</span>
      </span>
      {(idealFor.length > 0 || carefulWith.length > 0) && (
        <span className="dex-card-stages">
          {idealFor.length > 0 && (
            <span className="dex-stage-good" title={`Ideal for: ${idealFor.join(', ')}`}>
              💚 {idealFor.map(s => STAGE_DEFAULTS[s].emoji).join(' ')}
            </span>
          )}
          {carefulWith.length > 0 && (
            <span className="dex-stage-bad" title={`Not safe for: ${carefulWith.join(', ')}`}>
              ⚠️ {carefulWith.map(s => STAGE_DEFAULTS[s].emoji).join(' ')}
            </span>
          )}
        </span>
      )}
      {food.funFact && <span className="dex-card-fact">{food.funFact}</span>}
    </div>
  )
}

function UnknownCard() {
  return (
    <div className="dex-card dex-card-unknown" aria-label="Undiscovered food">
      <span className="dex-card-emoji" aria-hidden="true">❓</span>
      <span className="dex-card-name">???</span>
      <span className="dex-card-meta">Serve it to discover!</span>
    </div>
  )
}
