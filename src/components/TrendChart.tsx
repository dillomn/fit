"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
  CartesianGrid,
} from "recharts";

export type Point = { label: string; value: number };

export default function TrendChart({
  data,
  color = "#4ade80",
  goal,
  unit = "",
}: {
  data: Point[];
  color?: string;
  goal?: number | null;
  unit?: string;
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted">
        No data yet.
      </div>
    );
  }

  const values = data.map((d) => d.value);
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (goal != null) {
    min = Math.min(min, goal);
    max = Math.max(max, goal);
  }
  const pad = (max - min) * 0.15 || max * 0.05 || 1;

  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid stroke="#26323d" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#8b9bab", fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: "#26323d" }}
            minTickGap={20}
          />
          <YAxis
            domain={[Math.floor(min - pad), Math.ceil(max + pad)]}
            tick={{ fill: "#8b9bab", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              background: "#141b23",
              border: "1px solid #26323d",
              borderRadius: 12,
              color: "#fff",
              fontSize: 12,
            }}
            formatter={(v: number) => [`${v}${unit}`, ""]}
            labelStyle={{ color: "#8b9bab" }}
          />
          {goal != null && (
            <ReferenceLine
              y={goal}
              stroke="#f59e0b"
              strokeDasharray="5 4"
              label={{ value: "goal", fill: "#f59e0b", fontSize: 10, position: "insideTopRight" }}
            />
          )}
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2.5}
            dot={{ r: 2.5, fill: color }}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
