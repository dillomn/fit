import Link from "next/link";
import { db } from "@/lib/db";
import PageHeader from "@/components/PageHeader";
import NewExerciseForm from "@/components/NewExerciseForm";

export const dynamic = "force-dynamic";

export default async function ExercisesPage() {
  const exercises = await db.exercise.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  const byCategory = new Map<string, typeof exercises>();
  for (const e of exercises) {
    if (!byCategory.has(e.category)) byCategory.set(e.category, []);
    byCategory.get(e.category)!.push(e);
  }

  return (
    <div className="space-y-5">
      <header>
        <Link href="/workouts" className="text-xs text-muted">
          ← Workouts
        </Link>
        <PageHeader title="Exercises" subtitle={`${exercises.length} in your library`} />
      </header>

      <NewExerciseForm />

      {[...byCategory.entries()].map(([cat, list]) => (
        <section key={cat}>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
            {cat}
          </h2>
          <div className="card divide-y divide-border p-0">
            {list.map((e) => (
              <div key={e.id} className="flex items-center justify-between px-4 py-2.5">
                <span>{e.name}</span>
                <span className="text-xs text-muted">{e.type}</span>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
