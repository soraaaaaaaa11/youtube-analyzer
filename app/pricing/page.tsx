"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const plans = [
  {
    name: "Starter",
    planKey: "starter",
    price: "480",
    description: "個人で始めるYouTube分析",
    features: [
      "検索月30回",
      "チャンネル詳細閲覧",
      "基本フィルター",
      "メールサポート",
    ],
    cta: "Starterを始める",
    highlighted: false,
  },
  {
    name: "Pro",
    planKey: "pro",
    price: "980",
    description: "本格的なYouTube分析に",
    features: [
      "無制限検索",
      "チャンネル詳細閲覧",
      "全フィルター利用可能",
      "ウォッチリスト",
      "優先サポート",
      "データエクスポート",
    ],
    cta: "Proを始める",
    highlighted: true,
  },
  {
    name: "Business",
    planKey: "business",
    price: "2,980",
    description: "チーム・ビジネス利用向け",
    features: [
      "Pro機能すべて",
      "チームメンバー5人",
      "API アクセス",
      "カスタムレポート",
      "専任サポート",
    ],
    cta: "Businessを始める",
    highlighted: false,
  },
];

export default function PricingPage() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout(planKey: string) {
    if (!user) {
      router.push("/signup");
      return;
    }

    // 既に同じプランの場合
    if (userProfile?.plan === planKey) return;

    setLoadingPlan(planKey);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "エラーが発生しました");
      }
    } catch {
      setError("エラーが発生しました");
    }
    setLoadingPlan(null);
  }

  function getCtaLabel(planKey: string, defaultCta: string) {
    if (userProfile?.plan === planKey) return "現在のプラン";
    return defaultCta;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">料金プラン</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          まずは14日間無料トライアルから。クレジットカード不要。
        </p>
      </div>

      {error && (
        <div className="mb-6 text-center text-red-500 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const isCurrent = userProfile?.plan === plan.planKey;
          const isLoading = loadingPlan === plan.planKey;

          return (
            <div
              key={plan.name}
              className={`rounded-2xl border p-8 relative ${
                plan.highlighted
                  ? "border-red-500 bg-white dark:bg-gray-800 shadow-lg shadow-red-500/10"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white text-sm font-bold px-4 py-1 rounded-full">
                  人気No.1
                </div>
              )}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{plan.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">¥{plan.price}</span>
                  <span className="text-gray-500 dark:text-gray-400">/月</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(plan.planKey)}
                disabled={isCurrent || isLoading}
                className={`w-full block text-center py-3 rounded-xl font-semibold transition-colors ${
                  isCurrent
                    ? "bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    : plan.highlighted
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                }`}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  getCtaLabel(plan.planKey, plan.cta)
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">よくある質問</h2>
        <div className="space-y-4 max-w-2xl mx-auto">
          {[
            {
              q: "無料トライアルはいつでも解約できますか？",
              a: "はい。14日間の無料トライアル期間中は、いつでも解約可能です。解約後は課金されません。",
            },
            {
              q: "支払い方法は何が使えますか？",
              a: "クレジットカード（Visa、Mastercard、JCB等）に対応しています。",
            },
            {
              q: "プランの変更はできますか？",
              a: "いつでもプランのアップグレード・ダウングレードが可能です。アカウントページから変更できます。",
            },
          ].map((faq) => (
            <div key={faq.q} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{faq.q}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
