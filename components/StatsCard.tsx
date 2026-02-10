interface StatsCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  trendPositive?: boolean;
}

export default function StatsCard({ label, value, icon, trend, trendPositive }: StatsCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-500 dark:text-gray-400 text-sm">{label}</span>
        <span className="text-gray-400 dark:text-gray-500">{icon}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
      {trend && (
        <div className={`mt-1 text-sm font-medium ${trendPositive ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
          {trend}
        </div>
      )}
    </div>
  );
}
