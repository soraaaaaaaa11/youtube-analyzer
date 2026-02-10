-- ============================================
-- YouTube分析ツール Phase 1: データベースマイグレーション
-- Supabase Dashboard > SQL Editor で実行してください
-- ============================================

-- ============================================
-- 1. users テーブル（auth.users と連動）
-- ============================================
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'business')),
  trial_ends_at timestamptz DEFAULT (now() + interval '14 days'),
  stripe_customer_id text
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. 新規ユーザー登録時に自動で users レコード作成
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 3. channels テーブル（キャッシュ用）
-- ============================================
CREATE TABLE public.channels (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text,
  thumbnail_url text,
  subscriber_count integer DEFAULT 0,
  view_count bigint DEFAULT 0,
  video_count integer DEFAULT 0,
  published_at timestamptz,
  category text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "channels_select_authenticated" ON public.channels
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "channels_all_service" ON public.channels
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 4. channel_stats テーブル（履歴データ）
-- ============================================
CREATE TABLE public.channel_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id text NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  subscriber_count integer DEFAULT 0,
  view_count bigint DEFAULT 0,
  recorded_at timestamptz DEFAULT now()
);

ALTER TABLE public.channel_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "channel_stats_select_authenticated" ON public.channel_stats
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "channel_stats_all_service" ON public.channel_stats
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX idx_channel_stats_channel_id ON public.channel_stats(channel_id);
CREATE INDEX idx_channel_stats_recorded_at ON public.channel_stats(recorded_at);

-- ============================================
-- 5. watchlist テーブル
-- ============================================
CREATE TABLE public.watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  channel_id text NOT NULL,
  added_at timestamptz DEFAULT now(),
  subscriber_count_at_add integer DEFAULT 0,
  view_count_at_add bigint DEFAULT 0,
  UNIQUE(user_id, channel_id)
);

ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "watchlist_select_own" ON public.watchlist
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "watchlist_insert_own" ON public.watchlist
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "watchlist_delete_own" ON public.watchlist
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_watchlist_user_id ON public.watchlist(user_id);

-- ============================================
-- 6. searches テーブル（検索回数カウント用）
-- ============================================
CREATE TABLE public.searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  searched_at timestamptz DEFAULT now()
);

ALTER TABLE public.searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "searches_select_own" ON public.searches
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "searches_insert_own" ON public.searches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_searches_user_id_date ON public.searches(user_id, searched_at);
