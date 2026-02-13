import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { fetchTrendingVideos, TrendingVideo } from "@/lib/youtube-api";
import { Channel } from "@/types";

export const revalidate = 300; // 5分キャッシュ

export async function GET() {
  const admin = createAdminClient();

  try {
    // 全クエリを並列実行
    const [
      jpTopResult,
      globalTopResult,
      entertainmentResult,
      musicResult,
      gamingResult,
      techResult,
      risingResult,
      totalCountResult,
    ] = await Promise.all([
      // 日本 TOP5
      admin
        .from("channels")
        .select("*")
        .eq("region", "japan")
        .order("subscribers", { ascending: false })
        .limit(5),
      // グローバル TOP5
      admin
        .from("channels")
        .select("*")
        .eq("region", "global")
        .order("subscribers", { ascending: false })
        .limit(5),
      // エンタメ TOP5
      admin
        .from("channels")
        .select("*")
        .eq("category", "エンタメ")
        .order("subscribers", { ascending: false })
        .limit(5),
      // 音楽 TOP5
      admin
        .from("channels")
        .select("*")
        .eq("category", "音楽")
        .order("subscribers", { ascending: false })
        .limit(5),
      // ゲーム TOP5
      admin
        .from("channels")
        .select("*")
        .eq("category", "ゲーム")
        .order("subscribers", { ascending: false })
        .limit(5),
      // テクノロジー/AI TOP5
      admin
        .from("channels")
        .select("*")
        .eq("category", "テクノロジー/AI")
        .order("subscribers", { ascending: false })
        .limit(5),
      // 急成長チャンネル（登録者10万以下）
      admin
        .from("channels")
        .select("*")
        .lt("subscribers", 100000)
        .gt("subscribers", 1000)
        .order("subscribers", { ascending: false })
        .limit(10),
      // 総チャンネル数
      admin
        .from("channels")
        .select("id", { count: "exact", head: true }),
    ]);

    // 急上昇動画をYouTube APIから取得
    let trendingVideos: TrendingVideo[] = [];
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (apiKey) {
      try {
        trendingVideos = await fetchTrendingVideos(apiKey, "JP", 10);
      } catch (e) {
        console.error("Trending videos fetch error:", e);
      }
    }

    return NextResponse.json({
      trendingVideos,
      jpTop5: (jpTopResult.data ?? []).map(dbToChannel),
      globalTop5: (globalTopResult.data ?? []).map(dbToChannel),
      categories: {
        entertainment: (entertainmentResult.data ?? []).map(dbToChannel),
        music: (musicResult.data ?? []).map(dbToChannel),
        gaming: (gamingResult.data ?? []).map(dbToChannel),
        technology: (techResult.data ?? []).map(dbToChannel),
      },
      rising: (risingResult.data ?? []).map(dbToChannel),
      totalChannels: totalCountResult.count ?? 0,
    });
  } catch (e) {
    console.error("Homepage data error:", e);
    return NextResponse.json({ error: "データの取得に失敗しました" }, { status: 500 });
  }
}

function dbToChannel(row: {
  id: string; name: string; description: string; thumbnail: string;
  subscribers: number; total_views: number; video_count: number;
  category: string; region: string; updated_at: string; published_at?: string;
}): Channel {
  return {
    id: row.id,
    title: row.name,
    description: row.description ?? "",
    thumbnailUrl: row.thumbnail ?? "",
    subscriberCount: row.subscribers,
    viewCount: row.total_views,
    videoCount: row.video_count,
    publishedAt: row.published_at?.split("T")[0] ?? "",
    category: row.category ?? "エンタメ",
    growthRate: 0,
    updatedAt: row.updated_at?.split("T")[0] ?? "",
    region: row.region as "japan" | "global",
  };
}
