"use client";

import { useRouter } from "next/navigation";
import { fromYMD, toYMD } from "@/lib/date";

export default function DateNav({ dateYMD, basePath }: { dateYMD: string; basePath: string }) {
  const router = useRouter();
  const date = fromYMD(dateYMD);
  const today = toYMD(new Date());

  const go = (delta: number) => {
    const d = fromYMD(dateYMD);
    d.setDate(d.getDate() + delta);
    router.push(`${basePath}?date=${toYMD(d)}`);
  };

  const label =
    dateYMD === today
      ? "Today"
      : date.toLocaleDateString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
        });

  return (
    <div className="flex items-center justify-between">
      <button className="btn-ghost px-3 py-1.5" onClick={() => go(-1)} aria-label="Previous day">
        ‹
      </button>
      <div className="text-center">
        <div className="font-bold">{label}</div>
        {dateYMD !== today && (
          <button
            className="text-xs text-accent2"
            onClick={() => router.push(basePath)}
          >
            Jump to today
          </button>
        )}
      </div>
      <button
        className="btn-ghost px-3 py-1.5 disabled:opacity-30"
        onClick={() => go(1)}
        disabled={dateYMD >= today}
        aria-label="Next day"
      >
        ›
      </button>
    </div>
  );
}
