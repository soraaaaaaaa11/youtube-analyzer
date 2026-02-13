-- ============================================
-- channels テーブルに published_at カラムを追加
-- Supabase Dashboard > SQL Editor で実行してください
-- ============================================

-- published_at カラムを追加（チャンネル開設日）
ALTER TABLE public.channels ADD COLUMN IF NOT EXISTS published_at timestamptz;

-- 確認用クエリ（実行後にこれで確認できます）
-- SELECT id, name, published_at FROM public.channels LIMIT 5;
