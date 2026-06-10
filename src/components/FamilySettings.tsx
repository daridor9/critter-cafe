import type { FamilyMember, LifeStage } from '../family/types'
import { STAGE_DEFAULTS, EMOJI_BY_STAGE } from '../family/stages'
import './FamilySettings.css'

type Props = {
  family: FamilyMember[]
  onUpdate: (id: string, patch: Partial<{ name: string; emoji: string }>) => void
  onAdd: (stage: LifeStage) => void
  onRemove: (id: string) => void
  onReset: () => void
  onBack: () => void
  canRemove: boolean
  canAdd: boolean
}

const STAGES: LifeStage[] = ['baby', 'child', 'adult', 'elder']

export function FamilySettings({ family, onUpdate, onAdd, onRemove, onReset, onBack, canRemove, canAdd }: Props) {
  return (
    <section className="family-settings" aria-label="Family settings">
      <h2 className="family-settings-title">👨‍👩‍👧 Your family</h2>
      <p className="family-settings-hint">Add or remove people, name them, and pick an emoji. Life stages decide nutrition needs — a baby and an adult need different food, whatever you call them.</p>
      <ul className="family-edit-list">
        {family.map(m => (
          <li key={m.id} className="family-edit-row">
            <span className="family-edit-stage">{m.profile.lifeStage}</span>
            <span className="family-edit-emoji" aria-hidden="true">{m.emoji}</span>
            <label className="family-edit-name-field">
              <span className="visually-hidden">Name for {m.profile.lifeStage}</span>
              <input type="text" value={m.name} onChange={(e) => onUpdate(m.id, { name: e.target.value.slice(0, 20) })} className="family-edit-name-input" placeholder={m.profile.lifeStage} maxLength={20} />
            </label>
            {canRemove && <button type="button" className="family-remove-button" onClick={() => onRemove(m.id)} aria-label={`Remove ${m.name}`}>✕</button>}
            <div className="family-edit-emoji-row">
              {(EMOJI_BY_STAGE[m.profile.lifeStage] ?? [m.emoji]).map(e => (
                <button key={e} type="button" className={`family-edit-emoji-button ${m.emoji === e ? 'is-active' : ''}`} onClick={() => onUpdate(m.id, { emoji: e })} aria-label={`Use emoji ${e}`}>{e}</button>
              ))}
            </div>
          </li>
        ))}
      </ul>
      <div className="family-add-row">
        <span className="family-add-label">{canAdd ? 'Add a family member:' : 'Family is full (max 8).'}</span>
        {canAdd && STAGES.map(s => (
          <button key={s} type="button" className="family-add-button" onClick={() => onAdd(s)}>
            {STAGE_DEFAULTS[s].emoji} + {STAGE_DEFAULTS[s].label}
          </button>
        ))}
      </div>
      <div className="kitchen-actions">
        <button type="button" className="primary-action" onClick={onBack}>← Back to kitchen</button>
        <button type="button" className="secondary-action" onClick={onReset}>🔄 Reset to defaults</button>
      </div>
    </section>
  )
}
