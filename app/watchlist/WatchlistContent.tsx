"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Bookmark,
  Lock,
  Trash2,
  Users,
  TrendingUp,
  ExternalLink,
  Loader2,
  LayoutGrid,
  List,
  Eye,
  Download,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useWatchlist } from "@/context/WatchlistContext";
import { Channel } from "@/types";

type ViewMode = "grid" | "list";

interface WatchlistDisplayItem {
  id: string;
  channelId: string;
  addedAt: string;
  subscriberCountAtAdd: number;
  viewCountAtAdd: number;
  channel: Channel | null;
  subscriberChange: number;
  viewCountChange: number;
}

function formatNumber(num: number): string {
  if (num >= 100000000) {
    return `${(num / 100000000).toFixed(1)}億`;
  }
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`;
  }
  return num.toLocaleString();
}

function formatChange(num: number): string {
  const prefix = num >= 0 ? "+" : "";
  if (Math.abs(num) >= 10000) {
    return `${prefix}${(num / 10000).toFixed(1)}万`;
  }
  return `${prefix}${num.toLocaleString()}`;
}

export default function WatchlistContent() {
  const { user, loading: authLoading } = useAuth();
  const { removeFromWatchlist } = useWatchlist();
  const [items, setItems] = useState<WatchlistDisplayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Load viewMode from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("watchlist-view-mode");
    if (saved === "grid" || saved === "list") {
      setViewMode(saved);
    }
  }, []);

  function handleViewModeChange(mode: ViewMode) {
    setViewMode(mode);
    localStorage.setItem("watchlist-view-mode", mode);
  }

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchWatchlist() {
      setLoading(true);
      try {
        const res = await fetch("/api/watchlist");
        if (res.ok) {
          const data = await res.json();
          setItems(data.items ?? []);
        }
      } catch {
        // ネットワークエラー
      }
      setLoading(false);
    }

    fetchWatchlist();
  }, [user, authLoading]);

  async function handleRemove(channelId: string) {
    setRemovingId(channelId);
    const result = await removeFromWatchlist(channelId);
    if (!result.error) {
      setItems((prev) => prev.filter((item) => item.channelId !== channelId));
    }
    setRemovingId(null);
  }

  // ローディング中
  if (authLoading || (user && loading)) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
            <Bookmark className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              ウォッチリスト
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              気になるチャンネルを保存して追跡
            </p>
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 animate-pulse"
            >
              <div className="flex gap-4">
                <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 未ログイン
  if (!user) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
            <Bookmark className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              ウォッチリスト
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              気になるチャンネルを保存して追跡
            </p>
          </div>
        </div>
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            ログインが必要です
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            ウォッチリストを使用するにはアカウントが必要です
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/login"
              className="text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 px-6 py-2.5 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              ログイン
            </Link>
            <Link
              href="/signup"
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
            >
              無料で始める
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ログイン済み
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
            <Bookmark className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              ウォッチリスト
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {items.length > 0
                ? `${items.length}件のチャンネルを追跡中`
                : "気になるチャンネルを保存して追跡"}
            </p>
          </div>
        </div>
        
        {items.length > 0 && (
          <div className="flex items-center gap-3">
            {/* CSV Export Button */}
            <a
              href="/api/export/watchlist"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              title="CSVでエクスポート"
            >
              <Download className="w-4 h-4" />
              CSV
            </a>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => handleViewModeChange("grid")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-gray-700 text-red-500 shadow-sm"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
                title="グリッド表示"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleViewModeChange("list")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-white dark:bg-gray-700 text-red-500 shadow-sm"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
                title="リスト表示"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <Bookmark className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            ウォッチリストは空です
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            検索結果からチャンネルを追加してみましょう
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
          >
            チャンネルを検索
          </Link>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid View */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 hover:shadow-md hover:border-red-200 dark:hover:border-red-800 transition-all group relative"
            >
              {/* Actions - Top Right */}
              <div className="absolute top-2 right-2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <a
                  href={`https://www.youtube.com/channel/${item.channelId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="YouTubeで見る"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => handleRemove(item.channelId)}
                  disabled={removingId === item.channelId}
                  className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="削除"
                >
                  {removingId === item.channelId ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Thumbnail & Name */}
              <Link href={`/channel/${item.channelId}`} className="block text-center">
                {item.channel?.thumbnailUrl ? (
                  <Image
                    src={item.channel.thumbnailUrl}
                    alt={item.channel.title}
                    width={56}
                    height={56}
                    className="rounded-full object-cover mx-auto mb-2 ring-2 ring-gray-100 dark:ring-gray-700 group-hover:ring-red-200 dark:group-hover:ring-red-800 transition-all"
                  />
                ) : (
                  <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-2" />
                )}
                <h3 className="font-medium text-sm text-gray-900 dark:text-white group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors line-clamp-1 mb-1">
                  {item.channel?.title ?? item.channelId}
                </h3>
                {item.channel && (
                  <span className="inline-block text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
                    {item.channel.category}
                  </span>
                )}
              </Link>

              {/* Stats - Compact */}
              {item.channel && (
                <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-center gap-2 text-xs">
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                    <Users className="w-3 h-3" />
                    <span>{formatNumber(item.channel.subscriberCount)}</span>
                  </div>
                  {item.subscriberChange !== 0 && (
                    <span
                      className={`font-medium ${
                        item.subscriberChange > 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {formatChange(item.subscriberChange)}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md hover:border-red-200 dark:hover:border-red-800 transition-all group"
            >
              <div className="flex items-center gap-4">
                {/* Thumbnail */}
                <Link href={`/channel/${item.channelId}`} className="flex-shrink-0">
                  {item.channel?.thumbnailUrl ? (
                    <Image
                      src={item.channel.thumbnailUrl}
                      alt={item.channel.title}
                      width={48}
                      height={48}
                      className="rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-700 group-hover:ring-red-200 dark:group-hover:ring-red-800 transition-all"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  )}
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/channel/${item.channelId}`}
                      className="font-semibold text-gray-900 dark:text-white group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors truncate"
                    >
                      {item.channel?.title ?? item.channelId}
                    </Link>
                    {item.channel && (
                      <span className="flex-shrink-0 text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
                        {item.channel.category}
                      </span>
                    )}
                  </div>
                  
                  {item.channel && (
                    <div className="flex items-center gap-4 mt-1 text-sm">
                      <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                        <Users className="w-4 h-4" />
                        <span>{formatNumber(item.channel.subscriberCount)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                        <Eye className="w-4 h-4" />
                        <span>{formatNumber(item.channel.viewCount)}</span>
                      </div>
                      {item.subscriberChange !== 0 && (
                        <div
                          className={`flex items-center gap-1 font-medium ${
                            item.subscriberChange > 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          <TrendingUp className="w-4 h-4" />
                          <span>{formatChange(item.subscriberChange)}</span>
                        </div>
                      )}
                      {item.channel.publishedAt && (
                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>{item.channel.publishedAt.slice(0, 7)}</span>
                        </div>
                      )}
                      <span className="text-gray-400 text-xs">
                        {new Date(item.addedAt).toLocaleDateString("ja-JP")}に追加
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <a
                    href={`https://www.youtube.com/channel/${item.channelId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="YouTubeで見る"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleRemove(item.channelId)}
                    disabled={removingId === item.channelId}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="削除"
                  >
                    {removingId === item.channelId ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
