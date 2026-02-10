/**
 * YouTube Data API v3 のラッパー関数群
 * Cron Job やシード用に使用
 */

const BASE_URL = "https://www.googleapis.com/youtube/v3";

export interface YouTubeChannelRaw {
  id: string;
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    country?: string;
    thumbnails: {
      high?: { url: string };
      medium?: { url: string };
      default?: { url: string };
    };
  };
  statistics: {
    subscriberCount?: string;
    viewCount?: string;
    videoCount?: string;
    hiddenSubscriberCount?: boolean;
  };
  topicDetails?: {
    topicCategories?: string[];
  };
}

/**
 * チャンネルID配列からチャンネル詳細を取得（50件ずつバッチ処理）
 */
export async function fetchChannelsByIds(
  ids: string[],
  apiKey: string
): Promise<YouTubeChannelRaw[]> {
  const results: YouTubeChannelRaw[] = [];

  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50);
    const url = new URL(`${BASE_URL}/channels`);
    url.searchParams.set("part", "snippet,statistics,topicDetails");
    url.searchParams.set("id", batch.join(","));
    url.searchParams.set("key", apiKey);

    const res = await fetch(url.toString());
    if (!res.ok) {
      console.error(`YouTube channels API error: ${res.status}`);
      continue;
    }

    const data = await res.json();
    results.push(...(data.items ?? []));
  }

  return results;
}

/**
 * 急上昇動画を取得し、動画のチャンネルIDを返す
 */
export async function fetchTrendingVideoChannelIds(
  apiKey: string,
  regionCode: string = "JP",
  maxResults: number = 50
): Promise<string[]> {
  const url = new URL(`${BASE_URL}/videos`);
  url.searchParams.set("part", "snippet");
  url.searchParams.set("chart", "mostPopular");
  url.searchParams.set("regionCode", regionCode);
  url.searchParams.set("maxResults", String(maxResults));
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) return [];

  const data = await res.json();
  const channelIds = new Set<string>();
  for (const item of data.items ?? []) {
    if (item.snippet?.channelId) {
      channelIds.add(item.snippet.channelId);
    }
  }
  return [...channelIds];
}

/**
 * カテゴリ別チャンネル検索
 */
export async function searchChannelsByQuery(
  apiKey: string,
  query: string,
  regionCode: string = "JP",
  maxResults: number = 25
): Promise<string[]> {
  const url = new URL(`${BASE_URL}/search`);
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "channel");
  url.searchParams.set("q", query);
  url.searchParams.set("maxResults", String(maxResults));
  url.searchParams.set("regionCode", regionCode);
  url.searchParams.set("order", "viewCount");
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) return [];

  const data = await res.json();
  const channelIds: string[] = [];
  for (const item of data.items ?? []) {
    const cid = item.id?.channelId ?? item.snippet?.channelId;
    if (cid) channelIds.push(cid);
  }
  return channelIds;
}

/**
 * 急上昇動画の詳細を取得（ランキング表示用）
 */
export interface TrendingVideo {
  videoId: string;
  title: string;
  channelId: string;
  channelTitle: string;
  thumbnailUrl: string;
  viewCount: number;
  likeCount: number;
  publishedAt: string;
}

export async function fetchTrendingVideos(
  apiKey: string,
  regionCode: string = "JP",
  maxResults: number = 20
): Promise<TrendingVideo[]> {
  const url = new URL(`${BASE_URL}/videos`);
  url.searchParams.set("part", "snippet,statistics");
  url.searchParams.set("chart", "mostPopular");
  url.searchParams.set("regionCode", regionCode);
  url.searchParams.set("maxResults", String(maxResults));
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) return [];

  const data = await res.json();
  return (data.items ?? []).map((item: {
    id: string;
    snippet: { title: string; channelId: string; channelTitle: string; thumbnails: { high?: { url: string }; medium?: { url: string }; default?: { url: string } }; publishedAt: string };
    statistics: { viewCount?: string; likeCount?: string };
  }) => ({
    videoId: item.id,
    title: item.snippet.title,
    channelId: item.snippet.channelId,
    channelTitle: item.snippet.channelTitle,
    thumbnailUrl: item.snippet.thumbnails.high?.url ?? item.snippet.thumbnails.medium?.url ?? "",
    viewCount: parseInt(item.statistics.viewCount ?? "0", 10),
    likeCount: parseInt(item.statistics.likeCount ?? "0", 10),
    publishedAt: item.snippet.publishedAt,
  }));
}
