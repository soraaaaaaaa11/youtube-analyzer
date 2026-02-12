import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Users, Eye, Video, TrendingUp, Calendar, Clock, ExternalLink } from "lucide-react";
import StatsCard from "@/components/StatsCard";
import SubscriberChart from "@/components/SubscriberChart";
import ChannelCard from "@/components/ChannelCard";
import WatchlistButton from "@/components/WatchlistButton";
import { Channel, ChannelStats } from "@/types";
import { createAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

function formatNumber(num: number): string {
  if (num >= 100000000) {
    return `${(num / 100000000).toFixed(1)}億`;
  }
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`;
  }
  return num.toLocaleString();
}

function dbToChannel(row: {
  id: string; name: string; description: string; thumbnail: string;
  subscribers: number; total_views: number; video_count: number;
  category: string; region: string; updated_at: string;
}): Channel {
  return {
    id: row.id,
    title: row.name,
    description: row.description ?? "",
    thumbnailUrl: row.thumbnail ?? "",
    subscriberCount: row.subscribers,
    viewCount: row.total_views,
    videoCount: row.video_count,
    publishedAt: "",
    category: row.category ?? "エンタメ",
    growthRate: 0,
    updatedAt: row.updated_at?.split("T")[0] ?? "",
    region: row.region as "japan" | "global",
  };
}

export default async function ChannelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();

  // === チャンネル取得: DB → YouTube API フォールバック ===
  const { data: dbRow } = await admin
    .from("channels")
    .select("*")
    .eq("id", id)
    .single();

  let channel: Channel | null = dbRow ? dbToChannel(dbRow) : null;

  // DBになければ YouTube API で直接取得
  if (!channel) {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (apiKey) {
      try {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${encodeURIComponent(id)}&key=${apiKey}`,
          { next: { revalidate: 3600 } }
        );
        if (res.ok) {
          const data = await res.json();
          const item = data.items?.[0];
          if (item) {
            channel = {
              id: item.id,
              title: item.snippet.title,
              description: item.snippet.description ?? "",
              thumbnailUrl: item.snippet.thumbnails?.high?.url ?? item.snippet.thumbnails?.medium?.url ?? "",
              subscriberCount: parseInt(item.statistics.subscriberCount ?? "0", 10),
              viewCount: parseInt(item.statistics.viewCount ?? "0", 10),
              videoCount: parseInt(item.statistics.videoCount ?? "0", 10),
              publishedAt: item.snippet.publishedAt?.split("T")[0] ?? "",
              category: "その他",
              growthRate: 0,
              updatedAt: "",
            };
          }
        }
      } catch {
        // API error → fall through to 404
      }
    }
  }

  if (!channel) notFound();

  // === 統計履歴データ取得 ===
  let stats: ChannelStats[] = [];
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const ninetyDaysAgoStr = ninetyDaysAgo.toISOString().split("T")[0];

  const { data: historyRows } = await admin
    .from("channel_stats_history")
    .select("channel_id, subscribers, total_views, date")
    .eq("channel_id", id)
    .gte("date", ninetyDaysAgoStr)
    .order("date", { ascending: true });

  if (historyRows && historyRows.length > 0) {
    stats = historyRows.map((row, i) => ({
      id: String(i),
      channelId: row.channel_id,
      subscriberCount: row.subscribers,
      viewCount: row.total_views,
      recordedAt: row.date,
    }));

    // 成長率計算（最古と最新の比較）
    const oldest = historyRows[0].subscribers;
    const latest = historyRows[historyRows.length - 1].subscribers;
    if (oldest > 0 && latest !== oldest) {
      channel = { ...channel, growthRate: Math.round(((latest - oldest) / oldest) * 10000) / 100 };
    }
  }

  // === 類似チャンネル（同カテゴリ）===
  const { data: similarRows } = await admin
    .from("channels")
    .select("*")
    .eq("category", channel.category)
    .neq("id", channel.id)
    .order("subscribers", { ascending: false })
    .limit(4);

  const similarChannels = (similarRows ?? []).map(dbToChannel);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <Link href="/rankings" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6">
        <ArrowLeft className="w-4 h-4" />
        ランキングに戻る
      </Link>

      {/* Channel Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6">
        {/* モバイル: 縦積みレイアウト、PC: 横並び */}
        <div className="flex flex-col gap-4">
          {/* 上部: アイコン + 名前 + ボタン */}
          <div className="flex items-start gap-3 sm:gap-4">
            {channel.thumbnailUrl ? (
              <Image
                src={channel.thumbnailUrl}
                alt={channel.title}
                width={80}
                height={80}
                className="rounded-full flex-shrink-0 w-14 h-14 sm:w-20 sm:h-20"
              />
            ) : (
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight">{channel.title}</h1>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                  {channel.category}
                </span>
                <a
                  href={`https://www.youtube.com/channel/${channel.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs sm:text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
                >
                  <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  YouTubeで見る
                </a>
              </div>
            </div>
          </div>

          {/* アクションボタン（モバイルでは下、PCでは右側） */}
          <div className="flex items-center gap-3 flex-wrap">
            <WatchlistButton channel={channel} variant="full" />
            {channel.growthRate > 0 && (
              <div className="flex items-center gap-1.5 sm:gap-2 bg-green-50 dark:bg-green-900/20 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl">
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-green-700 dark:text-green-400 font-bold text-sm sm:text-lg">+{channel.growthRate}%</span>
                <span className="text-green-600 dark:text-green-500 text-xs sm:text-sm">成長率</span>
              </div>
            )}
          </div>

          {/* 説明文 */}
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3">
            {channel.description || "説明なし"}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatsCard
          label="登録者数"
          value={channel.subscriberCount === 0 ? "非公開" : formatNumber(channel.subscriberCount) + "人"}
          icon={<Users className="w-5 h-5" />}
          trend={channel.growthRate > 0 ? `+${channel.growthRate}%` : undefined}
          trendPositive
        />
        <StatsCard
          label="総再生数"
          value={formatNumber(channel.viewCount) + "回"}
          icon={<Eye className="w-5 h-5" />}
        />
        <StatsCard
          label="動画本数"
          value={channel.videoCount + "本"}
          icon={<Video className="w-5 h-5" />}
        />
      </div>

      {/* Chart */}
      {stats.length > 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">登録者推移（過去90日）</h2>
          <SubscriberChart stats={stats} />
        </div>
      )}

      {/* Channel Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {channel.publishedAt && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">開設日</span>
            </div>
            <p className="text-gray-900 dark:text-white font-medium">{channel.publishedAt}</p>
          </div>
        )}
        {channel.updatedAt && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm">最終更新</span>
            </div>
            <p className="text-gray-900 dark:text-white font-medium">{channel.updatedAt}</p>
          </div>
        )}
      </div>

      {/* Similar Channels */}
      {similarChannels.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">同じカテゴリのチャンネル</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {similarChannels.map((ch) => (
              <ChannelCard key={ch.id} channel={ch} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
