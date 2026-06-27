"use client";

import { useState, useTransition } from "react";
import { addBodyMetric } from "@/lib/actions";
import { toYMD } from "@/lib/date";

export default function WeightLogForm({ lastWeight }: { lastWeight: number | null }) {
  const [weight, setWeight] = useState(lastWeight ? String(lastWeight) : "");
  const [bodyFat, setBodyFat] = useState("");
  const [date, setDate] = useState(toYMD(new Date()));
  const [pending, startTransition] = useTransition();

  return (
    <div className="card space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Weight (kg)</label>
          <input
            type="number"
            inputMode="decimal"
            className="input"
            placeholder="80.0"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Body fat % (opt)</label>
          <input
            type="number"
            inputMode="decimal"
            className="input"
            placeholder="18"
            value={bodyFat}
            onChange={(e) => setBodyFat(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="label">Date</label>
        <input
          type="date"
          className="input"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <button
        className="btn-primary w-full"
        disabled={pending || !weight}
        onClick={() =>
          startTransition(async () => {
            await addBodyMetric({
              weightKg: Number(weight),
              bodyFat: bodyFat ? Number(bodyFat) : null,
              dateYMD: date,
            });
            setBodyFat("");
          })
        }
      >
        Log weigh-in
      </button>
    </div>
  );
}
