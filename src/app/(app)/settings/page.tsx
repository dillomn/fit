import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import SettingsForm from "@/components/SettingsForm";
import LogoutButton from "@/components/LogoutButton";
import { getProfile, getNutritionTargets } from "@/lib/queries";
import { toYMD } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [profile, { targets, weightKg }] = await Promise.all([
    getProfile(),
    getNutritionTargets(),
  ]);

  return (
    <div className="space-y-5">
      <header>
        <Link href="/" className="text-xs text-muted">
          ← Today
        </Link>
        <PageHeader title="Settings" subtitle="Stats, goals & macros" />
      </header>

      {/* Live target preview */}
      <section className="card">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          Daily targets
        </h2>
        {targets.targetCalories != null ? (
          <div className="grid grid-cols-4 gap-2 text-center">
            <Metric label="kcal" value={targets.targetCalories} />
            <Metric label="protein" value={targets.protein} unit="g" />
            <Metric label="carbs" value={targets.carbs} unit="g" />
            <Metric label="fat" value={targets.fat} unit="g" />
          </div>
        ) : (
          <p className="text-sm text-muted">
            {weightKg == null
              ? "Log a body weight to enable calculations."
              : `Add: ${targets.missing.join(", ")}.`}
          </p>
        )}
        {targets.tdee != null && (
          <p className="mt-3 text-xs text-muted">
            BMR {targets.bmr} · TDEE {targets.tdee} kcal · adjustment{" "}
            {targets.dailyDelta && targets.dailyDelta > 0 ? "+" : ""}
            {targets.dailyDelta} kcal/day
          </p>
        )}
      </section>

      <SettingsForm
        initial={{
          sex: profile.sex,
          birthDateYMD: profile.birthDate ? toYMD(profile.birthDate) : "",
          heightCm: profile.heightCm,
          activityLevel: profile.activityLevel,
          goalWeightKg: profile.goalWeightKg,
          goalBodyFat: profile.goalBodyFat,
          weeklyRateKg: profile.weeklyRateKg,
          proteinPerKg: profile.proteinPerKg,
          fatPctCalories: profile.fatPctCalories,
        }}
      />

      <LogoutButton />
    </div>
  );
}

function Metric({
  label,
  value,
  unit,
}: {
  label: string;
  value: number | null;
  unit?: string;
}) {
  return (
    <div>
      <div className="text-lg font-black">{value ?? "—"}</div>
      <div className="text-[10px] uppercase text-muted">
        {label}
        {unit ? ` (${unit})` : ""}
      </div>
    </div>
  );
}
