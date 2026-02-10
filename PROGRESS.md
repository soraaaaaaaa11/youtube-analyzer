# YouTube分析ツール - 開発進捗

最終更新: 2026-02-10

## ✅ 完了済み機能

### 1. プロジェクト初期化
- [x] Next.js 16 (App Router) + TypeScript + Tailwind CSS
- [x] 依存関係インストール: recharts, lucide-react, @supabase/supabase-js, @supabase/ssr, stripe
- [x] ディレクトリ構成作成

### 2. 基本UI（モックデータ）
- [x] トップページ（LP）
  - Hero セクション
  - 今週の急成長チャンネル TOP5
  - 特徴 3つ（広告なし・条件検索・日本特化）
  - CTA セクション
- [x] 検索ページ（/search）
  - キーワード検索
  - 成長率フィルター
  - 詳細条件（登録者数範囲・開設日・カテゴリ）
- [x] 検索結果ページ（/results）
  - チャンネルカード一覧
  - 並び替え（成長率・登録者数・開設日）
  - ローディング状態
- [x] チャンネル詳細ページ（/channel/[id]）
  - 基本情報・統計カード
  - 登録者推移グラフ（recharts）
  - 開設日・最終投稿日
  - YouTubeリンクボタン
  - 類似チャンネル
- [x] 料金ページ（/pricing）
  - 3プラン比較（Starter/Pro/Business）
  - Stripe Checkout 連携
  - FAQ
- [x] ログイン/登録ページ（UI）
- [x] ウォッチリストページ（ログイン誘導）

### 3. コンポーネント
- [x] Header（ログイン状態対応・アカウントリンク）
- [x] Footer
- [x] SearchForm（キーワード＋詳細フィルター）
- [x] ChannelCard（YouTubeリンク付き）
- [x] StatsCard
- [x] SubscriberChart（recharts）
- [x] TrialBanner（トライアル期限バナー）

### 4. YouTube Data API v3 連携 ✅
- [x] `lib/youtube.ts` 実装
  - `searchYouTubeChannels()` - search.list + channels.list
  - `getYouTubeChannel()` - チャンネル詳細 + 最終投稿日（playlistItems）
- [x] API Routes
  - `/api/search` - YouTube検索（キーワード・カテゴリ対応）
  - `/api/channel/[id]` - チャンネル詳細
- [x] モックデータフォールバック（APIキーなしでも動作）
- [x] 「デモデータ」バッジ表示

**取得データ:**
- チャンネル基本情報（title, description, thumbnails）
- 統計（subscriberCount, viewCount, videoCount）
- カテゴリ（topicDetails）
- 最終投稿日（uploads playlist → playlistItems）

### 5. Supabase 認証 ✅
- [x] `lib/supabase.ts` - ブラウザクライアント
- [x] `context/AuthContext.tsx` - 認証状態管理
  - `user`, `loading`, `signIn`, `signUp`, `signOut`
  - `userProfile`（plan, trialEndsAt, stripeCustomerId）
  - `isTrialExpired` 算出プロパティ
  - `refreshProfile()` 関数
- [x] ログインページ実装（/login）
  - メール＋パスワード認証
  - エラー表示・ローディング
- [x] 登録ページ実装（/signup）
  - メール＋パスワード登録
  - 確認メール送信完了画面
- [x] Header にログイン状態反映
  - 未ログイン: ログイン/無料で始めるボタン
  - ログイン中: メールアドレス表示・アカウント・ログアウトボタン

### 6. Phase 1: データベース・ウォッチリスト・検索制限 ✅
- [x] Supabase テーブル作成（SQLファイル: `supabase-migration.sql`）✅実行済み
  - users テーブル（plan, trial_ends_at、auth.users トリガー連動）
  - channels テーブル（キャッシュ用）
  - channel_stats テーブル（履歴用）
  - watchlist テーブル（UNIQUE制約、スナップショット付き）
  - searches テーブル（検索回数カウント用）
  - 全テーブルに RLS ポリシー設定
  - `handle_new_user()` トリガー ✅実行済み
- [x] サーバー用 Supabase クライアント
  - `lib/supabase-server.ts` - createServerSupabaseClient() / createAdminClient()
  - ブラウザ用 `lib/supabase.ts` とサーバー用を分離
- [x] 型定義追加（`types/index.ts`）
  - PlanType, WatchlistItem, WatchlistItemWithChannel, PLAN_LIMITS（priceYen付き）
- [x] ウォッチリスト API
  - `app/api/watchlist/route.ts` - GET（一覧）/ POST（追加）
  - `app/api/watchlist/[id]/route.ts` - DELETE（削除）
  - チャンネルキャッシュ自動保存（upsert）
- [x] WatchlistContext（`context/WatchlistContext.tsx`）
  - `useWatchlist()` フック
  - isInWatchlist / addToWatchlist / removeFromWatchlist
- [x] ChannelCard ウォッチリストボタン統合
  - Plus/Check アイコン切り替え
  - 未ログイン時はログインページへリダイレクト
- [x] ウォッチリストページ実装
  - `app/watchlist/WatchlistContent.tsx` - チャンネル一覧・変化量表示
  - ログイン誘導・空状態・削除機能
- [x] 検索回数制限
  - `app/api/search/route.ts` にプラン別制限ロジック追加
  - 月間検索回数カウント・429レスポンス
  - トライアル期限切れチェック・403レスポンス
  - `app/results/ResultsContent.tsx` に残り回数表示・上限エラー・トライアル期限切れ画面

### 7. Phase 2: データ蓄積・成長率計算 ✅
- [x] YouTube API バッチ取得（`lib/youtube-batch.ts`）
  - channels.list を50件ずつバッチ呼び出し
- [x] 成長率計算モジュール（`lib/growth-rate.ts`）
  - `calculateGrowthRate()` - 単一チャンネル
  - `calculateGrowthRatesBatch()` - 複数チャンネル一括
  - 計算式: ((最新 - 30日前) / 30日前) * 100
- [x] Cron ジョブ（`app/api/cron/collect-stats/route.ts`）
  - channels テーブルの全チャンネルを毎日バッチ取得
  - channels テーブル更新 + channel_stats に履歴挿入
  - CRON_SECRET ヘッダー認証
- [x] Vercel Cron 設定（`vercel.json`）
  - 毎日 03:00 UTC（12:00 JST）実行
- [x] 検索結果に実際の成長率を反映
  - 検索 API で `calculateGrowthRatesBatch()` 呼び出し
  - `minGrowthRate` フィルターが YouTube 結果にも適用
- [x] チャンネル詳細ページで実データ表示
  - channel_stats から過去90日の履歴を取得してチャート表示
  - 成長率も DB から計算
- [x] ウォッチリスト API に成長率追加

**⚠️ 要手動作業:**
- Supabase Dashboard で `supabase-migration-phase2.sql` を実行 ✅実行済み

### 8. Phase 3: Stripe 決済連携 ✅
- [x] Stripe SDK 導入（`stripe` パッケージ）
- [x] `lib/stripe.ts` - Stripe サーバークライアント + プラン価格定義
- [x] Checkout Session API（`app/api/stripe/checkout/route.ts`）
  - POST: プラン選択 → Stripe Customer 取得/作成 → Checkout Session 作成 → URL返却
  - `price_data` インライン指定（Stripe Dashboard での事前Product作成不要）
  - metadata に `supabase_user_id` と `plan` を設定
- [x] Webhook API（`app/api/stripe/webhook/route.ts`）
  - `stripe.webhooks.constructEvent()` で署名検証
  - `checkout.session.completed`: plan + stripe_customer_id を更新
  - `customer.subscription.updated`: metadata から plan を取得して更新
  - `customer.subscription.deleted`: plan を "free" にリセット
  - エラーログ出力付き
- [x] Customer Portal API（`app/api/stripe/portal/route.ts`）
  - Stripe Billing Portal セッション作成 → URL返却
- [x] Account API（`app/api/account/route.ts`）
  - ユーザープロフィール取得（plan, trial_ends_at, stripe_customer_id）
  - `public.users` レコード未存在時の自動作成フォールバック
- [x] 料金ページ（/pricing）改修
  - クライアントコンポーネント化
  - ログイン状態に応じたCTAボタン（未ログイン→/signup、ログイン→Checkout）
  - 現在のプラン表示・ローディング状態
- [x] アカウントページ（/account）新規作成
  - 現在のプラン・月額表示
  - トライアル残日数表示
  - 「サブスクリプションを管理」ボタン（→ Stripe Customer Portal）
  - 「プランをアップグレード」ボタン（freeプラン時）
  - checkout 成功メッセージ表示
- [x] AuthContext 拡張
  - `userProfile`（plan, trialEndsAt, stripeCustomerId）
  - `isTrialExpired` 算出プロパティ
  - `refreshProfile()` 関数（checkout 成功後のプラン再取得）
- [x] TrialBanner コンポーネント
  - 残り3日以下: 黄色警告バナー
  - 期限切れ: 赤バナー + アップグレードリンク
  - layout.tsx に配置（Header と main の間）
- [x] Header に「アカウント」リンク追加（デスクトップ・モバイル）
- [x] 検索 API にトライアル期限切れチェック追加（403レスポンス）
- [x] 検索結果ページでトライアル期限切れエラー表示
- [x] DB マイグレーション（`supabase-migration-phase3.sql`）✅実行済み
  - `stripe_subscription_id` カラム追加
  - `stripe_customer_id` インデックス追加

**動作確認済み:**
- Stripe テスト決済 → Webhook → DB プラン更新（Business プラン ¥2,980/月）
- アカウントページでプラン表示・サブスクリプション管理ボタン表示

## 🔧 環境変数設定済み

`.env.local`:
```
YOUTUBE_API_KEY=（設定済み）
CRON_SECRET=my-secret-key-12345
NEXT_PUBLIC_SUPABASE_URL=https://fmkgpdmprnrofsbbrtnd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=（JWT形式・設定済み）
SUPABASE_SERVICE_ROLE_KEY=（JWT形式・設定済み）
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51SzA9N...（設定済み）
STRIPE_SECRET_KEY=sk_test_51SzA9N...（設定済み）
STRIPE_WEBHOOK_SECRET=whsec_...（Stripe CLI で生成・設定済み）
```

## 📂 ディレクトリ構成

```
youtube-analyzer/
├── app/
│   ├── page.tsx              # トップページ
│   ├── layout.tsx            # AuthProvider + TrialBanner
│   ├── search/page.tsx       # 検索ページ
│   ├── results/
│   │   ├── page.tsx          # 検索結果（Suspense）
│   │   └── ResultsContent.tsx # クライアントコンポーネント
│   ├── channel/[id]/page.tsx # チャンネル詳細（dynamic）
│   ├── watchlist/page.tsx    # ウォッチリスト
│   ├── pricing/
│   │   ├── page.tsx          # 料金（Stripe Checkout連携）
│   │   └── layout.tsx        # metadata
│   ├── account/page.tsx      # アカウント管理
│   ├── login/page.tsx        # ログイン
│   ├── signup/page.tsx       # 登録
│   └── api/
│       ├── search/route.ts   # YouTube検索API（検索制限+トライアルチェック）
│       ├── channel/[id]/route.ts # チャンネル詳細API
│       ├── account/route.ts  # ユーザープロフィールAPI
│       ├── watchlist/route.ts    # ウォッチリスト GET/POST
│       ├── watchlist/[id]/route.ts # ウォッチリスト DELETE
│       ├── stripe/
│       │   ├── checkout/route.ts # Stripe Checkout Session作成
│       │   ├── webhook/route.ts  # Stripe Webhook処理
│       │   └── portal/route.ts   # Stripe Customer Portal
│       ├── cron/collect-stats/route.ts # Cronデータ収集
│       └── debug-env/route.ts # 環境変数確認用
├── components/
│   ├── Header.tsx            # ログイン状態対応・アカウントリンク
│   ├── Footer.tsx
│   ├── SearchForm.tsx
│   ├── ChannelCard.tsx       # YouTubeリンク付き
│   ├── StatsCard.tsx
│   ├── SubscriberChart.tsx
│   └── TrialBanner.tsx       # トライアル期限バナー
├── lib/
│   ├── youtube.ts            # YouTube API連携
│   ├── youtube-batch.ts      # YouTube APIバッチ取得
│   ├── growth-rate.ts        # 成長率計算
│   ├── stripe.ts             # Stripe SDKクライアント
│   ├── supabase.ts           # Supabaseクライアント（ブラウザ用）
│   ├── supabase-server.ts    # Supabaseクライアント（サーバー/管理者用）
│   └── mockData.ts           # モックデータ
├── context/
│   ├── AuthContext.tsx       # 認証Context（プロフィール・トライアル対応）
│   └── WatchlistContext.tsx  # ウォッチリストContext
├── types/
│   └── index.ts              # TypeScript型定義（PLAN_LIMITS priceYen付き）
├── supabase-migration.sql        # Phase 1 DBマイグレーション ✅実行済み
├── supabase-migration-phase2.sql # Phase 2 DBマイグレーション ✅実行済み
├── supabase-migration-phase3.sql # Phase 3 DBマイグレーション ✅実行済み
├── vercel.json               # Vercel Cron設定
└── .env.local                # 環境変数（全て設定済み）
```

## 🚀 次のステップ（未実装）

### Phase 4: 追加機能
- [ ] 競合チャンネル監視
- [ ] チャンネル比較
- [ ] 投稿頻度分析
- [ ] データエクスポート
- [ ] API提供（Business プラン）

## 📝 メモ

### YouTube API クォータ
- 1日 10,000 クォータ
- search.list: 2 units
- channels.list: 1 unit
- playlistItems.list: 1 unit
- 検索1回あたり約 3-4 units → 約 2,500〜3,000回/日

### Supabase 認証
- メール確認リンク送信設定: Supabase Dashboard > Authentication > Email Templates
- Email Confirmation は有効化推奨
- `handle_new_user()` トリガー設定済み（auth.users → public.users 自動挿入）
- `/api/account` にフォールバック自動作成あり（トリガー未動作時の保険）

### Stripe 決済
- テストモード使用中（`pk_test_` / `sk_test_`）
- Stripe Checkout（リダイレクト型）を使用
- `price_data` インライン指定（Stripe Dashboard での事前Product作成不要）
- ローカルWebhookテスト: `stripe listen --forward-to localhost:3001/api/stripe/webhook`
- テストカード: `4242 4242 4242 4242`
- Customer Portal: Stripe Dashboard > Settings > Billing > Customer portal で設定が必要

### デプロイ時の注意
- Vercel にデプロイ時、全環境変数を設定
  - `STRIPE_WEBHOOK_SECRET` は Stripe Dashboard の Webhook 設定から取得（CLI の whsec_ とは別）
- YouTube API キー: 本番用と開発用を分ける推奨
- Supabase: 本番用プロジェクトを別途作成

## 🐛 既知の問題
- なし（現時点）

## 💡 改善案
- [ ] ダークモード対応の完全化
- [ ] メタデータ（OGP）設定
- [ ] 検索履歴機能
- [ ] お気に入りフィルター保存
- [ ] チャンネル通知機能
