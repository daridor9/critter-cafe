# Critter Cafe

A free, open-source nutrition game co-designed by **Dan and Adam (age 9)**.

## What it is

You are the family nutritionist. Your family of four — a baby, a child, an adult, and an elder — each has different needs. You shop on a weekly grocery budget, plan meals, manage spoilage, and learn what real food does for real bodies. The game teaches by *putting you in charge*, not by lecturing.

It is built around three real-world tradeoffs every family makes:

- **Time** — fresh cooking takes longer than packaged food
- **Cost** — pantry staples are cheap; convenience is expensive
- **Nutrition** — the right food at the right time for the right person

Pick any two; the third pays the price. Learning to balance them *is* the game.

## Design pillars

- **No body shaming, ever.** Consequences are energy, mood, and growth — never appearance.
- **Player as expert.** You are not a student being taught; you are the family's trusted nutritionist.
- **Cultural inclusivity.** Players pick a kitchen tradition (Mediterranean, East Asian, Latin American, South Asian, Northern European) with its own pantry, recipes, and seasonal calendar — because every culture solved nutrition, all are valid.
- **Real food, real data.** Ingredient nutrition uses real values (USDA FoodData Central).

## Status

Early development — May 2026. Currently a splash screen while the first kitchen scene is built. Follow along.

## Sister project

[Critter Forge](https://github.com/daridor9/critter-forge) is the same team's biophysics creature-design game. A future tournament mode will connect the two: design a critter, then feed it across a multi-terrain journey.

## Tech

Vite + React + TypeScript. Deployed via GitHub Pages.

```bash
npm install      # install dependencies
npm run dev      # local dev server with hot reload
npm run build    # production build
npm run deploy   # deploy to GitHub Pages (build + push to gh-pages branch)
```

## License

MIT — free to play, free to fork, free to teach with.
