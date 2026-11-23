"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type RevenuePoint = {
  label: string;
  invoiced: number;
  paid: number;
};

function formatCompact(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="invoicedFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.12" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="paidFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.08} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "currentColor", opacity: 0.55 }}
            dy={8}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "currentColor", opacity: 0.55 }}
            tickFormatter={formatCompact}
            width={64}
          />
          <Tooltip
            cursor={{ stroke: "currentColor", strokeOpacity: 0.1 }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const invoiced = Number(payload.find((p) => p.dataKey === "invoiced")?.value ?? 0);
              const paid = Number(payload.find((p) => p.dataKey === "paid")?.value ?? 0);
              return (
                <div className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm shadow-lg dark:border-white/10 dark:bg-zinc-950">
                  <p className="mb-1 font-medium text-black dark:text-white">{label}</p>
                  <p className="text-zinc-600 dark:text-zinc-300">Invoiced: {formatMoney(invoiced)}</p>
                  <p className="text-emerald-600 dark:text-emerald-400">Paid: {formatMoney(paid)}</p>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="invoiced"
            stroke="currentColor"
            strokeWidth={2}
            fill="url(#invoicedFill)"
            name="Invoiced"
          />
          <Area
            type="monotone"
            dataKey="paid"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#paidFill)"
            name="Paid"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
