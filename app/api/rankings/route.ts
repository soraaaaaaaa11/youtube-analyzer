import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { fetchTrendingVideos } from "@/lib/youtube-api";
import { RANKING_CATEGORIES } from "@/types";

const VALID_CATEGORIES = RANKING_CATEGORIES.map(c => c.id);

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const region = searchParams.get("region") ?? "japan";
  const tab = searchParams.get("tab") ?? "subscribers";
  const category = searchParams.get("category") ?? "all";
  const sort = searchParams.get("sort") ?? (tab === "growth" ? "growth" : "subscribers");
  const limit = Math.min(Number(searchParams.get("limit") ?? 50), 100);

  const admin = createAdminClient();

  try {
    // === 急上昇動画タブ ===
    if (tab === "trending") {
      const apiKey = process.env.YOUTUBE_API_KEY;
      if (!apiKey) {
        return NextResponse.json({ error: "API key not configured" }, { status: 500 });
      }
      const regionCode = region === "japan" ? "JP" : "US";
      const videos = await fetchTrendingVideos(apiKey, regionCode, 20);
      return NextResponse.json({ videos });
    }

    // === 登録者数 or 成長率ランキング ===
    if (sort === "growth") {
      return handleGrowthRanking(admin, region, category, limit);
    }

    // 登録者数順（デフォルト）
    let query = admin
      .from("channels")
      .select("*")
      .eq("region", region)
      .order("subscribers", { ascending: false })
      .limit(limit);

    // カテゴリフィルタ
    if (category !== "all" && VALID_CATEGORIES.includes(category as typeof VALID_CATEGORIES[number])) {
      const catDef = RANKING_CATEGORIES.find(c => c.id === category);
      if (catDef) {
        query = query.eq("category", catDef.name);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error("Rankings subscribers error:", error);
      return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
    }

    const channels = (data ?? []).map(dbToChannel);
    return NextResponse.json({ channels });

  } catch (e) {
    console.error("Rankings API error:", e);
    return NextResponse.json({ error: "ランキングの取得に失敗しました" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleGrowthRanking(admin: any, region: string, category: string, limit: number) {
  let query = admin
    .from("channels")
    .select("*")
    .eq("region", region)
    .gt("subscribers", 10000)
    .order("subscribers", { ascending: false })
    .limit(500);

  if (category !== "all") {
    const catDef = RANKING_CATEGORIES.find(c => c.id === category);
    if (catDef) {
      query = query.eq("category", catDef.name);
    }
  }

  const { data: channelRows, error } = await query;
  if (error || !channelRows) {
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0];

  const channelIds = channelRows.map((r: { id: string }) => r.id);
  if (channelIds.length === 0) {
    return NextResponse.json({ channels: [] });
  }

  const { data: historyRows } = await admin
    .from("channel_stats_history")
    .select("channel_id, subscribers, date")
    .in("channel_id", channelIds)
    .gte("date", sevenDaysAgoStr)
    .order("date", { ascending: true });

  const oldestSubs = new Map<string, number>();
  const latestSubs = new Map<string, number>();

  for (const row of historyRows ?? []) {
    if (!oldestSubs.has(row.channel_id)) {
      oldestSubs.set(row.channel_id, row.subscribers);
    }
    latestSubs.set(row.channel_id, row.subscribers);
  }

  const channelsWithGrowth = channelRows.map((row: {
    id: string; name: string; description: string; thumbnail: string;
    subscribers: number; total_views: number; video_count: number;
    category: string; region: string; updated_at: string;
  }) => {
    const old = oldestSubs.get(row.id);
    const latest = latestSubs.get(row.id);
    let growthRate = 0;
    if (old && latest && old > 0 && latest !== old) {
      growthRate = Math.round(((latest - old) / old) * 10000) / 100;
    }
    return { ...dbToChannel(row), growthRate };
  });

  channelsWithGrowth.sort((a: { growthRate: number }, b: { growthRate: number }) => b.growthRate - a.growthRate);
  const filtered = channelsWithGrowth.filter((ch: { growthRate: number }) => ch.growthRate > 0).slice(0, limit);

  return NextResponse.json({ channels: filtered });
}

function dbToChannel(row: {
  id: string; name: string; description: string; thumbnail: string;
  subscribers: number; total_views: number; video_count: number;
  category: string; region: string; updated_at: string;
}) {
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
