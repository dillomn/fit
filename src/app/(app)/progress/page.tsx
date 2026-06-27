import { db } from "@/lib/db";
import PageHeader from "@/components/PageHeader";
import ProgressView, { type ExerciseSeries } from "@/components/ProgressView";
import { estimateOneRepMax } from "@/lib/nutrition";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  // All weighted sets that have both weight and reps recorded.
  const sets = await db.setLog.findMany({
    where: { weight: { not: null }, reps: { not: null } },
    include: { exercise: true, session: { select: { date: true } } },
    orderBy: { createdAt: "asc" },
  });

  // Group by exercise, then by calendar day, keeping the best set of each day.
  type DayBest = { date: Date; oneRm: number; weight: number };
  const byExercise = new Map<
    number,
    { name: string; unit: string; days: Map<string, DayBest> }
  >();

  for (const s of sets) {
    if (s.weight == null || s.reps == null) continue;
    const oneRm = estimateOneRepMax(s.weight, s.reps);
    const key = new Date(s.session.date);
    const dayKey = key.toISOString().slice(0, 10);

    if (!byExercise.has(s.exerciseId)) {
      byExercise.set(s.exerciseId, {
        name: s.exercise.name,
        unit: s.exercise.unit === "none" ? "reps" : s.exercise.unit,
        days: new Map(),
      });
    }
    const ex = byExercise.get(s.exerciseId)!;
    const existing = ex.days.get(dayKey);
    if (!existing || oneRm > existing.oneRm) {
      ex.days.set(dayKey, {
        date: key,
        oneRm,
        weight: Math.max(s.weight, existing?.weight ?? 0),
      });
    } else if (s.weight > existing.weight) {
      existing.weight = s.weight;
    }
  }

  const series: ExerciseSeries[] = [...byExercise.entries()]
    .map(([exerciseId, ex]) => {
      const days = [...ex.days.values()].sort((a, b) => +a.date - +b.date);
      const fmt = (d: Date) =>
        d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      return {
        exerciseId,
        name: ex.name,
        unit: ex.unit,
        oneRm: days.map((d) => ({ label: fmt(d.date), value: d.oneRm })),
        topSet: days.map((d) => ({ label: fmt(d.date), value: d.weight })),
        best1rm: Math.max(...days.map((d) => d.oneRm)),
        bestWeight: Math.max(...days.map((d) => d.weight)),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-5">
      <PageHeader title="Progress" subtitle="Strength over time, per exercise" />
      <ProgressView series={series} />
    </div>
  );
}
