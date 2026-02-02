"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { YouTubeVideo } from "@/lib/youtube";
import { formatEpisodeTitle } from "@/lib/format";
import { BsDiscord, BsInstagram, BsTiktok, BsTwitterX } from "react-icons/bs";

type CrewKey = "Haseeb" | "Faysal" | "Ilyas" | "Abz";

type Ratings = {
  overall: number; // 1-10
  banter: number; // 1-10
  knowledge: number; // 1-10
  hotTakes: number; // 1-10
  energy: number; // 1-10
  reaction?: "🔥" | "🧠" | "😂" | "🟥" | "";
};

type CrewMember = {
  key: CrewKey;
  name: string;
  role: string;
  avatar: string; // /public/crew/...
};

const CREW: CrewMember[] = [
  { key: "Haseeb", name: "Haseeb", role: "Host", avatar: "/crew/haseeb.webp" },
  { key: "Faysal", name: "Faysal", role: "Panel", avatar: "/crew/faysal.webp" },
  { key: "Ilyas", name: "Ilyas", role: "Panel", avatar: "/crew/ilyas.webp" },
  { key: "Abz", name: "Abz", role: "Panel", avatar: "/crew/abz.webp" },
];

type EpisodeStats = {
  totalVotes: number;
  overallAvg: number;
  motm: CrewKey | null;
  leaderboard: Array<{
    key: CrewKey;
    overall: number;
    banter: number;
    knowledge: number;
    hotTakes: number;
    energy: number;
  }>;
};

function clamp10(n: number) {
  return Math.max(1, Math.min(10, n));
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function RatingChip({ value }: { value: number }) {
  const v = clamp10(value);
  const tone = v >= 8 ? "bg-green-500 text-black" : v >= 6 ? "bg-yellow-400 text-black" : "bg-red-500 text-black";

  return (
    <div className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-black ${tone}`}>
      {v.toFixed(1)}
    </div>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10 hover:text-white hover:ring-2 hover:ring-green-500/40"
    >
      {children}
    </a>
  );
}

export default function SDSScoreClient({ latestVideo }: { latestVideo: YouTubeVideo | null }) {
  const youtubeVideoId = latestVideo?.id ?? "";
  const episodeTitle = latestVideo?.title ? formatEpisodeTitle(latestVideo.title) : "Latest episode coming soon";
  const episodeDate = latestVideo?.publishedAt ? formatDate(latestVideo.publishedAt) : "—";

  // Local sliders (your personal vote before submitting)
  const [votes, setVotes] = useState<Record<CrewKey, Ratings>>({
    Haseeb: { overall: 8, banter: 8, knowledge: 7, hotTakes: 7, energy: 9, reaction: "" },
    Faysal: { overall: 7, banter: 9, knowledge: 6, hotTakes: 7, energy: 8, reaction: "" },
    Ilyas: { overall: 7, banter: 7, knowledge: 7, hotTakes: 8, energy: 7, reaction: "" },
    Abz: { overall: 6, banter: 6, knowledge: 8, hotTakes: 6, energy: 6, reaction: "" },
  });

  // Email + submit state
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Real DB-backed stats
  const [stats, setStats] = useState<EpisodeStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  function updateCrew(k: CrewKey, patch: Partial<Ratings>) {
    setVotes((prev) => ({
      ...prev,
      [k]: { ...prev[k], ...patch },
    }));
  }

  function isValidEmail(s: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
  }

  async function fetchStats() {
    if (!youtubeVideoId) return;

    setLoadingStats(true);
    try {
      const res = await fetch(`/api/episode-stats?episodeId=${encodeURIComponent(youtubeVideoId)}`);
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data?.error || "Failed to load stats.");
        setLoadingStats(false);
        return;
      }

      setStats(data);
      setErrorMsg("");
    } catch {
      setErrorMsg("Failed to load stats.");
    } finally {
      setLoadingStats(false);
    }
  }

  useEffect(() => {
    // auto-load stats whenever we have an episode id
    if (youtubeVideoId) fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [youtubeVideoId]);

  async function submitVote() {
    setErrorMsg("");

    if (!youtubeVideoId) {
      setErrorMsg("No episode loaded yet.");
      return;
    }

    if (!isValidEmail(email)) {
      setErrorMsg("Please enter a valid email.");
      return;
    }

    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          episodeId: youtubeVideoId,
          email,
          votes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data?.error || "Failed to submit vote.");
        return;
      }

      setSubmitted(true);
      await fetchStats();
      setTimeout(() => setSubmitted(false), 2000);
    } catch {
      setErrorMsg("Failed to submit vote.");
    }
  }

  // Fallback (if stats not loaded yet): compute a local leaderboard from the current slider values
  const localLeaderboard = useMemo(() => {
    return (Object.entries(votes) as Array<[CrewKey, Ratings]>)
      .map(([k, r]) => ({
        key: k,
        overall: clamp10(r.overall),
        banter: clamp10(r.banter),
        knowledge: clamp10(r.knowledge),
        hotTakes: clamp10(r.hotTakes),
        energy: clamp10(r.energy),
      }))
      .sort((a, b) => b.overall - a.overall);
  }, [votes]);

  const shownLeaderboard = stats?.leaderboard?.length ? stats.leaderboard : localLeaderboard;
  const shownTotalVotes = stats?.totalVotes ?? 0;
  const shownOverallAvg = stats?.overallAvg ?? (shownLeaderboard.reduce((s, r) => s + r.overall, 0) / Math.max(1, shownLeaderboard.length));
  const shownMotm = stats?.motm ?? (shownLeaderboard[0]?.key ?? null);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Top bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-white/80">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              SDS SCORE • FAN RATINGS
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{episodeTitle}</h1>
            <p className="mt-2 text-sm text-neutral-400">FIFA-style ratings • matchday vibes • banter accountability</p>
          </div>

          <Link
            href="/"
            className="w-fit rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"
          >
            ← Back Home
          </Link>
        </div>

        {/* Matchday header card */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Episode / video */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 lg:col-span-2">
            <div className="border-b border-white/10 p-5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-white/70">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-semibold">{episodeDate}</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-semibold">Latest from SDS</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-semibold">Rate the crew</span>
              </div>

              <div className="mt-4 text-lg font-extrabold">Watch & rate the episode</div>
              <div className="mt-1 text-sm text-neutral-400">This pulls automatically from the main channel.</div>
            </div>

            <div className="aspect-video w-full bg-black">
              {youtubeVideoId ? (
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                  title="YouTube player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="grid h-full place-items-center text-sm text-white/50">Latest episode coming soon.</div>
              )}
            </div>
          </div>

          {/* Scoreboard */}
          <div className="rounded-2xl border border-white/10 bg-neutral-950 p-5">
            <div className="text-sm font-bold text-white/70">Scoreboard</div>

            <div className="mt-4 flex items-end justify-between">
              <div>
                <div className="text-5xl font-black">{loadingStats ? "…" : shownOverallAvg.toFixed(1)}</div>
                <div className="mt-1 text-xs font-semibold text-neutral-400">Episode average</div>
              </div>

              <div className="text-right">
                <div className="text-lg font-extrabold text-white">{loadingStats ? "…" : shownTotalVotes.toLocaleString()}</div>
                <div className="text-xs font-semibold text-neutral-400">Total votes</div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className="text-xs font-bold text-white/70">MOTM</div>
              <div className="mt-2 flex items-center justify-between">
                <div className="text-base font-extrabold">{shownMotm ?? "—"}</div>
                <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-black text-black">PLAYER OF EPISODE</span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <div className="text-xs font-semibold text-white/60">Follow / join</div>
              <div className="flex gap-2">
                <SocialIcon href="https://www.instagram.com/sdspod" label="Instagram">
                  <BsInstagram />
                </SocialIcon>
                <SocialIcon href="https://discord.gg/xpPQUPFWTE" label="Discord">
                  <BsDiscord />
                </SocialIcon>
                <SocialIcon href="https://x.com/sds_pod" label="X">
                  <BsTwitterX />
                </SocialIcon>
                <SocialIcon href="https://www.tiktok.com/@sdspod" label="TikTok">
                  <BsTiktok />
                </SocialIcon>
              </div>
            </div>
          </div>
        </div>

        {/* Player cards */}
        <div className="mt-10">
          <h2 className="text-xl font-black tracking-tight">Rate the Crew</h2>
          <p className="mt-1 text-sm text-neutral-400">FIFA-style cards: overall + attributes + quick reactions.</p>

          <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {CREW.map((m) => {
              const r = votes[m.key];
              const isMotm = shownMotm === m.key;

              return (
                <div
                  key={m.key}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 transition hover:-translate-y-1 hover:border-green-500"
                >
                  {/* Image */}
                  <div className="relative h-[340px] w-full overflow-hidden">
                    <img
                      src={m.avatar}
                      alt={m.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                    {/* Rating badge */}
                    <div className="absolute left-4 top-4 rounded-2xl border border-white/15 bg-black/40 px-3 py-2">
                      <div className="text-xs font-bold text-white/70">OVR</div>
                      <div className="text-2xl font-black">{clamp10(r.overall)}</div>
                    </div>

                    {isMotm ? (
                      <div className="absolute right-4 top-4 rounded-full bg-green-500 px-4 py-2 text-xs font-black text-black shadow">
                        🏆 MOTM
                      </div>
                    ) : null}

                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="text-xl font-extrabold">{m.name}</div>
                      <div className="text-sm font-semibold text-white/70">{m.role}</div>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-bold text-white/70">Overall</div>
                      <RatingChip value={r.overall} />
                    </div>

                    <input
                      type="range"
                      min={1}
                      max={10}
                      step={1}
                      value={r.overall}
                      onChange={(e) => updateCrew(m.key, { overall: Number(e.target.value) })}
                      className="mt-3 w-full accent-green-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Email + leaderboard */}
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-neutral-950 p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold">Enter Email:</h3>
                <p className="mt-1 text-sm text-neutral-400">Required (1 vote per episode).</p>
              </div>
              <button
                onClick={submitVote}
                className="rounded-full bg-green-500 px-5 py-2 text-sm font-black text-black transition hover:brightness-110"
              >
                Submit Vote
              </button>
            </div>

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              type="email"
              className="mt-4 h-14 w-full rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-green-500"
            />

            {errorMsg ? (
              <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                ❌ {errorMsg}
              </div>
            ) : null}

            {submitted ? (
              <div className="mt-4 rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-200">
                ✅ Vote submitted! Stats updated.
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-white/10 bg-neutral-950 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold">Leaderboard</h3>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-white/70">
                This episode
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {shownLeaderboard.map((row, idx) => (
                <div
                  key={row.key}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-white/5 text-xs font-black text-white/70">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="text-sm font-extrabold">{row.key}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-black">{row.overall.toFixed(1)}</div>
                    <div className="text-[10px] font-bold text-white/50">OVR</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-xs text-white/40">
              DB-backed: votes, averages, MOTM, leaderboard.
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm text-white/60">
          <Link className="rounded-full border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10" href="/episodes">
            Episodes
          </Link>
          <Link className="rounded-full border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10" href="/crew">
            Crew
          </Link>
          <Link className="rounded-full border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10" href="/community">
            Community
          </Link>
        </div>
      </div>
    </main>
  );
}
