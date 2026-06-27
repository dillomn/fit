export function MacroBar({
  label,
  value,
  target,
  unit = "g",
  color = "#4ade80",
}: {
  label: string;
  value: number;
  target: number | null;
  unit?: string;
  color?: string;
}) {
  const pct = target ? Math.min(100, Math.round((value / target) * 100)) : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-muted">{label}</span>
        <span className="font-medium">
          {Math.round(value)}
          {target != null ? ` / ${Math.round(target)}` : ""} {unit}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface2">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
