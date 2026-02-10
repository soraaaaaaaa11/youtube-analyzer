import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { fetchChannelsByIds } from "@/lib/youtube-api";
import { topicUrlToCategory } from "@/lib/youtube";

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
  const todayStr = new Date().toISOString().split("T")[0];
  let updatedCount = 0;
  let historyCount = 0;

  try {
    // channels テーブルの全チャンネルIDを取得
    const { data: rows, error } = await admin
      .from("channels")
      .select("id")
      .order("updated_at", { ascending: true })
      .limit(500); // 1回の実行で最大500チャンネル

    if (error || !rows || rows.length === 0) {
      return NextResponse.json({ ok: true, updated: 0, message: "No channels to update" });
    }

    const allIds = rows.map((r: { id: string }) => r.id);

    // 50件ずつ YouTube API で最新データ取得
    const channels = await fetchChannelsByIds(allIds, apiKey);

    for (const ch of channels) {
      const subs = parseInt(ch.statistics.subscriberCount ?? "0", 10);
      const views = parseInt(ch.statistics.viewCount ?? "0", 10);
      const videos = parseInt(ch.statistics.videoCount ?? "0", 10);

      // channels テーブルを更新
      await admin.from("channels").update({
        name: ch.snippet.title,
        thumbnail: ch.snippet.thumbnails.high?.url ?? ch.snippet.thumbnails.medium?.url ?? "",
        category: topicUrlToCategory(ch.topicDetails?.topicCategories),
        subscribers: subs,
        total_views: views,
        video_count: videos,
        updated_at: new Date().toISOString(),
      }).eq("id", ch.id);

      updatedCount++;

      // channel_stats_history に今日のデータを記録（UPSERT）
      await admin.from("channel_stats_history").upsert({
        channel_id: ch.id,
        date: todayStr,
        subscribers: subs,
        total_views: views,
        video_count: videos,
      }, { onConflict: "channel_id,date" });

      historyCount++;
    }

    // 期限切れの検索キャッシュを削除
    await admin
      .from("search_cache")
      .delete()
      .lt("expires_at", new Date().toISOString());

    return NextResponse.json({
      ok: true,
      updated: updatedCount,
      historyRecorded: historyCount,
      totalChannels: allIds.length,
    });
  } catch (e) {
    console.error("Cron update-stats error:", e);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
