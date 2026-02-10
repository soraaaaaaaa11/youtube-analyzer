import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase-server";

// POST /api/feedback/[id]/vote - 投票する
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: feedbackId } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  // 重複チェック
  const { data: existing } = await supabase
    .from("feedback_votes")
    .select("id")
    .eq("feedback_id", feedbackId)
    .eq("user_id", user.id)
    .single();

  if (existing) {
    return NextResponse.json({ error: "すでに投票済みです" }, { status: 409 });
  }

  // 投票追加
  const { error } = await supabase
    .from("feedback_votes")
    .insert({ feedback_id: feedbackId, user_id: user.id });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // vote_count を再計算して更新（admin で RLS バイパス）
  const admin = createAdminClient();
  const { count } = await admin
    .from("feedback_votes")
    .select("*", { count: "exact", head: true })
    .eq("feedback_id", feedbackId);

  await admin
    .from("feedback")
    .update({ vote_count: count ?? 0 })
    .eq("id", feedbackId);

  return NextResponse.json({ voted: true, voteCount: count ?? 0 });
}

// DELETE /api/feedback/[id]/vote - 投票取り消し
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: feedbackId } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  // 自分の投票を削除
  const { error } = await supabase
    .from("feedback_votes")
    .delete()
    .eq("feedback_id", feedbackId)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // vote_count を再計算して更新
  const admin = createAdminClient();
  const { count } = await admin
    .from("feedback_votes")
    .select("*", { count: "exact", head: true })
    .eq("feedback_id", feedbackId);

  await admin
    .from("feedback")
    .update({ vote_count: count ?? 0 })
    .eq("id", feedbackId);

  return NextResponse.json({ voted: false, voteCount: count ?? 0 });
}
