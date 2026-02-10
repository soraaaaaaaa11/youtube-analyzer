-- ============================================
-- ニックネーム機能
-- ============================================

-- users テーブルに nickname カラム追加
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS nickname text;
