import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import {
  fetchTrendingVideoChannelIds,
  fetchChannelsByIds,
  searchChannelsByQuery,
} from "@/lib/youtube-api";

// 30カテゴリ × 日替わりローテーション検索
const CATEGORY_SEARCHES = {
  japan: [
    { query: "エンタメ バラエティ", categoryName: "エンタメ" },
    { query: "音楽 MV 日本", categoryName: "音楽" },
    { query: "ゲーム実況 日本", categoryName: "ゲーム" },
    { query: "教育 授業 日本", categoryName: "教育" },
    { query: "テクノロジー ガジェット", categoryName: "テクノロジー" },
    { query: "ニュース 日本", categoryName: "ニュース" },
    { query: "スポーツ 日本", categoryName: "スポーツ" },
    { query: "料理 レシピ グルメ", categoryName: "料理/グルメ" },
    { query: "美容 コスメ ファッション", categoryName: "美容/ファッション" },
    { query: "旅行 キャンプ アウトドア", categoryName: "旅行/アウトドア" },
    { query: "ペット 猫 犬 動物", categoryName: "ペット/動物" },
    { query: "フィットネス ヨガ 健康", categoryName: "フィットネス" },
    { query: "ビジネス 経営 起業", categoryName: "ビジネス" },
    { query: "コメディ お笑い コント", categoryName: "コメディ" },
    { query: "ライフスタイル 暮らし ルーティン", categoryName: "ライフスタイル" },
    { query: "車 バイク カスタム ドライブ", categoryName: "車/バイク" },
    { query: "映画 レビュー 考察", categoryName: "映画" },
    { query: "アニメ 漫画 声優", categoryName: "アニメ" },
    { query: "政治 選挙 国会", categoryName: "政治" },
    { query: "宗教 哲学 スピリチュアル", categoryName: "宗教/哲学" },
    { query: "AI 人工知能 ChatGPT", categoryName: "AI" },
    { query: "副業 稼ぐ 在宅ワーク", categoryName: "副業" },
    { query: "投資 FX 株 仮想通貨", categoryName: "投資/FX" },
    { query: "プログラミング エンジニア 開発", categoryName: "プログラミング" },
    { query: "英語学習 英会話 TOEIC", categoryName: "英語学習" },
    { query: "ダイエット 痩せる 食事制限", categoryName: "ダイエット" },
    { query: "筋トレ トレーニング ジム", categoryName: "筋トレ" },
    { query: "子育て 育児 ママ", categoryName: "子育て" },
    { query: "DIY 自作 ハウツー 作り方", categoryName: "DIY/ハウツー" },
    { query: "vlog 日常 ルーティン", categoryName: "Vlog" },
  ],
  global: [
    { query: "entertainment funny", categoryName: "エンタメ" },
    { query: "music video official", categoryName: "音楽" },
    { query: "gaming gameplay", categoryName: "ゲーム" },
    { query: "education learn", categoryName: "教育" },
    { query: "technology gadget review", categoryName: "テクノロジー" },
    { query: "news breaking", categoryName: "ニュース" },
    { query: "sports highlights", categoryName: "スポーツ" },
    { query: "cooking recipe food", categoryName: "料理/グルメ" },
    { query: "beauty fashion makeup", categoryName: "美容/ファッション" },
    { query: "travel adventure outdoor", categoryName: "旅行/アウトドア" },
    { query: "pets animals cute", categoryName: "ペット/動物" },
    { query: "fitness workout yoga", categoryName: "フィットネス" },
    { query: "business entrepreneurship", categoryName: "ビジネス" },
    { query: "comedy sketch standup", categoryName: "コメディ" },
    { query: "lifestyle routine minimalism", categoryName: "ライフスタイル" },
    { query: "cars motorcycle driving", categoryName: "車/バイク" },
    { query: "movie review film", categoryName: "映画" },
    { query: "anime manga otaku", categoryName: "アニメ" },
    { query: "politics election government", categoryName: "政治" },
    { query: "religion philosophy spiritual", categoryName: "宗教/哲学" },
    { query: "AI artificial intelligence ChatGPT", categoryName: "AI" },
    { query: "side hustle passive income", categoryName: "副業" },
    { query: "investing stocks crypto forex", categoryName: "投資/FX" },
    { query: "programming coding developer", categoryName: "プログラミング" },
    { query: "english learning language", categoryName: "英語学習" },
    { query: "diet weight loss nutrition", categoryName: "ダイエット" },
    { query: "muscle training gym bodybuilding", categoryName: "筋トレ" },
    { query: "parenting kids family", categoryName: "子育て" },
    { query: "DIY how to craft", categoryName: "DIY/ハウツー" },
    { query: "vlog daily life routine", categoryName: "Vlog" },
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

    // === 2. カテゴリ別検索（バッチ処理: 2-3カテゴリ/回 × 24回/日） ===
    const jpCategories = CATEGORY_SEARCHES.japan;
    const globalCategories = CATEGORY_SEARCHES.global;

    // バッチ番号を取得（0-23）: クエリパラメータ or 時間ベースで自動判定
    const url = new URL(req.url);
    let batch = parseInt(url.searchParams.get("batch") ?? "-1", 10);
    if (batch < 0 || batch > 23) {
      // 時間ベースで自動判定（毎時）
      batch = new Date().getUTCHours();
    }

    // 全60カテゴリを24バッチに分割（各2-3カテゴリ）
    const allSearches = [
      ...jpCategories.map(s => ({ ...s, regionCode: "JP" as const })),
      ...globalCategories.map(s => ({ ...s, regionCode: "US" as const })),
    ];
    const batchSize = Math.ceil(allSearches.length / 24); // 約2-3カテゴリ
    const startIdx = batch * batchSize;
    const batchSearches = allSearches.slice(startIdx, startIdx + batchSize);

    for (const search of batchSearches) {
      try {
        // 各カテゴリで50チャンネル取得
        const searchIds = await searchChannelsByQuery(apiKey, search.query, search.regionCode, 50);

        if (searchIds.length > 0) {
          const channels = await fetchChannelsByIds(searchIds, apiKey);
          for (const ch of channels) {
            const region = detectRegion(ch.snippet.country);
            await upsertChannel(admin, ch, region, search.categoryName);
            totalCollected++;
          }
        }
      } catch (e) {
        console.error(`Category search failed: ${search.query}`, e);
        break;
      }
    }

    return NextResponse.json({
      ok: true,
      collected: totalCollected,
      batch,
      sources: {
        trending: allTrendingIds.length,
        categories: batchSearches.map(s => s.query),
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
  if (urls.includes("Technology") || urls.includes("Computers")) return "テクノロジー";
  if (urls.includes("Education") || urls.includes("Knowledge")) return "教育";
  if (urls.includes("Food") || urls.includes("Cooking")) return "料理/グルメ";
  if (urls.includes("News")) return "ニュース";
  if (urls.includes("Politics")) return "政治";
  if (urls.includes("Travel")) return "旅行/アウトドア";
  if (urls.includes("Pet") || urls.includes("Animal")) return "ペット/動物";
  if (urls.includes("Beauty") || urls.includes("Fashion")) return "美容/ファッション";
  if (urls.includes("Business")) return "ビジネス";
  if (urls.includes("Finance") || urls.includes("Investing")) return "投資/FX";
  if (urls.includes("Fitness") || urls.includes("Health")) return "フィットネス";
  if (urls.includes("Comedy") || urls.includes("Humor")) return "コメディ";
  if (urls.includes("Film") || urls.includes("Movie")) return "映画";
  if (urls.includes("Anime") || urls.includes("Animation")) return "アニメ";
  if (urls.includes("Automobile") || urls.includes("Vehicle")) return "車/バイク";
  if (urls.includes("Lifestyle")) return "ライフスタイル";
  if (urls.includes("Religion") || urls.includes("Philosophy")) return "宗教/哲学";
  if (urls.includes("DIY") || urls.includes("Howto")) return "DIY/ハウツー";
  if (urls.includes("Entertainment")) return "エンタメ";
  return "エンタメ";
}
