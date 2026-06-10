import type { Food } from './types'

// Levantine kitchen — the Eastern Mediterranean home table.
// Hummus, tahini, pita, chopped salads, shakshuka.
// Teaching wedges: chickpeas + wheat complement each other;
// whole dates are a choking risk for babies; fried falafel and
// burekas sit heavy on elders; tahini = sesame = calcium.

export const levantPantry: Food[] = [
  {
    id: 'lv-pita', name: 'Pita', emoji: '🫓',
    cost: 1, prepMinutes: 1, packable: true,
    calories: 160, protein: 5, carbs: 33, fat: 1,
    reactions: {
      baby:  { tone: 'poor',  message: 'Just pita? Hmm.' },
      child: { tone: 'okay',  message: 'What goes inside?' },
      adult: { tone: 'okay',  message: 'The pocket awaits filling.' },
      elder: { tone: 'okay',  message: 'Soft and familiar.' },
    },
  },
  {
    id: 'lv-hummus', name: 'Hummus', emoji: '🥣',
    cost: 2, prepMinutes: 3, packable: true,
    calories: 180, protein: 8, carbs: 20, fat: 9,
    funFact: 'Chickpeas and wheat pita complete each other — together they make a much better protein than either alone.',
    reactions: {
      baby:  { tone: 'ideal', message: 'Smooth and yummy!' },
      child: { tone: 'okay',  message: 'With pita, please!' },
      adult: { tone: 'ideal', message: 'Chickpea power.' },
      elder: { tone: 'ideal', message: 'Soft and filling.' },
    },
  },
  {
    id: 'lv-falafel', name: 'Falafel', emoji: '🧆',
    cost: 2, prepMinutes: 8, packable: true,
    calories: 230, protein: 9, carbs: 25, fat: 12,
    reactions: {
      baby:  { tone: 'poor',  message: 'Too crunchy for me!' },
      child: { tone: 'ideal', message: 'FALAFEL! 🎉' },
      adult: { tone: 'okay',  message: 'Tasty — fried, though.' },
      elder: { tone: 'poor',  message: 'Fried sits heavy on me.' },
    },
  },
  {
    id: 'lv-shakshuka', name: 'Shakshuka', emoji: '🍳',
    cost: 3, prepMinutes: 15, packable: false,
    calories: 250, protein: 14, carbs: 10, fat: 16,
    reactions: {
      baby:  { tone: 'poor',  message: 'A bit spicy for me!' },
      child: { tone: 'okay',  message: 'Dip the bread in!' },
      adult: { tone: 'ideal', message: 'Eggs in tomato heaven.' },
      elder: { tone: 'ideal', message: 'Warm and nourishing.' },
    },
  },
  {
    id: 'lv-labneh', name: 'Labneh', emoji: '🥛',
    cost: 2, prepMinutes: 1, packable: true,
    calories: 120, protein: 6, carbs: 5, fat: 8,
    reactions: {
      baby:  { tone: 'ideal', message: 'Creamy! More!' },
      child: { tone: 'okay',  message: 'Sour-ish... ok with zaatar.' },
      adult: { tone: 'ideal', message: 'Strained perfection.' },
      elder: { tone: 'ideal', message: 'Gentle on my stomach.' },
    },
  },
  {
    id: 'lv-salad', name: 'Chopped salad', emoji: '🥗',
    cost: 2, prepMinutes: 6, packable: false,
    calories: 60, protein: 2, carbs: 8, fat: 3,
    funFact: 'Cucumber-and-tomato chopped salad shows up at breakfast, lunch, AND dinner across the Levant.',
    reactions: {
      baby:  { tone: 'okay',  message: 'Tiny soft pieces, ok!' },
      child: { tone: 'okay',  message: 'Veggies again?' },
      adult: { tone: 'ideal', message: 'Chopped fresh. Perfect.' },
      elder: { tone: 'ideal', message: 'Light and fresh.' },
    },
  },
  {
    id: 'lv-tahini', name: 'Tahini', emoji: '🫙',
    cost: 2, prepMinutes: 2, packable: true,
    calories: 90, protein: 3, carbs: 3, fat: 8,
    funFact: 'Tahini is ground sesame — and spoon for spoon it has more calcium than milk.',
    reactions: {
      baby:  { tone: 'okay',  message: 'A little for me!' },
      child: { tone: 'okay',  message: 'Nutty sauce!' },
      adult: { tone: 'ideal', message: 'Sesame calcium. Yes.' },
      elder: { tone: 'ideal', message: 'Good fats for me.' },
    },
  },
  {
    id: 'lv-olives', name: 'Olives', emoji: '🫒',
    cost: 2, prepMinutes: 1, packable: true,
    calories: 30, protein: 0, carbs: 1, fat: 3,
    reactions: {
      baby:  { tone: 'bad',   message: 'Choking risk for me!' },
      child: { tone: 'okay',  message: 'Salty... I guess.' },
      adult: { tone: 'ideal', message: 'The table is not set without them.' },
      elder: { tone: 'okay',  message: 'Watching my salt.' },
    },
  },
  {
    id: 'lv-dates', name: 'Dates', emoji: '🌴',
    cost: 2, prepMinutes: 1, packable: true,
    calories: 70, protein: 0, carbs: 18, fat: 0,
    funFact: "Dates are called nature's candy — as sweet as a cookie, but with fiber and minerals along for the ride.",
    reactions: {
      baby:  { tone: 'bad',   message: 'Whole dates can choke me!' },
      child: { tone: 'okay',  message: "Nature's candy!" },
      adult: { tone: 'okay',  message: 'Sweet energy.' },
      elder: { tone: 'okay',  message: 'One or two for me.' },
    },
  },
  {
    id: 'lv-couscous', name: 'Couscous', emoji: '🍚',
    cost: 1, prepMinutes: 10, packable: false,
    calories: 180, protein: 6, carbs: 36, fat: 0,
    reactions: {
      baby:  { tone: 'ideal', message: 'Tiny soft grains!' },
      child: { tone: 'okay',  message: 'With sauce, please!' },
      adult: { tone: 'okay',  message: 'Comfort grain.' },
      elder: { tone: 'ideal', message: 'Easy to eat.' },
    },
  },
  {
    id: 'lv-skewers', name: 'Chicken skewers', emoji: '🍢',
    cost: 4, prepMinutes: 15, packable: false,
    calories: 220, protein: 26, carbs: 2, fat: 11,
    reactions: {
      baby:  { tone: 'poor',  message: 'Big chunks scare me!' },
      child: { tone: 'ideal', message: 'Skewer night!' },
      adult: { tone: 'ideal', message: 'Grilled protein.' },
      elder: { tone: 'okay',  message: 'Tender bits only, please.' },
    },
  },
  {
    id: 'lv-watermelon', name: 'Watermelon', emoji: '🍉',
    cost: 2, prepMinutes: 2, packable: true,
    calories: 50, protein: 1, carbs: 12, fat: 0,
    funFact: 'Watermelon is 92% water — in a hot summer it hydrates almost as well as a drink.',
    reactions: {
      baby:  { tone: 'ideal', message: 'Juicy and soft!' },
      child: { tone: 'ideal', message: 'Watermelon with salty cheese!' },
      adult: { tone: 'ideal', message: 'Summer hydration.' },
      elder: { tone: 'ideal', message: 'Refreshing and light.' },
    },
  },
  {
    id: 'lv-burekas', name: 'Burekas', emoji: '🥐',
    cost: 2, prepMinutes: 4, packable: true,
    calories: 250, protein: 5, carbs: 26, fat: 14,
    reactions: {
      baby:  { tone: 'poor',  message: 'Flaky bits everywhere!' },
      child: { tone: 'okay',  message: 'Flaky treat!' },
      adult: { tone: 'okay',  message: 'A guilty pleasure.' },
      elder: { tone: 'poor',  message: 'Too greasy for me.' },
    },
  },
  {
    id: 'lv-cucumber', name: 'Cucumber', emoji: '🥒',
    cost: 1, prepMinutes: 1, packable: true,
    calories: 15, protein: 1, carbs: 3, fat: 0,
    reactions: {
      baby:  { tone: 'okay',  message: 'Cool soft sticks!' },
      child: { tone: 'ideal', message: 'Crunchy snack!' },
      adult: { tone: 'ideal', message: 'Crisp and clean.' },
      elder: { tone: 'ideal', message: 'Light and easy.' },
    },
  },
]
