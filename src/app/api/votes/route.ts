import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { episodeId, email, votes } = body;

    if (!episodeId || typeof episodeId !== "string") {
      return NextResponse.json({ error: "Missing episodeId" }, { status: 400 });
    }
    if (!email || typeof email !== "string" || !isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (!votes || typeof votes !== "object") {
      return NextResponse.json({ error: "Missing votes" }, { status: 400 });
    }

    const { error } = await supabaseServer.from("sds_votes").insert([
      {
        episode_id: episodeId,
        email: email.toLowerCase().trim(),
        votes,
      },
    ]);

    if (error) {
      // Unique violation => already voted
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "You already voted for this episode with this email." },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
