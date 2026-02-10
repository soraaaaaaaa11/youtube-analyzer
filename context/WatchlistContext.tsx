"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useAuth } from "@/context/AuthContext";
import { Channel } from "@/types";

interface WatchlistEntry {
  id: string;
  channelId: string;
  addedAt: string;
  subscriberCountAtAdd: number;
  viewCountAtAdd: number;
}

interface WatchlistContextValue {
  items: WatchlistEntry[];
  loading: boolean;
  isInWatchlist: (channelId: string) => boolean;
  addToWatchlist: (channel: Channel) => Promise<{ error: string | null }>;
  removeFromWatchlist: (channelId: string) => Promise<{ error: string | null }>;
  refresh: () => Promise<void>;
}

const WatchlistContext = createContext<WatchlistContextValue | null>(null);

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<WatchlistEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWatchlist = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/watchlist");
      if (res.ok) {
        const data = await res.json();
        setItems(
          (data.items ?? []).map(
            (item: Record<string, unknown>) => ({
              id: item.id,
              channelId: item.channelId,
              addedAt: item.addedAt,
              subscriberCountAtAdd: item.subscriberCountAtAdd,
              viewCountAtAdd: item.viewCountAtAdd,
            })
          )
        );
      }
    } catch {
      // ネットワークエラー時は無視
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  function isInWatchlist(channelId: string): boolean {
    return items.some((item) => item.channelId === channelId);
  }

  async function addToWatchlist(
    channel: Channel
  ): Promise<{ error: string | null }> {
    const res = await fetch("/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channelId: channel.id,
        channelTitle: channel.title,
        thumbnailUrl: channel.thumbnailUrl,
        subscriberCount: channel.subscriberCount,
        viewCount: channel.viewCount,
        videoCount: channel.videoCount,
        publishedAt: channel.publishedAt,
        category: channel.category,
        description: channel.description,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      return { error: data.error ?? "追加に失敗しました" };
    }
    await fetchWatchlist();
    return { error: null };
  }

  async function removeFromWatchlist(
    channelId: string
  ): Promise<{ error: string | null }> {
    const entry = items.find((item) => item.channelId === channelId);
    if (!entry) return { error: "Not found" };
    const res = await fetch(`/api/watchlist/${entry.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      return { error: "削除に失敗しました" };
    }
    await fetchWatchlist();
    return { error: null };
  }

  return (
    <WatchlistContext.Provider
      value={{
        items,
        loading,
        isInWatchlist,
        addToWatchlist,
        removeFromWatchlist,
        refresh: fetchWatchlist,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext);
  if (!ctx)
    throw new Error("useWatchlist must be used within WatchlistProvider");
  return ctx;
}
