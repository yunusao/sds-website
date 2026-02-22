// src/app/api/sdsfc/matchday/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 600; // cache 10 minutes on Vercel

function okJson(data: unknown) {
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "s-maxage=600, stale-while-revalidate=600",
    },
  });
}

/** Sofascore team badge endpoint (works well in <img src="...">) */
function teamBadgeUrl(teamId?: number) {
  if (!teamId) return null;
  return `https://api.sofascore.app/api/v1/team/${teamId}/image`;
}

function decorateEvent(ev: any) {
  if (!ev) return null;
  return {
    ...ev,
    homeBadge: teamBadgeUrl(ev?.homeTeam?.id),
    awayBadge: teamBadgeUrl(ev?.awayTeam?.id),
  };
}

function isFinished(ev: any) {
  return (
    typeof ev?.homeScore?.current === "number" &&
    typeof ev?.awayScore?.current === "number"
  );
}

function outcomeForTeam(ev: any, teamIdNum: number): "W" | "D" | "L" | null {
  if (!isFinished(ev)) return null;

  const homeId = ev?.homeTeam?.id;
  const awayId = ev?.awayTeam?.id;
  const hs = ev?.homeScore?.current;
  const as = ev?.awayScore?.current;

  const isHome = homeId === teamIdNum;
  const isAway = awayId === teamIdNum;
  if (!isHome && !isAway) return null;

  const teamGoals = isHome ? hs : as;
  const oppGoals = isHome ? as : hs;

  if (teamGoals > oppGoals) return "W";
  if (teamGoals < oppGoals) return "L";
  return "D";
}

const COMMON_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36",
  Accept: "application/json,text/plain,*/*",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: "https://www.sofascore.com/",
  Origin: "https://www.sofascore.com",
};

async function fetchJsonWithTimeout(url: string, ms = 8000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);

  try {
    const res = await fetch(url, {
      headers: COMMON_HEADERS,
      signal: controller.signal,
      // Don’t let Next “optimize” this in weird ways; we already cache the route response.
      cache: "no-store",
    });

    const text = await res.text();
    const json = (() => {
      try {
        return text ? JSON.parse(text) : null;
      } catch {
        return null;
      }
    })();

    return { ok: res.ok, status: res.status, text, json };
  } finally {
    clearTimeout(t);
  }
}

/**
 * Try both SofaScore hosts (Vercel IPs get blocked sometimes on one but not the other).
 */
async function fetchSofa(path: string) {
  const primary = `https://api.sofascore.com/api/v1/${path}`;
  const fallback = `https://api.sofascore.app/api/v1/${path}`;

  const a = await fetchJsonWithTimeout(primary);
  if (a.ok && a.json) return { host: "api.sofascore.com", url: primary, ...a };

  const b = await fetchJsonWithTimeout(fallback);
  if (b.ok && b.json) return { host: "api.sofascore.app", url: fallback, ...b };

  // neither worked
  return {
    host: "none",
    url: primary,
    ok: false,
    status: a.status || b.status || 0,
    text: a.text || b.text || "",
    json: null,
    debug: {
      primary: { url: primary, status: a.status, sample: (a.text || "").slice(0, 180) },
      fallback: { url: fallback, status: b.status, sample: (b.text || "").slice(0, 180) },
    },
  };
}

export async function GET() {
  const teamId = process.env.SOFASCORE_TEAM_ID;
  if (!teamId) {
    return NextResponse.json(
      { error: "Missing SOFASCORE_TEAM_ID in Vercel environment variables" },
      { status: 500 }
    );
  }

  const nextPath = `team/${teamId}/events/next/0`;
  const lastPath = `team/${teamId}/events/last/0`;

  const [nextRes, lastRes] = await Promise.all([fetchSofa(nextPath), fetchSofa(lastPath)]);

  // If last fails on Vercel (common), do NOT hard-fail the entire page.
  // Return 200 with nulls so UI stays clean + include debug for logs.
  if (!lastRes.ok || !lastRes.json) {
    return okJson({
      teamId,
      nextEvent: null,
      lastEvent: null,
      recentForm: [],
      softError: "Failed to fetch SofaScore last events",
      debug: lastRes.debug ?? {
        url: lastRes.url,
        status: lastRes.status,
        sample: (lastRes.text || "").slice(0, 180),
      },
    });
  }

  const nextJson = nextRes.ok ? nextRes.json : null;
  const lastJson = lastRes.json;

  const nextEventRaw = nextJson?.events?.[0] ?? null;

  const eventsRaw = lastJson?.events ?? [];
  const eventsSorted = [...eventsRaw].sort(
    (a: any, b: any) => (b?.startTimestamp ?? 0) - (a?.startTimestamp ?? 0)
  );

  const lastPlayed = eventsSorted.find((ev) => isFinished(ev)) ?? null;

  const teamIdNum = Number(teamId);
  const recentForm = eventsSorted
    .filter((ev) => isFinished(ev))
    .map((ev) => outcomeForTeam(ev, teamIdNum))
    .filter(Boolean)
    .slice(0, 5);

  return okJson({
    teamId,
    nextEvent: decorateEvent(nextEventRaw),
    lastEvent: decorateEvent(lastPlayed),
    recentForm,
  });
}