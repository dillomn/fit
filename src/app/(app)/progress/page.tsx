import { db } from "@/lib/db";
import PageHeader from "@/components/PageHeader";
import ProgressView, { type ExerciseSeries } from "@/components/ProgressView";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  // Every completed set — the checklist "volume" that shows work over time.
  const sets = await db.setLog.findMany({
    where: { done: true },
    include: { exercise: true, session: { select: { date: true } } },
    orderBy: { createdAt: "asc" },
  });

  // Group by exercise, then by calendar day, counting completed sets per day.
  const byExercise = new Map<
    number,
    { name: string; days: Map<string, { date: Date; sets: number }> }
  >();

  for (const s of sets) {
    const date = new Date(s.session.date);
    const dayKey = date.toISOString().slice(0, 10);

    if (!byExercise.has(s.exerciseId)) {
      byExercise.set(s.exerciseId, { name: s.exercise.name, days: new Map() });
    }
    const ex = byExercise.get(s.exerciseId)!;
    const day = ex.days.get(dayKey);
    if (day) day.sets += 1;
    else ex.days.set(dayKey, { date, sets: 1 });
  }

  const series: ExerciseSeries[] = [...byExercise.entries()]
    .map(([exerciseId, ex]) => {
      const days = [...ex.days.values()].sort((a, b) => +a.date - +b.date);
      const fmt = (d: Date) =>
        d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      return {
        exerciseId,
        name: ex.name,
        volume: days.map((d) => ({ label: fmt(d.date), value: d.sets })),
        totalSets: days.reduce((n, d) => n + d.sets, 0),
        sessions: days.length,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-5">
      <PageHeader title="Progress" subtitle="Sets completed over time, per exercise" />
      <ProgressView series={series} />
    </div>
  );
}
