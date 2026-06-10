# Critter Cafe

A free, open-source nutrition game co-designed by **Dan and Adam (age 9)**.

**▶ Play it now: [daridor9.github.io/critter-cafe](https://daridor9.github.io/critter-cafe/)** · 📖 [Read the story behind the game](docs/blog-post.md)

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

**v1 — playable end-to-end** (June 2026). Plan a full day of meals — breakfast, packed school lunches, lunch at home, a snack, and dinner — with combination plates, real calorie/macro tracking per life stage, and an honest end-of-day energy report. Three switchable kitchens (Mediterranean, East Asian, Latin American), an editable family of up to 8 (multiple kids each get their own lunchbox), adjustable budgets, multi-day play, a first-run tutorial, and automatic saving in the browser.

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
