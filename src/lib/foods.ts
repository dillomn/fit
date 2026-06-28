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

  // More protein
  { name: "Turkey mince (cooked)", serving: 150, protein: 27, carbs: 0, fat: 8 },
  { name: "Chicken thigh (cooked)", serving: 150, protein: 26, carbs: 0, fat: 11 },
  { name: "Beef steak (cooked)", serving: 150, protein: 29, carbs: 0, fat: 15 },
  { name: "Pork loin (cooked)", serving: 150, protein: 27, carbs: 0, fat: 7 },
  { name: "White fish / Cod (cooked)", serving: 150, protein: 23, carbs: 0, fat: 1 },
  { name: "Prawns (cooked)", serving: 100, protein: 24, carbs: 0, fat: 0.3 },
  { name: "Canned salmon", serving: 100, protein: 22, carbs: 0, fat: 8 },
  { name: "Sardines (canned)", serving: 100, protein: 25, carbs: 0, fat: 11 },
  { name: "Ham (sliced)", serving: 50, protein: 18, carbs: 1.5, fat: 4 },
  { name: "Bacon (cooked)", serving: 40, protein: 37, carbs: 1.4, fat: 42 },
  { name: "Tempeh", serving: 100, protein: 19, carbs: 9, fat: 11 },
  { name: "Edamame", serving: 100, protein: 11, carbs: 9, fat: 5 },
  { name: "Chickpeas (cooked)", serving: 150, protein: 9, carbs: 27, fat: 2.6 },
  { name: "Kidney beans (cooked)", serving: 150, protein: 9, carbs: 22, fat: 0.5 },

  // More carbs
  { name: "Quinoa (cooked)", serving: 150, protein: 4.4, carbs: 21, fat: 1.9 },
  { name: "Couscous (cooked)", serving: 150, protein: 3.8, carbs: 23, fat: 0.2 },
  { name: "Bagel", serving: 90, protein: 11, carbs: 53, fat: 1.7 },
  { name: "Tortilla / Wrap", serving: 60, protein: 8, carbs: 50, fat: 7 },
  { name: "Rice cakes", serving: 20, protein: 8, carbs: 82, fat: 3 },
  { name: "Granola", serving: 50, protein: 10, carbs: 64, fat: 15 },
  { name: "Weetbix / Wheat biscuits", serving: 30, protein: 12, carbs: 67, fat: 2 },
  { name: "Honey", serving: 20, protein: 0.3, carbs: 82, fat: 0 },
  { name: "Dates", serving: 30, protein: 2.5, carbs: 75, fat: 0.2 },

  // More fats / nuts / seeds
  { name: "Cashews", serving: 30, protein: 18, carbs: 30, fat: 44 },
  { name: "Walnuts", serving: 30, protein: 15, carbs: 14, fat: 65 },
  { name: "Chia seeds", serving: 15, protein: 17, carbs: 42, fat: 31 },
  { name: "Sunflower seeds", serving: 30, protein: 21, carbs: 20, fat: 51 },
  { name: "Hummus", serving: 50, protein: 8, carbs: 14, fat: 18 },
  { name: "Butter", serving: 10, protein: 0.9, carbs: 0.1, fat: 81 },
  { name: "Mayonnaise", serving: 15, protein: 1, carbs: 1, fat: 75 },
  { name: "Dark chocolate (85%)", serving: 25, protein: 10, carbs: 30, fat: 46 },

  // More dairy
  { name: "Greek yogurt (full-fat)", serving: 170, protein: 9, carbs: 4, fat: 5 },
  { name: "Mozzarella", serving: 30, protein: 22, carbs: 2.2, fat: 22 },
  { name: "Parmesan", serving: 20, protein: 38, carbs: 4, fat: 29 },
  { name: "Feta", serving: 30, protein: 14, carbs: 4, fat: 21 },
  { name: "Cream cheese", serving: 30, protein: 6, carbs: 4, fat: 34 },
  { name: "Soy milk", serving: 250, protein: 3.3, carbs: 6, fat: 1.8 },
  { name: "Oat milk", serving: 250, protein: 1, carbs: 7, fat: 1.5 },
  { name: "Almond milk (unsweetened)", serving: 250, protein: 0.5, carbs: 0.6, fat: 1.1 },

  // More fruit / veg
  { name: "Orange", serving: 130, protein: 0.9, carbs: 12, fat: 0.1 },
  { name: "Strawberries", serving: 100, protein: 0.7, carbs: 8, fat: 0.3 },
  { name: "Grapes", serving: 100, protein: 0.6, carbs: 18, fat: 0.2 },
  { name: "Mango", serving: 150, protein: 0.8, carbs: 15, fat: 0.4 },
  { name: "Spinach", serving: 100, protein: 2.9, carbs: 3.6, fat: 0.4 },
  { name: "Carrot", serving: 100, protein: 0.9, carbs: 10, fat: 0.2 },
  { name: "Peas", serving: 100, protein: 5, carbs: 14, fat: 0.4 },
  { name: "Sweetcorn", serving: 100, protein: 3.4, carbs: 19, fat: 1.5 },
  { name: "Bell pepper", serving: 100, protein: 1, carbs: 6, fat: 0.3 },
  { name: "Mushrooms", serving: 100, protein: 3.1, carbs: 3.3, fat: 0.3 },
];

/** kcal from macros (Atwater 4/4/9). */
export function caloriesFromMacros(protein: number, carbs: number, fat: number): number {
  return Math.round(protein * 4 + carbs * 4 + fat * 9);
}
