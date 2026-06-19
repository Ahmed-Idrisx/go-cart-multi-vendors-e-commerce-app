"use client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "next-themes";
import { RevenueRecord } from "@/types/types";

interface ChartDataPoint {
  date: string;
  orders: number;
}

export default function OrdersAreaChart({
  allOrders,
}: {
  allOrders: RevenueRecord[];
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Group orders by date
  const ordersPerDay = allOrders.reduce<Record<string, number>>(
    (acc, order) => {
      const date = new Date(order.createdAt).toISOString().split("T")[0]; // format: YYYY-MM-DD
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    },
    {},
  );

  // Convert to array for Recharts
  const chartData: ChartDataPoint[] = Object.entries(ordersPerDay).map(
    ([date, count]) => ({
      date,
      orders: count,
    }),
  );

  return (
    <div className="w-full max-w-4xl h-75 text-xs">
      <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-4 pt-2 text-right">
        <span className="text-slate-500 dark:text-slate-400">Orders /</span> Day
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? "#334155" : "#e2e8f0"}
          />
          <XAxis dataKey="date" stroke={isDark ? "#94a3b8" : "#64748b"} />
          <YAxis
            allowDecimals={false}
            stroke={isDark ? "#94a3b8" : "#64748b"}
            label={{
              value: "Orders",
              angle: -90,
              position: "insideLeft",
              fill: isDark ? "#94a3b8" : "#64748b",
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? "#1e293b" : "#ffffff",
              border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
              borderRadius: "6px",
              color: isDark ? "#f1f5f9" : "#1e293b",
            }}
            labelStyle={{ color: isDark ? "#f1f5f9" : "#1e293b" }}
          />
          <Area
            type="monotone"
            dataKey="orders"
            stroke="#4f46e5"
            fill="#8884d8"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
