import './App.css'

function App() {
  return (
    <main className="splash">
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

      <p className="status">Kitchen scene coming soon&hellip;</p>
    </main>
  )
}

export default App
