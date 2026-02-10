import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

// GET /api/feedback - フィードバック一覧（vote_count順）
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const category = searchParams.get("category"); // "feature" | "bug" | "other" | null
  const perPage = 20;
  const offset = (page - 1) * perPage;

  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // クエリ構築
  let query = supabase
    .from("feedback")
    .select("id, user_id, title, description, category, status, vote_count, created_at", {
      count: "exact",
    })
    .order("vote_count", { ascending: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + perPage - 1);

  if (category) {
    query = query.eq("category", category);
  }

  const { data: feedbacks, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!feedbacks || feedbacks.length === 0) {
    return NextResponse.json({ items: [], total: count ?? 0, page, perPage });
  }

  // ログインユーザーの投票済みリストを取得
  let votedIds = new Set<string>();
  if (user) {
    const feedbackIds = feedbacks.map((f) => f.id);
    const { data: myVotes } = await supabase
      .from("feedback_votes")
      .select("feedback_id")
      .eq("user_id", user.id)
      .in("feedback_id", feedbackIds);
    votedIds = new Set((myVotes ?? []).map((v) => v.feedback_id));
  }

  const items = feedbacks.map((f) => ({
    id: f.id,
    title: f.title,
    description: f.description,
    category: f.category,
    status: f.status,
    voteCount: f.vote_count ?? 0,
    hasVoted: votedIds.has(f.id),
    createdAt: f.created_at,
  }));

  return NextResponse.json({ items, total: count ?? 0, page, perPage });
}

// POST /api/feedback - 新規フィードバック投稿
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, category } = body;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return NextResponse.json({ error: "タイトルは必須です" }, { status: 400 });
  }
  if (title.length > 50) {
    return NextResponse.json(
      { error: "タイトルは50文字以内で入力してください" },
      { status: 400 }
    );
  }
  if (description && description.length > 500) {
    return NextResponse.json(
      { error: "詳細は500文字以内で入力してください" },
      { status: 400 }
    );
  }
  const validCategories = ["feature", "bug", "other"];
  if (!validCategories.includes(category)) {
    return NextResponse.json({ error: "無効なカテゴリです" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("feedback")
    .insert({
      user_id: user.id,
      title: title.trim(),
      description: description?.trim() || null,
      category,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
