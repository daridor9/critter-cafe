import type { Food } from './types'

// Latin American kitchen — beans, corn, rice, avocado.
// Teaching wedges: beans + rice = complete protein (cheap and brilliant);
// avocado is a famous perfect first food for babies; salsa is spicy for
// little ones; whole corn kernels are a choking risk for babies.

export const latinPantry: Food[] = [
  {
    id: 'la-beans', name: 'Beans', emoji: '🫘',
    cost: 1, prepMinutes: 10, packable: true,
    calories: 180, protein: 11, carbs: 30, fat: 1,
    reactions: {
      baby:  { tone: 'ideal', message: 'Mashed beans, yum!' },
      child: { tone: 'okay',  message: 'Beans again? Fine...' },
      adult: { tone: 'ideal', message: 'Cheap, filling, protein.' },
      elder: { tone: 'ideal', message: 'Hearty and gentle.' },
    },
  },
  {
    id: 'la-tortilla', name: 'Tortillas', emoji: '🫓',
    cost: 1, prepMinutes: 3, packable: true,
    calories: 140, protein: 4, carbs: 24, fat: 3,
    reactions: {
      baby:  { tone: 'okay',  message: 'Soft pieces, ok!' },
      child: { tone: 'ideal', message: 'Roll it up!' },
      adult: { tone: 'okay',  message: 'The flexible staple.' },
      elder: { tone: 'okay',  message: 'Soft enough for me.' },
    },
  },
  {
    id: 'la-rice', name: 'Rice', emoji: '🍚',
    cost: 1, prepMinutes: 15, packable: false,
    calories: 200, protein: 4, carbs: 45, fat: 0,
    reactions: {
      baby:  { tone: 'ideal', message: 'Soft and easy!' },
      child: { tone: 'okay',  message: 'Rice AND beans please!' },
      adult: { tone: 'okay',  message: 'With beans = complete protein.' },
      elder: { tone: 'ideal', message: 'Easy on me.' },
    },
  },
  {
    id: 'la-avocado', name: 'Avocado', emoji: '🥑',
    cost: 2, prepMinutes: 2, packable: true,
    calories: 160, protein: 2, carbs: 9, fat: 15,
    reactions: {
      baby:  { tone: 'ideal', message: 'The perfect baby food!' },
      child: { tone: 'okay',  message: 'Green mush... ok.' },
      adult: { tone: 'ideal', message: 'Good fats. Beautiful.' },
      elder: { tone: 'ideal', message: 'Smooth and nourishing.' },
    },
  },
  {
    id: 'la-salsa', name: 'Salsa', emoji: '🍅',
    cost: 1, prepMinutes: 5, packable: true,
    calories: 25, protein: 1, carbs: 5, fat: 0,
    reactions: {
      baby:  { tone: 'poor',  message: 'Spicy! Too spicy!' },
      child: { tone: 'okay',  message: 'A little kick!' },
      adult: { tone: 'ideal', message: 'Bright and fresh.' },
      elder: { tone: 'okay',  message: 'Mild for me, please.' },
    },
  },
  {
    id: 'la-chicken', name: 'Chicken', emoji: '🍗',
    cost: 3, prepMinutes: 15, packable: false,
    calories: 220, protein: 27, carbs: 0, fat: 12,
    reactions: {
      baby:  { tone: 'okay',  message: 'Shredded small, ok!' },
      child: { tone: 'ideal', message: 'Chicken! Yes!' },
      adult: { tone: 'ideal', message: 'Lean and solid.' },
      elder: { tone: 'ideal', message: 'Tender protein.' },
    },
  },
  {
    id: 'la-eggs', name: 'Eggs', emoji: '🥚',
    cost: 2, prepMinutes: 6, packable: false,
    calories: 150, protein: 12, carbs: 1, fat: 10,
    reactions: {
      baby:  { tone: 'poor',  message: 'Tummy ache...' },
      child: { tone: 'ideal', message: 'Huevos! Protein!' },
      adult: { tone: 'ideal', message: 'Yes, fuel.' },
      elder: { tone: 'ideal', message: 'Soft protein. Good.' },
    },
  },
  {
    id: 'la-plantain', name: 'Plantain', emoji: '🍌',
    cost: 1, prepMinutes: 8, packable: true,
    calories: 150, protein: 1, carbs: 40, fat: 0,
    reactions: {
      baby:  { tone: 'ideal', message: 'Sweet and soft!' },
      child: { tone: 'ideal', message: 'Fried sweet circles!' },
      adult: { tone: 'okay',  message: 'Sweet side dish.' },
      elder: { tone: 'okay',  message: 'Soft, nice.' },
    },
  },
  {
    id: 'la-mango', name: 'Mango', emoji: '🥭',
    cost: 2, prepMinutes: 2, packable: true,
    calories: 100, protein: 1, carbs: 25, fat: 0,
    reactions: {
      baby:  { tone: 'ideal', message: 'Sweet and soft!' },
      child: { tone: 'ideal', message: 'Mango! 🥭' },
      adult: { tone: 'ideal', message: 'Vitamins and sunshine.' },
      elder: { tone: 'ideal', message: 'Sweet and gentle.' },
    },
  },
  {
    id: 'la-tacos', name: 'Tacos', emoji: '🌮',
    cost: 3, prepMinutes: 10, packable: false,
    calories: 230, protein: 12, carbs: 20, fat: 11,
    reactions: {
      baby:  { tone: 'poor',  message: 'Crunchy and messy for me.' },
      child: { tone: 'ideal', message: 'TACO TIME! 🌮' },
      adult: { tone: 'ideal', message: 'Everything in one shell.' },
      elder: { tone: 'okay',  message: 'Tasty, hard shell though.' },
    },
  },
  {
    id: 'la-cheese', name: 'Cheese', emoji: '🧀',
    cost: 2, prepMinutes: 1, packable: true,
    calories: 110, protein: 7, carbs: 1, fat: 9,
    reactions: {
      baby:  { tone: 'okay',  message: 'Mild cheese, ok!' },
      child: { tone: 'okay',  message: 'Cheesy!' },
      adult: { tone: 'ideal', message: 'Queso fresco. Nice.' },
      elder: { tone: 'okay',  message: 'Watching my salt.' },
    },
  },
  {
    id: 'la-corn', name: 'Corn', emoji: '🌽',
    cost: 1, prepMinutes: 8, packable: true,
    calories: 90, protein: 3, carbs: 19, fat: 1,
    reactions: {
      baby:  { tone: 'poor',  message: 'Whole kernels can choke me!' },
      child: { tone: 'ideal', message: 'Elote! Corn on the cob!' },
      adult: { tone: 'okay',  message: 'Sweet and solid.' },
      elder: { tone: 'okay',  message: 'Gets stuck in my teeth.' },
    },
  },
  {
    id: 'la-churros', name: 'Churros', emoji: '🍩',
    cost: 2, prepMinutes: 5, packable: true,
    calories: 220, protein: 3, carbs: 25, fat: 12,
    reactions: {
      baby:  { tone: 'poor',  message: 'Fried and sugary.' },
      child: { tone: 'okay',  message: 'CHURROS! A treat! 🎉' },
      adult: { tone: 'okay',  message: 'A sweet indulgence.' },
      elder: { tone: 'okay',  message: 'Just a bite for me.' },
    },
  },
  {
    id: 'la-cocoa', name: 'Hot cocoa', emoji: '🍫',
    cost: 2, prepMinutes: 5, packable: false,
    calories: 150, protein: 4, carbs: 22, fat: 5,
    reactions: {
      baby:  { tone: 'poor',  message: 'Too sweet for me.' },
      child: { tone: 'okay',  message: 'Cocoa! Warm and sweet.' },
      adult: { tone: 'okay',  message: 'Cozy.' },
      elder: { tone: 'okay',  message: 'Sweet, in moderation.' },
    },
  },
]
