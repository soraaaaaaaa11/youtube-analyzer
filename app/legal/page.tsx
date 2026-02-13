export default function LegalPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        特定商取引法に基づく表記
      </h1>

      <div className="space-y-8 text-gray-700 dark:text-gray-300">
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            事業者名
          </h2>
          <p>坂野宙輝</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            所在地
          </h2>
          <p>〒458-0013</p>
          <p>愛知県名古屋市緑区鎌倉台2丁目607番地 ビアン鎌倉台103号</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            連絡先
          </h2>
          <p>電話番号: 070-1617-1911</p>
          <p>メールアドレス: sh.miracle11@gmail.com</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            ※お問い合わせはメールにてお願いいたします
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            販売価格
          </h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Freeプラン: 無料（月額0円）</li>
            <li>Proプラン: 月額980円（税込）</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            支払方法
          </h2>
          <p>クレジットカード決済（Visa、Mastercard、JCB、American Express）</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            支払時期
          </h2>
          <p>ご登録時に初回決済、以降毎月同日に自動決済</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            サービス提供時期
          </h2>
          <p>決済完了後、即時ご利用いただけます</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            返品・キャンセルについて
          </h2>
          <p>
            デジタルコンテンツの性質上、ご購入後の返品・返金は原則としてお受けしておりません。
            ただし、サービスに重大な瑕疵がある場合は個別にご対応いたします。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            解約について
          </h2>
          <p>
            いつでもアカウント設定ページより解約が可能です。
            解約後は次回更新日以降の課金は発生しません。
            解約後も当該請求期間の終了までサービスをご利用いただけます。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            動作環境
          </h2>
          <p>
            最新版のGoogle Chrome、Safari、Firefox、Microsoft Edgeを推奨しております。
          </p>
        </section>
      </div>

      <p className="mt-12 text-sm text-gray-500 dark:text-gray-400">
        最終更新日: 2026年2月13日
      </p>
    </div>
  );
}
