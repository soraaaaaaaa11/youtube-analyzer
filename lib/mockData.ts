import { Channel, ChannelStats } from "@/types";

export const mockChannels: Channel[] = [
  {
    id: "UC001",
    title: "テクノロジー解説チャンネル",
    description: "最新のテクノロジートレンドをわかりやすく解説するチャンネルです。AI、プログラミング、ガジェット情報を毎週お届けします。",
    thumbnailUrl: "https://picsum.photos/seed/tech001/200/200",
    subscriberCount: 125000,
    viewCount: 8500000,
    videoCount: 234,
    publishedAt: "2022-03-15",
    category: "テクノロジー",
    growthRate: 245,
    updatedAt: "2026-02-01",
  },
  {
    id: "UC002",
    title: "毎日料理レシピ",
    description: "簡単で美味しい料理レシピを毎日投稿！時短レシピから本格料理まで幅広く紹介しています。",
    thumbnailUrl: "https://picsum.photos/seed/cook002/200/200",
    subscriberCount: 89000,
    viewCount: 12000000,
    videoCount: 412,
    publishedAt: "2021-07-20",
    category: "料理",
    growthRate: 189,
    updatedAt: "2026-02-01",
  },
  {
    id: "UC003",
    title: "ゲーム実況チャンネルGAME+",
    description: "最新ゲームの実況や攻略情報をお届け！毎日夜9時に更新しています。",
    thumbnailUrl: "https://picsum.photos/seed/game003/200/200",
    subscriberCount: 340000,
    viewCount: 45000000,
    videoCount: 876,
    publishedAt: "2020-01-10",
    category: "ゲーム",
    growthRate: 523,
    updatedAt: "2026-02-01",
  },
  {
    id: "UC004",
    title: "英語学習マスター",
    description: "日本人が本当に使える英語を教えます。TOEIC対策から日常会話まで。",
    thumbnailUrl: "https://picsum.photos/seed/english004/200/200",
    subscriberCount: 67000,
    viewCount: 3200000,
    videoCount: 189,
    publishedAt: "2023-01-05",
    category: "教育",
    growthRate: 678,
    updatedAt: "2026-02-01",
  },
  {
    id: "UC005",
    title: "副業・投資チャンネル",
    description: "サラリーマンでもできる副業や投資の始め方を解説。月収10万円を目指す人のために。",
    thumbnailUrl: "https://picsum.photos/seed/business005/200/200",
    subscriberCount: 210000,
    viewCount: 18000000,
    videoCount: 156,
    publishedAt: "2022-09-01",
    category: "ビジネス",
    growthRate: 412,
    updatedAt: "2026-02-01",
  },
  {
    id: "UC006",
    title: "旅行VLOG Japan",
    description: "日本各地の隠れた名所を発掘！毎週末に旅行動画をアップしています。",
    thumbnailUrl: "https://picsum.photos/seed/travel006/200/200",
    subscriberCount: 45000,
    viewCount: 2100000,
    videoCount: 98,
    publishedAt: "2023-05-12",
    category: "旅行",
    growthRate: 892,
    updatedAt: "2026-02-01",
  },
  {
    id: "UC007",
    title: "フィットネス道場",
    description: "自宅でできるトレーニングから本格的なジムワークアウトまで。ダイエット成功者続出！",
    thumbnailUrl: "https://picsum.photos/seed/fitness007/200/200",
    subscriberCount: 158000,
    viewCount: 9800000,
    videoCount: 324,
    publishedAt: "2021-11-30",
    category: "スポーツ",
    growthRate: 334,
    updatedAt: "2026-02-01",
  },
  {
    id: "UC008",
    title: "プログラミング入門塾",
    description: "未経験からエンジニアへ！Python、JavaScript、Reactを一から教えます。",
    thumbnailUrl: "https://picsum.photos/seed/prog008/200/200",
    subscriberCount: 92000,
    viewCount: 6700000,
    videoCount: 267,
    publishedAt: "2022-06-18",
    category: "教育",
    growthRate: 156,
    updatedAt: "2026-02-01",
  },
  {
    id: "UC009",
    title: "美容・コスメレビュー",
    description: "プチプラからデパコスまで正直レビュー。メイクの基礎から時短テクまで幅広く紹介。",
    thumbnailUrl: "https://picsum.photos/seed/beauty009/200/200",
    subscriberCount: 275000,
    viewCount: 22000000,
    videoCount: 445,
    publishedAt: "2020-08-15",
    category: "美容・ファッション",
    growthRate: 287,
    updatedAt: "2026-02-01",
  },
  {
    id: "UC010",
    title: "お笑い芸人の日常",
    description: "毎日笑える動画をお届け！日常のあるあるネタからショートコントまで。",
    thumbnailUrl: "https://picsum.photos/seed/comedy010/200/200",
    subscriberCount: 520000,
    viewCount: 78000000,
    videoCount: 1234,
    publishedAt: "2019-04-01",
    category: "コメディ",
    growthRate: 198,
    updatedAt: "2026-02-01",
  },
];

export const mockChannelStats: Record<string, ChannelStats[]> = {
  UC001: generateStats("UC001", 50000, 125000),
  UC002: generateStats("UC002", 45000, 89000),
  UC003: generateStats("UC003", 100000, 340000),
  UC004: generateStats("UC004", 10000, 67000),
  UC005: generateStats("UC005", 60000, 210000),
};

function generateStats(channelId: string, start: number, end: number): ChannelStats[] {
  const stats: ChannelStats[] = [];
  const days = 90;
  for (let i = days; i >= 0; i--) {
    const date = new Date("2026-02-09");
    date.setDate(date.getDate() - i);
    const progress = (days - i) / days;
    const subscriberCount = Math.round(start + (end - start) * progress + Math.random() * 1000 - 500);
    stats.push({
      id: `${channelId}-${i}`,
      channelId,
      subscriberCount: Math.max(0, subscriberCount),
      viewCount: subscriberCount * 68,
      recordedAt: date.toISOString().split("T")[0],
    });
  }
  return stats;
}

export function searchChannels(filters: {
  keyword?: string;
  minSubscribers?: number;
  maxSubscribers?: number;
  startDate?: string;
  endDate?: string;
  categories?: string[];
  minGrowthRate?: number;
}): Channel[] {
  return mockChannels.filter((channel) => {
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      const match = channel.title.toLowerCase().includes(kw) ||
        channel.description.toLowerCase().includes(kw) ||
        channel.category.toLowerCase().includes(kw);
      if (!match) return false;
    }
    if (filters.minSubscribers && channel.subscriberCount < filters.minSubscribers) return false;
    if (filters.maxSubscribers && channel.subscriberCount > filters.maxSubscribers) return false;
    if (filters.startDate && channel.publishedAt < filters.startDate) return false;
    if (filters.endDate && channel.publishedAt > filters.endDate) return false;
    if (filters.categories && filters.categories.length > 0 && !filters.categories.includes(channel.category)) return false;
    if (filters.minGrowthRate && channel.growthRate < filters.minGrowthRate) return false;
    return true;
  });
}
