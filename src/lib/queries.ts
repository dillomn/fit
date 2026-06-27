import { db } from "@/lib/db";
import { ageFromBirthDate } from "@/lib/date";
import { computeTargets, type NutritionTargets } from "@/lib/nutrition";

/** Most recent body weight in kg, or null. */
export async function latestWeightKg(): Promise<number | null> {
  const m = await db.bodyMetric.findFirst({ orderBy: { date: "desc" } });
  return m?.weightKg ?? null;
}

export async function getProfile() {
  return db.userProfile.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
}

/** Load profile + latest weight and compute nutrition targets. */
export async function getNutritionTargets(): Promise<{
  targets: NutritionTargets;
  weightKg: number | null;
}> {
  const [profile, weightKg] = await Promise.all([getProfile(), latestWeightKg()]);
  const targets = computeTargets({
    sex: profile.sex,
    age: ageFromBirthDate(profile.birthDate),
    heightCm: profile.heightCm,
    weightKg,
    activityLevel: profile.activityLevel,
    weeklyRateKg: profile.weeklyRateKg,
    proteinPerKg: profile.proteinPerKg,
    fatPctCalories: profile.fatPctCalories,
  });
  return { targets, weightKg };
}

export interface DayTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export function sumFood(
  entries: { calories: number; protein: number; carbs: number; fat: number }[],
): DayTotals {
  return entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      protein: acc.protein + e.protein,
      carbs: acc.carbs + e.carbs,
      fat: acc.fat + e.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}
