"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, TrendingUp, Users, Zap, Shield, Globe, ArrowRight, BarChart3, Eye, Crown, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Channel, RANKING_CATEGORIES } from "@/types";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  CountUp,
  Float,
} from "@/components/animations";

function formatNumber(num: number): string {
  if (num >= 100000000) {
    return `${(num / 100000000).toFixed(1)}億`;
  }
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`;
  }
  return num.toLocaleString();
}

interface HomepageData {
  trending: Channel[];
  jpTop5: Channel[];
  globalTop5: Channel[];
  categories: {
    entertainment: Channel[];
    music: Channel[];
    gaming: Channel[];
    technology: Channel[];
  };
  rising: Channel[];
}

function ChannelCard({ channel, rank }: { channel: Channel; rank?: number }) {
  return (
    <Link
      href={`/channel/${channel.id}`}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
    >
      {rank && (
        <span className={`text-lg font-bold w-6 text-center flex-shrink-0 ${
          rank === 1 ? "text-yellow-500" : rank === 2 ? "text-gray-400" : rank === 3 ? "text-amber-600" : "text-gray-300 dark:text-gray-600"
        }`}>
          {rank}
        </span>
      )}
      <Image
        src={channel.thumbnailUrl || "/placeholder.png"}
        alt={channel.title}
        width={40}
        height={40}
        className="rounded-full flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-red-500 transition-colors">
          {channel.title}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {formatNumber(channel.subscriberCount)}人
        </p>
      </div>
    </Link>
  );
}

const FEATURED_CATEGORIES = [
  { key: "entertainment" as const, id: "entertainment", name: "エンタメ", icon: "🎭" },
  { key: "music" as const, id: "music", name: "音楽", icon: "🎵" },
  { key: "gaming" as const, id: "gaming", name: "ゲーム", icon: "🎮" },
  { key: "technology" as const, id: "technology", name: "テクノロジー/AI", icon: "💻" },
];

export default function HomePage() {
  const [data, setData] = useState<HomepageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/homepage-data")
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-950 to-red-950 text-white overflow-hidden animate-gradient">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-900/30 via-transparent to-transparent" />
        <div className="absolute inset-0 overflow-hidden">
          <Float delay={0} range={20} className="absolute top-20 right-[15%] w-72 h-72 bg-red-500/5 rounded-full blur-3xl" />
          <Float delay={1.5} range={25} className="absolute bottom-10 left-[10%] w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
          <Float delay={0.8} range={15} className="absolute top-40 left-[40%] w-48 h-48 bg-white/3 rounded-full blur-2xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="text-4xl md:text-6xl font-bold leading-tight mb-6"
            >
              急成長YouTubeチャンネルを
              <br />
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
                className="text-red-500"
              >
                一瞬で発見。
              </motion.span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-xl text-gray-300 mb-8 leading-relaxed"
            >
              柔軟な条件検索で、あなたの次のビジネスチャンスを見つけよう。
              <br />
              広告なし、日本特化、シンプルなUI。
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/search"
                className="group flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-red-500/25"
              >
                <Search className="w-5 h-5" />
                無料で検索を始める
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/pricing"
                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all border border-white/20 hover:border-white/40"
              >
                料金プランを見る
              </Link>
            </motion.div>
          </div>

          {/* ヒーロー右側 - 統計カード */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="hidden lg:block absolute right-8 xl:right-16 top-1/2 -translate-y-1/2"
          >
            <div className="space-y-4">
              <Float delay={0} range={8}>
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4 w-56">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">平均成長率</p>
                      <p className="text-xl font-bold text-green-400">+391%</p>
                    </div>
                  </div>
                </div>
              </Float>
              <Float delay={0.5} range={10}>
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4 w-56 ml-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">分析チャンネル数</p>
                      <p className="text-xl font-bold text-blue-400">600+</p>
                    </div>
                  </div>
                </div>
              </Float>
              <Float delay={1} range={8}>
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4 w-56">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <Eye className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">15カテゴリ</p>
                      <p className="text-xl font-bold text-purple-400">日本特化</p>
                    </div>
                  </div>
                </div>
              </Float>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 実績数字 */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { target: 600, suffix: "+", label: "分析済みチャンネル" },
              { target: 15, suffix: "", label: "カテゴリ" },
              { target: 14, suffix: "日間", label: "無料トライアル" },
              { target: 100, suffix: "%", label: "広告なし" },
            ].map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 0.15}>
                <div>
                  <p className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                    <CountUp target={stat.target} suffix={stat.suffix} duration={2} />
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 急上昇チャンネル（横スクロール） */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <FadeIn>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-red-500" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">注目チャンネル TOP10</h2>
            </div>
            <Link href="/rankings?tab=subscribers" className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
              もっと見る <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </FadeIn>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="overflow-x-auto pb-4 -mx-4 px-4">
            <StaggerContainer className="flex gap-4" staggerDelay={0.08}>
              {(data?.trending ?? []).map((channel, index) => (
                <StaggerItem key={channel.id}>
                  <Link
                    href={`/channel/${channel.id}`}
                    className="block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-all hover:-translate-y-1 group w-48 flex-shrink-0"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-2xl font-bold ${
                        index === 0 ? "text-yellow-500" : index === 1 ? "text-gray-400" : index === 2 ? "text-amber-600" : "text-gray-200 dark:text-gray-700"
                      }`}>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <Image
                      src={channel.thumbnailUrl || "/placeholder.png"}
                      alt={channel.title}
                      width={48}
                      height={48}
                      className="rounded-full mb-3"
                    />
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-red-500 transition-colors line-clamp-2">
                      {channel.title}
                    </h3>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {formatNumber(channel.subscriberCount)}人
                    </div>
                    <span className="inline-block mt-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
                      {channel.category}
                    </span>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        )}
      </section>

      {/* 総合ランキングプレビュー */}
      <section className="bg-white dark:bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="flex items-center gap-3 mb-8">
              <Crown className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">総合ランキング TOP5</h2>
            </div>
          </FadeIn>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 日本 TOP5 */}
              <FadeIn delay={0.1}>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <span>🇯🇵</span> 日本 TOP5
                    </h3>
                    <Link href="/rankings?region=japan" className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
                      全ランキング <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="space-y-1">
                    {(data?.jpTop5 ?? []).map((ch, i) => (
                      <ChannelCard key={ch.id} channel={ch} rank={i + 1} />
                    ))}
                  </div>
                </div>
              </FadeIn>

              {/* グローバル TOP5 */}
              <FadeIn delay={0.2}>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Globe className="w-4 h-4" /> グローバル TOP5
                    </h3>
                    <Link href="/rankings?region=global" className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
                      全ランキング <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="space-y-1">
                    {(data?.globalTop5 ?? []).map((ch, i) => (
                      <ChannelCard key={ch.id} channel={ch} rank={i + 1} />
                    ))}
                  </div>
                </div>
              </FadeIn>
            </div>
          )}
        </div>
      </section>

      {/* カテゴリ別ランキング */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <FadeIn>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">カテゴリ別ランキング</h2>
            <Link href="/rankings" className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
              全カテゴリ <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </FadeIn>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_CATEGORIES.map((cat, catIdx) => (
              <FadeIn key={cat.id} delay={catIdx * 0.1}>
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <span>{cat.icon}</span> {cat.name}
                    </h3>
                    <Link
                      href={`/rankings?category=${cat.id}`}
                      className="text-xs text-red-500 hover:text-red-600"
                    >
                      もっと見る
                    </Link>
                  </div>
                  <div className="space-y-1">
                    {(data?.categories?.[cat.key] ?? []).map((ch, i) => (
                      <ChannelCard key={ch.id} channel={ch} rank={i + 1} />
                    ))}
                    {(data?.categories?.[cat.key] ?? []).length === 0 && (
                      <p className="text-xs text-gray-400 py-4 text-center">データ準備中</p>
                    )}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        )}
      </section>

      {/* 注目の成長チャンネル */}
      {(data?.rising ?? []).length > 0 && (
        <section className="bg-white dark:bg-gray-900 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6 text-green-500" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">注目の成長チャンネル</h2>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
                登録者10万人以下の穴場チャンネルを発見しよう
              </p>
            </FadeIn>
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" staggerDelay={0.08}>
              {(data?.rising ?? []).slice(0, 10).map((channel) => (
                <StaggerItem key={channel.id}>
                  <Link
                    href={`/channel/${channel.id}`}
                    className="block bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-all hover:-translate-y-1 group"
                  >
                    <Image
                      src={channel.thumbnailUrl || "/placeholder.png"}
                      alt={channel.title}
                      width={48}
                      height={48}
                      className="rounded-full mb-3"
                    />
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-red-500 transition-colors line-clamp-2">
                      {channel.title}
                    </h3>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatNumber(channel.subscriberCount)}人
                    </div>
                    <span className="inline-block mt-2 text-xs bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">
                      {channel.category}
                    </span>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      )}

      {/* カテゴリ一覧 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <FadeIn>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              カテゴリから探す
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              15カテゴリから注目チャンネルを探そう
            </p>
          </div>
        </FadeIn>
        <StaggerContainer className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-5 gap-3" staggerDelay={0.05}>
          {RANKING_CATEGORIES.filter(c => c.id !== "all").map((cat) => (
            <StaggerItem key={cat.id}>
              <Link
                href={`/rankings?category=${cat.id}`}
                className="group block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                  {cat.icon}
                </div>
                <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">{cat.name}</p>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* Features */}
      <section className="bg-white dark:bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
              なぜYouTube分析ツールが選ばれるのか
            </h2>
          </FadeIn>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8" staggerDelay={0.15}>
            {[
              {
                icon: Shield,
                title: "広告なし",
                desc: "サブスクリプション制だから、邪魔な広告は一切ありません。快適な分析体験を提供します。",
              },
              {
                icon: Zap,
                title: "柔軟な条件検索",
                desc: "登録者数・開設日・カテゴリ・成長率など、複数条件を組み合わせた精密な検索が可能。",
              },
              {
                icon: Globe,
                title: "日本 + グローバル",
                desc: "日本チャンネルに加え、グローバルのトレンドもカバー。15カテゴリで深い分析を。",
              },
            ].map((feature) => (
              <StaggerItem key={feature.title}>
                <div className="text-center p-6 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-7 h-7 text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <FadeIn>
          <div className="bg-gradient-to-r from-red-500 to-red-700 rounded-3xl p-10 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <Float delay={0} range={20}>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              </Float>
              <Float delay={1} range={15}>
                <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-white/5 rounded-full blur-2xl" />
              </Float>
            </div>
            <div className="relative">
              <h2 className="text-3xl font-bold mb-4">今すぐ無料で始めよう</h2>
              <p className="text-red-100 mb-8 text-lg">
                クレジットカード不要。14日間の無料トライアルで全機能を試せます。
              </p>
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 bg-white text-red-600 hover:bg-red-50 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-[1.02] hover:shadow-lg"
              >
                <Users className="w-5 h-5" />
                無料トライアルを開始
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
