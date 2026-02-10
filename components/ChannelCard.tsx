"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  TrendingUp,
  Users,
  Calendar,
  Plus,
  Check,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Channel } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useWatchlist } from "@/context/WatchlistContext";

interface ChannelCardProps {
  channel: Channel;
}

function formatNumber(num: number): string {
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`;
  }
  return num.toLocaleString();
}

export default function ChannelCard({ channel }: ChannelCardProps) {
  const { user } = useAuth();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const router = useRouter();
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  const inWatchlist = isInWatchlist(channel.id);

  async function handleWatchlistToggle() {
    if (!user) {
      router.push("/login");
      return;
    }
    setWatchlistLoading(true);
    if (inWatchlist) {
      await removeFromWatchlist(channel.id);
    } else {
      await addToWatchlist(channel);
    }
    setWatchlistLoading(false);
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Thumbnail */}
        <Link href={`/channel/${channel.id}`} className="flex-shrink-0">
          <Image
            src={channel.thumbnailUrl}
            alt={channel.title}
            width={64}
            height={64}
            className="rounded-full object-cover"
          />
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/channel/${channel.id}`}
              className="font-semibold text-gray-900 dark:text-white hover:text-red-500 dark:hover:text-red-400 transition-colors truncate"
            >
              {channel.title}
            </Link>
            <div className="flex items-center gap-1 flex-shrink-0">
              <a
                href={`https://www.youtube.com/channel/${channel.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="YouTubeで見る"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                onClick={handleWatchlistToggle}
                disabled={watchlistLoading}
                className={`p-1.5 rounded-lg border transition-colors ${
                  inWatchlist
                    ? "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800"
                    : "border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                title={
                  inWatchlist
                    ? "ウォッチリストから削除"
                    : "ウォッチリストに追加"
                }
              >
                {watchlistLoading ? (
                  <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                ) : inWatchlist ? (
                  <Check className="w-4 h-4 text-red-500" />
                ) : (
                  <Plus className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div className="mt-1">
            <span className="inline-block text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
              {channel.category}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
              <Users className="w-4 h-4 flex-shrink-0" />
              <span>{formatNumber(channel.subscriberCount)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400 font-medium">
              <TrendingUp className="w-4 h-4 flex-shrink-0" />
              <span>+{channel.growthRate}%</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>{channel.publishedAt.slice(0, 7)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
