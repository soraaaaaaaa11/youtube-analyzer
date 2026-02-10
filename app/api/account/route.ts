import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let { data: profile } = await supabase
    .from("users")
    .select("plan, trial_ends_at, stripe_customer_id, nickname")
    .eq("id", user.id)
    .single();

  // public.users にレコードが無い場合は自動作成（トリガー未設定時のフォールバック）
  if (!profile) {
    const admin = createAdminClient();
    const nickname = user.user_metadata?.nickname ?? null;
    await admin.from("users").upsert({
      id: user.id,
      email: user.email!,
      plan: "free",
      nickname,
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    }, { onConflict: "id" });

    const { data: newProfile } = await supabase
      .from("users")
      .select("plan, trial_ends_at, stripe_customer_id, nickname")
      .eq("id", user.id)
      .single();
    profile = newProfile;
  }

  return NextResponse.json({ profile });
}

// PATCH /api/account - ニックネーム更新
export async function PATCH(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { nickname } = body;

  if (typeof nickname !== "string" || nickname.trim().length === 0) {
    return NextResponse.json({ error: "ニックネームは必須です" }, { status: 400 });
  }
  if (nickname.trim().length > 20) {
    return NextResponse.json({ error: "ニックネームは20文字以内で入力してください" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("users")
    .update({ nickname: nickname.trim() })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ nickname: nickname.trim() });
}
