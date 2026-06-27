import Link from "next/link";
import { db } from "@/lib/db";
import PageHeader from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const sessions = await db.workoutSession.findMany({
    orderBy: { date: "desc" },
    include: { _count: { select: { sets: true } } },
  });

  // Group sessions by "Month Year" for readable history.
  const groups: { label: string; sessions: typeof sessions }[] = [];
  for (const s of sessions) {
    const label = new Date(s.date).toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
    let g = groups.find((x) => x.label === label);
    if (!g) {
      g = { label, sessions: [] };
      groups.push(g);
    }
    g.sessions.push(s);
  }

  const completed = sessions.filter((s) => s.completedAt).length;

  return (
    <div className="space-y-5">
      <header>
        <Link href="/workouts" className="text-xs text-muted">
          ← Workouts
        </Link>
        <PageHeader
          title="History"
          subtitle={`${sessions.length} sessions · ${completed} completed`}
        />
      </header>

      {sessions.length === 0 && (
        <p className="text-sm text-muted">No workouts logged yet.</p>
      )}

      {groups.map((g) => (
        <section key={g.label} className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            {g.label}
          </h2>
          {g.sessions.map((s) => (
            <Link
              key={s.id}
              href={`/workouts/session/${s.id}`}
              className="card flex items-center justify-between"
            >
              <div className="min-w-0">
                <div className="truncate font-medium">{s.name}</div>
                <div className="text-xs text-muted">
                  {new Date(s.date).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  · {s._count.sets} sets
                </div>
              </div>
              <span
                className={`ml-3 shrink-0 text-xs ${
                  s.completedAt ? "text-accent" : "text-muted"
                }`}
              >
                {s.completedAt ? "Done ✓" : "Open"}
              </span>
            </Link>
          ))}
        </section>
      ))}
    </div>
  );
}
