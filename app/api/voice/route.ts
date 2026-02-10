import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

// GET /api/voice - フィードバック一覧取得（投票数順）
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const perPage = 20;
  const offset = (page - 1) * perPage;

  const supabase = await createServerSupabaseClient();

  // 現在のユーザー（未ログインでもOK）
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // feedback + 投票数を取得
  const { data: feedbacks, error, count } = await supabase
    .from("feedback")
    .select("id, title, detail, category, status, created_at, user_id", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + perPage - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!feedbacks || feedbacks.length === 0) {
    return NextResponse.json({ items: [], total: 0, page, perPage });
  }

  // 各投稿の投票数を取得
  const feedbackIds = feedbacks.map((f) => f.id);
  const { data: voteCounts } = await supabase
    .from("feedback_votes")
    .select("feedback_id")
    .in("feedback_id", feedbackIds);

  const voteCountMap = new Map<string, number>();
  for (const v of voteCounts ?? []) {
    voteCountMap.set(v.feedback_id, (voteCountMap.get(v.feedback_id) ?? 0) + 1);
  }

  // ログイン中ユーザーの投票済みリスト
  let userVotes = new Set<string>();
  if (user) {
    const { data: myVotes } = await supabase
      .from("feedback_votes")
      .select("feedback_id")
      .eq("user_id", user.id)
      .in("feedback_id", feedbackIds);
    userVotes = new Set((myVotes ?? []).map((v) => v.feedback_id));
  }

  const items = feedbacks.map((f) => ({
    id: f.id,
    title: f.title,
    detail: f.detail,
    category: f.category,
    status: f.status,
    createdAt: f.created_at,
    voteCount: voteCountMap.get(f.id) ?? 0,
    hasVoted: userVotes.has(f.id),
  }));

  // 投票数順でソート（同票は新しい順）
  items.sort((a, b) => b.voteCount - a.voteCount || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json({
    items,
    total: count ?? 0,
    page,
    perPage,
  });
}

// POST /api/voice - フィードバック投稿
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const body = await req.json();
  const { title, detail, category } = body;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return NextResponse.json({ error: "タイトルは必須です" }, { status: 400 });
  }
  if (title.length > 50) {
    return NextResponse.json({ error: "タイトルは50文字以内で入力してください" }, { status: 400 });
  }
  if (detail && detail.length > 500) {
    return NextResponse.json({ error: "詳細は500文字以内で入力してください" }, { status: 400 });
  }
  const validCategories = ["feature", "bug", "question", "other"];
  if (!validCategories.includes(category)) {
    return NextResponse.json({ error: "無効なカテゴリです" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("feedback")
    .insert({
      user_id: user.id,
      title: title.trim(),
      detail: detail?.trim() || null,
      category,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
