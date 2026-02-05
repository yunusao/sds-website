"use client";
import Link from "next/link";
import Script from "next/script";
import {useEffect, useMemo, useState} from "react";

const GOLD = "#C7A24A";
const CREAM = "#F3E6C8";

const TROPHIES = [
  { title: "Baller League UK Champions", year: "2025", badge: "🏆" },
  { title: "Baller League Runners-up", year: "2026", badge: "🥈" },
  { title: "Fairy-tale Run", year: "2025–26", badge: "⭐" },
];

const SQUAD = [
  { name: "Kazaiah Sterling", pos: "MF", number: "#45", image: "/sds-fc/kaz.webp", stats: { apps: 13, goals: 17, assists: 3 } },
  { name: "Alfie Matthews", pos: "ST", number: "#8", image: "/sds-fc/alfie.webp", stats: { apps: 9, goals: 5, assists: 1 } },
  { name: "Mauro Vilhete", pos: "MF", number: "#20", image: "/sds-fc/mauro.webp", stats: { apps: 12, goals: 2, assists: 3 } },
  { name: "Camilo Restrepo", pos: "MF", number: "#99", image: "/sds-fc/camilo.webp", stats: { apps: 5, goals: 1, assists: 2 } },
  { name: "David Marques Castanho", pos: "MF", number: "#10", image: "/sds-fc/david.webp", stats: { apps: 13, goals: 5, assists: 6 } },
  { name: "Hafed Al Droubi", pos: "GK", number: "#1", image: "/sds-fc/hafed.webp", stats: { apps: 13, goals: 1, assists: 0 } },
  { name: "Calvin Dickson", pos: "MF", number: "#12", image: "/sds-fc/calvin.webp", stats: { apps: 1, goals: 0, assists: 1 } },
  { name: "Finlay Chadwick", pos: "MF", number: "#4", image: "/sds-fc/finlay.webp", stats: { apps: 9, goals: 3, assists: 0 } },
  { name: "Michael Folivi", pos: "ST", number: "#9", image: "/sds-fc/folivi.webp", stats: { apps: 8, goals: 4, assists: 2 } },
  { name: "Youssef Chentouf", pos: "ST", number: "#11", image: "/sds-fc/youssef.webp", stats: { apps: 12, goals: 4, assists: 0 } },
  { name: "Nya Kirby", pos: "MD", number: "#5", image: "/sds-fc/nya.webp", stats: { apps: 12, goals: 4, assists: 1 } },
  { name: "Tarik Gidaree", pos: "DF", number: "#3", image: "/sds-fc/tarik.webp", stats: { apps: 6, goals: 2, assists: 0 } },
];

const TIMELINE = [
  { year: "2025", title: "Founded", text: "A team built from the community." },
  { year: "2025", title: "Champions", text: "Baller League UK title — statement season." },
  { year: "2026", title: "Runners-up", text: "Back again — deep run, big moments." },
];


export default function SdsFcPage() {
  type SofaScoreTeam = { name?: string };
  type SofaScoreScore = { current?: number };
  type SofaScoreStatus = { type?: string };

  type SofaScoreEvent = {
    startTimestamp?: number; // seconds
    homeTeam?: SofaScoreTeam;
    awayTeam?: SofaScoreTeam;
    homeScore?: SofaScoreScore;
    awayScore?: SofaScoreScore;
    status?: SofaScoreStatus;
  };

  type MatchdayResponse = {
    teamId: string;
    nextEvent: SofaScoreEvent | null;
    lastEvent: SofaScoreEvent | null;
  };

  function formatKickoff(tsSeconds?: number) {
    if (!tsSeconds) return "TBD";
    const d = new Date(tsSeconds * 1000);
    return d.toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function isFinished(e: SofaScoreEvent | null) {
    const t = e?.status?.type?.toLowerCase();
    return t === "finished" || t === "ended";
  }

  function scoreLine(e: SofaScoreEvent | null) {
    const hs = e?.homeScore?.current;
    const as = e?.awayScore?.current;
    if (typeof hs === "number" && typeof as === "number") return `${hs} — ${as}`;
    return "—";
  }

  const [matchday, setMatchday] = useState<MatchdayResponse | null>(null);
  const [matchdayLoading, setMatchdayLoading] = useState(true);
  const [matchdayError, setMatchdayError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setMatchdayLoading(true);
        setMatchdayError(null);

        const res = await fetch("/api/sdsfc/matchday", { cache: "no-store" });
        if (!res.ok) throw new Error(`API error ${res.status}`);

        const data = (await res.json()) as MatchdayResponse;
        if (!cancelled) setMatchday(data);
      } catch (err: any) {
        if (!cancelled) setMatchdayError(err?.message ?? "Failed to load matchday data");
      } finally {
        if (!cancelled) setMatchdayLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const lastEvent = matchday?.lastEvent ?? null;
  const nextEvent = matchday?.nextEvent ?? null;
  return (
    <main className="relative">
      {/* HERO */}
      <section className="relative isolate min-h-screen overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="/sds-fc/hero.webp"
            alt="SDS FC Matchday"
            className="h-full w-full object-cover"
          />
          {/* overall dark overlay */}
          <div className="absolute inset-0 bg-black/45" />
          {/* nice top glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(199,162,74,0.18),transparent_60%)]" />
          {/* stronger bottom fade so buttons pop */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/95" />
        </div>

        {/* Content area (logo + title near top/middle, not touching buttons) */}
        <div className="relative mx-auto flex min-h-screen max-w-7xl px-4 pt-28 pb-28">
          <div className="mx-auto w-full max-w-3xl text-center">
            {/* Crest/logo */}
            <div className="flex justify-center">
              <img
                src="/sds-fc/fclogo.png"
                alt="SDS FC"
                className="w-[140px] sm:w-[170px] lg:w-[190px] object-contain drop-shadow-[0_0_45px_rgba(199,162,74,0.45)]"
              />
            </div>

            {/* Title */}
            <h1 className="mt-5 text-5xl font-black tracking-tight sm:text-6xl">
              <span className="text-white">SDS</span>{" "}
              <span className="text-[#F3E6C8]">FC</span>
            </h1>

            {/* Optional: keep this short so it doesn't clutter */}
            <p className="mt-3 text-sm sm:text-base font-semibold text-white/70">
              Founded 2025 • Champions 2025 • Runners-up 2026
            </p>

            {/* Optional tagline (keep or delete) */}
            <p className="mt-4 text-xl sm:text-2xl font-extrabold text-[#F3E6C8]">
              𝐹𝑜𝓇 𝐸𝒶𝒸𝒽 𝒪𝓉𝒽𝑒𝓇. 𝐹𝑜𝓇 𝒯𝒽𝑒 𝒢𝓇𝑒𝑒𝓃 𝒜𝓇𝓂𝓎.
            </p>
          </div>
        </div>

        {/* Bottom CTA Dock (always at bottom, not cluttering) */}
        <div className="absolute inset-x-0 bottom-0">
          {/* dock backdrop */}
          <div className="mx-auto max-w-7xl px-4 pb-10">
            {/* <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-black/45 p-3 backdrop-blur-md"> */}
              <div className="flex flex-wrap justify-center gap-3">
                <a
                  href="https://www.youtube.com/@BallerLeagueUK/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-[#C7A24A] px-6 py-3 text-sm font-black text-black transition hover:brightness-110"
                >
                  Watch Highlights
                </a>

                <a
                  href="#squad"
                  className="rounded-full border border-[#C7A24A]/35 bg-white/5 px-6 py-3 text-sm font-black text-[#F3E6C8] transition hover:bg-[#C7A24A]/10"
                >
                  View Squad
                </a>

                <a
                  href="#fixtures"
                  className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-black text-white/90 transition hover:bg-white/10"
                >
                  Fixtures
                </a>
              </div>

              <div className="mt-3 text-center text-xs text-white/45">Scroll ↓</div>
            {/* </div> */}
          </div>
        </div>
      </section>


      {/* TROPHY CABINET */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white">Trophy Cabinet</h2>
            <p className="mt-2 text-sm text-white/55">Gold era. Big nights. Real moments.</p>
          </div>
          <Link
            href="/episodes"
            className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-bold text-white/75 transition hover:bg-white/10"
          >
            Browse SDS Episodes
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TROPHIES.map((t) => (
            <div
              key={t.title}
              className="rounded-2xl border border-[#C7A24A]/15 bg-[#0B0B0B] p-6 transition hover:border-[#C7A24A]/35"
            >
              <div className="flex items-center justify-between">
                <div className="text-3xl">{t.badge}</div>
                <div className="rounded-full border border-[#C7A24A]/25 bg-black/40 px-3 py-1 text-xs font-black text-[#F3E6C8]">
                  {t.year}
                </div>
              </div>
              <div className="mt-4 text-lg font-extrabold text-white">{t.title}</div>
              <div className="mt-2 text-sm text-white/55">
                A season the Green Army won’t forget.
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* MATCHDAY HUB */}
      <MatchdayHub />

      
      {/* SQUAD */}
      <section id="squad" className="mx-auto max-w-7xl px-4 pb-14">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white">Squad</h2>
            <p className="mt-2 text-sm text-white/55">FIFA-style roster (we can auto-pull later).</p>
          </div>
        </div>
        {/* Management */}
        <ManagementSection />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SQUAD.map((p) => (
            <div
              key={p.name}
              className="group overflow-hidden rounded-2xl border border-[#C7A24A]/15 bg-[#0B0B0B] transition hover:-translate-y-1 hover:border-[#C7A24A]/35"
            >
              <div className="relative h-[260px] w-full overflow-hidden">
                {/* Player photo */}
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-full w-full object-cover object-[50%_20%] transition duration-500 group-hover:scale-[1.03]"
                  loading="lazy"
                />

                {/* Dark readability overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                {/* Subtle gold aura */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(199,162,74,0.20),transparent_60%)]" />

                {/* Badges */}
                <div className="absolute bottom-4 left-4 rounded-full bg-[#C7A24A] px-3 py-1 text-xs font-black text-black">
                  {p.pos}
                </div>
              </div>
              <div className="p-5">
                <div className="text-lg font-extrabold text-white">{p.name}</div>
                <div className="mt-1 text-sm font-semibold text-[#F3E6C8]/80">{p.number}</div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                  {[
                    ["APPS", p.stats.apps],
                    ["GOALS", p.stats.goals],
                    ["ASSISTS", p.stats.assists],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-center"
                    >
                      <div className="font-black text-white">{value}</div>
                      <div className="mt-1 font-bold text-white/50">{label}</div>
                    </div>
                  ))}
                </div>


                <div className="mt-5 text-sm font-bold text-[#C7A24A]">View player →</div>
              </div>
            </div>
          ))}
        </div>
      </section>

  {/* SOCIAL HUB */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <h2 className="text-2xl font-black tracking-tight text-white">
          The Green Army
        </h2>
        <p className="mt-2 text-sm text-white/55">
          Follow the journey
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Instagram */}
          <div className="rounded-2xl border border-[#C7A24A]/15 bg-[#0B0B0B] p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-black text-white">Instagram</span>
              <a
                href="https://www.instagram.com/sdsfc_/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#C7A24A] hover:underline"
              >
                Open →
              </a>
            </div>

            <div className="overflow-hidden rounded-xl">
              <iframe
                src="https://www.instagram.com/sdsfc_/embed"
                width="100%"
                height="480"
                frameBorder="0"
                scrolling="no"
              />
            </div>
          </div>

          {/* X (Twitter) — STABLE IFRAME EMBED */}
          <div className="rounded-2xl border border-[#C7A24A]/15 bg-[#0B0B0B] p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-black text-white">X (Twitter)</span>
              <a
                href="https://x.com/SDSFootballClub"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#C7A24A] hover:underline"
              >
                Open →
              </a>
            </div>

            <div className="overflow-hidden rounded-xl bg-black">
              <TwitterTimeline />
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}

function ManagementSection() {
  return (
    <section className="mt-20">

      <div className="grid gap-8 md:grid-cols-2">
        <ManagementCard
          role="Manager"
          name="Sharky"
          image="/sds-fc/sharky.webp"
        />

        <ManagementCard1
          role="Head Coach"
          name="Gaffer Maz"
          image="/sds-fc/gaffer.png"
        />
      </div>
    </section>
  );
}


//--------------------------------------FUNCTIONS-------------------------------------------------------------------

function ManagementCard({
  role,
  name,
  image,
}: {
  role: string;
  name: string;
  image: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#c7a24a]/30 bg-black">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(199,162,74,0.35),transparent_65%)]" />

      {/* Crest watermark */}
      <img
        src="/sds-fc/logo.jpg"
        alt=""
        className="absolute right-4 top-4 w-24 opacity-10"
      />

      {/* Image */}
      <div className="relative h-[420px] overflow-hidden">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover object-top"
        />

        {/* Gradient fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>

      {/* Info */}
      <div className="relative p-6 text-center">
        <div className="text-sm uppercase tracking-widest text-[#c7a24a]">
          {role}
        </div>

        <h3 className="mt-2 text-2xl font-extrabold">{name}</h3>
      </div>
    </div>
  );
}

function ManagementCard1({
  role,
  name,
  image,
}: {
  role: string;
  name: string;
  image: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#c7a24a]/30 bg-black">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(199,162,74,0.35),transparent_65%)]" />

      {/* Crest watermark */}
      <img
        src="/sds-fc/logo.jpg"
        alt=""
        className="absolute right-4 top-4 w-24 opacity-10"
      />

      {/* Image */}
      <div className="relative h-[420px] overflow-hidden">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover object-[50%_20%]"
        />

        {/* Gradient fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>

      {/* Info */}
      <div className="relative p-6 text-center">
        <div className="text-sm uppercase tracking-widest text-[#c7a24a]">
          {role}
        </div>

        <h3 className="mt-2 text-2xl font-extrabold">{name}</h3>

      </div>
    </div>
  );
}

function formatKickoff(ts?: number) {
  if (!ts) return "TBD";
  const d = new Date(ts * 1000);
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusLabel(ev: any) {
  // Basic labels (SofaScore has more fields; keep it simple)
  if (!ev) return "Scheduled";
  if (typeof ev?.homeScore?.current === "number") return "FT";
  return "Scheduled";
}

function TwitterTimeline() {
  return (
    <div className="w-full">
      <iframe
        src="https://nitter.net/SDSFootballClub"
        width="100%"
        height="600"
        frameBorder="0"
        scrolling="yes"
        title="Twitter Timeline"
        className="rounded-xl"
      />
    </div>
  );
}

function MatchdayHub() {
  const [loading, setLoading] = useState(true);
  const [matchday, setMatchday] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/sdsfc/matchday", { cache: "no-store" });
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json?.error ?? "Failed to load matchday");
        }

        if (alive) setMatchday(json);
      } catch (e: any) {
        if (alive) setError(e?.message ?? "Failed to load matchday");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const last = matchday?.lastEvent;
  const next = matchday?.nextEvent;
  const form: Array<"W" | "D" | "L"> = matchday?.recentForm ?? [];

  return (
    <section id="fixtures" className="mx-auto max-w-7xl px-4 pb-14">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#0B0B0B] p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-white">Matchday Hub</h3>
            <span className="text-xs font-bold text-white/45">
              {loading ? "Loading…" : "From SofaScore"}
            </span>
          </div>

          {error ? (
            <div className="mt-5 rounded-2xl border border-red-500/30 bg-black/40 p-5 text-sm text-red-200">
              {error}
            </div>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {/* LATEST RESULT */}
              <div className="rounded-2xl border border-[#C7A24A]/15 bg-black/40 p-5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-white/60">LATEST RESULT</div>
                  <div className="text-xs font-bold text-white/55">
                    {statusLabel(last)}
                  </div>
                </div>

                {last ? (
                  <>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xl font-black text-white">
                      {last?.homeBadge ? (
                        <img
                          src={last.homeBadge}
                          alt={last?.homeTeam?.name ?? "Home"}
                          className="h-7 w-7 rounded-full bg-white/5"
                          loading="lazy"
                        />
                      ) : null}

                      <span className="text-white/90">
                        {last?.homeTeam?.name ?? "Home"}
                      </span>

                      <span className="text-[#C7A24A]">
                        {last?.homeScore?.current ?? "-"} — {last?.awayScore?.current ?? "-"}
                      </span>

                      <span className="text-white/90">
                        {last?.awayTeam?.name ?? "Away"}
                      </span>

                      {last?.awayBadge ? (
                        <img
                          src={last.awayBadge}
                          alt={last?.awayTeam?.name ?? "Away"}
                          className="h-7 w-7 rounded-full bg-white/5"
                          loading="lazy"
                        />
                      ) : null}
                    </div>

                    <div className="mt-2 text-sm text-white/55">
                      Final • {formatKickoff(last?.startTimestamp)}
                    </div>

                    <div className="mt-4 flex gap-2">
                      {form.length ? (
                        form.map((x, i) => (
                          <div
                            key={i}
                            className={`grid h-8 w-8 place-items-center rounded-full text-xs font-black ${
                              x === "W"
                                ? "bg-[#C7A24A] text-black"
                                : x === "D"
                                ? "bg-white/15 text-white"
                                : "bg-red-500/70 text-black"
                            }`}
                          >
                            {x}
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-white/45">
                          Form not available yet.
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="mt-3 text-sm text-white/55">
                    No result found yet.
                  </div>
                )}
              </div>

              {/* NEXT FIXTURE */}
              <div className="rounded-2xl border border-[#C7A24A]/15 bg-black/40 p-5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-white/60">NEXT FIXTURE</div>
                  <div className="text-xs font-bold text-white/55">
                    {statusLabel(next)}
                  </div>
                </div>

                {next ? (
                  <>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xl font-black text-white">
                      {next?.homeBadge ? (
                        <img
                          src={next.homeBadge}
                          alt={next?.homeTeam?.name ?? "Home"}
                          className="h-7 w-7 rounded-full bg-white/5"
                          loading="lazy"
                        />
                      ) : null}

                      <span className="text-white/90">
                        {next?.homeTeam?.name ?? "Home"}
                      </span>

                      <span className="text-[#C7A24A]">vs</span>

                      <span className="text-white/90">
                        {next?.awayTeam?.name ?? "Away"}
                      </span>

                      {next?.awayBadge ? (
                        <img
                          src={next.awayBadge}
                          alt={next?.awayTeam?.name ?? "Away"}
                          className="h-7 w-7 rounded-full bg-white/5"
                          loading="lazy"
                        />
                      ) : null}
                    </div>

                    <div className="mt-2 text-sm text-white/55">
                      Kickoff • {formatKickoff(next?.startTimestamp)}
                    </div>
                  </>
                ) : (
                  <div className="mt-3 text-sm text-white/55">
                    No upcoming fixture found yet.
                  </div>
                )}

                <a
                  href="https://www.youtube.com/@BallerLeagueUK/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex rounded-full border border-[#C7A24A]/25 bg-white/5 px-4 py-2 text-xs font-bold text-[#F3E6C8] transition hover:bg-[#C7A24A]/10"
                >
                  Watch match coverage →
                </a>
              </div>
            </div>
          )}
        </div>

        {/* right column stays as you already have it */}
        <div className="rounded-2xl border border-white/10 bg-[#0B0B0B] p-6">
          <h3 className="text-lg font-black text-white">Fan Zone</h3>
          <p className="mt-2 text-sm text-white/55">Quick polls + community energy.</p>

          <div className="mt-5 space-y-3">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <div className="text-sm font-extrabold text-white">MVP of the season?</div>
              <div className="mt-2 text-xs text-white/55">We’ll add voting next.</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <div className="text-sm font-extrabold text-white">Best SDS FC moment?</div>
              <div className="mt-2 text-xs text-white/55">Clip it. Quote it. Argue it.</div>
            </div>

            <a
              href="/community"
              className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-[#C7A24A] px-5 py-3 text-sm font-black text-black transition hover:brightness-110"
            >
              Join the Green Army →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
