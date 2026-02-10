"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowUpDown, Loader2, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import ChannelCard from "@/components/ChannelCard";
import { Channel, SortField, SortOrder, PLAN_LIMITS, PlanType } from "@/types";

interface SearchInfo {
  remainingSearches: number | null;
  plan: PlanType;
}

export default function ResultsContent() {
  const searchParams = useSearchParams();
  const [sortField, setSortField] = useState<SortField>("growthRate");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"youtube" | "mock">("mock");
  const [searchInfo, setSearchInfo] = useState<SearchInfo | null>(null);
  const [limitError, setLimitError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setLimitError(null);
    const params = new URLSearchParams();
    for (const [key, value] of searchParams.entries()) {
      params.set(key, value);
    }
    fetch(`/api/search?${params.toString()}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.status === 429) {
          setLimitError(data.error ?? "検索回数の上限に達しました");
          setChannels([]);
          return;
        }
        if (res.status === 403 && data.trialExpired) {
          setLimitError("無料トライアルが終了しました。プランをアップグレードしてください。");
          setChannels([]);
          return;
        }
        setChannels(data.channels ?? []);
        setSource(data.source ?? "mock");
        setSearchInfo(data.searchInfo ?? null);
      })
      .catch(() => setChannels([]))
      .finally(() => setLoading(false));
  }, [searchParams]);

  const sorted = [...channels].sort((a: Channel, b: Channel) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortOrder === "desc" ? bVal - aVal : aVal - bVal;
    }
    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortOrder === "desc" ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
    }
    return 0;
  });

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  }

  const sortButtons: { label: string; field: SortField }[] = [
    { label: "成長率", field: "growthRate" },
    { label: "登録者数", field: "subscriberCount" },
    { label: "開設日", field: "publishedAt" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <Link href="/search" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6">
        <ArrowLeft className="w-4 h-4" />
        検索条件を変更
      </Link>

      {/* 検索回数制限エラー */}
      {limitError && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {limitError}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            プランをアップグレードすると、より多くの検索が可能になります
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
          >
            料金プランを見る
          </Link>
        </div>
      )}

      {/* Header */}
      {!limitError && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">検索結果</h1>
              <div className="flex items-center gap-2 mt-0.5">
                {loading ? (
                  <span className="text-gray-400 text-sm flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    検索中...
                  </span>
                ) : (
                  <>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {sorted.length}件のチャンネルが見つかりました
                    </p>
                    {source === "mock" && (
                      <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full">
                        デモデータ
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <ArrowUpDown className="w-4 h-4" />
                並び替え:
              </span>
              <div className="flex gap-1">
                {sortButtons.map((btn) => (
                  <button
                    key={btn.field}
                    onClick={() => handleSort(btn.field)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      sortField === btn.field
                        ? "bg-red-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {btn.label}
                    {sortField === btn.field && (sortOrder === "desc" ? " ↓" : " ↑")}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 残り検索回数 */}
          {searchInfo && searchInfo.remainingSearches !== null && (
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-3 py-1 rounded-full">
                残り検索回数: {searchInfo.remainingSearches}回 / 月
                （{PLAN_LIMITS[searchInfo.plan].displayName}プラン）
              </span>
            </div>
          )}

          {/* API注釈 */}
          {!loading && source === "youtube" && (
            <p className="mb-4 text-xs text-gray-400 dark:text-gray-500">
              ※ YouTube APIの仕様上、検索結果は最大50件です
            </p>
          )}

          {/* Results */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">条件に合うチャンネルが見つかりませんでした</p>
              <Link href="/search" className="text-red-500 hover:text-red-600 font-medium">
                条件を変更して再検索
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sorted.map((channel) => (
                <ChannelCard key={channel.id} channel={channel} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
