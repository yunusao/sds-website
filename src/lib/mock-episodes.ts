export type Episode = {
  slug: string;
  title: string;
  date: string; // "2026-01-10"
  guests: string[];
  tags: string[];
  youtubeId: string;
  description: string;
  duration?: string;
};

export const episodes: Episode[] = [
  {
    slug: "hot-takes-derby",
    title: "Hot Takes Derby: Title race, transfers & outrageous predictions",
    date: "2026-01-10",
    guests: ["Sharky", "Faysal", "Liban"],
    tags: ["Premier League", "Transfers", "Predictions"],
    youtubeId: "dQw4w9WgXcQ",
    description: "Banter, bold calls, and a full breakdown of this week’s chaos.",
    duration: "1:12:40",
  },
  {
    slug: "messi-ronaldo-are-we-done",
    title: "Messi vs Ronaldo: are we finally done with this debate?",
    date: "2025-12-28",
    guests: ["Sharky", "Faysal"],
    tags: ["Messi vs Ronaldo", "Debate"],
    youtubeId: "dQw4w9WgXcQ",
    description: "The debate returns with new angles, new slander, and new receipts.",
    duration: "58:12",
  },
  {
    slug: "transfer-window-madness",
    title: "Transfer Window Madness: 5 moves that would break football",
    date: "2025-12-15",
    guests: ["Sharky", "Liban"],
    tags: ["Transfers", "Hot Takes"],
    youtubeId: "dQw4w9WgXcQ",
    description: "Ridiculous signings, realistic signings, and one completely cursed shout.",
    duration: "47:05",
  },
  {
    slug: "ucl-knockout-reactions",
    title: "UCL Knockout Reactions: who’s actually winning it?",
    date: "2025-11-30",
    guests: ["Sharky", "Faysal", "Guest"],
    tags: ["Champions League", "Predictions"],
    youtubeId: "dQw4w9WgXcQ",
    description: "Match reactions + predictions + a loud argument that never ends.",
    duration: "1:05:19",
  },
];
