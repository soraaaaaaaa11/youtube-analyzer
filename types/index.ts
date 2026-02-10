export interface Channel {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  publishedAt: string;
  category: string;
  growthRate: number; // 過去7日の増加率（%）
  updatedAt: string;
  region?: "japan" | "global";
}

export interface ChannelStats {
  id: string;
  channelId: string;
  subscriberCount: number;
  viewCount: number;
  recordedAt: string;
}

export interface SearchFilters {
  keyword?: string;
  minSubscribers?: number;
  maxSubscribers?: number;
  startDate?: string;
  endDate?: string;
  categories?: string[];
  minGrowthRate?: number;
  region?: "japan" | "global";
}

export type SortField = "subscriberCount" | "growthRate" | "publishedAt";
export type SortOrder = "asc" | "desc";

export interface SearchResult {
  channels: Channel[];
  total: number;
  page: number;
  perPage: number;
}

// ランキング用15カテゴリ定義
export const RANKING_CATEGORIES = [
  { id: 'all', name: '総合', icon: '👑' },
  { id: 'entertainment', name: 'エンタメ', icon: '🎭' },
  { id: 'music', name: '音楽', icon: '🎵' },
  { id: 'gaming', name: 'ゲーム', icon: '🎮' },
  { id: 'education', name: '教育', icon: '📚' },
  { id: 'technology', name: 'テクノロジー/AI', icon: '💻' },
  { id: 'news', name: 'ニュース/政治', icon: '📰' },
  { id: 'sports', name: 'スポーツ', icon: '⚽' },
  { id: 'food', name: '料理/グルメ', icon: '🍳' },
  { id: 'beauty', name: '美容/ファッション', icon: '💄' },
  { id: 'travel', name: '旅行/アウトドア', icon: '✈️' },
  { id: 'pets', name: 'ペット/動物', icon: '🐾' },
  { id: 'business', name: '投資/ビジネス', icon: '💰' },
  { id: 'fitness', name: 'フィットネス/健康', icon: '💪' },
  { id: 'howto', name: 'ハウツー/DIY', icon: '🔧' },
] as const;

export type RankingCategoryId = typeof RANKING_CATEGORIES[number]['id'];

// 検索用カテゴリ一覧（後方互換性のため維持）
export const CATEGORIES = RANKING_CATEGORIES.filter(c => c.id !== 'all').map(c => c.name);

export type Category = string;

// プラン関連
export type PlanType = "free" | "starter" | "pro" | "business";

export interface UserProfile {
  id: string;
  email: string;
  nickname?: string | null;
  created_at: string;
  plan: PlanType;
  trial_ends_at: string;
  stripe_customer_id: string | null;
}

// ウォッチリスト
export interface WatchlistItem {
  id: string;
  user_id: string;
  channel_id: string;
  added_at: string;
  subscriber_count_at_add: number;
  view_count_at_add: number;
}

export interface WatchlistItemWithChannel extends WatchlistItem {
  channel: Channel;
  subscriberChange: number;
  viewCountChange: number;
}

// プラン別検索制限（1日あたりのAPI検索回数）
export const PLAN_LIMITS: Record<
  PlanType,
  { searchesPerDay: number; searchesPerMonth: number; displayName: string; priceYen: number }
> = {
  free: { searchesPerDay: 3, searchesPerMonth: 5, displayName: "無料", priceYen: 0 },
  starter: { searchesPerDay: 15, searchesPerMonth: 30, displayName: "Starter", priceYen: 480 },
  pro: { searchesPerDay: 50, searchesPerMonth: Infinity, displayName: "Pro", priceYen: 980 },
  business: { searchesPerDay: 200, searchesPerMonth: Infinity, displayName: "Business", priceYen: 2980 },
};

// ランキングタブ
export type RankingRegion = "japan" | "global";
export type RankingTab = "subscribers" | "growth" | "trending";
