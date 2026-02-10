import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasYoutubeKey: !!process.env.YOUTUBE_API_KEY,
    keyLength: process.env.YOUTUBE_API_KEY?.length ?? 0,
    keyPrefix: process.env.YOUTUBE_API_KEY?.substring(0, 8) ?? "(none)",
  });
}
