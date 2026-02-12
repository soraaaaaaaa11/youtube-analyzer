"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  TrendingUp, Users, Crown, Loader2, Flame,
  Globe, Play, Eye, ThumbsUp, ChevronDown,
} from "lucide-react";
import { Channel, RankingRegion, RANKING_CATEGORIES, RankingCategoryId } from "@/types";
import { StaggerContainer, StaggerItem, FadeIn } from "@/components/animations";

interface TrendingVideo {
  videoId: string;
  title: string;
  channelId: string;
  channelTitle: string;
  thumbnailUrl: string;
  viewCount: number;
  likeCount: number;
  publishedAt: string;
}

type SortMode = "subscribers" | "growth";

function formatNumber(num: number): string {
  if (num >= 100000000) {
    return `${(num / 100000000).toFixed(1)}億`;
  }
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`;
  }
  return num.toLocaleString();
}

function getRankStyle(rank: number) {
  switch (rank) {
    case 1:
      return "from-yellow-400 to-amber-500 text-white shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30";
    case 2:
      return "from-gray-300 to-gray-400 text-white shadow-lg shadow-gray-200/50 dark:shadow-gray-700/30";
    case 3:
      return "from-amber-600 to-amber-700 text-white shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30";
    default:
      return "from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-600 dark:text-gray-300";
  }
}

function getRankIcon(rank: number) {
  if (rank <= 3) return <Crown className="w-3.5 h-3.5" />;
  return null;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "1時間以内";
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  return `${days}日前`;
}

const REGION_TABS: { key: RankingRegion; label: string; icon: React.ReactNode }[] = [
  { key: "japan", label: "日本", icon: <span className="text-base">🇯🇵</span> },
  { key: "global", label: "グローバル", icon: <Globe className="w-4 h-4" /> },
];

const PAGE_SIZE = 10;

export default function RankingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialRegion = (searchParams.get("region") as RankingRegion) || "japan";
  const initialCategory = (searchParams.get("category") as RankingCategoryId) || "all";
  const initialTab = searchParams.get("tab") || "subscribers";

  const [region, setRegion] = useState<RankingRegion>(initialRegion);
  const [category, setCategory] = useState<RankingCategoryId>(initialCategory);
  const [sortMode, setSortMode] = useState<SortMode>(initialTab === "growth" ? "growth" : "subscribers");
  const [showTrending, setShowTrending] = useState(initialTab === "trending");
  const [channels, setChannels] = useState<Channel[]>([]);
  const [videos, setVideos] = useState<TrendingVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(false);

  // URL同期
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("region", region);
    params.set("category", category);
    if (showTrending) {
      params.set("tab", "trending");
    } else {
      params.set("tab", sortMode);
    }
    router.replace(`/rankings?${params.toString()}`, { scroll: false });
  }, [region, category, sortMode, showTrending, router]);

  const fetchRankings = useCallback(async () => {
    setLoading(true);
    setError(null);
    setVisibleCount(PAGE_SIZE);
    try {
      if (showTrending) {
        const res = await fetch(`/api/rankings?region=${region}&tab=trending`);
        if (!res.ok) {
          const data = await res.json();
          setError(data.error ?? "取得に失敗しました");
          return;
        }
        const data = await res.json();
        setVideos(data.videos ?? []);
        setChannels([]);
      } else {
        const res = await fetch(
          `/api/rankings?region=${region}&category=${category}&sort=${sortMode}&limit=50`
        );
        if (!res.ok) {
          const data = await res.json();
          setError(data.error ?? "取得に失敗しました");
          return;
        }
        const data = await res.json();
        setChannels(data.channels ?? []);
        setVideos([]);
      }
    } catch {
      setError("ネットワークエラーが発生しました");
    }
    setLoading(false);
  }, [region, category, sortMode, showTrending]);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  const currentCat = RANKING_CATEGORIES.find(c => c.id === category);

  return (
    <div className="flex gap-6">
      {/* カテゴリサイドバー（PC） */}
      <aside className="hidden lg:block w-56 flex-shrink-0">
        <div className="sticky top-24 space-y-1 max-h-[calc(100vh-7rem)] overflow-y-auto pr-1">
          <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-3">
            カテゴリ
          </h3>
          {RANKING_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setCategory(cat.id);
                setShowTrending(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                category === cat.id && !showTrending
                  ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <span className="text-base">{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
          <hr className="my-2 border-gray-200 dark:border-gray-700" />
          <button
            onClick={() => setShowTrending(true)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
              showTrending
                ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>急上昇動画</span>
          </button>
        </div>
      </aside>

      {/* メインコンテンツ */}
      <div className="flex-1 min-w-0">
        {/* 地域タブ */}
        <FadeIn>
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              {REGION_TABS.map((rt) => (
                <button
                  key={rt.key}
                  onClick={() => setRegion(rt.key)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                    region === rt.key
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm border-gray-300 dark:border-gray-600"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                  }`}
                >
                  {rt.icon}
                  {rt.label}
                </button>
              ))}
            </div>

            {/* モバイルカテゴリセレクタ */}
            <div className="lg:hidden relative">
              <button
                onClick={() => setMobileCategoryOpen(!mobileCategoryOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              >
                <span>{showTrending ? "🔥" : currentCat?.icon}</span>
                <span>{showTrending ? "急上昇動画" : currentCat?.name}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {mobileCategoryOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 max-h-80 overflow-auto">
                  {RANKING_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setCategory(cat.id);
                        setShowTrending(false);
                        setMobileCategoryOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm ${
                        category === cat.id && !showTrending
                          ? "bg-red-50 dark:bg-red-900/20 text-red-600"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      <span>{cat.icon}</span>
                      {cat.name}
                    </button>
                  ))}
                  <hr className="border-gray-200 dark:border-gray-700" />
                  <button
                    onClick={() => {
                      setShowTrending(true);
                      setMobileCategoryOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm ${
                      showTrending
                        ? "bg-red-50 dark:bg-red-900/20 text-red-600"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Flame className="w-4 h-4" />
                    急上昇動画
                  </button>
                </div>
              )}
            </div>
          </div>
        </FadeIn>

        {/* 並び替え（チャンネルランキング時のみ） */}
        {!showTrending && (
          <FadeIn delay={0.1}>
            <div className="mb-6">
              <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
                <button
                  onClick={() => setSortMode("subscribers")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    sortMode === "subscribers"
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  登録者数順
                </button>
                <button
                  onClick={() => setSortMode("growth")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    sortMode === "growth"
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  急成長順
                </button>
              </div>
              {/* 急成長順の説明 */}
              {sortMode === "growth" && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  過去7日間の登録者数増加率でランキング（毎日更新）
                </p>
              )}
            </div>
          </FadeIn>
        )}

        {/* ローディング */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-red-500 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">ランキングを取得中...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={fetchRankings}
              className="text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              再読み込み
            </button>
          </div>
        ) : showTrending ? (
          /* === 急上昇動画一覧 === */
          <StaggerContainer className="space-y-3" staggerDelay={0.06}>
            {videos.map((video, index) => {
              const rank = index + 1;
              return (
                <StaggerItem key={video.videoId}>
                  <a
                    href={`https://www.youtube.com/watch?v=${video.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 hover:shadow-lg transition-all hover:-translate-y-0.5 group ${
                      rank <= 3 ? "border-l-4 border-l-red-400 dark:border-l-red-500" : ""
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0 font-bold text-xs ${getRankStyle(rank)}`}
                    >
                      {getRankIcon(rank) || rank}
                    </div>
                    <div className="relative flex-shrink-0 w-28 h-16 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                      <Image src={video.thumbnailUrl} alt={video.title} fill className="object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-6 h-6 text-white" fill="white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-red-500 transition-colors line-clamp-2">
                        {video.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {video.channelTitle}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0 text-xs text-gray-500 dark:text-gray-400">
                      <div className="items-center gap-1 hidden sm:flex">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{formatNumber(video.viewCount)}回</span>
                      </div>
                      <div className="items-center gap-1 hidden sm:flex">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{formatNumber(video.likeCount)}</span>
                      </div>
                      <span className="text-gray-400">{timeAgo(video.publishedAt)}</span>
                    </div>
                  </a>
                </StaggerItem>
              );
            })}
            {videos.length === 0 && (
              <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                急上昇動画が見つかりませんでした
              </div>
            )}
          </StaggerContainer>
        ) : (
          /* === チャンネルランキング一覧 === */
          <>
            <StaggerContainer className="space-y-3" staggerDelay={0.04}>
              {channels.slice(0, visibleCount).map((channel, index) => {
                const rank = index + 1;
                return (
                  <StaggerItem key={channel.id}>
                    <Link
                      href={`/channel/${channel.id}`}
                      className={`flex items-center gap-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-all hover:-translate-y-0.5 group ${
                        rank <= 3
                          ? "border-l-4 border-l-amber-400 dark:border-l-amber-500"
                          : ""
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0 font-bold text-sm ${getRankStyle(rank)}`}
                      >
                        {getRankIcon(rank) || rank}
                      </div>
                      <Image
                        src={channel.thumbnailUrl || "/placeholder.png"}
                        alt={channel.title}
                        width={48}
                        height={48}
                        className="rounded-full flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-red-500 transition-colors truncate">
                          {channel.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="inline-block text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                            {channel.category}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
                        {/* 成長率（growth modeのみ） */}
                        {sortMode === "growth" && channel.growthRate > 0 && (
                          <div className="text-right">
                            <p className="text-[10px] sm:text-xs text-gray-400 hidden sm:block">7日間成長率</p>
                            <p className="font-bold text-green-600 dark:text-green-400 text-xs sm:text-sm">
                              +{channel.growthRate.toFixed(2)}%
                            </p>
                          </div>
                        )}
                        {/* 登録者数（常に表示） */}
                        <div className="text-right">
                          <p className="text-[10px] sm:text-xs text-gray-400 hidden sm:block">登録者数</p>
                          <p className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm">
                            {formatNumber(channel.subscriberCount)}人
                          </p>
                        </div>
                        {/* 総再生回数（PC/タブレットのみ） */}
                        <div className="text-right hidden md:block">
                          <p className="text-xs text-gray-400">総再生回数</p>
                          <p className="font-bold text-gray-900 dark:text-white text-sm">
                            {formatNumber(channel.viewCount)}回
                          </p>
                        </div>
                      </div>
                    </Link>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>

            {/* もっと見るボタン */}
            {visibleCount < channels.length && (
              <div className="text-center mt-6">
                <button
                  onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                  もっと見る（残り{channels.length - visibleCount}件）
                </button>
              </div>
            )}

            {channels.length === 0 && (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                <div className="flex justify-center mb-4">
                  {sortMode === "growth" ? (
                    <TrendingUp className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                  ) : (
                    <Users className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                  )}
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                  {sortMode === "growth"
                    ? "成長率データを計算中です"
                    : "このカテゴリにはまだチャンネルデータがありません"}
                </p>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  {sortMode === "growth"
                    ? "成長率の計算には7日間以上のデータ蓄積が必要です。毎日自動でデータを収集しています。"
                    : "データは毎日自動収集されます"}
                </p>
              </div>
            )}
            {/* 急成長データが少ない場合の案内 */}
            {sortMode === "growth" && channels.length > 0 && channels.length < 10 && (
              <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  💡 現在、成長率データが蓄積中です。日々のデータ収集により、より多くのチャンネルがランキングに表示されるようになります。
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
