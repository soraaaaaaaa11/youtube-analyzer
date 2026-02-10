import { topicUrlToCategory } from "@/lib/youtube";

const BASE_URL = "https://www.googleapis.com/youtube/v3";

export interface ChannelSnapshot {
  channelId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  publishedAt: string;
  category: string;
}

/**
 * YouTube API channels.list を50件ずつバッチ呼び出し
 * 失敗したバッチはスキップして継続
 */
export async function fetchChannelsBatch(
  channelIds: string[]
): Promise<ChannelSnapshot[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error("YOUTUBE_API_KEY is not set");

  const results: ChannelSnapshot[] = [];
  const BATCH_SIZE = 50;

  for (let i = 0; i < channelIds.length; i += BATCH_SIZE) {
    const batch = channelIds.slice(i, i + BATCH_SIZE);
    const url = new URL(`${BASE_URL}/channels`);
    url.searchParams.set("part", "snippet,statistics,topicDetails");
    url.searchParams.set("id", batch.join(","));
    url.searchParams.set("key", apiKey);

    try {
      const res = await fetch(url.toString());
      if (!res.ok) {
        console.error(
          `YouTube batch fetch failed for batch ${i / BATCH_SIZE}:`,
          await res.text()
        );
        continue;
      }

      const data = await res.json();
      for (const item of data.items ?? []) {
        const thumbnails = item.snippet.thumbnails ?? {};
        results.push({
          channelId: item.id,
          title: item.snippet.title,
          description: item.snippet.description ?? "",
          thumbnailUrl:
            thumbnails.high?.url ?? thumbnails.medium?.url ?? "",
          subscriberCount: item.statistics.hiddenSubscriberCount
            ? 0
            : parseInt(item.statistics.subscriberCount ?? "0", 10),
          viewCount: parseInt(item.statistics.viewCount ?? "0", 10),
          videoCount: parseInt(item.statistics.videoCount ?? "0", 10),
          publishedAt: item.snippet.publishedAt?.split("T")[0] ?? "",
          category: topicUrlToCategory(
            item.topicDetails?.topicCategories
          ),
        });
      }
    } catch (e) {
      console.error(`YouTube batch fetch error for batch ${i / BATCH_SIZE}:`, e);
      continue;
    }
  }

  return results;
}
