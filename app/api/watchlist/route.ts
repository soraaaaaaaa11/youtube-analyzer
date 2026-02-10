import { NextRequest, NextResponse } from "next/server";
import {
  createServerSupabaseClient,
  createAdminClient,
} from "@/lib/supabase-server";
import { calculateGrowthRatesBatch } from "@/lib/growth-rate";

// GET /api/watchlist - ウォッチリスト一覧取得
export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: watchlistItems, error } = await supabase
    .from("watchlist")
    .select("*")
    .eq("user_id", user.id)
    .order("added_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!watchlistItems || watchlistItems.length === 0) {
    return NextResponse.json({ items: [] });
  }

  // チャンネルデータを取得
  const channelIds = watchlistItems.map((item) => item.channel_id);
  const admin = createAdminClient();
  const { data: channels } = await admin
    .from("channels")
    .select("*")
    .in("id", channelIds);

  const channelMap = new Map(
    (channels ?? []).map((ch: Record<string, unknown>) => [ch.id, ch])
  );

  // 成長率を一括計算
  let growthRates = new Map<string, number>();
  try {
    growthRates = await calculateGrowthRatesBatch(channelIds);
  } catch {
    // 成長率計算失敗時はデフォルト 0
  }

  const items = watchlistItems.map((item) => {
    const ch = channelMap.get(item.channel_id) as Record<string, unknown> | undefined;
    return {
      id: item.id,
      channelId: item.channel_id,
      addedAt: item.added_at,
      subscriberCountAtAdd: item.subscriber_count_at_add,
      viewCountAtAdd: item.view_count_at_add,
      channel: ch
        ? {
            id: ch.id,
            title: ch.title,
            description: ch.description ?? "",
            thumbnailUrl: ch.thumbnail_url ?? "",
            subscriberCount: ch.subscriber_count ?? 0,
            viewCount: ch.view_count ?? 0,
            videoCount: ch.video_count ?? 0,
            publishedAt: ch.published_at ?? "",
            category: ch.category ?? "その他",
            growthRate: growthRates.get(item.channel_id) ?? 0,
            updatedAt: ch.updated_at ?? "",
          }
        : null,
      subscriberChange: ch
        ? (ch.subscriber_count as number) - item.subscriber_count_at_add
        : 0,
      viewCountChange: ch
        ? (ch.view_count as number) - item.view_count_at_add
        : 0,
    };
  });

  return NextResponse.json({ items });
}

// POST /api/watchlist - ウォッチリストに追加
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    channelId,
    channelTitle,
    thumbnailUrl,
    subscriberCount,
    viewCount,
    videoCount,
    publishedAt,
    category,
    description,
  } = body;

  if (!channelId) {
    return NextResponse.json(
      { error: "channelId is required" },
      { status: 400 }
    );
  }

  // チャンネルデータをキャッシュに保存
  const admin = createAdminClient();
  await admin.from("channels").upsert(
    {
      id: channelId,
      title: channelTitle ?? "",
      description: description ?? "",
      thumbnail_url: thumbnailUrl ?? "",
      subscriber_count: subscriberCount ?? 0,
      view_count: viewCount ?? 0,
      video_count: videoCount ?? 0,
      published_at: publishedAt || null,
      category: category ?? "その他",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  // ウォッチリストに追加
  const { data, error } = await supabase
    .from("watchlist")
    .insert({
      user_id: user.id,
      channel_id: channelId,
      subscriber_count_at_add: subscriberCount ?? 0,
      view_count_at_add: viewCount ?? 0,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "既にウォッチリストに追加されています" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ item: data }, { status: 201 });
}
