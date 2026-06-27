import Link from "next/link";
import { db } from "@/lib/db";
import PageHeader from "@/components/PageHeader";
import ScheduleEditor from "@/components/ScheduleEditor";
import NewTemplateForm from "@/components/NewTemplateForm";
import { startSession } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function WorkoutsPage() {
  const [templates, schedule, recent] = await Promise.all([
    db.workoutTemplate.findMany({
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { exercises: true } } },
    }),
    db.scheduleSlot.findMany(),
    db.workoutSession.findMany({
      orderBy: { date: "desc" },
      take: 8,
      include: { _count: { select: { sets: true } } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Workouts" subtitle="Schedule, templates & history" />

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
          Weekly schedule
        </h2>
        <ScheduleEditor templates={templates} schedule={schedule} />
        <p className="mt-2 text-xs text-muted">Tap a day to assign a template.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Templates
        </h2>
        {templates.map((t) => (
          <div key={t.id} className="card flex items-center justify-between gap-3">
            <Link href={`/workouts/templates/${t.id}`} className="min-w-0 flex-1">
              <div className="truncate font-bold" style={{ color: t.color }}>
                {t.name}
              </div>
              <div className="text-xs text-muted">{t._count.exercises} exercises</div>
            </Link>
            <form action={startSession.bind(null, t.id)}>
              <button className="btn-primary text-sm">Start</button>
            </form>
          </div>
        ))}
        <NewTemplateForm />
        <form action={startSession.bind(null, undefined)}>
          <button className="btn-ghost w-full">Start a freestyle workout</button>
        </form>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Recent sessions
        </h2>
        {recent.length === 0 && <p className="text-sm text-muted">No workouts logged yet.</p>}
        {recent.map((s) => (
          <Link
            key={s.id}
            href={`/workouts/session/${s.id}`}
            className="card flex items-center justify-between"
          >
            <div>
              <div className="font-medium">{s.name}</div>
              <div className="text-xs text-muted">
                {new Date(s.date).toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}{" "}
                · {s._count.sets} sets
              </div>
            </div>
            <span className={`text-xs ${s.completedAt ? "text-accent" : "text-muted"}`}>
              {s.completedAt ? "Done ✓" : "Open"}
            </span>
          </Link>
        ))}
      </section>

      <div className="flex gap-3 text-sm">
        <Link href="/workouts/exercises" className="text-accent2">
          Manage exercises →
        </Link>
      </div>
    </div>
  );
}
