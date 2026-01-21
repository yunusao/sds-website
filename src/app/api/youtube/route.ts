// src/app/api/youtube/route.ts
import { NextResponse } from "next/server";
import { fetchChannelPage } from "@/lib/youtube";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const which = searchParams.get("channel"); // "main" | "second"
  const pageToken = searchParams.get("pageToken");

  const channelId =
    which === "second"
      ? process.env.YOUTUBE_CHANNEL_ID_SECOND
      : process.env.YOUTUBE_CHANNEL_ID;

  if (!channelId) {
    return NextResponse.json({ videos: [], nextPageToken: null }, { status: 200 });
  }

  const page = await fetchChannelPage({
    channelId,
    pageToken: pageToken || null,
    maxResults: 50,
  });

  return NextResponse.json(page, { status: 200 });
}
