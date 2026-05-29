import type { Food } from './types'

// Macro values per serving — real-world rounded for kid-friendly clarity.
// Calories don't strictly equal P*4 + C*4 + F*9 due to rounding; both are
// approximations that teach the shape of nutrition without pretending precision.

export const defaultPantry: Food[] = [
  // ----- Dairy / protein -----
  {
    id: 'yogurt', name: 'Yogurt', emoji: '🥛',
    cost: 2, prepMinutes: 1, packable: true,
    calories: 150, protein: 8, carbs: 12, fat: 4,
    reactions: {
      baby:  { tone: 'ideal', message: 'Yum, smooth! 😊' },
      child: { tone: 'okay',  message: "Eh, it's fine." },
      adult: { tone: 'ideal', message: 'Protein. Perfect.' },
      elder: { tone: 'ideal', message: 'Gentle and lovely.' },
    },
  },
  {
    id: 'feta', name: 'Feta cheese', emoji: '🧀',
    cost: 3, prepMinutes: 1, packable: true,
    calories: 75, protein: 5, carbs: 1, fat: 6,
    reactions: {
      baby:  { tone: 'poor',  message: 'Too salty for me!' },
      child: { tone: 'okay',  message: 'Crumbly... bit salty.' },
      adult: { tone: 'ideal', message: 'Salty and rich. Yes.' },
      elder: { tone: 'okay',  message: 'Watching my salt.' },
    },
  },
  {
    id: 'eggs', name: 'Eggs', emoji: '🥚',
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
    id: 'fish', name: 'Fish', emoji: '🐟',
    cost: 4, prepMinutes: 12, packable: false,
    calories: 200, protein: 25, carbs: 0, fat: 12,
    reactions: {
      baby:  { tone: 'poor',  message: 'Bones scare me!' },
      child: { tone: 'ideal', message: 'Pink fish, yum!' },
      adult: { tone: 'ideal', message: 'Omega-3 perfection.' },
      elder: { tone: 'ideal', message: 'Good for the heart.' },
    },
  },
  {
    id: 'beef', name: 'Beef', emoji: '🥩',
    cost: 5, prepMinutes: 15, packable: false,
    calories: 300, protein: 30, carbs: 0, fat: 20,
    reactions: {
      baby:  { tone: 'bad',   message: 'Way too tough for me!' },
      child: { tone: 'ideal', message: 'Strong food!' },
      adult: { tone: 'ideal', message: 'Hearty protein.' },
      elder: { tone: 'okay',  message: 'A bit heavy on me.' },
    },
  },

  // ----- Carbs / grains -----
  {
    id: 'bread', name: 'Bread', emoji: '🍞',
    cost: 1, prepMinutes: 1, packable: true,
    calories: 80, protein: 3, carbs: 15, fat: 1,
    reactions: {
      baby:  { tone: 'poor', message: 'Just bread? Hmm.' },
      child: { tone: 'okay', message: 'Need more than this!' },
      adult: { tone: 'okay', message: 'Bread alone? Sigh.' },
      elder: { tone: 'okay', message: 'A bit dry today.' },
    },
  },
  {
    id: 'oatmeal', name: 'Oatmeal', emoji: '🥣',
    cost: 1, prepMinutes: 5, packable: false,
    calories: 200, protein: 6, carbs: 30, fat: 4,
    reactions: {
      baby:  { tone: 'ideal', message: 'Mmm warm!' },
      child: { tone: 'ideal', message: 'Big bowl please!' },
      adult: { tone: 'okay',  message: 'Solid.' },
      elder: { tone: 'ideal', message: 'Easy on the stomach.' },
    },
  },
  {
    id: 'rice', name: 'Rice', emoji: '🍚',
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
    id: 'pasta', name: 'Pasta', emoji: '🍝',
    cost: 2, prepMinutes: 12, packable: false,
    calories: 250, protein: 8, carbs: 50, fat: 2,
    reactions: {
      baby:  { tone: 'okay',  message: 'Tiny pieces, ok.' },
      child: { tone: 'ideal', message: 'PASTA! ❤️' },
      adult: { tone: 'ideal', message: 'Comfort food.' },
      elder: { tone: 'okay',  message: 'A bit heavy.' },
    },
  },
  {
    id: 'quinoa', name: 'Quinoa', emoji: '🌾',
    cost: 3, prepMinutes: 15, packable: true,
    calories: 220, protein: 8, carbs: 39, fat: 4,
    reactions: {
      baby:  { tone: 'okay',  message: 'Tiny grains, ok.' },
      child: { tone: 'okay',  message: 'Healthy stuff.' },
      adult: { tone: 'ideal', message: 'Complete protein. Yes.' },
      elder: { tone: 'ideal', message: 'Nutritious and easy.' },
    },
  },

  // ----- Fruit & veg -----
  {
    id: 'apple', name: 'Apple', emoji: '🍎',
    cost: 2, prepMinutes: 1, packable: true,
    calories: 100, protein: 0, carbs: 25, fat: 0,
    reactions: {
      baby:  { tone: 'bad',   message: 'Too hard for me!' },
      child: { tone: 'ideal', message: 'Crunch crunch!' },
      adult: { tone: 'ideal', message: 'Fresh and quick.' },
      elder: { tone: 'okay',  message: 'Tough on my teeth.' },
    },
  },
  {
    id: 'banana', name: 'Banana', emoji: '🍌',
    cost: 1, prepMinutes: 1, packable: true,
    calories: 100, protein: 1, carbs: 27, fat: 0,
    reactions: {
      baby:  { tone: 'ideal', message: 'Mash-able! Love it!' },
      child: { tone: 'ideal', message: 'Quick energy!' },
      adult: { tone: 'okay',  message: 'Sweet — okay snack.' },
      elder: { tone: 'okay',  message: 'Soft, fine for me.' },
    },
  },
  {
    id: 'berries', name: 'Berries', emoji: '🍓',
    cost: 3, prepMinutes: 1, packable: true,
    calories: 60, protein: 1, carbs: 14, fat: 0,
    reactions: {
      baby:  { tone: 'ideal', message: 'Soft and sweet!' },
      child: { tone: 'ideal', message: 'Sweet and pop!' },
      adult: { tone: 'ideal', message: 'Antioxidants. Nice.' },
      elder: { tone: 'ideal', message: 'Sweet and gentle.' },
    },
  },
  {
    id: 'tomato', name: 'Tomato', emoji: '🍅',
    cost: 1, prepMinutes: 1, packable: true,
    calories: 25, protein: 1, carbs: 5, fat: 0,
    reactions: {
      baby:  { tone: 'okay',  message: 'Squishy! 😋' },
      child: { tone: 'okay',  message: 'Plain tomato?' },
      adult: { tone: 'ideal', message: 'Fresh and bright.' },
      elder: { tone: 'ideal', message: 'Light and easy.' },
    },
  },
  {
    id: 'olives', name: 'Olives', emoji: '🫒',
    cost: 2, prepMinutes: 1, packable: true,
    calories: 30, protein: 0, carbs: 1, fat: 3,
    reactions: {
      baby:  { tone: 'bad',   message: 'Choking risk for me!' },
      child: { tone: 'okay',  message: 'Salty... I guess.' },
      adult: { tone: 'ideal', message: 'Mediterranean staple.' },
      elder: { tone: 'okay',  message: 'Watching my salt.' },
    },
  },
  {
    id: 'salad', name: 'Salad', emoji: '🥗',
    cost: 3, prepMinutes: 5, packable: false,
    calories: 80, protein: 2, carbs: 8, fat: 5,
    reactions: {
      baby:  { tone: 'poor',  message: 'Hard to chew for me!' },
      child: { tone: 'okay',  message: 'Veggies... ok.' },
      adult: { tone: 'ideal', message: 'Fresh and bright.' },
      elder: { tone: 'ideal', message: 'Light and healthy.' },
    },
  },

  // ----- Treats, prepared, drinks -----
  {
    id: 'pizza', name: 'Pizza', emoji: '🍕',
    cost: 4, prepMinutes: 8, packable: true,
    calories: 280, protein: 12, carbs: 35, fat: 12,
    reactions: {
      baby:  { tone: 'poor',  message: 'Too cheesy and chewy.' },
      child: { tone: 'ideal', message: 'PIZZA PARTY! 🎉' },
      adult: { tone: 'okay',  message: 'Tasty but heavy.' },
      elder: { tone: 'poor',  message: 'Hard to digest.' },
    },
  },
  {
    id: 'honey', name: 'Honey', emoji: '🍯',
    cost: 2, prepMinutes: 1, packable: true,
    calories: 60, protein: 0, carbs: 17, fat: 0,
    reactions: {
      baby:  { tone: 'bad',   message: 'Honey is dangerous for babies! 😟' },
      child: { tone: 'okay',  message: 'Sweet treat!' },
      adult: { tone: 'okay',  message: 'A bit sugary, but ok.' },
      elder: { tone: 'okay',  message: 'Sweet, in moderation.' },
    },
  },
  {
    id: 'cookie', name: 'Cookie', emoji: '🍪',
    cost: 2, prepMinutes: 1, packable: true,
    calories: 100, protein: 1, carbs: 15, fat: 5,
    reactions: {
      baby:  { tone: 'poor',  message: 'Hard and sugary.' },
      child: { tone: 'okay',  message: 'A treat! 🍪' },
      adult: { tone: 'okay',  message: 'A small indulgence.' },
      elder: { tone: 'okay',  message: 'Watching my sugar.' },
    },
  },
  {
    id: 'coffee', name: 'Coffee', emoji: '☕',
    cost: 3, prepMinutes: 4, packable: false,
    calories: 5, protein: 0, carbs: 0, fat: 0,
    reactions: {
      baby:  { tone: 'bad',   message: "Babies can't have coffee!" },
      child: { tone: 'bad',   message: "Coffee isn't for kids!" },
      adult: { tone: 'ideal', message: 'Bless you. ☕' },
      elder: { tone: 'okay',  message: "I'll be jittery..." },
    },
  },
]
