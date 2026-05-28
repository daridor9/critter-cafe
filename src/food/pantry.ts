import type { Food } from './types'

export const defaultPantry: Food[] = [
  {
    id: 'yogurt',
    name: 'Yogurt',
    emoji: '🥛',
    reactions: {
      baby:  { tone: 'ideal', message: 'Yum, smooth! 😊' },
      child: { tone: 'okay',  message: "Eh, it's fine." },
      adult: { tone: 'ideal', message: 'Protein. Perfect.' },
      elder: { tone: 'ideal', message: 'Gentle and lovely.' },
    },
  },
  {
    id: 'oatmeal',
    name: 'Oatmeal',
    emoji: '🥣',
    reactions: {
      baby:  { tone: 'ideal', message: 'Mmm warm!' },
      child: { tone: 'ideal', message: 'Big bowl please!' },
      adult: { tone: 'okay',  message: 'Solid.' },
      elder: { tone: 'ideal', message: 'Easy on the stomach.' },
    },
  },
  {
    id: 'bread',
    name: 'Bread',
    emoji: '🍞',
    reactions: {
      baby:  { tone: 'poor', message: 'Just bread? Hmm.' },
      child: { tone: 'okay', message: 'Need more than this!' },
      adult: { tone: 'okay', message: 'Bread alone? Sigh.' },
      elder: { tone: 'okay', message: 'A bit dry today.' },
    },
  },
  {
    id: 'apple',
    name: 'Apple',
    emoji: '🍎',
    reactions: {
      baby:  { tone: 'bad',   message: 'Too hard for me!' },
      child: { tone: 'ideal', message: 'Crunch crunch!' },
      adult: { tone: 'ideal', message: 'Fresh and quick.' },
      elder: { tone: 'okay',  message: 'Tough on my teeth.' },
    },
  },
  {
    id: 'eggs',
    name: 'Eggs',
    emoji: '🥚',
    reactions: {
      baby:  { tone: 'poor',  message: 'Tummy ache...' },
      child: { tone: 'ideal', message: 'Protein power!' },
      adult: { tone: 'ideal', message: 'Yes, fuel.' },
      elder: { tone: 'ideal', message: 'Soft protein. Good.' },
    },
  },
  {
    id: 'coffee',
    name: 'Coffee',
    emoji: '☕',
    reactions: {
      baby:  { tone: 'bad',   message: "Babies can't have coffee!" },
      child: { tone: 'bad',   message: "Coffee isn't for kids!" },
      adult: { tone: 'ideal', message: 'Bless you. ☕' },
      elder: { tone: 'okay',  message: "I'll be jittery..." },
    },
  },
]
