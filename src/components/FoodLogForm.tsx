"use client";

import { useState, useMemo, useTransition } from "react";
import { addFood } from "@/lib/actions";
import { STAPLES, caloriesFromMacros, type Staple } from "@/lib/foods";

const round1 = (n: number) => Math.round(n * 10) / 10;

export default function FoodLogForm({ dateYMD }: { dateYMD: string }) {
  const [name, setName] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [grams, setGrams] = useState("");
  const [base, setBase] = useState<Staple | null>(null); // per-100g basis when from a staple
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();

  // Calories are always derived from the macros currently in the form.
  const calories = caloriesFromMacros(
    Number(protein) || 0,
    Number(carbs) || 0,
    Number(fat) || 0,
  );

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return STAPLES.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 6);
  }, [query]);

  function applyStaple(s: Staple, g: number) {
    const f = g / 100;
    setBase(s);
    setName(s.name);
    setGrams(String(g));
    setProtein(String(round1(s.protein * f)));
    setCarbs(String(round1(s.carbs * f)));
    setFat(String(round1(s.fat * f)));
    setQuery("");
  }

  function onGramsChange(value: string) {
    setGrams(value);
    if (base && value !== "") {
      const f = Number(value) / 100;
      setProtein(String(round1(base.protein * f)));
      setCarbs(String(round1(base.carbs * f)));
      setFat(String(round1(base.fat * f)));
    }
  }

  function reset() {
    setName("");
    setProtein("");
    setCarbs("");
    setFat("");
    setGrams("");
    setBase(null);
    setQuery("");
  }

  return (
    <div className="card space-y-3">
      <div className="text-sm font-semibold">Add food</div>

      {/* Staple search */}
      <div className="relative">
        <input
          className="input"
          placeholder="Search staples (chicken, rice, oats…)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {matches.length > 0 && (
          <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-border bg-surface2 shadow-xl">
            {matches.map((s) => (
              <button
                key={s.name}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-surface"
                onClick={() => applyStaple(s, s.serving)}
              >
                <span>{s.name}</span>
                <span className="text-xs text-muted">
                  {caloriesFromMacros(s.protein, s.carbs, s.fat)} kcal/100g
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <input
        className="input"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      {base && (
        <div>
          <label className="label">Grams ({base.name})</label>
          <input
            type="number"
            inputMode="decimal"
            className="input"
            placeholder="100"
            value={grams}
            onChange={(e) => onGramsChange(e.target.value)}
          />
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        <Field label="Protein (g)" value={protein} onChange={(v) => { setBase(null); setProtein(v); }} />
        <Field label="Carbs (g)" value={carbs} onChange={(v) => { setBase(null); setCarbs(v); }} />
        <Field label="Fat (g)" value={fat} onChange={(v) => { setBase(null); setFat(v); }} />
      </div>

      <div className="flex items-center justify-between rounded-xl bg-surface2 px-3 py-2">
        <span className="text-xs uppercase tracking-wide text-muted">Calories (auto)</span>
        <span className="text-lg font-black">{calories} kcal</span>
      </div>

      <button
        className="btn-primary w-full"
        disabled={pending || !name.trim()}
        onClick={() =>
          startTransition(async () => {
            await addFood({
              name,
              calories,
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
