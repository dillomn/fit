"use client";

import { useState, useTransition } from "react";
import { createExercise } from "@/lib/actions";

const CATEGORIES = ["Push", "Pull", "Legs", "Core", "Cardio", "Other"];
const TYPES = [
  { value: "weight", label: "Weighted", unit: "kg" },
  { value: "bodyweight", label: "Bodyweight", unit: "none" },
  { value: "cardio", label: "Cardio", unit: "none" },
  { value: "duration", label: "Timed", unit: "none" },
];

export default function NewExerciseForm() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Push");
  const [type, setType] = useState("weight");
  const [pending, startTransition] = useTransition();

  return (
    <div className="card space-y-3">
      <div className="text-sm font-semibold">Add exercise</div>
      <input
        className="input"
        placeholder="Exercise name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-2">
        <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      <button
        className="btn-primary w-full"
        disabled={pending || !name.trim()}
        onClick={() =>
          startTransition(async () => {
            const unit = TYPES.find((t) => t.value === type)?.unit ?? "none";
            await createExercise(name, category, type, unit);
            setName("");
          })
        }
      >
        Add
      </button>
    </div>
  );
}
