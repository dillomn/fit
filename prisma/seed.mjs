import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// Exercise catalog. Reused across templates; upserted by unique name.
// Everything is tracked as a simple checklist — tick each set off, no weight.
const EXERCISES = [
  // Pull (back, biceps, grip) — first-pull-up + ring progressions
  { name: "Scapular Pulls", category: "Pull", type: "bodyweight", unit: "none" },
  { name: "Ring Rows", category: "Pull", type: "bodyweight", unit: "none" },
  { name: "Band-Assisted Pull-Ups", category: "Pull", type: "bodyweight", unit: "none" },
  { name: "Negative Pull-Ups", category: "Pull", type: "bodyweight", unit: "none" },
  { name: "Pull-Ups", category: "Pull", type: "bodyweight", unit: "none" },
  { name: "Australian Rows", category: "Pull", type: "bodyweight", unit: "none" },
  { name: "Dumbbell/Barbell Rows", category: "Pull", type: "weight", unit: "kg" },
  { name: "Hammer Curls", category: "Pull", type: "weight", unit: "kg" },
  { name: "Barbell/Dumbbell Curls", category: "Pull", type: "weight", unit: "kg" },
  { name: "Dead Hangs", category: "Pull", type: "duration", unit: "none" },
  // Push (chest, shoulders, triceps) — dip + ring progressions
  { name: "Ring Support Holds", category: "Push", type: "duration", unit: "none" },
  { name: "Ring Push-Ups", category: "Push", type: "bodyweight", unit: "none" },
  { name: "Push-Ups", category: "Push", type: "bodyweight", unit: "none" },
  { name: "Bench Dips", category: "Push", type: "bodyweight", unit: "none" },
  { name: "Band-Assisted Dips", category: "Push", type: "bodyweight", unit: "none" },
  { name: "Dips", category: "Push", type: "bodyweight", unit: "none" },
  { name: "Pike Push-Ups", category: "Push", type: "bodyweight", unit: "none" },
  { name: "Lateral Raises", category: "Push", type: "weight", unit: "kg" },
  { name: "Triceps Extensions", category: "Push", type: "weight", unit: "kg" },
  // Core (abs, midline for the pull/ring work)
  { name: "Hanging Knee Raises", category: "Core", type: "bodyweight", unit: "none" },
  { name: "Hanging Leg Raises", category: "Core", type: "bodyweight", unit: "none" },
  { name: "Toes-to-Bar", category: "Core", type: "bodyweight", unit: "none" },
];

// Beginner upper-body / calisthenics program tuned for: getting a first strict
// pull-up, building ring foundations (support holds, ring rows, ring push-ups)
// toward ring dips & ring pull-ups, and NO leg work by request.
// Exercises are ordered as superset pairs (A1+A2, B1+B2, …) — do each pair
// back-to-back with a short rest after the second move. scheme = the checklist
// rep target shown per set; there is no weight tracking.
const TEMPLATES = [
  {
    name: "Day 1 – Pull & Rings",
    color: "#4ade80",
    exercises: [
      // A: scap strength + straight-arm ring strength (the pull-up + ring base)
      { name: "Scapular Pulls", sets: 3, reps: 10, scheme: "8-10 (slow)" },
      { name: "Ring Support Holds", sets: 3, reps: 30, scheme: "20-30s" },
      // B: vertical pull skill + core
      { name: "Band-Assisted Pull-Ups", sets: 4, reps: 5, scheme: "3-5 (assisted)" },
      { name: "Hanging Knee Raises", sets: 3, reps: 15, scheme: "10-15" },
      // C: horizontal ring pull + pull-up negatives
      { name: "Ring Rows", sets: 4, reps: 12, scheme: "8-12" },
      { name: "Negative Pull-Ups", sets: 3, reps: 3, scheme: "3 (slow 3-5s)" },
      // D: arm + grip finisher
      { name: "Hammer Curls", sets: 3, reps: 15, scheme: "10-15" },
      { name: "Dead Hangs", sets: 3, reps: 30, scheme: "20-30s (grip)" },
    ],
  },
  {
    name: "Day 2 – Push & Chest",
    color: "#38bdf8",
    exercises: [
      // A: ring chest press + core (rings you can already do from rib height)
      { name: "Ring Push-Ups", sets: 4, reps: 12, scheme: "8-12" },
      { name: "Hanging Leg Raises", sets: 3, reps: 12, scheme: "8-12" },
      // B: dip progression + the one side-delt isolation
      { name: "Bench Dips", sets: 4, reps: 10, scheme: "6-12" },
      { name: "Lateral Raises", sets: 3, reps: 15, scheme: "12-20" },
      // C: single overhead compound + chest volume (shoulders kept in check)
      { name: "Pike Push-Ups", sets: 3, reps: 8, scheme: "6-10" },
      { name: "Push-Ups", sets: 3, reps: 15, scheme: "AMRAP" },
      // D: triceps + ring support carry-over
      { name: "Triceps Extensions", sets: 3, reps: 12, scheme: "8-12" },
      { name: "Ring Support Holds", sets: 3, reps: 30, scheme: "20-30s" },
    ],
  },
  {
    name: "Day 3 – Upper Body & Ring Skills",
    color: "#a78bfa",
    exercises: [
      // A: the big skill pair — pull-up + dip progressions (antagonist superset)
      { name: "Band-Assisted Pull-Ups", sets: 4, reps: 5, scheme: "3-5 (assisted)" },
      { name: "Band-Assisted Dips", sets: 4, reps: 8, scheme: "5-8 (assisted)" },
      // B: ring row + ring push-up antagonist superset
      { name: "Ring Rows", sets: 3, reps: 12, scheme: "8-12" },
      { name: "Ring Push-Ups", sets: 3, reps: 12, scheme: "8-12" },
      // C: biceps + triceps antagonist superset
      { name: "Barbell/Dumbbell Curls", sets: 3, reps: 12, scheme: "8-12" },
      { name: "Triceps Extensions", sets: 3, reps: 12, scheme: "8-12" },
      // D: scap strength + core (no legs)
      { name: "Scapular Pulls", sets: 3, reps: 10, scheme: "8-10 (slow)" },
      { name: "Hanging Knee Raises", sets: 3, reps: 15, scheme: "10-15" },
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
  "Day 1 – Pull & Arms",
  "Day 2 – Push & Shoulders",
  "Day 3 – Upper Strength & Skills",
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

  // Sync regime templates by name: create if missing, otherwise refresh the
  // exercise list so seed edits actually take effect on reseed. The template row
  // is reused (not recreated) so any schedule slots pointing at it stay valid.
  for (const tpl of TEMPLATES) {
    const exercises = {
      create: tpl.exercises.map((e, i) => ({
        exerciseId: idByName[e.name],
        order: i,
        targetSets: e.sets,
        targetReps: e.reps,
        repScheme: e.scheme,
      })),
    };
    const existing = await db.workoutTemplate.findFirst({ where: { name: tpl.name } });
    if (existing) {
      await db.templateExercise.deleteMany({ where: { templateId: existing.id } });
      await db.workoutTemplate.update({
        where: { id: existing.id },
        data: { color: tpl.color, exercises },
      });
    } else {
      await db.workoutTemplate.create({
        data: { name: tpl.name, color: tpl.color, exercises },
      });
    }
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

  console.log("Seed complete. Regime templates synced.");
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
