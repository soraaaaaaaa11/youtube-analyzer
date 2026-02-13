import { NextRequest, NextResponse } from "next/server";
import { searchYouTubeChannels } from "@/lib/youtube";
import { SearchFilters, PLAN_LIMITS, PlanType, Channel } from "@/types";
import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const region = searchParams.get("region") ?? "japan";

  // === 認証 & 検索回数制限 ===
  let remainingSearches: number | null = null;
  let userPlan: PlanType | null = null;
  let userId: string | null = null;

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      userId = user.id;
      const { data: profile } = await supabase
        .from("users")
        .select("plan, trial_ends_at")
        .eq("id", user.id)
        .single();

      userPlan = (profile?.plan as PlanType) ?? "free";

      // トライアル期限チェック（freeプラン）
      if (userPlan === "free" && profile?.trial_ends_at) {
        if (new Date(profile.trial_ends_at) < new Date()) {
          return NextResponse.json(
            { error: "無料トライアルが終了しました", trialExpired: true },
            { status: 403 }
          );
        }
      }
    }
  } catch {
    // 認証エラー時はそのまま検索を許可
  }

  // === フィルター解析 ===
  const filters: SearchFilters = {
    keyword: searchParams.get("keyword") ?? undefined,
    minSubscribers: searchParams.get("minSub")
      ? Number(searchParams.get("minSub"))
      : undefined,
    maxSubscribers: searchParams.get("maxSub")
      ? Number(searchParams.get("maxSub"))
      : undefined,
    startDate: searchParams.get("startDate") ?? undefined,
    endDate: searchParams.get("endDate") ?? undefined,
    categories: searchParams.get("categories")
      ? searchParams.get("categories")!.split(",")
      : undefined,
    minGrowthRate: searchParams.get("minGrowth")
      ? Number(searchParams.get("minGrowth"))
      : undefined,
    region: region as "japan" | "global",
  };

  const cacheKey = buildCacheKey(filters);
  const admin = createAdminClient();

  // === Step 1: search_cache チェック（24時間以内） ===
  try {
    const { data: cached } = await admin
      .from("search_cache")
      .select("results")
      .eq("keyword", cacheKey)
      .eq("region", region)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (cached?.results) {
      return NextResponse.json({
        channels: cached.results,
        source: "cache",
        ...(userPlan && {
          searchInfo: { remainingSearches: null, plan: userPlan },
        }),
      });
    }
  } catch {
    // キャッシュなし → 続行
  }

  // === Step 2: channels テーブル検索 ===
  try {
    const dbChannels = await searchChannelsDB(admin, filters);
    if (dbChannels.length >= 5) {
      // DBに十分な結果がある → キャッシュに保存して返す
      await saveSearchCache(admin, cacheKey, region, dbChannels);
      return NextResponse.json({
        channels: dbChannels,
        source: "database",
        ...(userPlan && {
          searchInfo: { remainingSearches: null, plan: userPlan },
        }),
      });
    }
  } catch {
    // DB検索エラー → YouTube APIにフォールバック
  }

  // === Step 3: YouTube API検索（回数制限あり） ===
  if (userId && userPlan) {
    const limitResult = await checkAndIncrementSearchLimit(admin, userId, userPlan);
    if (limitResult.blocked) {
      return NextResponse.json(
        {
          error: `本日のAPI検索回数の上限（${limitResult.limit}回）に達しました`,
          limit: limitResult.limit,
          used: limitResult.used,
          plan: userPlan,
        },
        { status: 429 }
      );
    }
    remainingSearches = limitResult.remaining;
  }

  const youtubeResults = await searchYouTubeChannels({
    keyword: filters.keyword,
    categories: filters.categories,
    maxResults: 50,
  });

  if (youtubeResults !== null) {
    let channels = applyFilters(youtubeResults, filters);

    // === Step 4: 結果を channels テーブルに保存 ===
    try {
      await saveChannelsToDB(admin, channels, region);
    } catch {
      // 保存失敗は無視
    }

    // === Step 5: search_cache に保存 ===
    await saveSearchCache(admin, cacheKey, region, channels);

    return NextResponse.json({
      channels,
      source: "youtube",
      ...(userPlan && {
        searchInfo: {
          remainingSearches,
          plan: userPlan,
        },
      }),
    });
  }

  // フォールバック: DBから部分結果を返す
  return NextResponse.json({
    channels: [],
    source: "none",
    ...(userPlan && {
      searchInfo: {
        remainingSearches,
        plan: userPlan,
      },
    }),
  });
}

// ============================================================
// ヘルパー関数
// ============================================================

function buildCacheKey(filters: SearchFilters): string {
  const parts = [
    filters.keyword ?? "",
    filters.categories?.join(",") ?? "",
    filters.minSubscribers ?? "",
    filters.maxSubscribers ?? "",
  ];
  return parts.join("|").toLowerCase();
}

function applyFilters(channels: Channel[], filters: SearchFilters): Channel[] {
  let result = channels;
  if (filters.minSubscribers) {
    result = result.filter((ch) => ch.subscriberCount >= filters.minSubscribers!);
  }
  if (filters.maxSubscribers) {
    result = result.filter((ch) => ch.subscriberCount <= filters.maxSubscribers!);
  }
  if (filters.startDate) {
    result = result.filter((ch) => ch.publishedAt >= filters.startDate!);
  }
  if (filters.endDate) {
    result = result.filter((ch) => ch.publishedAt <= filters.endDate!);
  }
  if (filters.minGrowthRate) {
    result = result.filter((ch) => ch.growthRate >= filters.minGrowthRate!);
  }
  return result;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function searchChannelsDB(admin: any, filters: SearchFilters): Promise<Channel[]> {
  let query = admin
    .from("channels")
    .select("*")
    .eq("region", filters.region ?? "japan")
    .order("subscribers", { ascending: false })
    .limit(50);

  if (filters.keyword) {
    query = query.ilike("name", `%${filters.keyword}%`);
  }
  if (filters.categories && filters.categories.length > 0) {
    query = query.in("category", filters.categories);
  }
  if (filters.minSubscribers) {
    query = query.gte("subscribers", filters.minSubscribers);
  }
  if (filters.maxSubscribers) {
    query = query.lte("subscribers", filters.maxSubscribers);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((row: {
    id: string; name: string; description: string; thumbnail: string;
    subscribers: number; total_views: number; video_count: number;
    category: string; region: string; updated_at: string; published_at?: string;
  }) => ({
    id: row.id,
    title: row.name,
    description: row.description ?? "",
    thumbnailUrl: row.thumbnail ?? "",
    subscriberCount: row.subscribers,
    viewCount: row.total_views,
    videoCount: row.video_count,
    publishedAt: row.published_at?.split("T")[0] ?? "",
    category: row.category ?? "その他",
    growthRate: 0,
    updatedAt: row.updated_at?.split("T")[0] ?? "",
    region: row.region,
  }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function saveChannelsToDB(admin: any, channels: Channel[], region: string) {
  for (const ch of channels) {
    await admin.from("channels").upsert({
      id: ch.id,
      name: ch.title,
      description: ch.description?.substring(0, 500) ?? "",
      thumbnail: ch.thumbnailUrl,
      region,
      category: ch.category,
      subscribers: ch.subscriberCount,
      total_views: ch.viewCount,
      video_count: ch.videoCount,
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function saveSearchCache(admin: any, key: string, region: string, channels: Channel[]) {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  await admin.from("search_cache").upsert({
    keyword: key,
    region,
    results: channels,
    created_at: new Date().toISOString(),
    expires_at: expiresAt.toISOString(),
  }, { onConflict: "keyword,region" });
}

async function checkAndIncrementSearchLimit(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any,
  userId: string,
  plan: PlanType
): Promise<{ blocked: boolean; limit: number; used: number; remaining: number }> {
  const limit = PLAN_LIMITS[plan].searchesPerDay;
  if (limit === Infinity || limit >= 200) {
    return { blocked: false, limit, used: 0, remaining: limit };
  }

  const todayStr = new Date().toISOString().split("T")[0];

  // 今日の検索回数を取得 or 作成
  const { data: existing } = await admin
    .from("user_search_limits")
    .select("api_search_count")
    .eq("user_id", userId)
    .eq("date", todayStr)
    .single();

  const currentCount = existing?.api_search_count ?? 0;

  if (currentCount >= limit) {
    return { blocked: true, limit, used: currentCount, remaining: 0 };
  }

  // カウントをインクリメント
  if (existing) {
    await admin
      .from("user_search_limits")
      .update({ api_search_count: currentCount + 1 })
      .eq("user_id", userId)
      .eq("date", todayStr);
  } else {
    await admin.from("user_search_limits").insert({
      user_id: userId,
      date: todayStr,
      api_search_count: 1,
    });
  }

  return {
    blocked: false,
    limit,
    used: currentCount + 1,
    remaining: limit - currentCount - 1,
  };
}
