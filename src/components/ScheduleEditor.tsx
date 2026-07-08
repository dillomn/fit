"use client";

import { useRef, useState, useTransition } from "react";
import { DAY_SHORT } from "@/lib/date";
import { setScheduleForDay, swapScheduleDays } from "@/lib/actions";

type Template = { id: number; name: string; color: string };

// Compact label for the tiny day cells: text before an en/em dash or hyphen,
// e.g. "Day 1 – Pull & Rings" -> "Day 1", "Pull Day" -> "Pull Day".
const shortLabel = (name: string) => name.split(/\s*[–—-]\s*/)[0].trim();

export default function ScheduleEditor({
  templates,
  schedule,
}: {
  templates: Template[];
  schedule: { dayOfWeek: number; templateId: number }[];
}) {
  const [pending, startTransition] = useTransition();
  const byDay = new Map(schedule.map((s) => [s.dayOfWeek, s.templateId]));

  // Drag state. `drag` holds the day being dragged + current pointer position;
  // `over` is the day currently hovered as a drop target; `menuDay` opens the
  // assign popover on a plain tap (no drag).
  const [drag, setDrag] = useState<{ day: number; x: number; y: number } | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const [menuDay, setMenuDay] = useState<number | null>(null);
  const startRef = useRef<{ x: number; y: number; day: number } | null>(null);
  const movedRef = useRef(false);

  const dayUnderPoint = (x: number, y: number): number | null => {
    const el = document.elementFromPoint(x, y)?.closest("[data-day]");
    const d = el?.getAttribute("data-day");
    return d == null ? null : Number(d);
  };

  const onPointerDown = (e: React.PointerEvent, day: number) => {
    startRef.current = { x: e.clientX, y: e.clientY, day };
    movedRef.current = false;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const start = startRef.current;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (!movedRef.current && Math.hypot(dx, dy) < 6) return; // tap threshold
    movedRef.current = true;
    e.preventDefault();
    setDrag({ day: start.day, x: e.clientX, y: e.clientY });
    setOver(dayUnderPoint(e.clientX, e.clientY));
  };

  const onPointerUp = (e: React.PointerEvent, day: number) => {
    const start = startRef.current;
    startRef.current = null;
    if (!movedRef.current) {
      // Treated as a tap — open the assign menu for this day.
      setMenuDay((m) => (m === day ? null : day));
      return;
    }
    const target = dayUnderPoint(e.clientX, e.clientY);
    setDrag(null);
    setOver(null);
    if (start && target != null && target !== start.day) {
      startTransition(() => swapScheduleDays(start.day, target));
    }
  };

  return (
    <div className="relative">
      <div className={`grid grid-cols-7 gap-1.5 ${pending ? "opacity-60" : ""}`}>
        {DAY_SHORT.map((label, day) => {
          const templateId = byDay.get(day) ?? "";
          const tpl = templates.find((t) => t.id === templateId);
          const isOver = over === day && drag?.day !== day;
          const isDragging = drag?.day === day;
          return (
            <div key={day} className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-semibold text-muted">{label}</span>
              <div
                data-day={day}
                onPointerDown={(e) => onPointerDown(e, day)}
                onPointerMove={onPointerMove}
                onPointerUp={(e) => onPointerUp(e, day)}
                className={`relative flex h-16 w-full touch-none select-none items-center justify-center overflow-hidden break-words rounded-xl border bg-surface2 p-1 text-center text-[10px] font-medium leading-tight transition ${
                  isOver ? "border-accent ring-1 ring-accent" : "border-border"
                } ${isDragging ? "opacity-30" : "cursor-grab"}`}
                style={tpl && !isOver ? { borderColor: tpl.color, color: tpl.color } : undefined}
              >
                {tpl ? shortLabel(tpl.name) : "Rest"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating chip that follows the pointer while dragging. */}
      {drag &&
        (() => {
          const tpl = templates.find((t) => t.id === byDay.get(drag.day));
          return (
            <div
              className="pointer-events-none fixed z-50 flex h-16 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border bg-surface2 p-1 text-center text-[10px] font-medium leading-tight shadow-lg"
              style={{
                left: drag.x,
                top: drag.y,
                borderColor: tpl?.color ?? "#26323d",
                color: tpl?.color ?? undefined,
              }}
            >
              {tpl ? shortLabel(tpl.name) : "Rest"}
            </div>
          );
        })()}

      {/* Assign popover, opened by tapping a day. */}
      {menuDay != null && (
        <>
          <button
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Close"
            onClick={() => setMenuDay(null)}
          />
          <div className="absolute left-1/2 top-full z-50 mt-2 w-52 -translate-x-1/2 space-y-1 rounded-xl border border-border bg-surface p-2 shadow-xl">
            <div className="px-2 py-1 text-[10px] uppercase tracking-wide text-muted">
              {DAY_SHORT[menuDay]}
            </div>
            <button
              className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm hover:bg-surface2"
              onClick={() => {
                const d = menuDay;
                setMenuDay(null);
                startTransition(() => setScheduleForDay(d, null));
              }}
            >
              Rest
            </button>
            {templates.map((t) => (
              <button
                key={t.id}
                className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm hover:bg-surface2"
                style={{ color: t.color }}
                onClick={() => {
                  const d = menuDay;
                  setMenuDay(null);
                  startTransition(() => setScheduleForDay(d, t.id));
                }}
              >
                {t.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
