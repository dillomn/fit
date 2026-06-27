"use client";

import { useState, useTransition } from "react";
import { createTemplate } from "@/lib/actions";

const COLORS = ["#4ade80", "#38bdf8", "#f59e0b", "#f472b6", "#a78bfa", "#f87171"];

export default function NewTemplateForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [pending, startTransition] = useTransition();

  if (!open) {
    return (
      <button className="btn-ghost w-full" onClick={() => setOpen(true)}>
        + New workout template
      </button>
    );
  }

  return (
    <div className="card space-y-3">
      <input
        className="input"
        placeholder="Template name (e.g. Upper Body)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
      />
      <div className="flex gap-2">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={`h-7 w-7 rounded-full ${color === c ? "ring-2 ring-white" : ""}`}
            style={{ backgroundColor: c }}
            aria-label={`color ${c}`}
          />
        ))}
      </div>
      <div className="flex gap-2">
        <button
          className="btn-primary flex-1"
          disabled={pending || !name.trim()}
          onClick={() =>
            startTransition(async () => {
              await createTemplate(name, color);
              setName("");
              setOpen(false);
            })
          }
        >
          Create
        </button>
        <button className="btn-ghost" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </div>
  );
}
