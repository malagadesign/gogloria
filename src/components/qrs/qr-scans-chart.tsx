"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ScanDayPoint } from "@/lib/analytics";

type QrScansChartProps = {
  data: ScanDayPoint[];
};

export function QrScansChart({ data }: QrScansChartProps) {
  const hasScans = data.some((point) => point.count > 0);

  if (!hasScans) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/20 px-6 text-center text-sm text-muted-foreground">
        Todavía no hay escaneos en los últimos 30 días.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#6b7280" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "#6b7280" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: "#f3f4f6" }}
            contentStyle={{
              borderRadius: "0.625rem",
              border: "1px solid #e5e7eb",
              boxShadow: "none",
            }}
            formatter={(value) => [`${value ?? 0} escaneos`, "Total"]}
            labelFormatter={(label) => `Día: ${label}`}
          />
          <Bar
            dataKey="count"
            fill="#2563eb"
            radius={[6, 6, 0, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
