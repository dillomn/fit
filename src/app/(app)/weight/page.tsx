import { db } from "@/lib/db";
import PageHeader from "@/components/PageHeader";
import WeightLogForm from "@/components/WeightLogForm";
import TrendChart, { type Point } from "@/components/TrendChart";
import { getProfile } from "@/lib/queries";
import { deleteBodyMetric } from "@/lib/actions";
import { toYMD } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function WeightPage() {
  const [metrics, profile] = await Promise.all([
    db.bodyMetric.findMany({ orderBy: { date: "asc" } }),
    getProfile(),
  ]);

  const latest = metrics[metrics.length - 1] ?? null;
  const first = metrics[0] ?? null;

  const weightData: Point[] = metrics.map((m) => ({
    label: new Date(m.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    value: m.weightKg,
  }));
  const bfData: Point[] = metrics
    .filter((m) => m.bodyFat != null)
    .map((m) => ({
      label: new Date(m.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      value: m.bodyFat as number,
    }));

  const toGoal =
    latest && profile.goalWeightKg != null
      ? +(latest.weightKg - profile.goalWeightKg).toFixed(1)
      : null;
  const changed =
    latest && first ? +(latest.weightKg - first.weightKg).toFixed(1) : null;

  return (
    <div className="space-y-5">
      <PageHeader title="Body weight" subtitle="Track weight & body fat over time" />

      <WeightLogForm lastWeight={latest?.weightKg ?? null} />

      {latest && (
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Current" value={`${latest.weightKg}`} unit="kg" />
          <Stat
            label="Change"
            value={changed != null ? `${changed > 0 ? "+" : ""}${changed}` : "—"}
            unit="kg"
            tone={changed != null ? (changed <= 0 ? "good" : "bad") : undefined}
          />
          <Stat
            label="To goal"
            value={toGoal != null ? `${toGoal > 0 ? "+" : ""}${toGoal}` : "—"}
            unit="kg"
          />
        </div>
      )}

      <section className="card">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
          Weight trend
        </h2>
        <TrendChart data={weightData} color="#38bdf8" goal={profile.goalWeightKg} unit=" kg" />
      </section>

      {bfData.length > 0 && (
        <section className="card">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
            Body fat %
          </h2>
          <TrendChart data={bfData} color="#f472b6" goal={profile.goalBodyFat} unit="%" />
        </section>
      )}

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">History</h2>
        {[...metrics].reverse().map((m) => (
          <div key={m.id} className="card flex items-center justify-between py-3">
            <div>
              <div className="font-medium">
                {m.weightKg} kg
                {m.bodyFat != null && (
                  <span className="ml-2 text-sm text-muted">{m.bodyFat}% bf</span>
                )}
              </div>
              <div className="text-xs text-muted">{toYMD(m.date)}</div>
            </div>
            <form action={deleteBodyMetric.bind(null, m.id)}>
              <button className="text-sm text-red-400">Delete</button>
            </form>
          </div>
        ))}
        {metrics.length === 0 && (
          <p className="text-sm text-muted">No weigh-ins yet.</p>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  unit,
  tone,
}: {
  label: string;
  value: string;
  unit?: string;
  tone?: "good" | "bad";
}) {
  const color = tone === "good" ? "text-accent" : tone === "bad" ? "text-red-400" : "";
  return (
    <div className="card py-3 text-center">
      <div className="text-[10px] uppercase tracking-wide text-muted">{label}</div>
      <div className={`text-xl font-black ${color}`}>
        {value}
        {unit && <span className="text-xs font-normal text-muted"> {unit}</span>}
      </div>
    </div>
  );
}
