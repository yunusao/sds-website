export type Episode = {
  slug: string;
  title: string;
  date: string; // ISO
  guests: string[];
  tags: string[];
  youtubeId: string; // just ID for now
  description: string;
};

export const latestEpisode: Episode = {
  slug: "hot-takes-derby",
  title: "HOT TAKES DERBY: Title race, transfers & outrageous predictions",
  date: "2026-01-10",
  guests: ["Sharky", "Faysal", "Liban"],
  tags: ["Premier League", "Transfers", "Predictions"],
  youtubeId: "dQw4w9WgXcQ",
  description:
    "Banter, bold calls, and a full breakdown of this week’s chaos. Fan call-ins and spicy debates helped too.",
};

export const highlightClips = [
  { title: "Messi vs Ronaldo debate goes OFF", youtubeId: "dQw4w9WgXcQ", tag: "Debate" },
  { title: "Wildest transfer shout of the year", youtubeId: "dQw4w9WgXcQ", tag: "Transfers" },
  { title: "Predictions segment (pure chaos)", youtubeId: "dQw4w9WgXcQ", tag: "Predictions" },
];

export const quickLinks = [
  { label: "Episodes", href: "/episodes", desc: "Searchable archive + tags" },
  { label: "SDS Score", href: "/score", desc: "Rate the newest episode" },
  { label: "Community", href: "/community", desc: "Discord + fan polls" },
  { label: "About", href: "/about", desc: "Timeline & channel history" },
  { label: "Crew", href: "/crew", desc: "Profiles + socials" },
  { label: "SDS FC", href: "/sds-fc", desc: "Different vibe. Club mode." },
];
