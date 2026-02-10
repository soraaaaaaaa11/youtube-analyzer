"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ChevronUp,
  Plus,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Lock,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface FeedbackItem {
  id: string;
  title: string;
  description: string | null;
  category: "feature" | "bug" | "other";
  status: "pending" | "planned" | "done" | "rejected";
  voteCount: number;
  hasVoted: boolean;
  createdAt: string;
}

type CategoryFilter = "all" | "feature" | "bug" | "other";

const CATEGORY_LABELS: Record<FeedbackItem["category"], { label: string; color: string }> = {
  feature: {
    label: "機能リクエスト",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  bug: {
    label: "バグ報告",
    color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  },
  other: {
    label: "その他",
    color: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  },
};

const STATUS_LABELS: Record<FeedbackItem["status"], { label: string; color: string }> = {
  pending: {
    label: "検討中",
    color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  planned: {
    label: "対応予定",
    color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  done: {
    label: "対応済み",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  rejected: {
    label: "見送り",
    color: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
  },
};

const FILTER_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "feature", label: "機能リクエスト" },
  { value: "bug", label: "バグ報告" },
  { value: "other", label: "その他" },
];

export default function FeedbackContent() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [showForm, setShowForm] = useState(false);
  const [votingId, setVotingId] = useState<string | null>(null);
  const perPage = 20;

  const fetchFeedbacks = useCallback(
    async (p: number, cat: CategoryFilter) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(p) });
        if (cat !== "all") params.set("category", cat);
        const res = await fetch(`/api/feedback?${params}`);
        if (res.ok) {
          const data = await res.json();
          setItems(data.items ?? []);
          setTotal(data.total ?? 0);
        }
      } catch {
        // ネットワークエラー
      }
      setLoading(false);
    },
    []
  );

  useEffect(() => {
    if (authLoading) return;
    fetchFeedbacks(page, categoryFilter);
  }, [page, categoryFilter, authLoading, fetchFeedbacks]);

  function handleFilterChange(cat: CategoryFilter) {
    setCategoryFilter(cat);
    setPage(1);
  }

  async function handleVote(feedbackId: string, hasVoted: boolean) {
    if (!user) return;
    setVotingId(feedbackId);
    try {
      const res = await fetch(`/api/feedback/${feedbackId}/vote`, {
        method: hasVoted ? "DELETE" : "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setItems((prev) =>
          prev.map((item) =>
            item.id === feedbackId
              ? { ...item, hasVoted: data.voted, voteCount: data.voteCount }
              : item
          )
        );
      }
    } catch {
      // エラー
    }
    setVotingId(null);
  }

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <>
      {/* 上部: カテゴリフィルター + 投稿ボタン */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleFilterChange(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                categoryFilter === opt.value
                  ? "bg-red-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {user ? (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl font-medium transition-colors flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            投稿する
          </button>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2.5 rounded-xl font-medium flex-shrink-0"
          >
            <Lock className="w-4 h-4" />
            ログインして投稿
          </Link>
        )}
      </div>

      {/* 投稿フォームモーダル */}
      {showForm && (
        <PostForm
          onClose={() => setShowForm(false)}
          onSubmitted={() => {
            setShowForm(false);
            setPage(1);
            setCategoryFilter("all");
            fetchFeedbacks(1, "all");
          }}
        />
      )}

      {/* 一覧 */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 animate-pulse"
            >
              <div className="flex gap-4">
                <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            まだ投稿がありません
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            最初の声を投稿してみましょう
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <FeedbackCard
              key={item.id}
              item={item}
              onVote={handleVote}
              voting={votingId === item.id}
              canVote={!!user}
            />
          ))}
        </div>
      )}

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            前へ
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            次へ
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}

/* ========== フィードバックカード ========== */

function FeedbackCard({
  item,
  onVote,
  voting,
  canVote,
}: {
  item: FeedbackItem;
  onVote: (id: string, hasVoted: boolean) => void;
  voting: boolean;
  canVote: boolean;
}) {
  const cat = CATEGORY_LABELS[item.category];
  const status = STATUS_LABELS[item.status];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        {/* 投票ボタン（▲ スタイル） */}
        <div className="flex-shrink-0">
          <button
            onClick={() => onVote(item.id, item.hasVoted)}
            disabled={!canVote || voting}
            className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl border-2 transition-all ${
              item.hasVoted
                ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-500"
                : "border-gray-200 dark:border-gray-600 text-gray-400 hover:border-red-300 hover:text-red-400"
            } ${!canVote ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            title={
              canVote
                ? item.hasVoted
                  ? "投票を取り消す"
                  : "投票する"
                : "ログインして投票"
            }
          >
            {voting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ChevronUp className={`w-5 h-5 ${item.hasVoted ? "stroke-[3]" : ""}`} />
            )}
            <span className="text-xs font-bold -mt-0.5">{item.voteCount}</span>
          </button>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${cat.color}`}
            >
              {cat.label}
            </span>
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${status.color}`}
            >
              {status.label}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug mb-1">
            {item.title}
          </h3>
          {item.description && (
            <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed line-clamp-2">
              {item.description}
            </p>
          )}
          <p className="text-gray-400 dark:text-gray-500 text-[11px] mt-2">
            {new Date(item.createdAt).toLocaleDateString("ja-JP", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ========== 投稿フォームモーダル ========== */

function PostForm({
  onClose,
  onSubmitted,
}: {
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<FeedbackItem["category"]>("feature");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("タイトルを入力してください");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          category,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "投稿に失敗しました");
        setSubmitting(false);
        return;
      }
      onSubmitted();
    } catch {
      setError("ネットワークエラーが発生しました");
      setSubmitting(false);
    }
  }

  const categories: { value: FeedbackItem["category"]; label: string }[] = [
    { value: "feature", label: "機能リクエスト" },
    { value: "bug", label: "バグ報告" },
    { value: "other", label: "その他" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* オーバーレイ */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* モーダル */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            新しい投稿
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* カテゴリ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              カテゴリ
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    category === cat.value
                      ? "bg-red-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* タイトル */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={50}
              placeholder="例: チャンネル比較機能がほしい"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {title.length}/50
            </p>
          </div>

          {/* 詳細 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              詳細（任意）
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="具体的な内容や背景を教えてください"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {description.length}/500
            </p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting || !title.trim()}
            className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition-colors"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                投稿中...
              </>
            ) : (
              "投稿する"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
