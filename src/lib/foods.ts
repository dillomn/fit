// Staple foods with macros per 100 g (or per 100 ml for liquids).
// Calories are derived from macros (4/4/9) so they stay consistent with the
// auto-calculated total in the food logger.

export interface Staple {
  name: string;
  /** grams in a typical serving, used as the default quantity */
  serving: number;
  protein: number; // per 100 g
  carbs: number;
  fat: number;
}

export const STAPLES: Staple[] = [
  // Protein
  { name: "Chicken breast (cooked)", serving: 150, protein: 31, carbs: 0, fat: 3.6 },
  { name: "Lean beef mince (cooked)", serving: 150, protein: 27, carbs: 0, fat: 12 },
  { name: "Salmon (cooked)", serving: 150, protein: 20, carbs: 0, fat: 13 },
  { name: "Tuna (canned in water)", serving: 100, protein: 26, carbs: 0, fat: 1 },
  { name: "Eggs (whole)", serving: 100, protein: 12.6, carbs: 0.7, fat: 9.5 },
  { name: "Egg whites", serving: 100, protein: 11, carbs: 0.7, fat: 0.2 },
  { name: "Greek yogurt (nonfat)", serving: 170, protein: 10, carbs: 3.6, fat: 0.4 },
  { name: "Cottage cheese", serving: 100, protein: 11, carbs: 3.4, fat: 4.3 },
  { name: "Tofu (firm)", serving: 100, protein: 15, carbs: 3, fat: 8 },
  { name: "Whey protein (powder)", serving: 30, protein: 80, carbs: 8, fat: 7 },

  // Carbs / grains
  { name: "White rice (cooked)", serving: 150, protein: 2.7, carbs: 28, fat: 0.3 },
  { name: "Brown rice (cooked)", serving: 150, protein: 2.6, carbs: 23, fat: 0.9 },
  { name: "Pasta (cooked)", serving: 150, protein: 5, carbs: 25, fat: 1.1 },
  { name: "Rolled oats (dry)", serving: 50, protein: 16.9, carbs: 66, fat: 6.9 },
  { name: "Wholemeal bread", serving: 40, protein: 13, carbs: 41, fat: 3.4 },
  { name: "Potato (boiled)", serving: 200, protein: 1.9, carbs: 20, fat: 0.1 },
  { name: "Sweet potato (cooked)", serving: 200, protein: 2, carbs: 21, fat: 0.2 },
  { name: "Lentils (cooked)", serving: 150, protein: 9, carbs: 20, fat: 0.4 },
  { name: "Black beans (cooked)", serving: 150, protein: 8.9, carbs: 24, fat: 0.5 },

  // Fats / nuts
  { name: "Peanut butter", serving: 32, protein: 25, carbs: 20, fat: 50 },
  { name: "Almonds", serving: 30, protein: 21, carbs: 22, fat: 49 },
  { name: "Olive oil", serving: 15, protein: 0, carbs: 0, fat: 100 },
  { name: "Avocado", serving: 100, protein: 2, carbs: 9, fat: 15 },
  { name: "Cheddar cheese", serving: 30, protein: 25, carbs: 1.3, fat: 33 },

  // Fruit / veg / dairy
  { name: "Banana", serving: 120, protein: 1.1, carbs: 23, fat: 0.3 },
  { name: "Apple", serving: 180, protein: 0.3, carbs: 14, fat: 0.2 },
  { name: "Blueberries", serving: 100, protein: 0.7, carbs: 14, fat: 0.3 },
  { name: "Broccoli", serving: 100, protein: 2.8, carbs: 7, fat: 0.4 },
  { name: "Whole milk", serving: 250, protein: 3.2, carbs: 4.8, fat: 3.3 },
  { name: "Skim milk", serving: 250, protein: 3.4, carbs: 5, fat: 0.1 },
];

/** kcal from macros (Atwater 4/4/9). */
export function caloriesFromMacros(protein: number, carbs: number, fat: number): number {
  return Math.round(protein * 4 + carbs * 4 + fat * 9);
}
