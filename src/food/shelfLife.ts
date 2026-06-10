// Shelf life in days, by food id. Only perishables are listed —
// anything absent never spoils (dry goods, jarred, canned, honey...).
// Real-world rounded values: the teaching is the SHAPE (sushi dies in a
// day, eggs keep three weeks, rice keeps forever), not precision.

export const SHELF_LIFE: Record<string, number> = {
  // Mediterranean
  yogurt: 4, feta: 10, eggs: 21, fish: 2, beef: 3, bread: 4,
  apple: 14, banana: 5, berries: 3, tomato: 6, salad: 2, pizza: 2,
  // East Asian
  'ea-sushi': 1, 'ea-dumplings': 4, 'ea-tofu': 6, 'ea-bokchoy': 4,
  'ea-miso': 5, 'ea-riceball': 2, 'ea-edamame': 5, 'ea-eggs': 21,
  'ea-mandarin': 10, 'ea-shrimp': 2, 'ea-noodles': 14,
  // Latin American
  'la-tortilla': 7, 'la-avocado': 4, 'la-salsa': 4, 'la-chicken': 2,
  'la-eggs': 21, 'la-plantain': 6, 'la-mango': 5, 'la-tacos': 1,
  'la-cheese': 14, 'la-corn': 5, 'la-churros': 2,
  // Levantine
  'lv-pita': 4, 'lv-hummus': 4, 'lv-falafel': 2, 'lv-shakshuka': 2,
  'lv-labneh': 5, 'lv-salad': 2, 'lv-skewers': 2, 'lv-watermelon': 5,
  'lv-burekas': 3, 'lv-cucumber': 7,
}

export const shelfLifeOf = (foodId: string): number => SHELF_LIFE[foodId] ?? Infinity
export const isPerishable = (foodId: string): boolean => Number.isFinite(shelfLifeOf(foodId))
