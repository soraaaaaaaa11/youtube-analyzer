-- ============================================
-- YouTube分析ツール Phase 2: マイグレーション
-- Supabase Dashboard > SQL Editor で実行してください
-- ============================================

-- 成長率クエリ用の複合インデックス
-- WHERE channel_id = X AND recorded_at >= Y ORDER BY recorded_at の高速化
CREATE INDEX IF NOT EXISTS idx_channel_stats_channel_recorded
  ON public.channel_stats(channel_id, recorded_at);

-- 古い統計データのクリーンアップ関数（180日以上前を削除）
-- 手動または別途 Cron で呼び出し可能
CREATE OR REPLACE FUNCTION public.cleanup_old_channel_stats()
RETURNS integer AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.channel_stats
  WHERE recorded_at < now() - interval '180 days';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
