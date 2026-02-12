export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        プライバシーポリシー
      </h1>

      <div className="space-y-8 text-gray-700 dark:text-gray-300">
        <section>
          <p>
            坂野宙輝（以下「当方」）は、YouTube分析ツール（以下「本サービス」）における
            ユーザーの個人情報の取り扱いについて、以下のとおりプライバシーポリシーを定めます。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            1. 収集する情報
          </h2>
          <p>当方は、本サービスの提供にあたり、以下の情報を収集することがあります。</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>メールアドレス</li>
            <li>氏名（任意）</li>
            <li>決済に関する情報（クレジットカード情報はStripe社が管理し、当方は保持しません）</li>
            <li>本サービスの利用履歴</li>
            <li>Cookie、アクセスログ等の技術情報</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            2. 利用目的
          </h2>
          <p>収集した情報は、以下の目的で利用いたします。</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>本サービスの提供・運営</li>
            <li>ユーザーからのお問い合わせへの対応</li>
            <li>利用料金の請求</li>
            <li>サービスの改善・新機能の開発</li>
            <li>重要なお知らせの通知</li>
            <li>利用規約に違反する行為への対応</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            3. 第三者提供
          </h2>
          <p>
            当方は、以下の場合を除き、ユーザーの同意なく個人情報を第三者に提供することはありません。
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>法令に基づく場合</li>
            <li>人の生命、身体または財産の保護のために必要な場合</li>
            <li>サービス提供に必要な範囲で業務委託先に提供する場合（決済処理等）</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            4. 外部サービスの利用
          </h2>
          <p>本サービスでは、以下の外部サービスを利用しています。</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>
              <strong>Stripe</strong>: 決済処理
              （<a href="https://stripe.com/jp/privacy" className="text-red-500 hover:underline" target="_blank" rel="noopener noreferrer">Stripeプライバシーポリシー</a>）
            </li>
            <li>
              <strong>Supabase</strong>: 認証・データベース
              （<a href="https://supabase.com/privacy" className="text-red-500 hover:underline" target="_blank" rel="noopener noreferrer">Supabaseプライバシーポリシー</a>）
            </li>
            <li>
              <strong>Vercel</strong>: ホスティング
              （<a href="https://vercel.com/legal/privacy-policy" className="text-red-500 hover:underline" target="_blank" rel="noopener noreferrer">Vercelプライバシーポリシー</a>）
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            5. Cookieの使用
          </h2>
          <p>
            本サービスでは、ユーザー体験の向上およびサービス改善のためにCookieを使用しています。
            ブラウザの設定によりCookieを無効にすることができますが、
            一部の機能が正常に動作しなくなる可能性があります。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            6. 情報の管理
          </h2>
          <p>
            当方は、ユーザーの個人情報を適切に管理し、不正アクセス、紛失、破壊、改ざん、
            漏洩などを防止するため、合理的な安全対策を講じます。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            7. 開示・訂正・削除
          </h2>
          <p>
            ユーザーは、当方に対して自己の個人情報の開示、訂正、削除を請求することができます。
            ご希望の場合は、下記のお問い合わせ先までご連絡ください。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            8. プライバシーポリシーの変更
          </h2>
          <p>
            当方は、必要に応じて本プライバシーポリシーを変更することがあります。
            重要な変更がある場合は、本サービス上でお知らせいたします。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            9. お問い合わせ
          </h2>
          <p>個人情報の取り扱いに関するお問い合わせは、以下までご連絡ください。</p>
          <p className="mt-2">
            メールアドレス: sh.miracle11@gmail.com
          </p>
        </section>
      </div>

      <p className="mt-12 text-sm text-gray-500 dark:text-gray-400">
        制定日: 2026年2月12日
      </p>
    </div>
  );
}
