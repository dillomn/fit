"use client";

import { useState } from "react";
import TrendChart, { type Point } from "@/components/TrendChart";

export type ExerciseSeries = {
  exerciseId: number;
  name: string;
  unit: string;
  oneRm: Point[];
  topSet: Point[];
  best1rm: number;
  bestWeight: number;
};

export default function ProgressView({ series }: { series: ExerciseSeries[] }) {
  const [selectedId, setSelectedId] = useState(series[0]?.exerciseId ?? 0);
  const [metric, setMetric] = useState<"oneRm" | "topSet">("oneRm");

  const current = series.find((s) => s.exerciseId === selectedId);

  if (series.length === 0) {
    return (
      <div className="card text-center text-sm text-muted">
        Log some weighted sets to see strength progress here.
      </div>
    );
  }

  const data = current ? current[metric] : [];

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

      <div className="flex gap-2">
        <Toggle active={metric === "oneRm"} onClick={() => setMetric("oneRm")}>
          Est. 1RM
        </Toggle>
        <Toggle active={metric === "topSet"} onClick={() => setMetric("topSet")}>
          Top set
        </Toggle>
      </div>

      {current && (
        <div className="grid grid-cols-2 gap-3">
          <div className="card py-3 text-center">
            <div className="text-[10px] uppercase tracking-wide text-muted">Best 1RM</div>
            <div className="text-xl font-black text-accent">
              {current.best1rm}
              <span className="text-xs font-normal text-muted"> {current.unit}</span>
            </div>
          </div>
          <div className="card py-3 text-center">
            <div className="text-[10px] uppercase tracking-wide text-muted">Heaviest</div>
            <div className="text-xl font-black">
              {current.bestWeight}
              <span className="text-xs font-normal text-muted"> {current.unit}</span>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <TrendChart
          data={data}
          color="#4ade80"
          unit={current ? ` ${current.unit}` : ""}
        />
      </div>
    </div>
  );
}

function Toggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-xl border py-2 text-sm font-semibold transition ${
        active ? "border-accent bg-accent/10 text-accent" : "border-border text-muted"
      }`}
    >
      {children}
    </button>
  );
}
