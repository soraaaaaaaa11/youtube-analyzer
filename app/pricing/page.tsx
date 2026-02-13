"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const plans = [
  {
    name: "Free",
    planKey: "free",
    price: "0",
    description: "まずは無料で始める",
    features: [
      { text: "検索1日3回", included: true },
      { text: "基本フィルター", included: true },
      { text: "チャンネル詳細閲覧", included: true },
      { text: "ウォッチリスト", included: false },
      { text: "全フィルター利用", included: false },
      { text: "データエクスポート", included: false },
    ],
    cta: "無料で始める",
    highlighted: false,
  },
  {
    name: "Pro",
    planKey: "pro",
    price: "300",
    description: "本格的なYouTube分析に",
    features: [
      { text: "無制限検索", included: true },
      { text: "全フィルター利用可能", included: true },
      { text: "チャンネル詳細閲覧", included: true },
      { text: "ウォッチリスト（無制限）", included: true },
      { text: "データエクスポート（CSV）", included: true },
      { text: "優先サポート", included: true },
    ],
    cta: "Proを始める",
    highlighted: true,
  },
];

export default function PricingPage() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout(planKey: string) {
    // 無料プランの場合
    if (planKey === "free") {
      if (!user) {
        router.push("/signup");
      }
      return;
    }

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
    if (planKey === "free" && user && (!userProfile?.plan || userProfile?.plan === "free")) {
      return "現在のプラン";
    }
    if (userProfile?.plan === planKey) return "現在のプラン";
    return defaultCta;
  }

  function isCurrentPlan(planKey: string) {
    if (planKey === "free" && user && (!userProfile?.plan || userProfile?.plan === "free")) {
      return true;
    }
    return userProfile?.plan === planKey;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">料金プラン</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          まずは無料プランから。いつでもアップグレード可能。
        </p>
      </div>

      {error && (
        <div className="mb-6 text-center text-red-500 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {plans.map((plan) => {
          const isCurrent = isCurrentPlan(plan.planKey);
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
                  おすすめ
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
                  <li key={feature.text} className={`flex items-center gap-2 text-sm ${feature.included ? "text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-500"}`}>
                    {feature.included ? (
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                    )}
                    {feature.text}
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

      {/* 比較表 */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">プラン比較</h2>
        <div className="overflow-x-auto">
          <table className="w-full max-w-2xl mx-auto">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-4 px-4 text-gray-600 dark:text-gray-400 font-medium">機能</th>
                <th className="text-center py-4 px-4 text-gray-900 dark:text-white font-semibold">Free</th>
                <th className="text-center py-4 px-4 text-red-500 font-semibold">Pro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              <tr>
                <td className="py-4 px-4 text-gray-700 dark:text-gray-300">検索回数</td>
                <td className="py-4 px-4 text-center text-gray-600 dark:text-gray-400">1日3回</td>
                <td className="py-4 px-4 text-center text-gray-900 dark:text-white font-medium">無制限</td>
              </tr>
              <tr>
                <td className="py-4 px-4 text-gray-700 dark:text-gray-300">ウォッチリスト</td>
                <td className="py-4 px-4 text-center"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                <td className="py-4 px-4 text-center text-gray-900 dark:text-white font-medium">無制限</td>
              </tr>
              <tr>
                <td className="py-4 px-4 text-gray-700 dark:text-gray-300">全フィルター</td>
                <td className="py-4 px-4 text-center"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-4 px-4 text-gray-700 dark:text-gray-300">CSVエクスポート</td>
                <td className="py-4 px-4 text-center"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-4 px-4 text-gray-700 dark:text-gray-300">優先サポート</td>
                <td className="py-4 px-4 text-center"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">よくある質問</h2>
        <div className="space-y-4 max-w-2xl mx-auto">
          {[
            {
              q: "無料プランから有料プランへの移行はいつでもできますか？",
              a: "はい。いつでもProプランにアップグレードできます。アップグレード後すぐに全機能が利用可能になります。",
            },
            {
              q: "支払い方法は何が使えますか？",
              a: "クレジットカード（Visa、Mastercard、JCB等）に対応しています。",
            },
            {
              q: "解約はいつでもできますか？",
              a: "はい。いつでも解約可能です。解約後は次の請求日から課金が停止され、無料プランに戻ります。",
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
