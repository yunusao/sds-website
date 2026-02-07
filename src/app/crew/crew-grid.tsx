"use client";

import { useMemo, useState } from "react";
import { BsInstagram, BsTiktok, BsTwitterX } from "react-icons/bs";

type CrewMember = {
  name: string;
  role?: string;
  bio?: string;
  avatar?: string;
  socials?: {
    youtube?: string;
    instagram?: string;
    tiktok?: string;
    x?: string;
  };
};

const CREW: CrewMember[] = [
  {
    name: "Sharky",
    role: "Host / Founder",
    //bio: "SDS frontman. Debates, reactions, interviews, and pure chaos.",
    avatar: "/crew/sharky.webp",
    socials: {
      youtube: "https://www.youtube.com/@sharky",
      instagram: "https://www.instagram.com/ohnosharky/",
        tiktok: "https://www.tiktok.com/@sharky",
      x: "https://x.com/ohnosharky",
    },
  },
  {
    name: "Faysal",
    role: "Regular / Panel",
    //bio: "Banter merchant with strong opinions (and stronger celebrations).",
    avatar: "/crew/faysal.webp",
    socials: {
        youtube: "https://www.youtube.com/@Elfayz",
        instagram: "https://www.instagram.com/elfayz__/",
        tiktok: "https://www.tiktok.com/@elfayz_",
        x: "https://x.com/elfayz_",
    },
  },
  {
    name: "Liban",
    role: "Regular / Panel",
    //bio: "Never ducks smoke. Always ready to argue football.",
    avatar: "/crew/liban.webp",
    socials: {
        youtube: "https://www.youtube.com/@libanldn",
      instagram: "https://www.instagram.com/libanldn/",
        tiktok: "https://www.tiktok.com/@libanldn",
        x: "https://x.com/libanldn",
    },
  },
  {
    name: "Fuad Cadani",
    role: "Regular / Panel",
    //bio: "Never ducks smoke. Always ready to argue football.",
    avatar: "/crew/fuad.webp",
    socials: {
        youtube: "https://www.youtube.com/@FuadCadani",
      instagram: "https://www.instagram.com/fuadcadani",
        tiktok: "https://www.tiktok.com/@fuadcadani",
        x: "https://x.com/fuadcadani",
    },
  },
  {
    name: "Lyes Bouzidi",
    role: "Regular / Panel",
    //bio: "Never ducks smoke. Always ready to argue football.",
    avatar: "/crew/lyes.webp",
    socials: {
        youtube: "https://www.youtube.com/@LyesClips",
      instagram: "https://www.instagram.com/lyesbouzidi10",
        tiktok: "https://www.tiktok.com/@lyesbouzidi10",
        x: "https://x.com/lyesbouzidi10",
    },
  },
  {
    name: "Ilyas Noreaga",
    role: "Regular / Panel",
    //bio: "Never ducks smoke. Always ready to argue football.",
    avatar: "/crew/ilyas.webp",
    socials: {
      instagram: "https://www.instagram.com/ilyasnoreaga/",
        tiktok: "https://www.tiktok.com/@ilyasnoreaga",
        x: "https://x.com/IlyasNoreaga",
    },
  },
  {
    name: "Haseeb",
    role: "Channel Manager / Editor",
    //bio: "Never ducks smoke. Always ready to argue football.",
    avatar: "/crew/haseeb.webp",
    socials: {
      instagram: "https://www.instagram.com/seebyk/",
        tiktok: "https://www.tiktok.com/@seebyk",
        x: "https://x.com/SeebyK",
    },
  },
  {
    name: "Fu Izzy",
    role: "Regular / Panel",
    //bio: "Never ducks smoke. Always ready to argue football.",
    avatar: "/crew/fu.webp",
    socials: {
        youtube: "https://www.youtube.com/@fu_izzy",
      instagram: "https://www.instagram.com/fu_izzy/",
        tiktok: "https://www.tiktok.com/@fu_izzy",
        x: "https://x.com/fu_izzy1",
    },
  },
  {
    name: "Abz Busquets",
    role: "Regular / Panel",
   // bio: "Never ducks smoke. Always ready to argue football.",
    avatar: "/crew/abz.webp",
    socials: {
        youtube: "https://www.youtube.com/@fu_izzy",
      instagram: "https://www.instagram.com/fu_izzy/",
        tiktok: "https://www.tiktok.com/@fu_izzy",
        x: "https://x.com/fu_izzy1",
    },
  },
  {
    name: "Starplayer",
    role: "Regular / Panel",
    //bio: "Never ducks smoke. Always ready to argue football.",
    avatar: "/crew/starplayer.webp",
    socials: {
      instagram: "https://www.instagram.com/starplayer/",
        tiktok: "https://www.tiktok.com/@_starplayer1",
        x: "https://x.com/Stxrplayer",
    },
  },
  {
    name: "Shuceeb",
    role: "Editor / Producer",
    //bio: "Never ducks smoke. Always ready to argue football.",
    avatar: "/crew/shuceeb.jpg",
    socials: {
      instagram: "https://www.instagram.com/shuceebb/",
        x: "https://x.com/isitShuceeb", 
        youtube: "https://www.youtube.com/@Shuceeb",
    },
  },
  {
    name: "Hussein",
    role: "Editor / Producer",
    //bio: "Never ducks smoke. Always ready to argue football.",
    avatar: "/crew/hussein.jpg",
    socials: {
        youtube: "https://www.youtube.com/@nxcciofficial",
      instagram: "https://www.instagram.com/nxcci",
        tiktok: "https://www.tiktok.com/@nxcci",
        x: "https://x.com/nxcci_ldn",
    },
  },
  {
    name: "Rinidie",
    role: "Regular / Panel",
   // bio: "Never ducks smoke. Always ready to argue football.",
    avatar: "/crew/rinidie.webp",
    socials: {
      instagram: "https://www.instagram.com/rozaylo_/",
        tiktok: "https://www.tiktok.com/@rozay2lo",
        x: "https://x.com/RozayLo_",
    },
  },
];

/* ---------- ICONS (official SVGs) ---------- */

function IconWrapper({
  href,
  children,
  label,
}: {
  href: string;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10 hover:text-white hover:ring-2 hover:ring-green-500/40"
    >
      {children}
    </a>
  );
}

const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
    <path d="M23.498 6.186a2.997 2.997 0 0 0-2.11-2.12C19.516 3.5 12 3.5 12 3.5s-7.516 0-9.388.566a2.997 2.997 0 0 0-2.11 2.12C0 8.066 0 12 0 12s0 3.934.502 5.814a2.997 2.997 0 0 0 2.11 2.12C4.484 20.5 12 20.5 12 20.5s7.516 0 9.388-.566a2.997 2.997 0 0 0 2.11-2.12C24 15.934 24 12 24 12s0-3.934-.502-5.814ZM9.75 15.5v-7l6.5 3.5-6.5 3.5Z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
    <path d="M12 2.2c3.2 0 3.584.012 4.85.07 1.17.056 1.97.24 2.43.403a4.9 4.9 0 0 1 1.77 1.03 4.9 4.9 0 0 1 1.03 1.77c.163.46.347 1.26.403 2.43.058 1.266.07 1.65.07 4.85s-.012 3.584-.07 4.85c-.056 1.17-.24 1.97-.403 2.43a4.9 4.9 0 0 1-1.03 1.77 4.9 4.9 0 0 1-1.77 1.03c-.46.163-1.26.347-2.43.403-1.266.058-1.65.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.056-1.97-.24-2.43-.403a4.9 4.9 0 0 1-1.77-1.03 4.9 4.9 0 0 1-1.03-1.77c-.163-.46-.347-1.26-.403-2.43C2.212 15.584 2.2 15.2 2.2 12s.012-3.584.07-4.85c.056-1.17.24-1.97.403-2.43a4.9 4.9 0 0 1 1.03-1.77 4.9 4.9 0 0 1 1.77-1.03c.46-.163 1.26-.347 2.43-.403C8.416 2.212 8.8 2.2 12 2.2Zm0 3.4a6.4 6.4 0 1 0 0 12.8 6.4 6.4 0 0 0 0-12.8Zm0 10.6a4.2 4.2 0 1 1 0-8.4 4.2 4.2 0 0 1 0 8.4Zm6.6-11.2a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
    <path d="M18.244 2H21.6l-7.334 8.387L22.8 22h-6.8l-5.317-6.91L4.8 22H1.44l7.843-8.963L1.2 2h6.8l4.8 6.247L18.244 2Zm-1.19 18h1.86L8.06 4h-1.9l10.894 16Z" />
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
    <path d="M12.525 2h3.25c.196 1.692 1.174 3.104 2.73 3.78v3.02c-1.39.04-2.78-.33-3.98-1.03v6.13c0 3.11-2.52 5.63-5.63 5.63S3.27 17.01 3.27 13.9c0-3.07 2.45-5.56 5.52-5.63v3.12a2.51 2.51 0 1 0 1.51 2.31V2Z" />
  </svg>
);

/* ---------- COMPONENT ---------- */

export default function CrewGrid() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CREW;
    return CREW.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.role || "").toLowerCase().includes(q) ||
        (m.bio || "").toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div>
      {/* Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search crew..."
          className="w-full flex-1 rounded-2xl border border-white/10 bg-neutral-950 px-4 py-3 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-green-500"
        />
        <button
          onClick={() => setQuery("")}
          className="rounded-2xl border border-white/10 bg-neutral-950 px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/5"
        >
          Clear
        </button>
      </div>

      {/* Grid */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((m) => (
          <div
            key={m.name}
            className="group overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 transition hover:-translate-y-1 hover:border-green-500"
          >
            {/* Image */}
            <div className="relative h-[360px] w-full overflow-hidden">
              <img
                src={m.avatar}
                alt={m.name}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            </div>

            {/* Info */}
            <div className="p-5">
              <h3 className="text-xl font-extrabold">{m.name}</h3>
              {m.role && (
                <div className="mt-1 text-sm font-semibold text-green-400">
                  {m.role}
                </div>
              )}
              {m.bio && (
                <p className="mt-3 text-sm leading-relaxed text-neutral-300">
                  {m.bio}
                </p>
              )}

              {/* Social icons */}
              <div className="mt-4 flex gap-3">
                {m.socials?.youtube && (
                  <IconWrapper href={m.socials.youtube} label="YouTube">
                    <YouTubeIcon />
                  </IconWrapper>
                )}
                {m.socials?.instagram && (
                  <IconWrapper href={m.socials.instagram} label="Instagram">
                    <BsInstagram />
                  </IconWrapper>
                )}
                {m.socials?.tiktok && (
                  <IconWrapper href={m.socials.tiktok} label="TikTok">
                    <BsTiktok />
                  </IconWrapper>
                )}
                {m.socials?.x && (
                  <IconWrapper href={m.socials.x} label="X">
                    <BsTwitterX />
                  </IconWrapper>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
