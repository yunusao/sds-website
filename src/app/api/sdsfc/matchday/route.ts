// src/app/api/sdsfc/matchday/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 600;

function okJson(data: unknown) {
  return NextResponse.json(data, {
    headers: { "Cache-Control": "s-maxage=600, stale-while-revalidate=600" },
  });
}

function teamBadgeUrl(teamId?: number) {
  if (!teamId) return null;
  return `https://api.sofascore.app/api/v1/team/${teamId}/image`;
}

function decorateEvent(ev: any) {
  if (!ev) return null;
  return { ...ev, homeBadge: teamBadgeUrl(ev?.homeTeam?.id), awayBadge: teamBadgeUrl(ev?.awayTeam?.id) };
}

function isFinished(ev: any) {
  return typeof ev?.homeScore?.current === "number" && typeof ev?.awayScore?.current === "number";
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

const HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36",
  Accept: "application/json,text/plain,*/*",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: "https://www.sofascore.com/",
  Origin: "https://www.sofascore.com",
};

async function fetchJson(url: string) {
  const res = await fetch(url, {
    headers: HEADERS,
    next: { revalidate: 600 },
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  return { ok: res.ok, status: res.status, text, json };
}

async function fetchSofa(path: string) {
  const primary = `https://api.sofascore.com/api/v1/${path}`;
  const fallback = `https://api.sofascore.app/api/v1/${path}`;

  const a = await fetchJson(primary);
  if (a.ok && a.json) {
    return { url: primary, ok: true, status: a.status, text: a.text, json: a.json, debug: undefined as any };
  }

  const b = await fetchJson(fallback);
  if (b.ok && b.json) {
    return { url: fallback, ok: true, status: b.status, text: b.text, json: b.json, debug: undefined as any };
  }

  return {
    url: primary,
    ok: false as const,
    status: a.status || b.status || 0,
    text: a.text || b.text || "",
    json: null as any, // IMPORTANT: always present (nullable)
    debug: {
      primary: { url: primary, status: a.status, sample: (a.text || "").slice(0, 160) },
      fallback: { url: fallback, status: b.status, sample: (b.text || "").slice(0, 160) },
    },
  };
}

/**
 * "Last known good" cache (persists while the serverless instance stays warm).
 */
type Cached = { ts: number; payload: any };
declare global {
  // eslint-disable-next-line no-var
  var __SDS_MATCHDAY_CACHE__: Cached | undefined;
}

function getCached(maxAgeMs = 1000 * 60 * 60 * 24) {
  const c = globalThis.__SDS_MATCHDAY_CACHE__;
  if (!c) return null;
  if (Date.now() - c.ts > maxAgeMs) return null;
  return c.payload;
}

function setCached(payload: any) {
  globalThis.__SDS_MATCHDAY_CACHE__ = { ts: Date.now(), payload };
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

  // If we can't fetch "last", fall back to cached “last known good” data.
  if (!lastRes.ok || !lastRes.json) {
    const cached = getCached();
    if (cached) {
      return okJson({
        ...cached,
        softError: "SofaScore blocked/rate-limited — served last known good data",
      });
    }

    return okJson({
      teamId,
      nextEvent: null,
      lastEvent: null,
      recentForm: [],
      softError: "Failed to fetch from SofaScore (last events)",
      debug: lastRes.debug ?? { url: lastRes.url, status: lastRes.status },
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

  const payload = {
    teamId,
    nextEvent: decorateEvent(nextEventRaw),
    lastEvent: decorateEvent(lastPlayed),
    recentForm,
  };

  // Save last good response
  setCached(payload);

  return okJson(payload);
}