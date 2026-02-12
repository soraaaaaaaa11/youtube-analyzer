"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Check, Loader2, Bookmark } from "lucide-react";
import { Channel } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useWatchlist } from "@/context/WatchlistContext";

interface WatchlistButtonProps {
  channel: Channel;
  variant?: "icon" | "full";
}

export default function WatchlistButton({ channel, variant = "icon" }: WatchlistButtonProps) {
  const { user } = useAuth();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const inWatchlist = isInWatchlist(channel.id);

  async function handleToggle() {
    if (!user) {
      router.push("/login");
      return;
    }
    setLoading(true);
    if (inWatchlist) {
      await removeFromWatchlist(channel.id);
    } else {
      await addToWatchlist(channel);
    }
    setLoading(false);
  }

  if (variant === "full") {
    return (
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
          inWatchlist
            ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30"
            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
        }`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : inWatchlist ? (
          <Check className="w-4 h-4" />
        ) : (
          <Bookmark className="w-4 h-4" />
        )}
        {inWatchlist ? "ウォッチリストに追加済み" : "ウォッチリストに追加"}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`p-1.5 rounded-lg border transition-colors ${
        inWatchlist
          ? "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800"
          : "border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
      title={inWatchlist ? "ウォッチリストから削除" : "ウォッチリストに追加"}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
      ) : inWatchlist ? (
        <Check className="w-4 h-4 text-red-500" />
      ) : (
        <Plus className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      )}
    </button>
  );
}
