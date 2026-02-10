-- Phase 4: ランキング＆データ収集システム
-- channels, channel_stats_history, search_cache, user_search_limits

-- ========================================
-- 1. チャンネル基本情報テーブル
-- ========================================
CREATE TABLE IF NOT EXISTS channels (
  id TEXT PRIMARY KEY,              -- YouTube Channel ID
  name TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT,
  country TEXT,                     -- 国コード (JP, US, etc.)
  region TEXT DEFAULT 'global',     -- 'japan' or 'global'
  category TEXT,
  subscribers BIGINT DEFAULT 0,
  total_views BIGINT DEFAULT 0,
  video_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_channels_region ON channels(region);
CREATE INDEX IF NOT EXISTS idx_channels_subscribers ON channels(subscribers DESC);
CREATE INDEX IF NOT EXISTS idx_channels_category ON channels(category);
CREATE INDEX IF NOT EXISTS idx_channels_updated ON channels(updated_at);

-- RLS: 誰でも読める、service_role のみ書き込み可
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "channels_select_all" ON channels FOR SELECT USING (true);
CREATE POLICY "channels_insert_service" ON channels FOR INSERT WITH CHECK (true);
CREATE POLICY "channels_update_service" ON channels FOR UPDATE USING (true);

-- ========================================
-- 2. チャンネル統計履歴テーブル（成長率計算用）
-- ========================================
CREATE TABLE IF NOT EXISTS channel_stats_history (
  id SERIAL PRIMARY KEY,
  channel_id TEXT REFERENCES channels(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  subscribers BIGINT,
  total_views BIGINT,
  video_count INT,
  UNIQUE(channel_id, date)
);

CREATE INDEX IF NOT EXISTS idx_stats_history_date ON channel_stats_history(channel_id, date);
CREATE INDEX IF NOT EXISTS idx_stats_history_date_desc ON channel_stats_history(date DESC);

ALTER TABLE channel_stats_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stats_history_select_all" ON channel_stats_history FOR SELECT USING (true);
CREATE POLICY "stats_history_insert_service" ON channel_stats_history FOR INSERT WITH CHECK (true);

-- ========================================
-- 3. 検索キャッシュテーブル
-- ========================================
CREATE TABLE IF NOT EXISTS search_cache (
  id SERIAL PRIMARY KEY,
  keyword TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT 'japan',
  results JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(keyword, region)
);

CREATE INDEX IF NOT EXISTS idx_search_cache_lookup ON search_cache(keyword, region);
CREATE INDEX IF NOT EXISTS idx_search_cache_expires ON search_cache(expires_at);

ALTER TABLE search_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "search_cache_select_all" ON search_cache FOR SELECT USING (true);
CREATE POLICY "search_cache_insert_service" ON search_cache FOR INSERT WITH CHECK (true);
CREATE POLICY "search_cache_update_service" ON search_cache FOR UPDATE USING (true);
CREATE POLICY "search_cache_delete_service" ON search_cache FOR DELETE USING (true);

-- ========================================
-- 4. ユーザー検索回数制限テーブル
-- ========================================
CREATE TABLE IF NOT EXISTS user_search_limits (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  api_search_count INT DEFAULT 0,
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_search_limits_lookup ON user_search_limits(user_id, date);

ALTER TABLE user_search_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "search_limits_select_own" ON user_search_limits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "search_limits_insert_service" ON user_search_limits FOR INSERT WITH CHECK (true);
CREATE POLICY "search_limits_update_service" ON user_search_limits FOR UPDATE USING (true);

-- ========================================
-- 5. users テーブル更新
-- ========================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';

-- 既存ユーザーにトライアル期間を設定
UPDATE users SET trial_ends_at = created_at + INTERVAL '14 days' WHERE trial_ends_at IS NULL;
