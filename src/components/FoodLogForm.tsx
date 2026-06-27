"use client";

import { useState, useTransition } from "react";
import { addFood } from "@/lib/actions";

export default function FoodLogForm({ dateYMD }: { dateYMD: string }) {
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [pending, startTransition] = useTransition();

  const reset = () => {
    setName("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFat("");
  };

  return (
    <div className="card space-y-3">
      <div className="text-sm font-semibold">Add food</div>
      <input
        className="input"
        placeholder="What did you eat?"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="grid grid-cols-4 gap-2">
        <Field label="kcal" value={calories} onChange={setCalories} />
        <Field label="P (g)" value={protein} onChange={setProtein} />
        <Field label="C (g)" value={carbs} onChange={setCarbs} />
        <Field label="F (g)" value={fat} onChange={setFat} />
      </div>
      <button
        className="btn-primary w-full"
        disabled={pending || !name.trim()}
        onClick={() =>
          startTransition(async () => {
            await addFood({
              name,
              calories: Number(calories) || 0,
              protein: Number(protein) || 0,
              carbs: Number(carbs) || 0,
              fat: Number(fat) || 0,
              dateYMD,
            });
            reset();
          })
        }
      >
        Add entry
      </button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-center text-[10px] uppercase text-muted">
        {label}
      </label>
      <input
        type="number"
        inputMode="decimal"
        className="input px-1 py-1.5 text-center text-sm"
        placeholder="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
