import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import TemplateEditor from "@/components/TemplateEditor";
import { startSession } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function TemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const templateId = Number(id);
  if (Number.isNaN(templateId)) notFound();

  const [template, allExercises] = await Promise.all([
    db.workoutTemplate.findUnique({
      where: { id: templateId },
      include: {
        exercises: { orderBy: { order: "asc" }, include: { exercise: true } },
      },
    }),
    db.exercise.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] }),
  ]);

  if (!template) notFound();

  return (
    <div className="space-y-4">
      <header>
        <Link href="/workouts" className="text-xs text-muted">
          ← Workouts
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black tracking-tight" style={{ color: template.color }}>
            {template.name}
          </h1>
          <form action={startSession.bind(null, template.id)}>
            <button className="btn-primary text-sm">Start</button>
          </form>
        </div>
      </header>

      <TemplateEditor
        templateId={template.id}
        items={template.exercises.map((te) => ({
          id: te.id,
          exerciseId: te.exerciseId,
          exerciseName: te.exercise.name,
          targetSets: te.targetSets,
          targetReps: te.targetReps,
        }))}
        allExercises={allExercises.map((e) => ({
          id: e.id,
          name: e.name,
          category: e.category,
        }))}
      />
    </div>
  );
}
