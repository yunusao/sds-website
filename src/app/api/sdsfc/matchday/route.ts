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

/**
 * Fetch next/last events for a team from SofaScore (unofficial endpoints).
 * Works well for "Matchday Hub" cards.
 */
export async function GET() {
  const teamId = process.env.SOFASCORE_TEAM_ID;
  if (!teamId) {
    return NextResponse.json(
      { error: "Missing SOFASCORE_TEAM_ID in .env.local" },
      { status: 500 }
    );
  }

  const nextUrl = `https://api.sofascore.com/api/v1/team/${teamId}/events/next/0`;
  const lastUrl = `https://api.sofascore.com/api/v1/team/${teamId}/events/last/0`;

  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Safari",
    Accept: "application/json",
  };

  const [nextRes, lastRes] = await Promise.all([
    fetch(nextUrl, { headers, next: { revalidate: 600 } }),
    fetch(lastUrl, { headers, next: { revalidate: 600 } }),
  ]);

  // NOTE: next endpoint sometimes 404s for some teams/tournaments.
  // We treat that as "no upcoming fixture" instead of failing the whole route.
  if (!lastRes.ok) {
    return NextResponse.json(
      {
        error: "Failed to fetch from SofaScore (last)",
        last: { url: lastUrl, status: lastRes.status, body: await lastRes.text() },
      },
      { status: 502 }
    );
  }

  const nextJson = nextRes.ok ? await nextRes.json() : null;
  const lastJson = await lastRes.json();

  const nextEventRaw = nextJson?.events?.[0] ?? null;

  // last endpoint returns a list of past events (usually newest first, but we sort safely)
  const eventsRaw = lastJson?.events ?? [];
  const eventsSorted = [...eventsRaw].sort(
    (a: any, b: any) => (b?.startTimestamp ?? 0) - (a?.startTimestamp ?? 0)
  );

  // newest finished match
  const lastPlayed = eventsSorted.find((ev) => isFinished(ev)) ?? null;

  // last 5 outcomes for this team
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
