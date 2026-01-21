import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

function clamp10(n: number) {
  return Math.max(1, Math.min(10, n));
}

type Ratings = {
  overall: number;
  banter: number;
  knowledge: number;
  hotTakes: number;
  energy: number;
  reaction?: string;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const episodeId = searchParams.get("episodeId");

  if (!episodeId) {
    return NextResponse.json({ error: "Missing episodeId" }, { status: 400 });
  }

  const { data, error } = await supabaseServer
    .from("sds_votes")
    .select("votes")
    .eq("episode_id", episodeId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = data ?? [];
  const totalVotes = rows.length;

  // votes JSON looks like: { Sharky: {...}, Faysal: {...}, ... }
  const sums: Record<string, any> = {};
  const counts: Record<string, number> = {};

  for (const row of rows) {
    const voteObj = row.votes as Record<string, Ratings>;
    for (const [crewKey, r] of Object.entries(voteObj)) {
      if (!sums[crewKey]) {
        sums[crewKey] = { overall: 0, banter: 0, knowledge: 0, hotTakes: 0, energy: 0 };
        counts[crewKey] = 0;
      }
      sums[crewKey].overall += clamp10(Number(r.overall));
      sums[crewKey].banter += clamp10(Number(r.banter));
      sums[crewKey].knowledge += clamp10(Number(r.knowledge));
      sums[crewKey].hotTakes += clamp10(Number(r.hotTakes));
      sums[crewKey].energy += clamp10(Number(r.energy));
      counts[crewKey] += 1;
    }
  }

  const averages = Object.entries(sums).map(([crewKey, s]) => {
    const c = counts[crewKey] || 1;
    return {
      key: crewKey,
      overall: s.overall / c,
      banter: s.banter / c,
      knowledge: s.knowledge / c,
      hotTakes: s.hotTakes / c,
      energy: s.energy / c,
    };
  });

  const leaderboard = averages.slice().sort((a, b) => b.overall - a.overall);
  const overallAvg =
    leaderboard.reduce((sum, r) => sum + r.overall, 0) / Math.max(1, leaderboard.length);

  const motm = leaderboard[0]?.key ?? null;

  return NextResponse.json({
    totalVotes,
    overallAvg,
    motm,
    leaderboard,
  });
}
