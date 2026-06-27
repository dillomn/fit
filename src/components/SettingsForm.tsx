"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/lib/actions";
import { ACTIVITY_FACTORS } from "@/lib/nutrition";

type Profile = {
  sex: string;
  birthDateYMD: string;
  heightCm: number | null;
  activityLevel: string;
  goalWeightKg: number | null;
  goalBodyFat: number | null;
  weeklyRateKg: number;
  proteinPerKg: number;
  fatPctCalories: number;
};

export default function SettingsForm({ initial }: { initial: Profile }) {
  const router = useRouter();
  const [p, setP] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => {
    setP((prev) => ({ ...prev, [k]: v }));
    setSaved(false);
  };
  const num = (v: string): number | null => (v === "" ? null : Number(v));

  const save = () =>
    startTransition(async () => {
      await updateProfile({
        sex: p.sex,
        birthDateYMD: p.birthDateYMD || null,
        heightCm: p.heightCm,
        activityLevel: p.activityLevel,
        goalWeightKg: p.goalWeightKg,
        goalBodyFat: p.goalBodyFat,
        weeklyRateKg: p.weeklyRateKg,
        proteinPerKg: p.proteinPerKg,
        fatPctCalories: p.fatPctCalories,
      });
      setSaved(true);
      router.refresh();
    });

  return (
    <div className="space-y-4">
      <section className="card space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">You</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Sex</label>
            <select
              className="input"
              value={p.sex}
              onChange={(e) => set("sex", e.target.value)}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className="label">Birth date</label>
            <input
              type="date"
              className="input"
              value={p.birthDateYMD}
              onChange={(e) => set("birthDateYMD", e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="label">Height (cm)</label>
          <input
            type="number"
            inputMode="decimal"
            className="input"
            value={p.heightCm ?? ""}
            onChange={(e) => set("heightCm", num(e.target.value))}
          />
        </div>
        <div>
          <label className="label">Activity level</label>
          <select
            className="input"
            value={p.activityLevel}
            onChange={(e) => set("activityLevel", e.target.value)}
          >
            {Object.entries(ACTIVITY_FACTORS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="card space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Goal</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Goal weight (kg)</label>
            <input
              type="number"
              inputMode="decimal"
              className="input"
              value={p.goalWeightKg ?? ""}
              onChange={(e) => set("goalWeightKg", num(e.target.value))}
            />
          </div>
          <div>
            <label className="label">Goal body fat %</label>
            <input
              type="number"
              inputMode="decimal"
              className="input"
              value={p.goalBodyFat ?? ""}
              onChange={(e) => set("goalBodyFat", num(e.target.value))}
            />
          </div>
        </div>
        <div>
          <label className="label">
            Weekly rate: {p.weeklyRateKg > 0 ? "+" : ""}
            {p.weeklyRateKg} kg/week ({p.weeklyRateKg < 0 ? "cut" : p.weeklyRateKg > 0 ? "bulk" : "maintain"})
          </label>
          <input
            type="range"
            min={-1}
            max={0.5}
            step={0.05}
            className="w-full accent-accent"
            value={p.weeklyRateKg}
            onChange={(e) => set("weeklyRateKg", Number(e.target.value))}
          />
        </div>
      </section>

      <section className="card space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Macro strategy
        </h2>
        <div>
          <label className="label">Protein: {p.proteinPerKg} g per kg bodyweight</label>
          <input
            type="range"
            min={1.2}
            max={3}
            step={0.1}
            className="w-full accent-accent"
            value={p.proteinPerKg}
            onChange={(e) => set("proteinPerKg", Number(e.target.value))}
          />
        </div>
        <div>
          <label className="label">
            Fat: {Math.round(p.fatPctCalories * 100)}% of calories
          </label>
          <input
            type="range"
            min={0.15}
            max={0.4}
            step={0.01}
            className="w-full accent-accent"
            value={p.fatPctCalories}
            onChange={(e) => set("fatPctCalories", Number(e.target.value))}
          />
        </div>
      </section>

      <button className="btn-primary w-full" onClick={save} disabled={pending}>
        {pending ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
      </button>
    </div>
  );
}
