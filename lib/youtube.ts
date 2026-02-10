import { Channel } from "@/types";

const BASE_URL = "https://www.googleapis.com/youtube/v3";

// YouTube topic ID マッピング（カテゴリ → YouTube topicId）
const CATEGORY_TOPIC_MAP: Record<string, string> = {
  ゲーム: "/m/0bzvm2",
  音楽: "/m/04rlf",
  スポーツ: "/m/06ntj",
  テクノロジー: "/m/07c1v",
  教育: "/m/01k8wb",
  エンタメ: "/m/02jjt",
  旅行: "/m/07bxq",
  ニュース: "/m/05qt0",
  料理: "/m/02wbm",
  コメディ: "/m/09kqc",
  "美容・ファッション": "/m/0mvn3",
  ライフスタイル: "/m/019_rr",
  "ペット・動物": "/m/068hy",
  "車・バイク": "/m/07yv9",
  映画: "/m/02vxn",
  アニメ: "/m/0jxy",
  フィットネス: "/m/027x7n",
  ビジネス: "/m/09s1f",
  政治: "/m/05wkw",
  宗教: "/m/06bvp",
};

// キーワードベースカテゴリ（topicIdがないため検索クエリにキーワードを追加）
const KEYWORD_CATEGORY_MAP: Record<string, string> = {
  AI: "AI 人工知能",
  副業: "副業 稼ぐ",
  "投資・FX": "投資 FX 株",
  プログラミング: "プログラミング エンジニア",
  英語学習: "英語学習 英会話",
  ダイエット: "ダイエット 痩せる",
  筋トレ: "筋トレ トレーニング",
  子育て: "子育て 育児",
  DIY: "DIY 自作",
  vlog: "vlog 日常",
};

// YouTube API レスポンス型
interface YouTubeSearchItem {
  id: { channelId: string };
  snippet: {
    title: string;
    description: string;
    thumbnails: { high?: { url: string }; medium?: { url: string }; default?: { url: string } };
    publishedAt: string;
    channelId: string;
  };
}

interface YouTubeChannelItem {
  id: string;
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    thumbnails: { high?: { url: string }; medium?: { url: string }; default?: { url: string } };
    country?: string;
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
  contentDetails?: {
    relatedPlaylists?: {
      uploads?: string;
    };
  };
}

function pickThumbnail(thumbnails: YouTubeChannelItem["snippet"]["thumbnails"]): string {
  return thumbnails.high?.url ?? thumbnails.medium?.url ?? thumbnails.default?.url ?? "";
}

export function topicUrlToCategory(topicCategories?: string[]): string {
  if (!topicCategories || topicCategories.length === 0) return "その他";
  const urls = topicCategories.join(" ");
  // Wikipedia URL からカテゴリ推定
  if (urls.includes("Gaming") || urls.includes("Video_game")) return "ゲーム";
  if (urls.includes("Music")) return "音楽";
  if (urls.includes("Sport")) return "スポーツ";
  if (urls.includes("Technology") || urls.includes("Computers")) return "テクノロジー";
  if (urls.includes("Education") || urls.includes("Knowledge")) return "教育";
  if (urls.includes("Entertainment")) return "エンタメ";
  if (urls.includes("Travel") || urls.includes("Tourism")) return "旅行";
  if (urls.includes("News") || urls.includes("Politics")) return "ニュース";
  if (urls.includes("Food") || urls.includes("Cooking")) return "料理";
  if (urls.includes("Humor") || urls.includes("Comedy")) return "コメディ";
  if (urls.includes("Fashion") || urls.includes("Beauty")) return "美容・ファッション";
  if (urls.includes("Lifestyle")) return "ライフスタイル";
  if (urls.includes("Pet") || urls.includes("Animal")) return "ペット・動物";
  if (urls.includes("Vehicle") || urls.includes("Automobile") || urls.includes("Motorcycle")) return "車・バイク";
  if (urls.includes("Film")) return "映画";
  if (urls.includes("Anime") || urls.includes("Animation")) return "アニメ";
  if (urls.includes("Fitness") || urls.includes("Physical_exercise")) return "フィットネス";
  if (urls.includes("Business") || urls.includes("Finance")) return "ビジネス";
  if (urls.includes("Religion")) return "宗教";
  return "その他";
}

function channelItemToChannel(item: YouTubeChannelItem, lastUploadDate?: string): Channel {
  const subscriberCount = item.statistics.hiddenSubscriberCount
    ? 0
    : parseInt(item.statistics.subscriberCount ?? "0", 10);
  const viewCount = parseInt(item.statistics.viewCount ?? "0", 10);
  const videoCount = parseInt(item.statistics.videoCount ?? "0", 10);

  return {
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnailUrl: pickThumbnail(item.snippet.thumbnails),
    subscriberCount,
    viewCount,
    videoCount,
    publishedAt: item.snippet.publishedAt.split("T")[0],
    category: topicUrlToCategory(item.topicDetails?.topicCategories),
    growthRate: 0,
    updatedAt: lastUploadDate ?? "---",
  };
}

/**
 * uploads プレイリストから最新動画の投稿日を取得（1クォータ）
 */
async function getLastUploadDate(uploadsPlaylistId: string, apiKey: string): Promise<string | undefined> {
  try {
    const url = new URL(`${BASE_URL}/playlistItems`);
    url.searchParams.set("part", "snippet");
    url.searchParams.set("playlistId", uploadsPlaylistId);
    url.searchParams.set("maxResults", "1");
    url.searchParams.set("key", apiKey);

    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) return undefined;

    const data = await res.json();
    const publishedAt: string | undefined = data.items?.[0]?.snippet?.publishedAt;
    return publishedAt ? publishedAt.split("T")[0] : undefined;
  } catch {
    return undefined;
  }
}

/**
 * チャンネルを検索する
 * APIキーがない場合は null を返す（呼び出し側でモックにフォールバック）
 */
export async function searchYouTubeChannels(params: {
  keyword?: string;
  categories?: string[];
  maxResults?: number;
}): Promise<Channel[] | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return null;

  const { keyword, categories, maxResults = 25 } = params;

  // 検索クエリ組み立て（キーワードカテゴリは展開キーワードに置換）
  const queryParts: string[] = [];
  if (keyword) queryParts.push(keyword);
  let topicId: string | undefined;

  if (categories) {
    for (const cat of categories) {
      if (KEYWORD_CATEGORY_MAP[cat]) {
        queryParts.push(KEYWORD_CATEGORY_MAP[cat]);
      } else {
        queryParts.push(cat);
        if (categories.length === 1 && CATEGORY_TOPIC_MAP[cat]) {
          topicId = CATEGORY_TOPIC_MAP[cat];
        }
      }
    }
  }

  const q = queryParts.filter(Boolean).join(" ");
  if (!q) return null;

  try {
    // Step 1: search.list でチャンネルIDを取得（2クォータ）
    const searchUrl = new URL(`${BASE_URL}/search`);
    searchUrl.searchParams.set("part", "snippet");
    searchUrl.searchParams.set("type", "channel");
    searchUrl.searchParams.set("q", q);
    searchUrl.searchParams.set("maxResults", String(maxResults));
    searchUrl.searchParams.set("regionCode", "JP");
    searchUrl.searchParams.set("relevanceLanguage", "ja");
    searchUrl.searchParams.set("key", apiKey);

    // カテゴリのtopicIdがある場合は追加
    if (topicId) {
      searchUrl.searchParams.set("topicId", topicId);
    }

    const searchRes = await fetch(searchUrl.toString(), { next: { revalidate: 3600 } });
    if (!searchRes.ok) {
      const err = await searchRes.json();
      console.error("YouTube search error:", err);
      return null;
    }

    const searchData = await searchRes.json();
    const items: YouTubeSearchItem[] = searchData.items ?? [];
    if (items.length === 0) return [];

    const channelIds = items.map((item) => item.id.channelId).join(",");

    // Step 2: channels.list で詳細統計を取得（1クォータ）
    const channelUrl = new URL(`${BASE_URL}/channels`);
    channelUrl.searchParams.set("part", "snippet,statistics,topicDetails,contentDetails");
    channelUrl.searchParams.set("id", channelIds);
    channelUrl.searchParams.set("key", apiKey);

    const channelRes = await fetch(channelUrl.toString(), { next: { revalidate: 3600 } });
    if (!channelRes.ok) {
      const err = await channelRes.json();
      console.error("YouTube channels error:", err);
      return null;
    }

    const channelData = await channelRes.json();
    const channelItems: YouTubeChannelItem[] = channelData.items ?? [];

    return channelItems.map((item) => channelItemToChannel(item));
  } catch (e) {
    console.error("YouTube API fetch failed:", e);
    return null;
  }
}

/**
 * チャンネル詳細を取得する
 * APIキーがない場合は null を返す
 */
export async function getYouTubeChannel(channelId: string): Promise<Channel | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return null;

  try {
    const url = new URL(`${BASE_URL}/channels`);
    url.searchParams.set("part", "snippet,statistics,topicDetails,contentDetails");
    url.searchParams.set("id", channelId);
    url.searchParams.set("key", apiKey);

    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) return null;

    const data = await res.json();
    const item: YouTubeChannelItem | undefined = data.items?.[0];
    if (!item) return null;

    // uploads プレイリストから最新動画の投稿日を取得
    const uploadsId = item.contentDetails?.relatedPlaylists?.uploads;
    const lastUploadDate = uploadsId ? await getLastUploadDate(uploadsId, apiKey) : undefined;

    return channelItemToChannel(item, lastUploadDate);
  } catch (e) {
    console.error("YouTube channel fetch failed:", e);
    return null;
  }
}
