import './About.css'

type Props = {
  onBack: () => void
}

export function About({ onBack }: Props) {
  return (
    <main className="about">
      <h1 className="about-title">About Critter Cafe</h1>

      <section className="about-story">
        <p>
          This game was designed by <strong>Adam, age 9</strong>, and his dad. Adam had eating and
          digestion troubles as a baby that took years to work out — and along the way he became
          unusually aware of what food does inside a body. This year he presented the science of
          food to his class at school. Critter Cafe grew straight out of that presentation.
        </p>
        <p>
          The big idea: <strong>kids shouldn't be lectured about food — they should be the expert.</strong>{' '}
          In this game, your family comes to <em>you</em>. The baby can't have honey, the grandparent
          shouldn't have another coffee, and the kid is starving after school. You figure it out, on a
          budget of money and time, because that's what real families do every day.
        </p>
        <p>
          One rule we never break: <strong>no body-shaming, ever.</strong> Consequences are about
          energy and growth — never appearance. And there's no single "correct" cuisine here, because
          every food culture on Earth solved nutrition in its own way.
        </p>
      </section>

      <section className="about-links" aria-label="Links">
        <a className="about-link-card" href="https://github.com/daridor9/critter-cafe/blob/main/docs/blog-post.md" target="_blank" rel="noopener noreferrer">
          📖 Read the full story behind the game
        </a>
        <a className="about-link-card" href="https://github.com/daridor9/critter-cafe" target="_blank" rel="noopener noreferrer">
          ⚙ Source code on GitHub (MIT — free forever)
        </a>
        <a className="about-link-card" href="https://daridor9.github.io/critter-forge/" target="_blank" rel="noopener noreferrer">
          🐉 Critter Forge — our creature-design game
        </a>
      </section>

      <p className="about-credits">
        Designed by Adam (Chief Nutritionist) &amp; Dan · built with Claude ·
        free for all kids, parents, and classrooms
      </p>

      <div className="kitchen-actions">
        <button type="button" className="primary-action" onClick={onBack}>← Back to title</button>
      </div>
    </main>
  )
}
