import type { Food } from './types'

// East Asian kitchen — rice, noodles, soy, fish, tea.
// Teaching wedges: raw fish (sushi) unsafe for babies; green tea has
// caffeine like coffee; mochi is a real choking hazard for elders
// (a known public-health warning in Japan); whole edamame beans are
// a choking risk for babies.

export const eastAsianPantry: Food[] = [
  {
    id: 'ea-rice', name: 'Rice', emoji: '🍚',
    cost: 1, prepMinutes: 15, packable: false,
    calories: 200, protein: 4, carbs: 45, fat: 0,
    reactions: {
      baby:  { tone: 'ideal', message: 'Soft and easy!' },
      child: { tone: 'okay',  message: 'Plain rice? Need more!' },
      adult: { tone: 'okay',  message: 'Carbs — solid.' },
      elder: { tone: 'ideal', message: 'Easy on me.' },
    },
  },
  {
    id: 'ea-noodles', name: 'Noodles', emoji: '🍜',
    cost: 2, prepMinutes: 10, packable: false,
    calories: 250, protein: 8, carbs: 45, fat: 3,
    reactions: {
      baby:  { tone: 'okay',  message: 'Cut small for me!' },
      child: { tone: 'ideal', message: 'SLURP! 🍜' },
      adult: { tone: 'ideal', message: 'Comfort in a bowl.' },
      elder: { tone: 'okay',  message: 'Warm, a bit salty.' },
    },
  },
  {
    id: 'ea-sushi', name: 'Sushi', emoji: '🍣',
    cost: 4, prepMinutes: 15, packable: true,
    calories: 180, protein: 15, carbs: 30, fat: 2,
    reactions: {
      baby:  { tone: 'bad',   message: 'Raw fish is unsafe for babies!' },
      child: { tone: 'okay',  message: 'Fancy! A little weird.' },
      adult: { tone: 'ideal', message: 'Fresh omega-3s.' },
      elder: { tone: 'ideal', message: 'Light and lovely.' },
    },
  },
  {
    id: 'ea-dumplings', name: 'Dumplings', emoji: '🥟',
    cost: 3, prepMinutes: 12, packable: true,
    calories: 220, protein: 9, carbs: 28, fat: 8,
    reactions: {
      baby:  { tone: 'poor',  message: 'Too chewy for me.' },
      child: { tone: 'ideal', message: 'Dumplings!! 🥟' },
      adult: { tone: 'ideal', message: 'Little parcels of joy.' },
      elder: { tone: 'okay',  message: 'Tasty, a bit heavy.' },
    },
  },
  {
    id: 'ea-tofu', name: 'Tofu', emoji: '🧈',
    cost: 2, prepMinutes: 5, packable: true,
    calories: 100, protein: 10, carbs: 3, fat: 6,
    reactions: {
      baby:  { tone: 'ideal', message: 'Soft! Perfect for me!' },
      child: { tone: 'okay',  message: 'Wobbly... ok.' },
      adult: { tone: 'ideal', message: 'Plant protein. Clean.' },
      elder: { tone: 'ideal', message: 'Gentle and good for me.' },
    },
  },
  {
    id: 'ea-bokchoy', name: 'Bok choy', emoji: '🥬',
    cost: 1, prepMinutes: 4, packable: false,
    calories: 20, protein: 2, carbs: 3, fat: 0,
    reactions: {
      baby:  { tone: 'okay',  message: 'Steamed soft, ok!' },
      child: { tone: 'okay',  message: 'More veggies?' },
      adult: { tone: 'ideal', message: 'Green and crisp.' },
      elder: { tone: 'ideal', message: 'Light and healthy.' },
    },
  },
  {
    id: 'ea-miso', name: 'Miso soup', emoji: '🍲',
    cost: 1, prepMinutes: 5, packable: false,
    calories: 60, protein: 4, carbs: 6, fat: 2,
    reactions: {
      baby:  { tone: 'okay',  message: 'Warm... bit salty.' },
      child: { tone: 'okay',  message: 'Soup again?' },
      adult: { tone: 'ideal', message: 'Savory and warming.' },
      elder: { tone: 'ideal', message: 'Warm and gentle.' },
    },
  },
  {
    id: 'ea-greentea', name: 'Green tea', emoji: '🍵',
    cost: 1, prepMinutes: 3, packable: false,
    calories: 0, protein: 0, carbs: 0, fat: 0,
    funFact: 'Tea has caffeine just like coffee — which is exactly why it is a grown-up drink.',
    reactions: {
      baby:  { tone: 'bad',   message: 'No caffeine for babies!' },
      child: { tone: 'bad',   message: 'Tea has caffeine — not for kids!' },
      adult: { tone: 'ideal', message: 'Calm focus. 🍵' },
      elder: { tone: 'okay',  message: 'Half a cup for me.' },
    },
  },
  {
    id: 'ea-riceball', name: 'Rice ball', emoji: '🍙',
    cost: 1, prepMinutes: 3, packable: true,
    calories: 150, protein: 3, carbs: 33, fat: 1,
    reactions: {
      baby:  { tone: 'okay',  message: 'Sticky but soft!' },
      child: { tone: 'ideal', message: 'Lunchbox classic!' },
      adult: { tone: 'okay',  message: 'Handy carbs.' },
      elder: { tone: 'okay',  message: 'A bit sticky for me.' },
    },
  },
  {
    id: 'ea-edamame', name: 'Edamame', emoji: '🫛',
    cost: 2, prepMinutes: 5, packable: true,
    calories: 120, protein: 11, carbs: 9, fat: 5,
    reactions: {
      baby:  { tone: 'bad',   message: 'Whole beans can choke me!' },
      child: { tone: 'ideal', message: 'Pop pop pop!' },
      adult: { tone: 'ideal', message: 'Protein snack. Yes.' },
      elder: { tone: 'okay',  message: 'Good, chewy work.' },
    },
  },
  {
    id: 'ea-eggs', name: 'Eggs', emoji: '🥚',
    cost: 2, prepMinutes: 6, packable: false,
    calories: 150, protein: 12, carbs: 1, fat: 10,
    reactions: {
      baby:  { tone: 'poor',  message: 'Tummy ache...' },
      child: { tone: 'ideal', message: 'Protein power!' },
      adult: { tone: 'ideal', message: 'Yes, fuel.' },
      elder: { tone: 'ideal', message: 'Soft protein. Good.' },
    },
  },
  {
    id: 'ea-mandarin', name: 'Mandarin', emoji: '🍊',
    cost: 1, prepMinutes: 1, packable: true,
    calories: 50, protein: 1, carbs: 12, fat: 0,
    reactions: {
      baby:  { tone: 'okay',  message: 'Juicy segments!' },
      child: { tone: 'ideal', message: 'Easy peel, yum!' },
      adult: { tone: 'ideal', message: 'Vitamin C boost.' },
      elder: { tone: 'ideal', message: 'Sweet and easy.' },
    },
  },
  {
    id: 'ea-mochi', name: 'Mochi', emoji: '🍡',
    cost: 2, prepMinutes: 1, packable: true,
    calories: 110, protein: 1, carbs: 25, fat: 0,
    funFact: 'In Japan, sticky mochi comes with a real public-safety warning for elders every New Year.',
    reactions: {
      baby:  { tone: 'bad',   message: 'Sticky mochi can choke me!' },
      child: { tone: 'okay',  message: 'Chewy treat!' },
      adult: { tone: 'okay',  message: 'A sweet bite.' },
      elder: { tone: 'bad',   message: 'Mochi is a choking risk for elders!' },
    },
  },
  {
    id: 'ea-shrimp', name: 'Shrimp', emoji: '🍤',
    cost: 4, prepMinutes: 10, packable: false,
    calories: 120, protein: 20, carbs: 5, fat: 3,
    reactions: {
      baby:  { tone: 'poor',  message: 'Shellfish is risky for me.' },
      child: { tone: 'ideal', message: 'Crispy shrimp!' },
      adult: { tone: 'ideal', message: 'Lean protein.' },
      elder: { tone: 'okay',  message: 'Nice, watching cholesterol.' },
    },
  },
]
