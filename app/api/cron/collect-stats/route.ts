import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { fetchChannelsBatch } from "@/lib/youtube-batch";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  // CRON_SECRET で認証
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // 1. channels テーブルから全チャンネルID取得
  const { data: channels, error: fetchError } = await admin
    .from("channels")
    .select("id");

  if (fetchError || !channels) {
    return NextResponse.json(
      { error: "Failed to fetch channels", details: fetchError?.message },
      { status: 500 }
    );
  }

  if (channels.length === 0) {
    return NextResponse.json({ message: "No channels to update", updated: 0 });
  }

  const channelIds = channels.map((ch) => ch.id as string);

  // 2. YouTube API でバッチ取得
  let snapshots;
  try {
    snapshots = await fetchChannelsBatch(channelIds);
  } catch (e) {
    return NextResponse.json(
      { error: "YouTube API batch fetch failed", details: String(e) },
      { status: 500 }
    );
  }

  // 3. channels テーブル更新 + channel_stats に履歴挿入
  const now = new Date().toISOString();
  let updatedCount = 0;
  let statsInserted = 0;

  // channels テーブルを一括 upsert
  const channelRows = snapshots.map((s) => ({
    id: s.channelId,
    title: s.title,
    description: s.description,
    thumbnail_url: s.thumbnailUrl,
    subscriber_count: s.subscriberCount,
    view_count: s.viewCount,
    video_count: s.videoCount,
    published_at: s.publishedAt || null,
    category: s.category,
    updated_at: now,
  }));

  for (let i = 0; i < channelRows.length; i += 500) {
    const batch = channelRows.slice(i, i + 500);
    const { error } = await admin
      .from("channels")
      .upsert(batch, { onConflict: "id" });
    if (!error) updatedCount += batch.length;
  }

  // channel_stats に一括挿入
  const statsRows = snapshots.map((s) => ({
    channel_id: s.channelId,
    subscriber_count: s.subscriberCount,
    view_count: s.viewCount,
    recorded_at: now,
  }));

  for (let i = 0; i < statsRows.length; i += 500) {
    const batch = statsRows.slice(i, i + 500);
    const { error } = await admin.from("channel_stats").insert(batch);
    if (!error) statsInserted += batch.length;
  }

  return NextResponse.json({
    message: "Stats collection completed",
    totalChannels: channelIds.length,
    fetchedFromYouTube: snapshots.length,
    channelsUpdated: updatedCount,
    statsInserted,
    timestamp: now,
  });
}
