"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { startOfDay, endOfDay, fromYMD } from "@/lib/date";

// ---------- Workout sessions ----------

/** Start a session from a template (copying target sets) or an empty one. */
export async function startSession(templateId?: number): Promise<void> {
  let sessionId: number;

  if (templateId) {
    const template = await db.workoutTemplate.findUniqueOrThrow({
      where: { id: templateId },
      include: { exercises: { orderBy: { order: "asc" } } },
    });
    const session = await db.workoutSession.create({
      data: {
        name: template.name,
        templateId: template.id,
        sets: {
          create: template.exercises.flatMap((te) =>
            Array.from({ length: te.targetSets }).map((_, i) => ({
              exerciseId: te.exerciseId,
              setNumber: i + 1,
              reps: te.targetReps,
              weight: te.targetWeight ?? undefined,
            })),
          ),
        },
      },
    });
    sessionId = session.id;
  } else {
    const session = await db.workoutSession.create({
      data: { name: "Freestyle Workout" },
    });
    sessionId = session.id;
  }

  revalidatePath("/");
  revalidatePath("/workouts");
  redirect(`/workouts/session/${sessionId}`);
}

export async function updateSet(
  setId: number,
  data: { reps?: number | null; weight?: number | null; durationSec?: number | null },
): Promise<void> {
  const set = await db.setLog.update({ where: { id: setId }, data });
  revalidatePath(`/workouts/session/${set.sessionId}`);
}

export async function toggleSetDone(setId: number, done: boolean): Promise<void> {
  const set = await db.setLog.update({ where: { id: setId }, data: { done } });
  revalidatePath(`/workouts/session/${set.sessionId}`);
}

export async function addSet(sessionId: number, exerciseId: number): Promise<void> {
  const count = await db.setLog.count({ where: { sessionId, exerciseId } });
  const last = await db.setLog.findFirst({
    where: { sessionId, exerciseId },
    orderBy: { setNumber: "desc" },
  });
  await db.setLog.create({
    data: {
      sessionId,
      exerciseId,
      setNumber: count + 1,
      reps: last?.reps ?? null,
      weight: last?.weight ?? null,
    },
  });
  revalidatePath(`/workouts/session/${sessionId}`);
}

export async function removeSet(setId: number): Promise<void> {
  const set = await db.setLog.delete({ where: { id: setId } });
  revalidatePath(`/workouts/session/${set.sessionId}`);
}

export async function addExerciseToSession(
  sessionId: number,
  exerciseId: number,
): Promise<void> {
  const exists = await db.setLog.findFirst({ where: { sessionId, exerciseId } });
  if (!exists) {
    await db.setLog.create({ data: { sessionId, exerciseId, setNumber: 1, reps: 10 } });
  }
  revalidatePath(`/workouts/session/${sessionId}`);
}

export async function completeSession(sessionId: number): Promise<void> {
  await db.workoutSession.update({
    where: { id: sessionId },
    data: { completedAt: new Date() },
  });
  revalidatePath("/");
  revalidatePath("/progress");
  redirect("/");
}

export async function deleteSession(sessionId: number): Promise<void> {
  await db.workoutSession.delete({ where: { id: sessionId } });
  revalidatePath("/");
  revalidatePath("/workouts");
  redirect("/workouts");
}

// ---------- Templates & schedule ----------

export async function createTemplate(name: string, color: string): Promise<void> {
  if (!name.trim()) return;
  await db.workoutTemplate.create({ data: { name: name.trim(), color } });
  revalidatePath("/workouts");
}

export async function deleteTemplate(id: number): Promise<void> {
  await db.workoutTemplate.delete({ where: { id } });
  revalidatePath("/workouts");
}

export async function addTemplateExercise(
  templateId: number,
  exerciseId: number,
  targetSets: number,
  targetReps: number,
): Promise<void> {
  const count = await db.templateExercise.count({ where: { templateId } });
  await db.templateExercise.upsert({
    where: { templateId_exerciseId: { templateId, exerciseId } },
    update: { targetSets, targetReps },
    create: { templateId, exerciseId, order: count, targetSets, targetReps },
  });
  revalidatePath(`/workouts/templates/${templateId}`);
}

export async function updateTemplateExercise(
  id: number,
  data: {
    targetSets?: number;
    targetReps?: number;
    targetWeight?: number | null;
    repScheme?: string | null;
  },
): Promise<void> {
  // When the rep scheme text changes, derive a numeric default (last number in
  // the string, e.g. "8-12" -> 12, "45-60s" -> 60) to pre-fill logged sets.
  const patch = { ...data };
  if (data.repScheme !== undefined) {
    const nums = (data.repScheme ?? "").match(/\d+/g);
    if (nums && nums.length) patch.targetReps = Number(nums[nums.length - 1]);
  }
  const te = await db.templateExercise.update({ where: { id }, data: patch });
  revalidatePath(`/workouts/templates/${te.templateId}`);
}

export async function removeTemplateExercise(id: number): Promise<void> {
  const te = await db.templateExercise.delete({ where: { id } });
  revalidatePath(`/workouts/templates/${te.templateId}`);
}

export async function setScheduleForDay(
  dayOfWeek: number,
  templateId: number | null,
): Promise<void> {
  await db.scheduleSlot.deleteMany({ where: { dayOfWeek } });
  if (templateId) {
    await db.scheduleSlot.create({ data: { dayOfWeek, templateId } });
  }
  revalidatePath("/workouts");
  revalidatePath("/");
}

export async function createExercise(
  name: string,
  category: string,
  type: string,
  unit: string,
): Promise<void> {
  if (!name.trim()) return;
  await db.exercise.create({
    data: { name: name.trim(), category, type, unit },
  });
  revalidatePath("/workouts/exercises");
}

// ---------- Body metrics ----------

export async function addBodyMetric(data: {
  weightKg: number;
  bodyFat?: number | null;
  note?: string | null;
  dateYMD?: string;
}): Promise<void> {
  const date = data.dateYMD ? fromYMD(data.dateYMD) : new Date();
  await db.bodyMetric.create({
    data: {
      weightKg: data.weightKg,
      bodyFat: data.bodyFat ?? null,
      note: data.note ?? null,
      date,
    },
  });
  revalidatePath("/weight");
  revalidatePath("/");
  revalidatePath("/nutrition");
}

export async function deleteBodyMetric(id: number): Promise<void> {
  await db.bodyMetric.delete({ where: { id } });
  revalidatePath("/weight");
}

// ---------- Food / nutrition ----------

export async function addFood(data: {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  dateYMD?: string;
}): Promise<void> {
  if (!data.name.trim()) return;
  const date = data.dateYMD ? fromYMD(data.dateYMD) : new Date();
  await db.foodEntry.create({
    data: {
      name: data.name.trim(),
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fat,
      date,
    },
  });
  revalidatePath("/nutrition");
  revalidatePath("/");
}

export async function deleteFood(id: number): Promise<void> {
  await db.foodEntry.delete({ where: { id } });
  revalidatePath("/nutrition");
  revalidatePath("/");
}

// ---------- Profile / goal ----------

export async function updateProfile(data: {
  sex?: string;
  birthDateYMD?: string | null;
  heightCm?: number | null;
  activityLevel?: string;
  goalWeightKg?: number | null;
  goalBodyFat?: number | null;
  weeklyRateKg?: number;
  proteinPerKg?: number;
  fatPctCalories?: number;
}): Promise<void> {
  const { birthDateYMD, ...rest } = data;
  const fields = {
    ...rest,
    ...(birthDateYMD === undefined
      ? {}
      : { birthDate: birthDateYMD ? fromYMD(birthDateYMD) : null }),
  };
  await db.userProfile.upsert({
    where: { id: 1 },
    update: fields,
    create: { id: 1, ...fields },
  });
  revalidatePath("/nutrition");
  revalidatePath("/settings");
  revalidatePath("/");
}

// re-export for client convenience
export { startOfDay, endOfDay };
