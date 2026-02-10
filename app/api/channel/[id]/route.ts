import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = createAdminClient();

  // DB から取得
  const { data: row } = await admin
    .from("channels")
    .select("*")
    .eq("id", id)
    .single();

  if (row) {
    return NextResponse.json({
      channel: {
        id: row.id,
        title: row.name,
        description: row.description ?? "",
        thumbnailUrl: row.thumbnail ?? "",
        subscriberCount: row.subscribers,
        viewCount: row.total_views,
        videoCount: row.video_count,
        publishedAt: "",
        category: row.category ?? "エンタメ",
        growthRate: 0,
        updatedAt: row.updated_at?.split("T")[0] ?? "",
        region: row.region,
      },
      source: "db",
    });
  }

  // DB になければ YouTube API フォールバック
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (apiKey) {
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${encodeURIComponent(id)}&key=${apiKey}`
      );
      if (res.ok) {
        const data = await res.json();
        const item = data.items?.[0];
        if (item) {
          return NextResponse.json({
            channel: {
              id: item.id,
              title: item.snippet.title,
              description: item.snippet.description ?? "",
              thumbnailUrl: item.snippet.thumbnails?.high?.url ?? "",
              subscriberCount: parseInt(item.statistics.subscriberCount ?? "0", 10),
              viewCount: parseInt(item.statistics.viewCount ?? "0", 10),
              videoCount: parseInt(item.statistics.videoCount ?? "0", 10),
              publishedAt: item.snippet.publishedAt?.split("T")[0] ?? "",
              category: "その他",
              growthRate: 0,
              updatedAt: "",
            },
            source: "youtube",
          });
        }
      }
    } catch {
      // fall through to 404
    }
  }

  return NextResponse.json({ error: "Channel not found" }, { status: 404 });
}
