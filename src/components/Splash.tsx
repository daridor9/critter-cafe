import './Splash.css'

type Props = {
  onEnter: () => void
  onAbout: () => void
}

export function Splash({ onEnter, onAbout }: Props) {
  return (
    <main
      className="splash"
      onClick={onEnter}
      onKeyDown={(e) => {
        // Only react to keys on the splash surface itself — not on the
        // nested About button (its own Enter/Space click bubbles up here).
        if (e.target !== e.currentTarget) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onEnter()
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="Enter Critter Cafe — click anywhere to start"
    >
      <div className="emoji-row" aria-hidden="true">
        <span>🍅</span>
        <span>🥕</span>
        <span>🥖</span>
        <span>🐟</span>
        <span>🌿</span>
      </div>

      <h1>Critter Cafe</h1>
      <p className="tagline">A family kitchen where every meal teaches something.</p>

      <p className="byline">
        A free, open-source nutrition game by <strong>Dan &amp; Adam</strong>
      </p>

      <p className="start-hint">Click anywhere to start</p>

      <button
        type="button"
        className="about-button"
        onClick={(e) => { e.stopPropagation(); onAbout() }}
        aria-label="About this game"
      >
        ℹ About this game
      </button>
    </main>
  )
}
