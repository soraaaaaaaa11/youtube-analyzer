"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { CATEGORIES, SearchFilters } from "@/types";

interface SearchFormProps {
  initialFilters?: SearchFilters;
  compact?: boolean;
}

export default function SearchForm({ initialFilters, compact }: SearchFormProps) {
  const router = useRouter();
  const [showAdvanced, setShowAdvanced] = useState(!compact);
  const [filters, setFilters] = useState<SearchFilters>({
    keyword: initialFilters?.keyword ?? "",
    minSubscribers: initialFilters?.minSubscribers,
    maxSubscribers: initialFilters?.maxSubscribers,
    startDate: initialFilters?.startDate,
    endDate: initialFilters?.endDate,
    categories: initialFilters?.categories ?? [],
    minGrowthRate: initialFilters?.minGrowthRate,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (filters.keyword) params.set("keyword", filters.keyword);
    if (filters.minSubscribers) params.set("minSub", String(filters.minSubscribers));
    if (filters.maxSubscribers) params.set("maxSub", String(filters.maxSubscribers));
    if (filters.startDate) params.set("startDate", filters.startDate);
    if (filters.endDate) params.set("endDate", filters.endDate);
    if (filters.categories && filters.categories.length > 0) params.set("categories", filters.categories.join(","));
    if (filters.minGrowthRate) params.set("minGrowth", String(filters.minGrowthRate));
    router.push(`/results?${params.toString()}`);
  }

  function toggleCategory(cat: string) {
    setFilters((prev) => {
      const current = prev.categories ?? [];
      if (current.includes(cat)) {
        return { ...prev, categories: current.filter((c) => c !== cat) };
      }
      return { ...prev, categories: [...current, cat] };
    });
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        {/* Keyword search */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            キーワード検索
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="チャンネル名・キーワードで検索"
              value={filters.keyword ?? ""}
              onChange={(e) => setFilters((prev) => ({ ...prev, keyword: e.target.value }))}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Growth rate quick filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            成長率フィルター（過去30日）
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "すべて", value: undefined },
              { label: "100%以上", value: 100 },
              { label: "300%以上", value: 300 },
              { label: "500%以上", value: 500 },
              { label: "1000%以上", value: 1000 },
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, minGrowthRate: option.value }))}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filters.minGrowthRate === option.value
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-4"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {showAdvanced ? "詳細条件を閉じる" : "詳細条件を開く"}
        </button>

        {showAdvanced && (
          <div className="space-y-4 mb-6">
            {/* Subscriber range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  登録者数（最小）
                </label>
                <input
                  type="number"
                  placeholder="例: 10000"
                  value={filters.minSubscribers ?? ""}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, minSubscribers: e.target.value ? Number(e.target.value) : undefined }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  登録者数（最大）
                </label>
                <input
                  type="number"
                  placeholder="例: 500000"
                  value={filters.maxSubscribers ?? ""}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, maxSubscribers: e.target.value ? Number(e.target.value) : undefined }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Date range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  開設日（開始）
                </label>
                <input
                  type="date"
                  value={filters.startDate ?? ""}
                  onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value || undefined }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  開設日（終了）
                </label>
                <input
                  type="date"
                  value={filters.endDate ?? ""}
                  onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value || undefined }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Categories */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  カテゴリ（複数選択可）
                  {(filters.categories?.length ?? 0) > 0 && (
                    <span className="ml-1.5 text-xs text-red-500 font-normal">
                      {filters.categories!.length}件選択中
                    </span>
                  )}
                </label>
                {(filters.categories?.length ?? 0) > 0 && (
                  <button
                    type="button"
                    onClick={() => setFilters((prev) => ({ ...prev, categories: [] }))}
                    className="flex items-center gap-0.5 text-xs text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                    クリア
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                      filters.categories?.includes(cat)
                        ? "bg-red-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition-colors"
        >
          <Search className="w-5 h-5" />
          チャンネルを検索する
        </button>
      </div>
    </form>
  );
}
