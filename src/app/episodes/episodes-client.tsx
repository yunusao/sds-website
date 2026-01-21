"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { YouTubeVideo } from "@/lib/youtube";
import { formatEpisodeTitle } from "@/lib/format";

type Category =
  | "All"
  | "Weekly Round Up"
  | "Debates"
  | "Shorts"
  | "Football Mafia"
  | "SDS FC"
  | "Green Room"
  | "Call In Show"
  | "Second Channel";

const MAIN_CATEGORIES: Exclude<Category, "Second Channel">[] = [
  "All",
  "Weekly Round Up",
  "Debates",
  "Shorts",
  "Football Mafia",
  "SDS FC",
  "Green Room",
  "Call In Show",
];

const CATEGORIES: Category[] = [...MAIN_CATEGORIES, "Second Channel"];

/**
 * EDIT THESE RULES anytime — first match wins
 */
const CATEGORY_RULES: Array<{
  category: Exclude<Category, "Second Channel">;
  titleIncludes?: string[];
  titleMatches?: RegExp[];
}> = [
  {
    category: "Debates",
    titleIncludes: ["debates", "debate"],
    titleMatches: [/debates?/i],
  },
  {
    category: "Football Mafia",
    titleIncludes: ["football mafia", "footballmafia"],
    titleMatches: [/football\s*mafia/i],
  },
  {
    category: "Weekly Round Up",
    titleIncludes: ["weekly round up", "weeklyroundup", "roundup"],
    titleMatches: [/weekly\s*round\s*up/i],
  },
  {
    category: "Call In Show",
    titleIncludes: ["call in show", "callin show"],
    titleMatches: [/call\s*in\s*show/i],
  },
  {
    category: "SDS FC",
    titleIncludes: ["sds fc", "baller league", "ballerleague"],
    titleMatches: [/sds\s*fc/i, /baller\s*league/i],
  },
  {
    category: "Green Room",
    titleIncludes: ["green room", "greenroom"],
    titleMatches: [/green\s*room/i],
  },
  {
    category: "Shorts",
    titleIncludes: ["#shorts", "shorts", "#"],
    titleMatches: [/\bshorts?\b/i],
  },
];

const GREEN_ROOM_IDS = new Set<string>([
  "AG1ByehBmc4",
  "AAencTdTHr4",
  "zvHbKl4Orn8",
  "YWHa8tSklWY",
]);

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function categorizeMainVideo(v: YouTubeVideo): Exclude<Category, "Second Channel"> {
  const title = (formatEpisodeTitle(v.title) || "").toLowerCase();

  for (const rule of CATEGORY_RULES) {
    if (rule.titleIncludes?.some((s) => title.includes(s.toLowerCase()))) return rule.category;
    if (rule.titleMatches?.some((re) => re.test(formatEpisodeTitle(v.title)))) return rule.category;
  }
  return "All";
}

function isShort(v: YouTubeVideo) {
  // If we have duration, use it (preferred)
  if (v.duration) {
    const parts = v.duration.split(":").map(Number);

    let seconds = 0;

    if (parts.length === 3) {
      // H:MM:SS
      seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      // M:SS
      seconds = parts[0] * 60 + parts[1];
    }

    // under 2 minutes = short
    if (seconds > 0 && seconds < 120) return true;
  }

  // Fallback: explicit shorts tagging
  const title = (v.title || "").toLowerCase();
  return title.includes("#shorts");
}

function isGreenRoom(v: YouTubeVideo) {
  const title = (v.title || "").toLowerCase();
  return title.includes("green room") || title.includes("greenroom") || /green\s*room/i.test(title);
}

function isGreenRoomManual(v: YouTubeVideo) {
  return GREEN_ROOM_IDS.has(v.id);
}

export default function EpisodesClient({
  initialMainVideos,
  initialSecondVideos,
  initialMainPageToken,
  initialSecondPageToken,
}: {
  initialMainVideos: YouTubeVideo[];
  initialSecondVideos: YouTubeVideo[];
  initialMainPageToken: string | null;
  initialSecondPageToken: string | null;
}) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  // ✅ Pagination state
  const [mainVideos, setMainVideos] = useState<YouTubeVideo[]>(initialMainVideos);
  const [secondVideos, setSecondVideos] = useState<YouTubeVideo[]>(initialSecondVideos);

  const [mainPageToken, setMainPageToken] = useState<string | null>(initialMainPageToken);
  const [secondPageToken, setSecondPageToken] = useState<string | null>(initialSecondPageToken);

  const [loadingMore, setLoadingMore] = useState(false);

  async function loadMore() {
    if (loadingMore) return;
    if (!mainPageToken && !secondPageToken) return;

    setLoadingMore(true);
    try {
      const [mainRes, secondRes] = await Promise.all([
        mainPageToken
          ? fetch(`/api/youtube?channel=main&pageToken=${encodeURIComponent(mainPageToken)}`).then((r) => r.json())
          : Promise.resolve({ videos: [], nextPageToken: null }),
        secondPageToken
          ? fetch(`/api/youtube?channel=second&pageToken=${encodeURIComponent(secondPageToken)}`).then((r) => r.json())
          : Promise.resolve({ videos: [], nextPageToken: null }),
      ]);

      if (mainRes?.videos?.length) {
        setMainVideos((prev) => {
          const map = new Map(prev.map((v) => [v.id, v]));
          for (const v of mainRes.videos) map.set(v.id, v);
          return Array.from(map.values());
        });
      }
      setMainPageToken(mainRes?.nextPageToken ?? null);

      if (secondRes?.videos?.length) {
        setSecondVideos((prev) => {
          const map = new Map(prev.map((v) => [v.id, v]));
          for (const v of secondRes.videos) map.set(v.id, v);
          return Array.from(map.values());
        });
      }
      setSecondPageToken(secondRes?.nextPageToken ?? null);
    } finally {
      setLoadingMore(false);
    }
  }

  // Build categorized lists
  const mainItems = useMemo(() => {
    return mainVideos.map((v) => ({
      ...v,
      category: categorizeMainVideo(v),
    }));
  }, [mainVideos]);

  const secondItems = useMemo(() => {
    // second channel stays fully separate — no re-categorizing
    return secondVideos.map((v) => ({
      ...v,
      category: "Second Channel" as const,
    }));
  }, [secondVideos]);

  const itemsForCategory = useMemo(() => {
    if (activeCategory === "Second Channel") return secondItems;

    // "All" = everything from both channels except Shorts
    if (activeCategory === "All") {
      return [...mainItems, ...secondItems]
        .filter((v) => !isShort(v))
        .sort(
          (a, b) =>
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime()
        );
    }

    // Green Room should include second channel Green Room too
    if (activeCategory === "Green Room") {
      return [...mainItems, ...secondItems]
        .filter((v) => !isShort(v))
        .filter((v) => isGreenRoom(v) || isGreenRoomManual(v))
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    }

    // All other category tabs are main channel only
    return mainItems.filter((v) => v.category === activeCategory);
  }, [activeCategory, mainItems, secondItems]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return itemsForCategory;

    return itemsForCategory.filter((v) => {
      return (
        formatEpisodeTitle(v.title).toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q)
      );
    });
  }, [itemsForCategory, query]);

  const counts = useMemo(() => {
    const map = new Map<Category, number>();
    for (const c of CATEGORIES) map.set(c, 0);

    for (const v of mainItems) {
      map.set(v.category as Category, (map.get(v.category as Category) || 0) + 1);
    }

    map.set("Second Channel", secondItems.length);

    // All = (main + second) minus shorts
    const allCount = [...mainItems, ...secondItems].filter((v) => !isShort(v)).length;
    map.set("All", allCount);

    // ✅ FIXED PARENTHESES: was counting manual items even if short
    map.set(
      "Green Room",
      [...mainItems, ...secondItems].filter(
        (v) => !isShort(v) && (isGreenRoom(v) || isGreenRoomManual(v))
      ).length
    );

    return map;
  }, [mainItems, secondItems]);

  const noMore = !mainPageToken && !secondPageToken;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 text-white">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Archive</h1>
          <p className="mt-2 text-sm text-neutral-400">
            Main channel categorized + second channel as its own tab.
          </p>
        </div>

        <Link
          href="/"
          className="w-fit rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"
        >
          ← Back Home
        </Link>
      </div>

      {/* Category Tabs */}
      <div className="mt-8 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => {
          const active = activeCategory === c;
          const count = counts.get(c) ?? 0;

          return (
            <button
              key={c}
              onClick={() => {
                setActiveCategory(c);
                setQuery("");
              }}
              className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                active
                  ? "bg-green-500 text-black"
                  : "border border-white/10 bg-neutral-950 text-white/80 hover:bg-white/5"
              }`}
            >
              {c}
              <span
                className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                  active ? "bg-black/20 text-black" : "bg-white/5 text-white/60"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${activeCategory.toLowerCase()}...`}
          className="w-full flex-1 rounded-2xl border border-white/10 bg-neutral-950 px-4 py-3 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-green-500"
        />

        <button
          onClick={() => setQuery("")}
          className="rounded-2xl border border-white/10 bg-neutral-950 px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/5"
        >
          Clear
        </button>
      </div>

      {/* Results */}
      <div className="mt-6 text-sm text-neutral-400">
        Showing <span className="font-semibold text-white">{filtered.length}</span> {activeCategory}
      </div>

      {/* Grid */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((v) => (
          <a
            key={v.id}
            href={`https://www.youtube.com/watch?v=${v.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-2xl border border-white/10 bg-neutral-950 transition hover:-translate-y-1 hover:border-green-500"
          >
            <div className="overflow-hidden rounded-t-2xl border-b border-white/10">
              <img
                src={v.thumbnail}
                alt={v.title}
                className="h-44 w-full object-cover transition group-hover:scale-[1.02]"
                loading="lazy"
              />
            </div>

            <div className="p-5">
              <div className="flex items-center justify-between gap-3 text-xs text-neutral-400">
                <span>{formatDate(v.publishedAt)}</span>

                {v.duration ? (
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                    {v.duration}
                  </span>
                ) : null}
              </div>

              <h2 className="mt-3 line-clamp-2 text-base font-extrabold">
                {formatEpisodeTitle(v.title)}
              </h2>
              <p className="mt-2 line-clamp-2 text-sm text-neutral-400">{v.description}</p>

              <div className="mt-6 text-sm font-semibold text-green-400">
                Open on YouTube →
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* ✅ Load more */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={loadMore}
          disabled={loadingMore || noMore}
          className="rounded-2xl border border-white/10 bg-neutral-950 px-6 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loadingMore ? "Loading..." : noMore ? "No more videos" : "Load more"}
        </button>
      </div>

      {/* Empty states */}
      {mainVideos.length === 0 && secondVideos.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-white/10 bg-neutral-950 p-6 text-neutral-400">
          Nothing loaded from YouTube yet. Check your API key + channel IDs.
        </div>
      ) : null}

      {filtered.length === 0 && (mainVideos.length > 0 || secondVideos.length > 0) ? (
        <div className="mt-10 rounded-2xl border border-white/10 bg-neutral-950 p-6 text-neutral-400">
          No matches in <span className="text-white">{activeCategory}</span>.
        </div>
      ) : null}
    </div>
  );
}
