import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// Starter exercise catalog grouped by category.
const EXERCISES = [
  // Push
  { name: "Barbell Bench Press", category: "Push", type: "weight", unit: "kg" },
  { name: "Incline Dumbbell Press", category: "Push", type: "weight", unit: "kg" },
  { name: "Overhead Press", category: "Push", type: "weight", unit: "kg" },
  { name: "Cable Fly", category: "Push", type: "weight", unit: "kg" },
  { name: "Tricep Pushdown", category: "Push", type: "weight", unit: "kg" },
  // Pull
  { name: "Deadlift", category: "Pull", type: "weight", unit: "kg" },
  { name: "Pull Up", category: "Pull", type: "bodyweight", unit: "none" },
  { name: "Barbell Row", category: "Pull", type: "weight", unit: "kg" },
  { name: "Lat Pulldown", category: "Pull", type: "weight", unit: "kg" },
  { name: "Face Pull", category: "Pull", type: "weight", unit: "kg" },
  { name: "Barbell Curl", category: "Pull", type: "weight", unit: "kg" },
  // Legs
  { name: "Back Squat", category: "Legs", type: "weight", unit: "kg" },
  { name: "Romanian Deadlift", category: "Legs", type: "weight", unit: "kg" },
  { name: "Leg Press", category: "Legs", type: "weight", unit: "kg" },
  { name: "Leg Curl", category: "Legs", type: "weight", unit: "kg" },
  { name: "Calf Raise", category: "Legs", type: "weight", unit: "kg" },
  // Core / Cardio
  { name: "Plank", category: "Core", type: "duration", unit: "none" },
  { name: "Hanging Leg Raise", category: "Core", type: "bodyweight", unit: "none" },
  { name: "Running", category: "Cardio", type: "cardio", unit: "none" },
  { name: "Cycling", category: "Cardio", type: "cardio", unit: "none" },
];

async function main() {
  // Default profile (single row, id = 1).
  await db.userProfile.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      sex: "male",
      heightCm: 178,
      activityLevel: "moderate",
      goalWeightKg: 80,
      weeklyRateKg: -0.5,
    },
  });

  // Exercises.
  for (const ex of EXERCISES) {
    await db.exercise.upsert({ where: { name: ex.name }, update: {}, create: ex });
  }

  // Only seed templates/schedule if there are none yet.
  const templateCount = await db.workoutTemplate.count();
  if (templateCount === 0) {
    const ex = async (name) =>
      (await db.exercise.findUniqueOrThrow({ where: { name } })).id;

    const push = await db.workoutTemplate.create({
      data: {
        name: "Push Day",
        color: "#38bdf8",
        exercises: {
          create: [
            { exerciseId: await ex("Barbell Bench Press"), order: 0, targetSets: 4, targetReps: 8 },
            { exerciseId: await ex("Overhead Press"), order: 1, targetSets: 3, targetReps: 10 },
            { exerciseId: await ex("Incline Dumbbell Press"), order: 2, targetSets: 3, targetReps: 12 },
            { exerciseId: await ex("Tricep Pushdown"), order: 3, targetSets: 3, targetReps: 15 },
          ],
        },
      },
    });

    const pull = await db.workoutTemplate.create({
      data: {
        name: "Pull Day",
        color: "#4ade80",
        exercises: {
          create: [
            { exerciseId: await ex("Deadlift"), order: 0, targetSets: 3, targetReps: 5 },
            { exerciseId: await ex("Pull Up"), order: 1, targetSets: 4, targetReps: 8 },
            { exerciseId: await ex("Barbell Row"), order: 2, targetSets: 3, targetReps: 10 },
            { exerciseId: await ex("Barbell Curl"), order: 3, targetSets: 3, targetReps: 12 },
          ],
        },
      },
    });

    const legs = await db.workoutTemplate.create({
      data: {
        name: "Leg Day",
        color: "#f59e0b",
        exercises: {
          create: [
            { exerciseId: await ex("Back Squat"), order: 0, targetSets: 4, targetReps: 6 },
            { exerciseId: await ex("Romanian Deadlift"), order: 1, targetSets: 3, targetReps: 10 },
            { exerciseId: await ex("Leg Press"), order: 2, targetSets: 3, targetReps: 12 },
            { exerciseId: await ex("Calf Raise"), order: 3, targetSets: 4, targetReps: 15 },
          ],
        },
      },
    });

    // Mon=Push, Wed=Pull, Fri=Legs.
    await db.scheduleSlot.createMany({
      data: [
        { dayOfWeek: 1, templateId: push.id },
        { dayOfWeek: 3, templateId: pull.id },
        { dayOfWeek: 5, templateId: legs.id },
      ],
    });
  }

  console.log("Seed complete.");
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
