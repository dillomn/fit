"use client";

import { useTransition } from "react";
import { DAY_SHORT } from "@/lib/date";
import { setScheduleForDay } from "@/lib/actions";

type Template = { id: number; name: string; color: string };

export default function ScheduleEditor({
  templates,
  schedule,
}: {
  templates: Template[];
  schedule: { dayOfWeek: number; templateId: number }[];
}) {
  const [pending, startTransition] = useTransition();
  const byDay = new Map(schedule.map((s) => [s.dayOfWeek, s.templateId]));

  // Compact label for the tiny day cells: text before an en/em dash or hyphen,
  // e.g. "Day 1 – Pull + Biceps + Abs" -> "Day 1", "Pull Day" -> "Pull Day".
  const shortLabel = (name: string) => name.split(/\s*[–—-]\s*/)[0].trim();

  return (
    <div className={`grid grid-cols-7 gap-1.5 ${pending ? "opacity-60" : ""}`}>
      {DAY_SHORT.map((label, day) => {
        const templateId = byDay.get(day) ?? "";
        const tpl = templates.find((t) => t.id === templateId);
        return (
          <div key={day} className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-semibold text-muted">{label}</span>
            <div
              className="relative flex h-16 w-full items-center justify-center overflow-hidden break-words rounded-xl border border-border bg-surface2 p-1 text-center text-[10px] font-medium leading-tight"
              style={tpl ? { borderColor: tpl.color, color: tpl.color } : undefined}
            >
              {tpl ? shortLabel(tpl.name) : "Rest"}
              <select
                aria-label={`Schedule for ${label}`}
                className="absolute inset-0 cursor-pointer opacity-0"
                value={templateId}
                onChange={(e) => {
                  const v = e.target.value;
                  startTransition(() =>
                    setScheduleForDay(day, v === "" ? null : Number(v)),
                  );
                }}
              >
                <option value="">Rest</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );
      })}
    </div>
  );
}
