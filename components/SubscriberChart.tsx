"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChannelStats } from "@/types";

interface SubscriberChartProps {
  stats: ChannelStats[];
}

function formatNumber(num: number): string {
  if (num >= 10000) {
    return `${(num / 10000).toFixed(0)}万`;
  }
  return num.toLocaleString();
}

export default function SubscriberChart({ stats }: SubscriberChartProps) {
  const data = stats.map((s) => ({
    date: s.recordedAt.slice(5), // MM-DD
    subscribers: s.subscriberCount,
  }));

  // 間引いて表示（多すぎると見にくい）
  const displayData = data.filter((_, i) => i % 7 === 0 || i === data.length - 1);

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={displayData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatNumber}
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(value) => [formatNumber(Number(value)), "登録者数"]}
            labelStyle={{ color: "#374151" }}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            }}
          />
          <Line
            type="monotone"
            dataKey="subscribers"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#ef4444" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
