// src/app/api/sdsfc/matchday/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 600;

function okJson(data: unknown) {
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "s-maxage=600, stale-while-revalidate=600",
    },
  });
}

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

const HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36",
  Accept: "application/json,text/plain,*/*",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: "https://www.sofascore.com/",
  Origin: "https://www.sofascore.com",
};

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

async function fetchJson(url: string) {
  const res = await fetch(url, {
    headers: HEADERS,
    // IMPORTANT: allow Next/Vercel to cache this upstream call for 10 minutes
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

async function fetchWithRetry(url: string) {
  const first = await fetchJson(url);
  if (first.ok && first.json) return first;

  // quick retry (helps with transient 429/5xx)
  await sleep(250);
  const second = await fetchJson(url);
  return second;
}

async function fetchSofa(path: string) {
  const primary = `https://api.sofascore.com/api/v1/${path}`;
  const fallback = `https://api.sofascore.app/api/v1/${path}`;

  const a = await fetchWithRetry(primary);
  if (a.ok && a.json) return { url: primary, ...a };

  const b = await fetchWithRetry(fallback);
  if (b.ok && b.json) return { url: fallback, ...b };

  return {
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

  // If SofaScore blocks sometimes, don't hard-break your UI
  if (!lastRes.ok || !lastRes.json) {
    return okJson({
      teamId,
      nextEvent: null,
      lastEvent: null,
      recentForm: [],
      softError: "SofaScore blocked/rate-limited (last events)",
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