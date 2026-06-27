import Link from "next/link";
import { db } from "@/lib/db";
import { startOfDay, endOfDay, DAY_NAMES } from "@/lib/date";
import { getNutritionTargets, sumFood } from "@/lib/queries";
import { startSession } from "@/lib/actions";
import { MacroBar } from "@/components/MacroBar";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const now = new Date();
  const dow = now.getDay();
  const dayStart = startOfDay(now);
  const dayEnd = endOfDay(now);

  const [slot, todaySession, latestMetric, food, { targets }] = await Promise.all([
    db.scheduleSlot.findFirst({
      where: { dayOfWeek: dow },
      include: { template: true },
    }),
    db.workoutSession.findFirst({
      where: { date: { gte: dayStart, lte: dayEnd } },
      orderBy: { date: "desc" },
      include: { _count: { select: { sets: true } } },
    }),
    db.bodyMetric.findFirst({ orderBy: { date: "desc" } }),
    db.foodEntry.findMany({ where: { date: { gte: dayStart, lte: dayEnd } } }),
    getNutritionTargets(),
  ]);

  const totals = sumFood(food);
  const calsLeft =
    targets.targetCalories != null
      ? Math.round(targets.targetCalories - totals.calories)
      : null;

  return (
    <div className="space-y-5">
      <header className="mb-1 flex items-start justify-between">
        <div>
          <p className="text-sm text-muted">
            {DAY_NAMES[dow]},{" "}
            {now.toLocaleDateString(undefined, { month: "long", day: "numeric" })}
          </p>
          <h1 className="text-2xl font-black tracking-tight">Today</h1>
        </div>
        <Link
          href="/settings"
          aria-label="Settings"
          className="rounded-xl border border-border bg-surface2 p-2 text-muted"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 008 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H2a2 2 0 010-4h.09A1.65 1.65 0 004.6 8a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 3.6a1.65 1.65 0 001-1.51V2a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 8c.14.63.66 1.11 1.31 1.31H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        </Link>
      </header>

      {/* Workout card */}
      <section className="card">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          Workout
        </h2>
        {todaySession ? (
          <Link
            href={`/workouts/session/${todaySession.id}`}
            className="flex items-center justify-between"
          >
            <div>
              <div className="text-lg font-bold">{todaySession.name}</div>
              <div className="text-sm text-muted">
                {todaySession.completedAt
                  ? "Completed ✓"
                  : `In progress · ${todaySession._count.sets} sets`}
              </div>
            </div>
            <span className="btn-ghost text-sm">
              {todaySession.completedAt ? "View" : "Resume"}
            </span>
          </Link>
        ) : slot ? (
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-lg font-bold" style={{ color: slot.template.color }}>
                {slot.template.name}
              </div>
              <div className="text-sm text-muted">Scheduled for today</div>
            </div>
            <form action={startSession.bind(null, slot.templateId)}>
              <button className="btn-primary text-sm">Start</button>
            </form>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-muted">Rest day — nothing scheduled.</div>
            <form action={startSession.bind(null, undefined)}>
              <button className="btn-ghost text-sm">Freestyle</button>
            </form>
          </div>
        )}
      </section>

      {/* Nutrition card */}
      <section className="card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Nutrition
          </h2>
          <Link href="/nutrition" className="text-xs text-accent2">
            Log food →
          </Link>
        </div>
        {targets.targetCalories != null ? (
          <>
            <div className="mb-3 flex items-end gap-2">
              <span className="text-3xl font-black">{Math.round(totals.calories)}</span>
              <span className="pb-1 text-sm text-muted">
                / {targets.targetCalories} kcal
              </span>
              <span
                className={`ml-auto pb-1 text-sm font-semibold ${
                  calsLeft != null && calsLeft < 0 ? "text-red-400" : "text-accent"
                }`}
              >
                {calsLeft != null && calsLeft >= 0
                  ? `${calsLeft} left`
                  : `${Math.abs(calsLeft ?? 0)} over`}
              </span>
            </div>
            <div className="space-y-2">
              <MacroBar label="Protein" value={totals.protein} target={targets.protein} color="#38bdf8" />
              <MacroBar label="Carbs" value={totals.carbs} target={targets.carbs} color="#4ade80" />
              <MacroBar label="Fat" value={totals.fat} target={targets.fat} color="#f59e0b" />
            </div>
          </>
        ) : (
          <p className="text-sm text-muted">
            Add your stats in{" "}
            <Link href="/settings" className="text-accent2">
              settings
            </Link>{" "}
            to get calorie targets.
          </p>
        )}
      </section>

      {/* Weight card */}
      <section className="card">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Body weight
          </h2>
          <Link href="/weight" className="text-xs text-accent2">
            Log →
          </Link>
        </div>
        {latestMetric ? (
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black">{latestMetric.weightKg}</span>
            <span className="pb-1 text-sm text-muted">kg</span>
            {latestMetric.bodyFat != null && (
              <span className="ml-auto pb-1 text-sm text-muted">
                {latestMetric.bodyFat}% bf
              </span>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted">No weigh-ins yet.</p>
        )}
      </section>
    </div>
  );
}
