-- ============================================
-- みんなの声（フィードバック）機能
-- ============================================

-- feedback テーブル
CREATE TABLE IF NOT EXISTS public.feedback (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(title) <= 50),
  detail text CHECK (detail IS NULL OR char_length(detail) <= 500),
  category text NOT NULL DEFAULT 'feature' CHECK (category IN ('feature', 'bug', 'question', 'other')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'planned', 'done', 'rejected')),
  created_at timestamptz DEFAULT now()
);

-- feedback_votes テーブル
CREATE TABLE IF NOT EXISTS public.feedback_votes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  feedback_id uuid NOT NULL REFERENCES public.feedback(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(feedback_id, user_id)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_votes_feedback_id ON public.feedback_votes(feedback_id);
CREATE INDEX IF NOT EXISTS idx_feedback_votes_user_id ON public.feedback_votes(user_id);

-- RLS 有効化
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_votes ENABLE ROW LEVEL SECURITY;

-- feedback: 誰でも閲覧可能
CREATE POLICY "feedback_select_all" ON public.feedback
  FOR SELECT USING (true);

-- feedback: 認証ユーザーのみ投稿可能
CREATE POLICY "feedback_insert_auth" ON public.feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- feedback_votes: 認証ユーザーのみ閲覧可能
CREATE POLICY "feedback_votes_select_auth" ON public.feedback_votes
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- feedback_votes: 認証ユーザーのみ投票可能
CREATE POLICY "feedback_votes_insert_auth" ON public.feedback_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- feedback_votes: 自分の投票のみ削除可能
CREATE POLICY "feedback_votes_delete_own" ON public.feedback_votes
  FOR DELETE USING (auth.uid() = user_id);
