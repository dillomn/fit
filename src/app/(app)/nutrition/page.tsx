import Link from "next/link";
import { db } from "@/lib/db";
import PageHeader from "@/components/PageHeader";
import FoodLogForm from "@/components/FoodLogForm";
import DateNav from "@/components/DateNav";
import { MacroBar } from "@/components/MacroBar";
import { getNutritionTargets, sumFood } from "@/lib/queries";
import { deleteFood } from "@/lib/actions";
import { startOfDay, endOfDay, fromYMD, toYMD } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function NutritionPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const sp = await searchParams;
  const dateYMD = sp.date ?? toYMD(new Date());
  const day = fromYMD(dateYMD);

  const [entries, { targets }] = await Promise.all([
    db.foodEntry.findMany({
      where: { date: { gte: startOfDay(day), lte: endOfDay(day) } },
      orderBy: { createdAt: "asc" },
    }),
    getNutritionTargets(),
  ]);

  const totals = sumFood(entries);
  const remaining =
    targets.targetCalories != null
      ? Math.round(targets.targetCalories - totals.calories)
      : null;

  return (
    <div className="space-y-5">
      <PageHeader title="Nutrition" subtitle="Calorie & macro tracking" action={{ href: "/settings", label: "Goals" }} />

      <DateNav dateYMD={dateYMD} basePath="/nutrition" />

      {targets.targetCalories == null ? (
        <div className="card text-sm text-muted">
          Set your stats and goal in{" "}
          <Link href="/settings" className="text-accent2">
            settings
          </Link>{" "}
          to calculate calorie & macro targets.
          {targets.missing.length > 0 && (
            <span className="mt-1 block text-xs">Missing: {targets.missing.join(", ")}.</span>
          )}
        </div>
      ) : (
        <section className="card">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <div className="text-3xl font-black">{Math.round(totals.calories)}</div>
              <div className="text-xs text-muted">of {targets.targetCalories} kcal</div>
            </div>
            <div
              className={`text-right text-sm font-semibold ${
                remaining != null && remaining < 0 ? "text-red-400" : "text-accent"
              }`}
            >
              {remaining != null && remaining >= 0
                ? `${remaining} kcal left`
                : `${Math.abs(remaining ?? 0)} over`}
            </div>
          </div>
          <div className="space-y-2.5">
            <MacroBar label="Protein" value={totals.protein} target={targets.protein} color="#38bdf8" />
            <MacroBar label="Carbs" value={totals.carbs} target={targets.carbs} color="#4ade80" />
            <MacroBar label="Fat" value={totals.fat} target={targets.fat} color="#f59e0b" />
          </div>
        </section>
      )}

      <FoodLogForm dateYMD={dateYMD} />

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Entries
        </h2>
        {entries.length === 0 && (
          <p className="text-sm text-muted">Nothing logged for this day.</p>
        )}
        {entries.map((e) => (
          <div key={e.id} className="card flex items-center justify-between py-3">
            <div className="min-w-0">
              <div className="truncate font-medium">{e.name}</div>
              <div className="text-xs text-muted">
                {Math.round(e.calories)} kcal · {Math.round(e.protein)}P {Math.round(e.carbs)}C{" "}
                {Math.round(e.fat)}F
              </div>
            </div>
            <form action={deleteFood.bind(null, e.id)}>
              <button className="ml-3 text-sm text-red-400">✕</button>
            </form>
          </div>
        ))}
      </section>
    </div>
  );
}
