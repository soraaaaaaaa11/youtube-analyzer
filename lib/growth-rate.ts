import { createAdminClient } from "@/lib/supabase-server";

/**
 * 単一チャンネルの成長率を計算（過去30日）
 * データ不足時は 0 を返す
 */
export async function calculateGrowthRate(
  channelId: string
): Promise<number> {
  const admin = createAdminClient();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: oldestRecord } = await admin
    .from("channel_stats")
    .select("subscriber_count")
    .eq("channel_id", channelId)
    .gte("recorded_at", thirtyDaysAgo.toISOString())
    .order("recorded_at", { ascending: true })
    .limit(1)
    .single();

  const { data: latestRecord } = await admin
    .from("channel_stats")
    .select("subscriber_count")
    .eq("channel_id", channelId)
    .order("recorded_at", { ascending: false })
    .limit(1)
    .single();

  if (!oldestRecord || !latestRecord) return 0;
  if (oldestRecord.subscriber_count === 0) return 0;
  if (
    oldestRecord.subscriber_count === latestRecord.subscriber_count
  )
    return 0;

  return Math.round(
    ((latestRecord.subscriber_count - oldestRecord.subscriber_count) /
      oldestRecord.subscriber_count) *
      100
  );
}

/**
 * 複数チャンネルの成長率を一括計算（過去30日）
 * 1回の DB クエリで全データ取得し、メモリ上で集計
 */
export async function calculateGrowthRatesBatch(
  channelIds: string[]
): Promise<Map<string, number>> {
  const result = new Map<string, number>();
  if (channelIds.length === 0) return result;

  const admin = createAdminClient();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: stats } = await admin
    .from("channel_stats")
    .select("channel_id, subscriber_count, recorded_at")
    .in("channel_id", channelIds)
    .gte("recorded_at", thirtyDaysAgo.toISOString())
    .order("recorded_at", { ascending: true });

  if (!stats || stats.length === 0) return result;

  // チャンネルごとに最古と最新のレコードを取得
  const firstRecord = new Map<string, number>();
  const lastRecord = new Map<string, number>();

  for (const stat of stats) {
    if (!firstRecord.has(stat.channel_id)) {
      firstRecord.set(stat.channel_id, stat.subscriber_count);
    }
    lastRecord.set(stat.channel_id, stat.subscriber_count);
  }

  for (const channelId of channelIds) {
    const first = firstRecord.get(channelId);
    const last = lastRecord.get(channelId);
    if (!first || !last || first === 0 || first === last) {
      result.set(channelId, 0);
    } else {
      result.set(
        channelId,
        Math.round(((last - first) / first) * 100)
      );
    }
  }

  return result;
}
