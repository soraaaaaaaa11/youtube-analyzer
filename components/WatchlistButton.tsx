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
        className={`group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md ${
          inWatchlist
            ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
            : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-2 border-gray-200 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-500 hover:text-red-500 dark:hover:text-red-400"
        }`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : inWatchlist ? (
          <Check className="w-4 h-4" />
        ) : (
          <Bookmark className="w-4 h-4 transition-transform group-hover:scale-110" />
        )}
        {inWatchlist ? "追加済み ✓" : "ウォッチリストに追加"}
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
