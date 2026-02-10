import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

// POST /api/voice/[id]/vote - 投票トグル（いいね / 取り消し）
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

  // 既存の投票を確認
  const { data: existing } = await supabase
    .from("feedback_votes")
    .select("id")
    .eq("feedback_id", feedbackId)
    .eq("user_id", user.id)
    .single();

  if (existing) {
    // 投票取り消し
    const { error } = await supabase
      .from("feedback_votes")
      .delete()
      .eq("id", existing.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ voted: false });
  }

  // 新規投票
  const { error } = await supabase
    .from("feedback_votes")
    .insert({ feedback_id: feedbackId, user_id: user.id });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ voted: true });
}
