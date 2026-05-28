import { defaultFamily } from '../family/defaultFamily'
import { FamilyMember } from './FamilyMember'
import './KitchenScene.css'

export function KitchenScene() {
  return (
    <main className="kitchen-scene">
      <header className="kitchen-header">
        <div className="header-left">
          <span className="day-marker">☀ Day 1 — Morning</span>
          <span className="kitchen-subtitle">Mediterranean Kitchen 🫒</span>
        </div>
        <span className="brand-mark">Critter Cafe</span>
      </header>

      <section className="family-row" aria-label="Family">
        {defaultFamily.map((member, i) => (
          <FamilyMember
            key={member.id}
            member={member}
            speechDelayMs={200 * i}
          />
        ))}
      </section>

      <div className="kitchen-floor" aria-hidden="true" />

      <footer className="kitchen-footer">
        <p>
          <em>Coming soon:</em> name your family · pick a kitchen tradition · plan breakfast · shop at the market · build your Nutrient-dex
        </p>
      </footer>
    </main>
  )
}
