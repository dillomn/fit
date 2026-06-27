// Nutrition / energy math: TDEE via Mifflin–St Jeor and macro target derivation.

export const ACTIVITY_FACTORS: Record<string, { factor: number; label: string }> = {
  sedentary: { factor: 1.2, label: "Sedentary (little/no exercise)" },
  light: { factor: 1.375, label: "Light (1–3 days/week)" },
  moderate: { factor: 1.55, label: "Moderate (3–5 days/week)" },
  active: { factor: 1.725, label: "Active (6–7 days/week)" },
  very_active: { factor: 1.9, label: "Very active (physical job / 2x day)" },
};

// 1 kg of body mass change ≈ 7700 kcal.
const KCAL_PER_KG = 7700;

export interface ProfileInput {
  sex: string;
  age: number | null;
  heightCm: number | null;
  weightKg: number | null; // most recent body weight
  activityLevel: string;
  weeklyRateKg: number; // negative = deficit
  proteinPerKg: number;
  fatPctCalories: number;
}

export interface NutritionTargets {
  bmr: number | null;
  tdee: number | null;
  targetCalories: number | null;
  protein: number | null; // grams
  fat: number | null; // grams
  carbs: number | null; // grams
  dailyDelta: number | null; // kcal added/subtracted from TDEE
  missing: string[]; // fields needed for a full calc
}

/** Mifflin–St Jeor basal metabolic rate. */
export function bmrMifflin(p: ProfileInput): number | null {
  if (p.weightKg == null || p.heightCm == null || p.age == null) return null;
  const base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age;
  return Math.round(p.sex === "female" ? base - 161 : base + 5);
}

export function computeTargets(p: ProfileInput): NutritionTargets {
  const missing: string[] = [];
  if (p.weightKg == null) missing.push("current weight");
  if (p.heightCm == null) missing.push("height");
  if (p.age == null) missing.push("birth date");

  const bmr = bmrMifflin(p);
  const af = ACTIVITY_FACTORS[p.activityLevel]?.factor ?? 1.55;
  const tdee = bmr != null ? Math.round(bmr * af) : null;

  // Convert weekly rate (kg/week) to a daily kcal delta.
  const dailyDelta = Math.round((p.weeklyRateKg * KCAL_PER_KG) / 7);
  let targetCalories = tdee != null ? tdee + dailyDelta : null;

  // Never recommend below a safe floor.
  if (targetCalories != null) {
    const floor = p.sex === "female" ? 1200 : 1500;
    targetCalories = Math.max(targetCalories, floor);
  }

  let protein: number | null = null;
  let fat: number | null = null;
  let carbs: number | null = null;
  if (targetCalories != null && p.weightKg != null) {
    protein = Math.round(p.proteinPerKg * p.weightKg);
    fat = Math.round((p.fatPctCalories * targetCalories) / 9);
    const remaining = targetCalories - protein * 4 - fat * 9;
    carbs = Math.max(0, Math.round(remaining / 4));
  }

  return { bmr, tdee, targetCalories, protein, fat, carbs, dailyDelta, missing };
}

/** Estimated 1-rep max via the Epley formula. */
export function estimateOneRepMax(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

export function lbToKg(lb: number): number {
  return lb / 2.20462;
}
export function kgToLb(kg: number): number {
  return kg * 2.20462;
}
