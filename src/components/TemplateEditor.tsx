"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addTemplateExercise,
  updateTemplateExercise,
  removeTemplateExercise,
  deleteTemplate,
} from "@/lib/actions";

type TE = {
  id: number;
  exerciseId: number;
  exerciseName: string;
  targetSets: number;
  targetReps: number;
};
type Exercise = { id: number; name: string; category: string };

export default function TemplateEditor({
  templateId,
  items,
  allExercises,
}: {
  templateId: number;
  items: TE[];
  allExercises: Exercise[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [picking, setPicking] = useState(false);

  const usedIds = new Set(items.map((i) => i.exerciseId));
  const available = allExercises.filter((e) => !usedIds.has(e.id));

  return (
    <div className="space-y-3">
      {items.map((it) => (
        <div key={it.id} className="card flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium">{it.exerciseName}</div>
          </div>
          <Stepper
            label="sets"
            value={it.targetSets}
            min={1}
            onChange={(v) =>
              startTransition(() => updateTemplateExercise(it.id, { targetSets: v }))
            }
          />
          <Stepper
            label="reps"
            value={it.targetReps}
            min={1}
            onChange={(v) =>
              startTransition(() => updateTemplateExercise(it.id, { targetReps: v }))
            }
          />
          <button
            className="text-red-400"
            aria-label="Remove"
            onClick={() => startTransition(() => removeTemplateExercise(it.id))}
          >
            ✕
          </button>
        </div>
      ))}

      {items.length === 0 && (
        <p className="text-sm text-muted">No exercises yet — add some below.</p>
      )}

      {picking ? (
        <div className="card max-h-72 space-y-1 overflow-y-auto">
          {available.map((e) => (
            <button
              key={e.id}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-surface2"
              onClick={() =>
                startTransition(async () => {
                  await addTemplateExercise(templateId, e.id, 3, 10);
                  setPicking(false);
                })
              }
            >
              {e.name}
              <span className="text-xs text-muted">{e.category}</span>
            </button>
          ))}
          {available.length === 0 && (
            <p className="px-3 py-2 text-sm text-muted">All exercises added.</p>
          )}
          <button className="btn-ghost mt-1 w-full" onClick={() => setPicking(false)}>
            Close
          </button>
        </div>
      ) : (
        <button className="btn-ghost w-full" onClick={() => setPicking(true)}>
          + Add exercise
        </button>
      )}

      <button
        className="w-full rounded-xl border border-border py-2.5 text-sm text-red-400"
        onClick={() => {
          if (confirm("Delete this template?"))
            startTransition(async () => {
              await deleteTemplate(templateId);
              router.push("/workouts");
            });
        }}
      >
        Delete template
      </button>
    </div>
  );
}

function Stepper({
  label,
  value,
  min = 0,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[9px] uppercase text-muted">{label}</span>
      <div className="flex items-center gap-1">
        <button
          className="h-6 w-6 rounded-md bg-surface2 text-sm"
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          −
        </button>
        <span className="w-6 text-center text-sm font-bold">{value}</span>
        <button
          className="h-6 w-6 rounded-md bg-surface2 text-sm"
          onClick={() => onChange(value + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
}
