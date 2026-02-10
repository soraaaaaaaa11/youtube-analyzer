# YouTube分析ツール - プロジェクト仕様書

## 🎯 プロジェクト概要

YouTubeチャンネルを条件検索できる分析ツール。
競合（ユーチュラ、vidIQ等）にない「柔軟な条件検索」が最大の差別化ポイント。

### ターゲットユーザー
- YouTubeで副業したい人
- チャンネル運営者
- マーケター

### 競合との差別化
| 既存の問題 | このツールの解決策 |
|-----------|------------------|
| 広告がうざい | 広告なし（サブスク課金） |
| 条件検索できない | 柔軟な条件検索 |
| 日本語が弱い | 日本特化 |
| UIが古い | モダン＆シンプル |

---

## 💰 料金プラン

### 無料トライアル戦略
- 最初は全機能無料（14〜30日間）
- 課金の存在を見せない
- 「これないと無理」状態にさせてから課金提示

### プラン構成
| プラン | 月額 | 内容 |
|--------|------|------|
| Starter | 480円 | 検索月30回 |
| Pro | 980円 | 無制限検索 |
| Business | 2,980円 | チーム利用・API |

---

## 🛠️ 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **データベース**: Supabase (PostgreSQL)
- **認証**: Supabase Auth
- **決済**: Stripe
- **ホスティング**: Vercel
- **API**: YouTube Data API v3

---

## 📱 画面構成（MVP）

### 1. トップページ（LP）
- キャッチコピー：「急成長YouTubeチャンネルを一瞬で発見。」
- 検索バー
- 今週の急成長チャンネルTOP5
- 特徴3つ（広告なし・条件検索・日本特化）
- 料金プラン概要
- 無料トライアルCTA

### 2. 検索ページ
条件入力フォーム：
- 登録者数（最小〜最大）
- 開設日（範囲指定）
- カテゴリ（ドロップダウン複数選択）
- 増加率フィルター（過去30日：100%以上、500%以上など）

### 3. 検索結果ページ
- 結果件数表示
- 並び替え（登録者数/増加率/開設日）
- チャンネルカード一覧：
  - サムネイル
  - チャンネル名
  - 登録者数
  - 増加率
  - 開設日
  - カテゴリ
  - ウォッチリスト追加ボタン
- ページネーション

### 4. チャンネル詳細ページ
- チャンネル基本情報
- 統計カード（登録者/総再生数/動画本数）
- 登録者推移グラフ（過去90日）
- 投稿頻度
- 最終投稿日
- 類似チャンネル

### 5. ウォッチリスト
- 保存したチャンネル一覧
- 前回からの変化表示（+○○人）

### 6. 料金ページ
- 3プラン比較表
- FAQ

### 7. 認証（ログイン/登録）
- メールアドレス + パスワード
- Googleログイン（あれば）

---

## 🗄️ データベース設計

### users テーブル
```sql
- id (uuid, primary key)
- email (text, unique)
- created_at (timestamp)
- plan (text: 'free' | 'starter' | 'pro' | 'business')
- trial_ends_at (timestamp)
- stripe_customer_id (text)
```

### channels テーブル（キャッシュ用）
```sql
- id (text, primary key) -- YouTube channel ID
- title (text)
- description (text)
- thumbnail_url (text)
- subscriber_count (integer)
- view_count (bigint)
- video_count (integer)
- published_at (timestamp)
- category (text)
- updated_at (timestamp)
```

### channel_stats テーブル（履歴用）
```sql
- id (uuid, primary key)
- channel_id (text, foreign key)
- subscriber_count (integer)
- view_count (bigint)
- recorded_at (timestamp)
```

### watchlist テーブル
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key)
- channel_id (text)
- added_at (timestamp)
```

### searches テーブル（検索回数カウント用）
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key)
- searched_at (timestamp)
```

---

## 🔧 MVP機能（Phase 1）

優先度順：

1. **チャンネル条件検索** - コア機能
2. **カテゴリ別フィルター** - 検索精度向上
3. **チャンネル詳細ページ** - 検索結果の受け皿
4. **ユーザー認証** - 無料トライアル管理
5. **検索回数制限** - プラン差別化

### Phase 2（リリース後）
- ウォッチリスト
- 競合チャンネル監視

### Phase 3（将来）
- チャンネル比較
- 投稿頻度分析
- API提供

---

## 🎨 デザイン方針

- **カラー**: 
  - Primary: YouTube Red (#FF0000) をアクセントに
  - Background: ダークモード対応（#0f0f0f / #ffffff）
  - Text: 高コントラスト
  
- **フォント**: Inter または Noto Sans JP

- **UI原則**:
  - シンプル＆クリーン
  - 広告なしのスッキリ感を強調
  - モバイルファースト

---

## 📁 推奨ディレクトリ構成

```
youtube-analyzer/
├── app/
│   ├── page.tsx              # トップページ
│   ├── search/
│   │   └── page.tsx          # 検索ページ
│   ├── results/
│   │   └── page.tsx          # 検索結果
│   ├── channel/
│   │   └── [id]/
│   │       └── page.tsx      # チャンネル詳細
│   ├── watchlist/
│   │   └── page.tsx          # ウォッチリスト
│   ├── pricing/
│   │   └── page.tsx          # 料金ページ
│   ├── login/
│   │   └── page.tsx          # ログイン
│   ├── signup/
│   │   └── page.tsx          # 登録
│   └── layout.tsx            # 共通レイアウト
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── SearchForm.tsx
│   ├── ChannelCard.tsx
│   ├── StatsCard.tsx
│   └── Chart.tsx
├── lib/
│   ├── supabase.ts           # Supabase client
│   ├── youtube.ts            # YouTube API
│   └── stripe.ts             # Stripe
├── types/
│   └── index.ts              # TypeScript types
└── public/
    └── images/
```

---

## 🚀 開発の進め方

### Step 1: プロジェクト初期化
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false
```

### Step 2: 依存関係インストール
```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install stripe @stripe/stripe-js
npm install recharts  # グラフ用
npm install lucide-react  # アイコン
```

### Step 3: 環境変数設定
`.env.local` に以下を設定（後で取得）：
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
YOUTUBE_API_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

### Step 4: 開発順序
1. 基本レイアウト（Header/Footer）
2. トップページ
3. 検索フォーム
4. YouTube API連携
5. 検索結果表示
6. チャンネル詳細
7. Supabase認証
8. 検索回数制限
9. Stripe決済

---

## ⚠️ 重要な注意事項

1. **YouTube API制限**: 1日10,000クォータ。キャッシュ戦略必須。
2. **無料トライアル**: 課金UIは最初は非表示。期限切れ時のみ表示。
3. **レスポンシブ**: モバイル対応必須。
4. **日本語**: 全てのUIを日本語で。

---

## 📝 Claude Codeへの指示

このファイルを読んだ上で、以下の順序で開発を進めてください：

1. まずプロジェクトを初期化
2. 基本的なページ構成を作成
3. UIコンポーネントを作成
4. YouTube APIを仮データで実装（APIキーは後で設定）
5. 動作確認できる状態まで一気に作成

質問があれば聞いてください。基本的には自律的に進めてOKです。
