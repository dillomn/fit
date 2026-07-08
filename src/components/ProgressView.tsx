"use client";

import { useState } from "react";
import TrendChart, { type Point } from "@/components/TrendChart";

export type ExerciseSeries = {
  exerciseId: number;
  name: string;
  volume: Point[];
  totalSets: number;
  sessions: number;
};

export default function ProgressView({ series }: { series: ExerciseSeries[] }) {
  const [selectedId, setSelectedId] = useState(series[0]?.exerciseId ?? 0);

  const current = series.find((s) => s.exerciseId === selectedId);

  if (series.length === 0) {
    return (
      <div className="card text-center text-sm text-muted">
        Tick off some sets in a workout to see your volume build up here.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <select
        className="input"
        value={selectedId}
        onChange={(e) => setSelectedId(Number(e.target.value))}
      >
        {series.map((s) => (
          <option key={s.exerciseId} value={s.exerciseId}>
            {s.name}
          </option>
        ))}
      </select>

      {current && (
        <div className="grid grid-cols-2 gap-3">
          <div className="card py-3 text-center">
            <div className="text-[10px] uppercase tracking-wide text-muted">
              Total sets
            </div>
            <div className="text-xl font-black text-accent">{current.totalSets}</div>
          </div>
          <div className="card py-3 text-center">
            <div className="text-[10px] uppercase tracking-wide text-muted">Sessions</div>
            <div className="text-xl font-black">{current.sessions}</div>
          </div>
        </div>
      )}

      <div className="card">
        <TrendChart
          data={current ? current.volume : []}
          color="#4ade80"
          unit=" sets"
        />
      </div>
    </div>
  );
}
