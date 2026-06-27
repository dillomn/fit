"use client";

import { useState, useTransition } from "react";
import {
  updateSet,
  toggleSetDone,
  addSet,
  removeSet,
  addExerciseToSession,
  completeSession,
  deleteSession,
} from "@/lib/actions";

type Set = {
  id: number;
  exerciseId: number;
  setNumber: number;
  reps: number | null;
  weight: number | null;
  done: boolean;
};
type Exercise = { id: number; name: string; type: string; unit: string };

export default function SessionLogger({
  sessionId,
  completed,
  sets,
  exercises,
  allExercises,
}: {
  sessionId: number;
  completed: boolean;
  sets: Set[];
  exercises: Record<number, Exercise>;
  allExercises: Exercise[];
}) {
  const [, startTransition] = useTransition();
  const [picking, setPicking] = useState(false);

  // Group sets by exercise, preserving first-seen order.
  const groups: { exerciseId: number; sets: Set[] }[] = [];
  for (const s of sets) {
    let g = groups.find((x) => x.exerciseId === s.exerciseId);
    if (!g) {
      g = { exerciseId: s.exerciseId, sets: [] };
      groups.push(g);
    }
    g.sets.push(s);
  }

  const usedIds = new Set(groups.map((g) => g.exerciseId));
  const available = allExercises.filter((e) => !usedIds.has(e.id));

  const totalSets = sets.length;
  const doneSets = sets.filter((s) => s.done).length;

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-10 -mx-4 border-b border-border bg-bg/90 px-4 py-2 backdrop-blur">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">
            {doneSets}/{totalSets} sets done
          </span>
          <div className="h-1.5 w-32 overflow-hidden rounded-full bg-surface2">
            <div
              className="h-full bg-accent transition-all"
              style={{ width: totalSets ? `${(doneSets / totalSets) * 100}%` : "0%" }}
            />
          </div>
        </div>
      </div>

      {groups.map((g) => {
        const ex = exercises[g.exerciseId];
        const isWeighted = ex?.type === "weight";
        return (
          <section key={g.exerciseId} className="card">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-bold">{ex?.name ?? "Exercise"}</h3>
            </div>

            <div className="mb-1 grid grid-cols-[2rem_1fr_1fr_2.5rem] items-center gap-2 px-1 text-[10px] font-semibold uppercase text-muted">
              <span>Set</span>
              <span>{isWeighted ? `Weight (${ex.unit})` : "Weight"}</span>
              <span>Reps</span>
              <span></span>
            </div>

            <div className="space-y-1.5">
              {g.sets.map((s) => (
                <div
                  key={s.id}
                  className={`grid grid-cols-[2rem_1fr_1fr_2.5rem] items-center gap-2 rounded-xl px-1 py-1 ${
                    s.done ? "bg-accent/10" : ""
                  }`}
                >
                  <span className="text-center text-sm font-bold text-muted">
                    {s.setNumber}
                  </span>
                  <NumberCell
                    value={s.weight}
                    placeholder="—"
                    onCommit={(v) =>
                      startTransition(() => updateSet(s.id, { weight: v }))
                    }
                  />
                  <NumberCell
                    value={s.reps}
                    placeholder="—"
                    onCommit={(v) => startTransition(() => updateSet(s.id, { reps: v }))}
                  />
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => startTransition(() => toggleSetDone(s.id, !s.done))}
                      className={`flex h-7 w-7 items-center justify-center rounded-lg border text-sm ${
                        s.done
                          ? "border-accent bg-accent text-black"
                          : "border-border text-muted"
                      }`}
                      aria-label="Toggle set done"
                    >
                      ✓
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2 flex gap-2">
              <button
                className="btn-ghost flex-1 py-1.5 text-xs"
                onClick={() => startTransition(() => addSet(sessionId, g.exerciseId))}
              >
                + Set
              </button>
              {g.sets.length > 0 && (
                <button
                  className="rounded-xl border border-border px-3 py-1.5 text-xs text-red-400"
                  onClick={() =>
                    startTransition(() => removeSet(g.sets[g.sets.length - 1].id))
                  }
                >
                  − Set
                </button>
              )}
            </div>
          </section>
        );
      })}

      {picking ? (
        <div className="card space-y-2">
          <div className="text-sm font-semibold">Add exercise</div>
          <div className="max-h-64 space-y-1 overflow-y-auto">
            {available.map((e) => (
              <button
                key={e.id}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-surface2"
                onClick={() =>
                  startTransition(async () => {
                    await addExerciseToSession(sessionId, e.id);
                    setPicking(false);
                  })
                }
              >
                {e.name}
                <span className="text-xs text-muted">{e.type}</span>
              </button>
            ))}
            {available.length === 0 && (
              <p className="px-3 py-2 text-sm text-muted">All exercises added.</p>
            )}
          </div>
          <button className="btn-ghost w-full" onClick={() => setPicking(false)}>
            Close
          </button>
        </div>
      ) : (
        <button className="btn-ghost w-full" onClick={() => setPicking(true)}>
          + Add exercise
        </button>
      )}

      <div className="flex gap-3 pt-2">
        {!completed && (
          <button
            className="btn-primary flex-1"
            onClick={() => startTransition(() => completeSession(sessionId))}
          >
            Finish workout
          </button>
        )}
        <button
          className="rounded-xl border border-border px-4 py-2.5 text-sm text-red-400"
          onClick={() => {
            if (confirm("Delete this workout session?"))
              startTransition(() => deleteSession(sessionId));
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function NumberCell({
  value,
  placeholder,
  onCommit,
}: {
  value: number | null;
  placeholder: string;
  onCommit: (v: number | null) => void;
}) {
  const [v, setV] = useState(value == null ? "" : String(value));
  return (
    <input
      type="number"
      inputMode="decimal"
      className="input px-2 py-1.5 text-center text-sm"
      placeholder={placeholder}
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => {
        const num = v === "" ? null : Number(v);
        if (num !== value) onCommit(Number.isNaN(num as number) ? null : num);
      }}
    />
  );
}
