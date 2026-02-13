import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  
  // ユーザー認証確認
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ユーザープロファイル取得（プラン確認）
  const { data: profile } = await supabase
    .from("users")
    .select("plan")
    .eq("id", user.id)
    .single();

  // Proプランのみ許可
  if (profile?.plan !== "pro") {
    return NextResponse.json({ error: "Pro plan required" }, { status: 403 });
  }

  // クエリパラメータ取得
  const url = new URL(req.url);
  const category = url.searchParams.get("category");
  const region = url.searchParams.get("region");
  const minSubs = url.searchParams.get("minSubs");
  const maxSubs = url.searchParams.get("maxSubs");
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "1000", 10), 5000);

  // チャンネルデータ取得
  let query = supabase
    .from("channels")
    .select("id, name, description, thumbnail, subscribers, total_views, video_count, category, region, updated_at")
    .order("subscribers", { ascending: false })
    .limit(limit);

  if (category && category !== "all") {
    query = query.eq("category", category);
  }
  if (region && region !== "all") {
    query = query.eq("region", region);
  }
  if (minSubs) {
    query = query.gte("subscribers", parseInt(minSubs, 10));
  }
  if (maxSubs) {
    query = query.lte("subscribers", parseInt(maxSubs, 10));
  }

  const { data: channels, error } = await query;

  if (error) {
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }

  // CSV生成
  const headers = ["チャンネルID", "チャンネル名", "登録者数", "総再生回数", "動画数", "カテゴリ", "地域", "チャンネルURL"];
  const rows = (channels ?? []).map(ch => [
    ch.id,
    `"${(ch.name ?? "").replace(/"/g, '""')}"`,
    ch.subscribers ?? 0,
    ch.total_views ?? 0,
    ch.video_count ?? 0,
    ch.category ?? "",
    ch.region ?? "",
    `https://www.youtube.com/channel/${ch.id}`,
  ]);

  const csv = [
    headers.join(","),
    ...rows.map(row => row.join(",")),
  ].join("\n");

  // BOM付きUTF-8で返す（Excelで文字化けしないように）
  const bom = "\uFEFF";
  const csvWithBom = bom + csv;

  return new NextResponse(csvWithBom, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="youtube-channels-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
