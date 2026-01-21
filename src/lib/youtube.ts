// src/lib/youtube.ts

export type YouTubeVideo = {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnail: string;
  duration?: string; // "M:SS" or "H:MM:SS"
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
};

export type YouTubeChannel = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
};

export type YouTubePage = {
  videos: YouTubeVideo[];
  nextPageToken: string | null;
};

function isoDurationToHMS(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "";
  const h = Number(match[1] || 0);
  const m = Number(match[2] || 0);
  const s = Number(match[3] || 0);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

async function fetchDurations(ids: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (!process.env.YOUTUBE_API_KEY || ids.length === 0) return map;

  const url =
    "https://www.googleapis.com/youtube/v3/videos?" +
    new URLSearchParams({
      key: process.env.YOUTUBE_API_KEY,
      id: ids.join(","),
      part: "contentDetails",
    });

  const res = await fetch(url, { next: { revalidate: 60 * 60 } });
  if (!res.ok) {
    console.error("YouTube videos.list error:", await res.text());
    return map;
  }

  const data = await res.json();
  for (const it of data.items ?? []) {
    if (it?.id && it?.contentDetails?.duration) {
      map.set(it.id, isoDurationToHMS(it.contentDetails.duration));
    }
  }
  return map;
}

async function fetchVideoStats(ids: string[]): Promise<Map<string, { viewCount: number; likeCount: number; commentCount: number }>> {
  const map = new Map();
  if (!process.env.YOUTUBE_API_KEY || ids.length === 0) return map;

  // YouTube API allows max 50 IDs per request, so chunk if needed
  const chunks = [];
  for (let i = 0; i < ids.length; i += 50) {
    chunks.push(ids.slice(i, i + 50));
  }

  for (const chunk of chunks) {
    const url =
      "https://www.googleapis.com/youtube/v3/videos?" +
      new URLSearchParams({
        key: process.env.YOUTUBE_API_KEY,
        id: chunk.join(","),
        part: "statistics",
      });

    const res = await fetch(url, { next: { revalidate: 60 * 60 } });
    if (!res.ok) {
      console.error("YouTube video stats error:", await res.text());
      continue;
    }

    const data = await res.json();
    for (const it of data.items ?? []) {
      if (it?.id && it?.statistics) {
        map.set(it.id, {
          viewCount: parseInt(it.statistics.viewCount || "0", 10),
          likeCount: parseInt(it.statistics.likeCount || "0", 10),
          commentCount: parseInt(it.statistics.commentCount || "0", 10),
        });
      }
    }
  }

  return map;
}

export async function fetchChannelPage(params: {
  channelId: string;
  pageToken?: string | null;
  maxResults?: number; // <= 50
}): Promise<YouTubePage> {
  const { channelId, pageToken = null, maxResults = 50 } = params;

  if (!process.env.YOUTUBE_API_KEY || !channelId) {
    console.warn("Missing YOUTUBE_API_KEY or channelId");
    return { videos: [], nextPageToken: null };
  }

  const qs = new URLSearchParams({
    key: process.env.YOUTUBE_API_KEY,
    channelId,
    part: "snippet",
    order: "date",
    maxResults: String(Math.min(maxResults, 50)),
    type: "video",
  });

  if (pageToken) qs.set("pageToken", pageToken);

  const url = "https://www.googleapis.com/youtube/v3/search?" + qs.toString();

  const res = await fetch(url, { next: { revalidate: 60 * 10 } });
  if (!res.ok) {
    console.error("YouTube search error:", await res.text());
    return { videos: [], nextPageToken: null };
  }

  const data = await res.json();
  const items = (data.items ?? []) as any[];

  const videos: YouTubeVideo[] = items
    .map((it) => ({
      id: it?.id?.videoId as string,
      title: it?.snippet?.title as string,
      description: it?.snippet?.description as string,
      publishedAt: it?.snippet?.publishedAt as string,
      thumbnail:
        it?.snippet?.thumbnails?.high?.url ||
        it?.snippet?.thumbnails?.medium?.url ||
        it?.snippet?.thumbnails?.default?.url ||
        "",
    }))
    .filter((v) => !!v.id);

  const durationMap = await fetchDurations(videos.map((v) => v.id));
  const withDurations = videos.map((v) => ({ ...v, duration: durationMap.get(v.id) }));

  return {
    videos: withDurations,
    nextPageToken: data.nextPageToken ?? null,
  };
}

/** Fetch channel info (subscriber count, view count, etc.) */
export async function getChannelInfo(channelId: string): Promise<YouTubeChannel | null> {
  if (!process.env.YOUTUBE_API_KEY) return null;

  const url =
    "https://www.googleapis.com/youtube/v3/channels?" +
    new URLSearchParams({
      key: process.env.YOUTUBE_API_KEY,
      id: channelId,
      part: "snippet,statistics",
    });

  const res = await fetch(url, { next: { revalidate: 60 * 60 } });
  if (!res.ok) {
    console.error("YouTube channels error:", await res.text());
    return null;
  }

  const data = await res.json();
  const channel = data.items?.[0];
  if (!channel) return null;

  return {
    id: channel.id,
    title: channel.snippet?.title ?? "",
    description: channel.snippet?.description ?? "",
    thumbnail: channel.snippet?.thumbnails?.high?.url || channel.snippet?.thumbnails?.default?.url || "",
    subscriberCount: parseInt(channel.statistics?.subscriberCount || "0", 10),
    viewCount: parseInt(channel.statistics?.viewCount || "0", 10),
    videoCount: parseInt(channel.statistics?.videoCount || "0", 10),
  };
}

/** Home page: latest single video from MAIN channel */
export async function getLatestVideo(): Promise<YouTubeVideo | null> {
  const channelId = process.env.YOUTUBE_CHANNEL_ID;
  if (!channelId) return null;

  // Fetch more than 1 so we can skip Shorts
  const page = await fetchChannelPage({
    channelId,
    maxResults: 25,
  });

  function isShort(v: YouTubeVideo) {
    // Prefer duration if available
    if (v.duration) {
      const parts = v.duration.split(":").map(Number);
      let seconds = 0;

      if (parts.length === 3) {
        seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
      } else if (parts.length === 2) {
        seconds = parts[0] * 60 + parts[1];
      }

      if (seconds > 0 && seconds < 120) return true; // under 2 min
    }

    // Fallback: title-based detection
    const title = (v.title || "").toLowerCase();
    return title.includes("#shorts") || /\bshorts?\b/i.test(title);
  }

  // Return the first non-short video
  return page.videos.find((v) => !isShort(v)) ?? null;
}


/** Episodes page initial load: MAIN channel first page */
export async function getMainChannelFirstPage(): Promise<YouTubePage> {
  const channelId = process.env.YOUTUBE_CHANNEL_ID;
  if (!channelId) return { videos: [], nextPageToken: null };
  return fetchChannelPage({ channelId, maxResults: 50 });
}

/** Episodes page initial load: SECOND channel first page */
export async function getSecondChannelFirstPage(): Promise<YouTubePage> {
  const channelId = process.env.YOUTUBE_CHANNEL_ID_SECOND;
  if (!channelId) return { videos: [], nextPageToken: null };
  return fetchChannelPage({ channelId, maxResults: 50 });
}
