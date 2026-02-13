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

  // ウォッチリストのチャンネル取得
  const { data: watchlist, error: watchlistError } = await supabase
    .from("watchlist")
    .select(`
      channel_id,
      added_at,
      channels (
        id,
        name,
        description,
        thumbnail,
        subscribers,
        total_views,
        video_count,
        category,
        region
      )
    `)
    .eq("user_id", user.id)
    .order("added_at", { ascending: false });

  if (watchlistError) {
    return NextResponse.json({ error: "Failed to fetch watchlist" }, { status: 500 });
  }

  // 数字を日本語表記にフォーマット
  function formatJapanese(num: number): string {
    if (num >= 100000000) {
      const oku = Math.floor(num / 100000000);
      const man = Math.floor((num % 100000000) / 10000);
      return man > 0 ? `${oku}億${man}万` : `${oku}億`;
    }
    if (num >= 10000) {
      return `${Math.floor(num / 10000)}万`;
    }
    return num.toLocaleString();
  }

  // CSV生成
  const headers = [
    "チャンネルID",
    "チャンネル名",
    "登録者数",
    "総再生回数",
    "動画数",
    "カテゴリ",
    "地域",
    "チャンネルURL",
    "ウォッチリスト追加日"
  ];

  const rows = (watchlist ?? []).map(item => {
    const ch = item.channels as any;
    return [
      ch?.id ?? "",
      `"${(ch?.name ?? "").replace(/"/g, '""')}"`,
      formatJapanese(ch?.subscribers ?? 0),
      formatJapanese(ch?.total_views ?? 0),
      ch?.video_count ?? 0,
      ch?.category ?? "",
      ch?.region ?? "",
      ch?.id ? `https://www.youtube.com/channel/${ch.id}` : "",
      item.added_at ? new Date(item.added_at).toLocaleDateString("ja-JP") : "",
    ];
  });

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
      "Content-Disposition": `attachment; filename="watchlist-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
