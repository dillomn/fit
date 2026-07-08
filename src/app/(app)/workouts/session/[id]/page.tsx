import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import SessionLogger from "@/components/SessionLogger";

export const dynamic = "force-dynamic";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sessionId = Number(id);
  if (Number.isNaN(sessionId)) notFound();

  const [session, allExercises] = await Promise.all([
    db.workoutSession.findUnique({
      where: { id: sessionId },
      include: {
        sets: {
          orderBy: [{ exerciseId: "asc" }, { setNumber: "asc" }],
          include: { exercise: true },
        },
      },
    }),
    db.exercise.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!session) notFound();

  const exercises: Record<number, any> = {};
  for (const s of session.sets) exercises[s.exerciseId] = s.exercise;

  // Pull target rep schemes from the originating template, if any.
  const targets: Record<number, { sets: number; scheme: string }> = {};
  if (session.templateId) {
    const tes = await db.templateExercise.findMany({
      where: { templateId: session.templateId },
    });
    for (const te of tes) {
      targets[te.exerciseId] = {
        sets: te.targetSets,
        scheme: te.repScheme ?? String(te.targetReps),
      };
    }
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <Link href="/workouts" className="text-xs text-muted">
            ← Workouts
          </Link>
          <h1 className="text-2xl font-black tracking-tight">{session.name}</h1>
          <p className="text-sm text-muted">
            {new Date(session.date).toLocaleDateString(undefined, {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      </header>

      <SessionLogger
        sessionId={session.id}
        completed={!!session.completedAt}
        sets={session.sets.map((s) => ({
          id: s.id,
          exerciseId: s.exerciseId,
          setNumber: s.setNumber,
          reps: s.reps,
          done: s.done,
        }))}
        exercises={exercises}
        targets={targets}
        allExercises={allExercises.map((e) => ({
          id: e.id,
          name: e.name,
          type: e.type,
          unit: e.unit,
        }))}
      />
    </div>
  );
}
