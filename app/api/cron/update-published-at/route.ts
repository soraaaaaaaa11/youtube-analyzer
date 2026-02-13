import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { fetchChannelsByIds } from "@/lib/youtube-api";

/**
 * 既存チャンネルのpublished_at（開設日）を更新
 * 
 * - published_atがnullのチャンネルを取得
 * - YouTube APIでチャンネル情報を取得してpublished_atを更新
 * - バッチ処理（50件ずつ）でVercel Hobbyタイムアウト対応
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const admin = createAdminClient();
  
  try {
    // published_atがnullのチャンネルを取得（50件ずつ）
    const { data: channels, error } = await admin
      .from("channels")
      .select("id")
      .is("published_at", null)
      .limit(50);

    if (error) {
      console.error("DB query error:", error);
      return NextResponse.json({ error: "DB query failed", details: error.message }, { status: 500 });
    }

    if (!channels || channels.length === 0) {
      return NextResponse.json({ 
        ok: true, 
        message: "All channels have published_at",
        updated: 0,
        remaining: 0
      });
    }

    const channelIds = channels.map(ch => ch.id);
    
    // YouTube APIでチャンネル情報取得
    const youtubeChannels = await fetchChannelsByIds(channelIds, apiKey);
    
    let updated = 0;
    for (const ytChannel of youtubeChannels) {
      const publishedAt = ytChannel.snippet?.publishedAt;
      if (publishedAt) {
        const { error: updateError } = await admin
          .from("channels")
          .update({ published_at: publishedAt })
          .eq("id", ytChannel.id);
        
        if (!updateError) {
          updated++;
        }
      }
    }

    // 残りのnullカウント
    const { count: remaining } = await admin
      .from("channels")
      .select("*", { count: "exact", head: true })
      .is("published_at", null);

    return NextResponse.json({
      ok: true,
      processed: channels.length,
      updated,
      remaining: remaining ?? 0
    });
  } catch (e) {
    console.error("Update published_at error:", e);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
