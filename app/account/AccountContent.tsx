"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CreditCard, ExternalLink, Loader2, CheckCircle, Crown, Pencil, Check, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { PLAN_LIMITS } from "@/types";

export default function AccountContent() {
  const { user, loading, userProfile, isTrialExpired, refreshProfile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [portalLoading, setPortalLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [editingNickname, setEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const [nicknameSaving, setNicknameSaving] = useState(false);

  // checkout=success の場合、profile を再取得して成功メッセージ表示
  useEffect(() => {
    if (searchParams.get("checkout") === "success") {
      setShowSuccess(true);
      // Webhook の処理完了を待つ
      const timer = setTimeout(() => refreshProfile(), 2000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, refreshProfile]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const plan = userProfile?.plan ?? "free";
  const planInfo = PLAN_LIMITS[plan];
  const daysLeft = userProfile?.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(userProfile.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  async function handleManageSubscription() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // ignore
    }
    setPortalLoading(false);
  }

  return (
    <>
      {/* checkout 成功メッセージ */}
      {showSuccess && (
        <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          <p className="text-green-700 dark:text-green-400 text-sm font-medium">
            お支払いが完了しました。プランが反映されるまで少しお待ちください。
          </p>
        </div>
      )}

      {/* プロフィール */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6 space-y-4">
        {/* ニックネーム */}
        <div>
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">ニックネーム</h2>
          {editingNickname ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={nicknameInput}
                onChange={(e) => setNicknameInput(e.target.value)}
                maxLength={20}
                className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                autoFocus
              />
              <button
                onClick={async () => {
                  if (!nicknameInput.trim()) return;
                  setNicknameSaving(true);
                  const res = await fetch("/api/account", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nickname: nicknameInput.trim() }),
                  });
                  if (res.ok) {
                    await refreshProfile();
                    setEditingNickname(false);
                  }
                  setNicknameSaving(false);
                }}
                disabled={nicknameSaving || !nicknameInput.trim()}
                className="p-1.5 rounded-lg text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 disabled:opacity-50"
              >
                {nicknameSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setEditingNickname(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="text-gray-900 dark:text-white">
                {userProfile?.nickname || "未設定"}
              </p>
              <button
                onClick={() => {
                  setNicknameInput(userProfile?.nickname || "");
                  setEditingNickname(true);
                }}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
        {/* メール */}
        <div>
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">メールアドレス</h2>
          <p className="text-gray-900 dark:text-white">{user.email}</p>
        </div>
      </div>

      {/* 現在のプラン */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">現在のプラン</h2>
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-yellow-500" />
            <span className="text-lg font-bold text-gray-900 dark:text-white">{planInfo.displayName}</span>
          </div>
        </div>

        {planInfo.priceYen > 0 && (
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            ¥{planInfo.priceYen.toLocaleString()}/月
          </p>
        )}

        {/* トライアル情報 */}
        {plan === "free" && daysLeft !== null && (
          <div className={`text-sm rounded-lg px-3 py-2 mb-4 ${
            isTrialExpired
              ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
              : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
          }`}>
            {isTrialExpired
              ? "無料トライアルが終了しました"
              : `無料トライアル残り ${daysLeft}日`}
          </div>
        )}

        {/* アクションボタン */}
        {plan !== "free" && userProfile?.stripeCustomerId ? (
          <button
            onClick={handleManageSubscription}
            disabled={portalLoading}
            className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            {portalLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CreditCard className="w-4 h-4" />
            )}
            サブスクリプションを管理
            <ExternalLink className="w-3 h-3" />
          </button>
        ) : (
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            プランをアップグレード
          </Link>
        )}
      </div>

      {/* 検索制限 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">月間検索回数</h2>
        <p className="text-gray-900 dark:text-white">
          {planInfo.searchesPerMonth === Infinity
            ? "無制限"
            : `${planInfo.searchesPerMonth}回/月`}
        </p>
      </div>
    </>
  );
}
