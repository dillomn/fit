import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// Exercise catalog. Reused across templates; upserted by unique name.
const EXERCISES = [
  // Pull (back, biceps, grip) — beginner pull-up progressions
  { name: "Band-Assisted Pull-Ups", category: "Pull", type: "bodyweight", unit: "none" },
  { name: "Negative Pull-Ups", category: "Pull", type: "bodyweight", unit: "none" },
  { name: "Pull-Ups", category: "Pull", type: "bodyweight", unit: "none" },
  { name: "Australian Rows", category: "Pull", type: "bodyweight", unit: "none" },
  { name: "Dumbbell/Barbell Rows", category: "Pull", type: "weight", unit: "kg" },
  { name: "Hammer Curls", category: "Pull", type: "weight", unit: "kg" },
  { name: "Barbell/Dumbbell Curls", category: "Pull", type: "weight", unit: "kg" },
  { name: "Dead Hangs", category: "Pull", type: "duration", unit: "none" },
  // Push (chest, shoulders, triceps) — beginner dip progressions
  { name: "Bench Dips", category: "Push", type: "bodyweight", unit: "none" },
  { name: "Band-Assisted Dips", category: "Push", type: "bodyweight", unit: "none" },
  { name: "Dips", category: "Push", type: "bodyweight", unit: "none" },
  { name: "Push-Ups", category: "Push", type: "bodyweight", unit: "none" },
  { name: "Ring Push-Ups", category: "Push", type: "bodyweight", unit: "none" },
  { name: "Pike Push-Ups", category: "Push", type: "bodyweight", unit: "none" },
  { name: "Dumbbell Shoulder Press", category: "Push", type: "weight", unit: "kg" },
  { name: "Lateral Raises", category: "Push", type: "weight", unit: "kg" },
  { name: "Triceps Extensions", category: "Push", type: "weight", unit: "kg" },
  { name: "Ring Support Holds", category: "Push", type: "duration", unit: "none" },
  // Legs (minimal — bouldering base)
  { name: "Pistol Squat Progression", category: "Legs", type: "bodyweight", unit: "none" },
  { name: "Goblet Squat", category: "Legs", type: "weight", unit: "kg" },
  { name: "Calf Raises", category: "Legs", type: "weight", unit: "kg" },
  // Core (abs, small waist)
  { name: "Hanging Knee Raises", category: "Core", type: "bodyweight", unit: "none" },
  { name: "Hanging Leg Raises", category: "Core", type: "bodyweight", unit: "none" },
  { name: "Toes-to-Bar", category: "Core", type: "bodyweight", unit: "none" },
  { name: "Cable Crunches", category: "Core", type: "weight", unit: "kg" },
];

// Beginner upper-body + calisthenics program (V-taper focus, minimal legs).
// Exercises are ordered as superset pairs (A1+A2, B1+B2, …) — do each pair
// back-to-back with a short rest after the second move to save time.
// reps = numeric default used to pre-fill logged sets.
const TEMPLATES = [
  {
    name: "Day 1 – Pull & Arms",
    color: "#4ade80",
    exercises: [
      // A: vertical pull + core
      { name: "Band-Assisted Pull-Ups", sets: 4, reps: 5, scheme: "3-5 (assisted)" },
      { name: "Hanging Knee Raises", sets: 4, reps: 15, scheme: "10-15" },
      // B: pull-up skill + grip
      { name: "Negative Pull-Ups", sets: 3, reps: 3, scheme: "3 (slow 3-5s)" },
      { name: "Dead Hangs", sets: 3, reps: 30, scheme: "20-30s (grip)" },
      // C: horizontal pull volume
      { name: "Australian Rows", sets: 3, reps: 12, scheme: "8-12" },
      { name: "Dumbbell/Barbell Rows", sets: 3, reps: 12, scheme: "8-12" },
      // D: arm finisher
      { name: "Hammer Curls", sets: 3, reps: 15, scheme: "10-15" },
      { name: "Barbell/Dumbbell Curls", sets: 3, reps: 12, scheme: "8-12" },
    ],
  },
  {
    name: "Day 2 – Push & Shoulders",
    color: "#38bdf8",
    exercises: [
      // A: dip progression + side-delt (non-competing)
      { name: "Bench Dips", sets: 4, reps: 10, scheme: "6-12" },
      { name: "Lateral Raises", sets: 4, reps: 20, scheme: "12-20" },
      // B: chest press + core
      { name: "Ring Push-Ups", sets: 3, reps: 15, scheme: "8-15" },
      { name: "Hanging Leg Raises", sets: 4, reps: 12, scheme: "8-12" },
      // C: shoulder press + triceps
      { name: "Pike Push-Ups", sets: 3, reps: 10, scheme: "6-10" },
      { name: "Triceps Extensions", sets: 3, reps: 12, scheme: "8-12" },
      // D: overhead press + core
      { name: "Dumbbell Shoulder Press", sets: 3, reps: 10, scheme: "6-10" },
      { name: "Cable Crunches", sets: 4, reps: 15, scheme: "12-15" },
    ],
  },
  {
    name: "Day 3 – Upper Strength & Skills",
    color: "#a78bfa",
    exercises: [
      // A: pull + push antagonist superset (the big skill pair)
      { name: "Band-Assisted Pull-Ups", sets: 4, reps: 5, scheme: "3-5 (assisted)" },
      { name: "Band-Assisted Dips", sets: 4, reps: 8, scheme: "5-10 (assisted)" },
      // B: row + push-up antagonist superset
      { name: "Australian Rows", sets: 3, reps: 12, scheme: "8-12" },
      { name: "Ring Push-Ups", sets: 3, reps: 15, scheme: "8-15" },
      // C: biceps + triceps antagonist superset
      { name: "Barbell/Dumbbell Curls", sets: 3, reps: 12, scheme: "8-12" },
      { name: "Triceps Extensions", sets: 3, reps: 12, scheme: "8-12" },
      // D: core + a little legs
      { name: "Hanging Leg Raises", sets: 3, reps: 12, scheme: "8-12" },
      { name: "Pistol Squat Progression", sets: 2, reps: 10, scheme: "6-10/leg" },
    ],
  },
];

// Templates from earlier seeds — removed if present so the program stays current.
const LEGACY_TEMPLATE_NAMES = [
  "Push Day",
  "Pull Day",
  "Leg Day",
  "Day 1 – Pull + Biceps + Abs",
  "Day 2 – Push + Triceps + Rings + Abs",
  "Day 3 – Legs + Biceps + Pull-Up Practice + Abs",
];

async function main() {
  await db.userProfile.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, sex: "male", heightCm: 178, activityLevel: "moderate", goalWeightKg: 80, weeklyRateKg: -0.5 },
  });

  // Upsert exercises.
  const idByName = {};
  for (const ex of EXERCISES) {
    const row = await db.exercise.upsert({ where: { name: ex.name }, update: {}, create: ex });
    idByName[ex.name] = row.id;
  }

  // Create regime templates that don't already exist (by name).
  let createdRegime = false;
  for (const tpl of TEMPLATES) {
    const existing = await db.workoutTemplate.findFirst({ where: { name: tpl.name } });
    if (existing) continue;
    createdRegime = true;
    await db.workoutTemplate.create({
      data: {
        name: tpl.name,
        color: tpl.color,
        exercises: {
          create: tpl.exercises.map((e, i) => ({
            exerciseId: idByName[e.name],
            order: i,
            targetSets: e.sets,
            targetReps: e.reps,
            repScheme: e.scheme,
          })),
        },
      },
    });
  }

  // Remove legacy placeholder templates (cascade-deletes their schedule slots).
  await db.workoutTemplate.deleteMany({ where: { name: { in: LEGACY_TEMPLATE_NAMES } } });

  // Default weekly schedule (Mon/Wed/Fri) only if nothing is scheduled yet.
  const slotCount = await db.scheduleSlot.count();
  if (slotCount === 0) {
    const days = [1, 3, 5];
    for (let i = 0; i < TEMPLATES.length; i++) {
      const t = await db.workoutTemplate.findFirst({ where: { name: TEMPLATES[i].name } });
      if (t) await db.scheduleSlot.create({ data: { dayOfWeek: days[i], templateId: t.id } });
    }
  }

  console.log(`Seed complete.${createdRegime ? " Regime templates added." : ""}`);
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
