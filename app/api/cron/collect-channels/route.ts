import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import {
  fetchTrendingVideoChannelIds,
  fetchChannelsByIds,
  searchChannelsByQuery,
} from "@/lib/youtube-api";

// YouTube videoCategoryId → アプリカテゴリ名マッピング
const CATEGORY_SEARCHES = {
  japan: [
    { query: "エンタメ バラエティ", categoryName: "エンタメ" },
    { query: "音楽 MV 日本", categoryName: "音楽" },
    { query: "ゲーム実況 日本", categoryName: "ゲーム" },
    { query: "教育 授業 日本", categoryName: "教育" },
    { query: "テクノロジー ガジェット AI", categoryName: "テクノロジー/AI" },
    { query: "ニュース 政治 日本", categoryName: "ニュース/政治" },
    { query: "スポーツ 日本", categoryName: "スポーツ" },
    { query: "料理 レシピ グルメ", categoryName: "料理/グルメ" },
    { query: "美容 コスメ ファッション", categoryName: "美容/ファッション" },
    { query: "旅行 キャンプ アウトドア", categoryName: "旅行/アウトドア" },
    { query: "ペット 猫 犬 動物", categoryName: "ペット/動物" },
    { query: "投資 ビジネス 副業", categoryName: "投資/ビジネス" },
    { query: "フィットネス 筋トレ ヨガ", categoryName: "フィットネス/健康" },
    { query: "DIY ハウツー 作り方", categoryName: "ハウツー/DIY" },
  ],
  global: [
    { query: "entertainment funny", categoryName: "エンタメ" },
    { query: "music video official", categoryName: "音楽" },
    { query: "gaming gameplay", categoryName: "ゲーム" },
    { query: "education learn", categoryName: "教育" },
    { query: "technology AI review", categoryName: "テクノロジー/AI" },
    { query: "news politics", categoryName: "ニュース/政治" },
    { query: "sports highlights", categoryName: "スポーツ" },
    { query: "cooking recipe food", categoryName: "料理/グルメ" },
    { query: "beauty fashion makeup", categoryName: "美容/ファッション" },
    { query: "travel adventure outdoor", categoryName: "旅行/アウトドア" },
    { query: "pets animals cute", categoryName: "ペット/動物" },
    { query: "investing business finance", categoryName: "投資/ビジネス" },
    { query: "fitness workout health", categoryName: "フィットネス/健康" },
    { query: "DIY how to craft", categoryName: "ハウツー/DIY" },
  ],
};

function detectRegion(country?: string): "japan" | "global" {
  return country === "JP" ? "japan" : "global";
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const admin = createAdminClient();
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0-6
  let totalCollected = 0;

  try {
    // === 1. 急上昇動画からチャンネル収集 ===
    const [jpTrendingIds, usTrendingIds] = await Promise.all([
      fetchTrendingVideoChannelIds(apiKey, "JP", 50),
      fetchTrendingVideoChannelIds(apiKey, "US", 50),
    ]);

    const allTrendingIds = [...new Set([...jpTrendingIds, ...usTrendingIds])];

    if (allTrendingIds.length > 0) {
      const channels = await fetchChannelsByIds(allTrendingIds, apiKey);
      for (const ch of channels) {
        const region = detectRegion(ch.snippet.country);
        await upsertChannel(admin, ch, region);
        totalCollected++;
      }
    }

    // === 2. カテゴリ別検索（日替わりで2カテゴリずつ） ===
    const jpCategories = CATEGORY_SEARCHES.japan;
    const globalCategories = CATEGORY_SEARCHES.global;

    // 日替わりで2カテゴリを処理（14カテゴリ÷2 = 7日でフルローテーション）
    const idx1 = (dayOfWeek * 2) % jpCategories.length;
    const idx2 = (dayOfWeek * 2 + 1) % jpCategories.length;

    const todayJpSearches = [jpCategories[idx1], jpCategories[idx2]];
    const todayGlobalSearches = [globalCategories[idx1], globalCategories[idx2]];

    for (const search of [...todayJpSearches, ...todayGlobalSearches]) {
      const isJp = todayJpSearches.includes(search);
      const regionCode = isJp ? "JP" : "US";
      const searchIds = await searchChannelsByQuery(apiKey, search.query, regionCode, 25);

      if (searchIds.length > 0) {
        const channels = await fetchChannelsByIds(searchIds, apiKey);
        for (const ch of channels) {
          const region = detectRegion(ch.snippet.country);
          // カテゴリを検索クエリから決定
          await upsertChannel(admin, ch, region, search.categoryName);
          totalCollected++;
        }
      }
    }

    return NextResponse.json({
      ok: true,
      collected: totalCollected,
      sources: {
        trending: allTrendingIds.length,
        jpSearches: todayJpSearches.map(s => s.query),
        globalSearches: todayGlobalSearches.map(s => s.query),
      },
    });
  } catch (e) {
    console.error("Cron collect-channels error:", e);
    return NextResponse.json({ error: "Collection failed" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function upsertChannel(admin: any, ch: any, region: string, categoryOverride?: string) {
  const subs = parseInt(ch.statistics.subscriberCount ?? "0", 10);
  const views = parseInt(ch.statistics.viewCount ?? "0", 10);
  const videos = parseInt(ch.statistics.videoCount ?? "0", 10);

  // カテゴリの決定: 指定があればそれを使い、なければtopicDetailsから推定
  const category = categoryOverride ?? topicToCategory(ch.topicDetails?.topicCategories);

  await admin.from("channels").upsert({
    id: ch.id,
    name: ch.snippet.title,
    description: ch.snippet.description?.substring(0, 500) ?? "",
    thumbnail: ch.snippet.thumbnails.high?.url ?? ch.snippet.thumbnails.medium?.url ?? "",
    country: ch.snippet.country ?? null,
    region,
    category,
    subscribers: subs,
    total_views: views,
    video_count: videos,
    updated_at: new Date().toISOString(),
  }, { onConflict: "id" });
}

function topicToCategory(topicCategories?: string[]): string {
  if (!topicCategories || topicCategories.length === 0) return "エンタメ";
  const urls = topicCategories.join(" ");
  if (urls.includes("Gaming") || urls.includes("Video_game")) return "ゲーム";
  if (urls.includes("Music")) return "音楽";
  if (urls.includes("Sport")) return "スポーツ";
  if (urls.includes("Technology") || urls.includes("Computers")) return "テクノロジー/AI";
  if (urls.includes("Education") || urls.includes("Knowledge")) return "教育";
  if (urls.includes("Entertainment")) return "エンタメ";
  if (urls.includes("Food") || urls.includes("Cooking")) return "料理/グルメ";
  if (urls.includes("News") || urls.includes("Politics")) return "ニュース/政治";
  if (urls.includes("Travel")) return "旅行/アウトドア";
  if (urls.includes("Pet") || urls.includes("Animal")) return "ペット/動物";
  if (urls.includes("Beauty") || urls.includes("Fashion")) return "美容/ファッション";
  if (urls.includes("Business") || urls.includes("Finance")) return "投資/ビジネス";
  if (urls.includes("Fitness") || urls.includes("Health")) return "フィットネス/健康";
  if (urls.includes("Howto") || urls.includes("DIY") || urls.includes("Lifestyle")) return "ハウツー/DIY";
  return "エンタメ";
}
