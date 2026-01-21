import Link from "next/link";
import { getLatestVideo } from "@/lib/youtube";
import { formatEpisodeTitle } from "@/lib/format";
import { BsDiscord, BsInstagram, BsTiktok, BsTwitterX, BsX } from "react-icons/bs";

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
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/5 text-white/80 transition hover:bg-white/10 hover:text-white hover:ring-2 hover:ring-green-500/40"
    >
      {children}
    </a>
  );
}

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
    <path d="M12 2.2c3.2 0 3.584.012 4.85.07 1.17.056 1.97.24 2.43.403a4.9 4.9 0 0 1 1.77 1.03 4.9 4.9 0 0 1 1.03 1.77c.163.46.347 1.26.403 2.43.058 1.266.07 1.65.07 4.85s-.012 3.584-.07 4.85c-.056 1.17-.24 1.97-.403 2.43a4.9 4.9 0 0 1-1.03 1.77 4.9 4.9 0 0 1-1.77 1.03c-.46.163-1.26.347-2.43.403-1.266.058-1.65.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.056-1.97-.24-2.43-.403a4.9 4.9 0 0 1-1.77-1.03 4.9 4.9 0 0 1-1.03-1.77c-.163-.46-.347-1.26-.403-2.43C2.212 15.584 2.2 15.2 2.2 12s.012-3.584.07-4.85c.056-1.17.24-1.97.403-2.43a4.9 4.9 0 0 1 1.03-1.77 4.9 4.9 0 0 1 1.77-1.03c.46-.163 1.26-.347 2.43-.403C8.416 2.212 8.8 2.2 12 2.2Z" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
    <path d="M18.244 2H21.6l-7.334 8.387L22.8 22h-6.8l-5.317-6.91L4.8 22H1.44l7.843-8.963L1.2 2h6.8l4.8 6.247L18.244 2Z" />
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
    <path d="M12.525 2h3.25c.196 1.692 1.174 3.104 2.73 3.78v3.02c-1.39.04-2.78-.33-3.98-1.03v6.13c0 3.11-2.52 5.63-5.63 5.63S3.27 17.01 3.27 13.9c0-3.07 2.45-5.56 5.52-5.63v3.12a2.51 2.51 0 1 0 1.51 2.31V2Z" />
  </svg>
);

const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
    <path d="M20.317 4.369A19.791 19.791 0 0 0 15.988 3c-.19.343-.403.805-.553 1.166a18.489 18.489 0 0 0-5.87 0A12.7 12.7 0 0 0 9.012 3a19.736 19.736 0 0 0-4.329 1.369C1.942 8.5 1.5 12.479 1.7 16.411a19.898 19.898 0 0 0 6.037 3.049c.49-.668.93-1.38 1.309-2.126a12.78 12.78 0 0 1-2.063-.99c.174-.13.343-.266.506-.404a14.284 14.284 0 0 0 12.022 0c.164.138.333.274.507.404a12.55 12.55 0 0 1-2.067.99c.379.746.819 1.458 1.309 2.126a19.89 19.89 0 0 0 6.04-3.049c.232-4.558-.396-8.497-3.003-12.042ZM8.02 14.331c-1.177 0-2.134-1.082-2.134-2.415 0-1.333.94-2.416 2.134-2.416 1.193 0 2.15 1.083 2.134 2.416 0 1.333-.94 2.415-2.134 2.415Zm7.96 0c-1.177 0-2.134-1.082-2.134-2.415 0-1.333.94-2.416 2.134-2.416 1.193 0 2.15 1.083 2.134 2.416 0 1.333-.94 2.415-2.134 2.415Z" />
  </svg>
);

const accessPoints = [
  { title: "Episodes", desc: "Search the archive by guest, topic, team.", href: "/episodes" },
  { title: "SDS Score", desc: "Rate the newest episode (no login).", href: "/score" },
  { title: "Community", desc: "Join Discord + vote in fan polls.", href: "/community" },
  { title: "About", desc: "SDS history with a timeline.", href: "/about" },
  { title: "Crew", desc: "Profiles + socials for the crew.", href: "/crew" },
  { title: "SDS FC", desc: "Enter club mode (different vibe).", href: "/sds-fc" },
];

export default async function HomePage() {
  const latest = await getLatestVideo();


  return (
    <div className="w-full bg-black text-white">
      {/* FULL SCREEN HERO */}
      <section className="relative h-screen w-screen overflow-hidden">
        {/* Base black */}
        <div className="absolute inset-0 bg-black" />

        {/* Hero image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/hero.jpg)" }}
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/80" />

        {/* Hero content */}
        <div className="relative z-10 flex h-full items-center justify-center px-4">
          <div className="max-w-4xl text-center">
            <div className="mb-3 text-sm font-semibold uppercase tracking-widest text-green-400">
              +4 million views
            </div>

            <h1 className="text-4xl font-black leading-tight sm:text-6xl md:text-7xl">
              The Official Home of <br />
              <span className="italic">Football Culture</span>
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-base text-neutral-300 sm:text-lg">
              Debates, banter, reactions, predictions, and football chaos —
              all in one place.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/episodes"
                className="rounded-full bg-green-500 px-7 py-3 text-sm font-bold text-black transition hover:bg-green-400"
              >
                Watch Episodes
              </Link>

              <Link
                href="/score"
                className="rounded-full border border-white/30 px-7 py-3 text-sm font-bold transition hover:bg-white hover:text-black"
              >
                SDS Score
              </Link>

              <Link
                href="/community"
                className="rounded-full border border-white/30 px-7 py-3 text-sm font-bold transition hover:bg-white hover:text-black"
              >
                Community
              </Link>
            </div>
            {/* Social links */}
            <div className="mt-6 flex justify-center gap-4">
              <SocialIcon href="https://www.instagram.com/sdspod" label="Instagram">
                <BsInstagram/>
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

        {/* Scroll hint */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-neutral-300">
          ↓ Scroll
        </div>
      </section>

      {/* BELOW THE FOLD */}
      <main className="mx-auto max-w-6xl px-4 py-16 space-y-16">
        {/* Latest Episode */}
        {latest ? (
          <section className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-2xl font-extrabold">Latest Episode</h2>
              <p className="mt-2 text-neutral-400">Fresh from the SDS studio.</p>

              <h3 className="mt-4 text-lg font-bold">{formatEpisodeTitle(latest.title)}</h3>

              <p className="mt-2 line-clamp-4 text-neutral-400">
                {latest.description}
              </p>

              <div className="mt-4 flex gap-4">
                <a
                  className="text-green-400 hover:underline"
                  href={`https://www.youtube.com/watch?v=${latest.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open on YouTube →
                </a>

                <Link className="text-white/80 hover:text-white hover:underline" href="/episodes">
                  Browse archive →
                </Link>
              </div>
            </div>

            <div className="aspect-video w-full overflow-hidden rounded-xl border border-white/10">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${latest.id}`}
                title={latest.title}
                loading="lazy"
                allowFullScreen
              />
            </div>
          </section>
        ) : (
          <section className="rounded-2xl border border-white/10 bg-neutral-950 p-6 text-neutral-400">
            Latest episode coming soon.
          </section>
        )}

        {/* ACCESS POINTS */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-extrabold">Explore</h2>
            <p className="mt-2 text-neutral-400">
              Jump straight to the part you want.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {accessPoints.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-2xl border border-white/10 bg-neutral-950 p-6 transition hover:-translate-y-1 hover:border-green-500"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold">{item.title}</h3>
                    <p className="mt-2 text-sm text-neutral-400">{item.desc}</p>
                  </div>
                  <span className="text-xl text-white/40 transition group-hover:text-green-400">
                    ›
                  </span>
                </div>

                <div className="mt-6 text-sm font-semibold text-green-400">
                  Open →
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
