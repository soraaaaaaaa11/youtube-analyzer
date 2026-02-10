-- Phase 3: Stripe決済連携
-- Supabase Dashboard > SQL Editor で実行

-- サブスクリプションID追跡カラム追加
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text;

-- Stripe Customer IDでのWebhook検索用インデックス
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id
  ON public.users(stripe_customer_id);
