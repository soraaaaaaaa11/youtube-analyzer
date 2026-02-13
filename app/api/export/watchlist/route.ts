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

  // ウォッチリストのチャンネルID取得
  const { data: watchlistItems, error: watchlistError } = await supabase
    .from("watchlist")
    .select("channel_id, added_at")
    .eq("user_id", user.id)
    .order("added_at", { ascending: false });

  if (watchlistError || !watchlistItems) {
    return NextResponse.json({ error: "Failed to fetch watchlist" }, { status: 500 });
  }

  // チャンネル詳細を取得
  const channelIds = watchlistItems.map(item => item.channel_id);
  const { data: channels } = await supabase
    .from("channels")
    .select("id, name, subscribers, total_views, video_count, category, region, published_at")
    .in("id", channelIds);

  // チャンネル情報をマップ化
  const channelMap = new Map((channels ?? []).map(ch => [ch.id, ch]));

  // ウォッチリストとチャンネル情報を結合
  const watchlist = watchlistItems.map(item => ({
    ...item,
    channel: channelMap.get(item.channel_id) ?? null,
  }));

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
    "開設日",
    "チャンネルURL",
    "ウォッチリスト追加日"
  ];

  const rows = watchlist.map(item => {
    const ch = item.channel as any;
    return [
      ch?.id ?? item.channel_id,
      `"${(ch?.name ?? "").replace(/"/g, '""')}"`,
      formatJapanese(ch?.subscribers ?? 0),
      formatJapanese(ch?.total_views ?? 0),
      ch?.video_count ?? 0,
      ch?.category ?? "",
      ch?.region ?? "",
      ch?.published_at ? new Date(ch.published_at).toLocaleDateString("ja-JP") : "",
      `https://www.youtube.com/channel/${ch?.id ?? item.channel_id}`,
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
