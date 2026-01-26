"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

type TimelineItem = {
  dateLabel: string;
  year: number;
  title: string;
  detail?: string;
  highlight?: boolean;
  debutHighlight?: boolean;
  imageSrc?: string; // put images in /public/timeline/...
  imageAlt?: string;
};

const ITEMS: TimelineItem[] = [
  { dateLabel: "July 11, 2020", year: 2020, title: "Sharky Uploads First Ever SDS Video", detail: "Sharky does Sports", highlight: true, imageSrc: "/timeline/sdsFirstVid.jpg" },
  { dateLabel: "July 13, 2020", year: 2020, title: "Starplayers Debut", debutHighlight: true, imageSrc: "/timeline/starzFirst.jpg" },
  { dateLabel: "July 25, 2020", year: 2020, title: "Ilyas Debut", debutHighlight: true, imageSrc: "/timeline/ilyasDebut.jpg" },
  { dateLabel: "Aug 9, 2020", year: 2020, title: "Liban Debut", imageSrc: "/timeline/libanDebut.jpg" },
  { dateLabel: "Aug 28, 2020", year: 2020, title: "First SDS Episode Recorded In A Studio", detail: "Starplayer, Liban, & Ilyas", highlight: true, imageSrc: "/timeline/firstStu.jpg" },
  { dateLabel: "Sep 2, 2020", year: 2020, title: "Shaun Debut", imageSrc: "/timeline/shaunDebut.jpg" },
  { dateLabel: "Oct 6, 2020", year: 2020, title: "Haseeb Debut", debutHighlight: true, imageSrc: "/timeline/haseebDebut.png" },

  { dateLabel: "Mar 23, 2021", year: 2021, title: "First Video @ The Home Studio", highlight: true, imageSrc: "/timeline/homeStudio.png" },
  { dateLabel: "Jun 3, 2021", year: 2021, title: "First Interview On The Channel", detail: "HD Cutz", imageSrc: "/timeline/hdCutzInterview.jpg" },
  { dateLabel: "Sep 20, 2021", year: 2021, title: "Henoc Mukendi Interview", detail: "First professional footballer interview", highlight: true, imageSrc: "/timeline/henocInterview.jpg" },
  { dateLabel: "Oct 12, 2021", year: 2021, title: "Faysal Debut", debutHighlight: true, imageSrc: "/timeline/faysalDebut.png" },
  { dateLabel: "Oct 26, 2021", year: 2021, title: "Abz Busquets Debut", debutHighlight: true, imageSrc: "/timeline/abzDebut.png" },
  { dateLabel: "May 17, 2022", year: 2022, title: "Rinidie Debut", debutHighlight: true, imageSrc: "/timeline/rinidieDebut.png" },
  { dateLabel: "May 25, 2022", year: 2022, title: "Fu Izzy Debut", debutHighlight: true, imageSrc: "/timeline/fuIzzyDebut.png" },
  { dateLabel: "Aug 5, 2022", year: 2022, title: "First Episode of SDS Extra", highlight: true, imageSrc: "/timeline/sdsExtraFirst.png" },
  { dateLabel: "Aug 30, 2022", year: 2022, title: "Lyes Debut", debutHighlight: true, imageSrc: "/timeline/lyesDebut.png" },
  { dateLabel: "Feb 7, 2023", year: 2023, title: "Fuad Cadani Debut", debutHighlight: true, imageSrc: "/timeline/fuadDebut.png" },
  { dateLabel: "Mar 5, 2023", year: 2023, title: "NEW STUDIO (Current Studio)", highlight: true, imageSrc: "/timeline/currentStudio.jpg" },
  { dateLabel: "Jun 22, 2023", year: 2023, title: "First Episode of Football Mastermind", highlight: true, imageSrc: "/timeline/footballMastermind.jpg" },
  { dateLabel: "Jul 16, 2023", year: 2023, title: "Lyes Wins First Season of Football Mastermind", imageSrc: "/timeline/lyesMastermind.png" },
  { dateLabel: "Jul 26, 2023", year: 2023, title: "Live Show — Rich Mix (London, England)", detail: "Sold out", highlight: true, imageSrc: "/timeline/liveShow1.jpg" },
  { dateLabel: "Aug 2, 2023", year: 2023, title: "Rio Ferdinand episode", highlight: true, imageSrc: "/timeline/rioVid.png" },

  { dateLabel: "March 10, 2024", year: 2024, title: "Mastermind Liverpool Edition", imageSrc: "/timeline/liverpool.jpg" },
  { dateLabel: "Sep 20, 2024", year: 2024, title: "Lyes Wins Season 2 of Football Mastermind", detail: "Back-to-back champ", imageSrc: "/timeline/LyesMastermind2.png" },
  { dateLabel: "Oct 17, 2024", year: 2024, title: "Live Show 2 — Hackney Empire", detail: "1,200 seats sold out", highlight: true, imageSrc: "/timeline/liveShow2.jpg" },
  { dateLabel: "Oct 23, 2024", year: 2024, title: "First episode of Who is the Smartest SDS Member", imageSrc: "/timeline/smartestSDS.png" },
  { dateLabel: "Nov 22, 2024", year: 2024, title: "Lyes wins Who is the Smartest SDS Member", imageSrc: "/timeline/lyesWinsAgain.png" },
  { dateLabel: "Nov 24, 2024", year: 2024, title: "First Episode of The Liban & Fu show", highlight: true, imageSrc: "/timeline/libanAndFuShow.jpg" },

  { dateLabel: "Jan 13, 2025", year: 2025, title: "Ryan Babel Episode", highlight: true, imageSrc: "/timeline/ryanBabbel.png" },
  { dateLabel: "Jan 30, 2025", year: 2025, title: "Elia & Drenthe Episode", highlight: true, imageSrc: "/timeline/eliaAndDrenthe.png" },
  { dateLabel: "Feb 12, 2025", year: 2025, title: "Live Podcast @ Match for Hope (Doha, Qatar)", highlight: true, imageSrc: "/hero2.jpg" },
  { dateLabel: "Mar 28, 2025", year: 2025, title: "First Episode of Football Imposter", highlight: true, imageSrc: "/timeline/mafia.jpg" },
  { dateLabel: "May 13, 2025", year: 2025, title: "Patrice Evra Episode", highlight: true, imageSrc: "/timeline/evra.jpg" },
  { dateLabel: "Jul 25, 2025", year: 2025, title: "Live Show 3 — Rich Mix (London, England)", highlight: true, imageSrc: "/timeline/liveShow3.jpg" },
  { dateLabel: "Jul 31, 2025", year: 2025, title: "Ian Wright Episode", highlight: true, imageSrc: "/timeline/ian.jpg" },
  { dateLabel: "Aug 15, 2025", year: 2025, title: "First Episode of the SDS Call in Show", highlight: true, imageSrc: "/timeline/callinShow.jpg" },
  { dateLabel: "Nov 25, 2025", year: 2025, title: "First Episode of The Green Room", highlight: true, imageSrc: "/timeline/greenRoom.jpg" },

  { dateLabel: "Jan 13, 2026", year: 2026, title: "Musiala Episode with Nike Football", highlight: true, imageSrc: "/timeline/mus.jpg" },
];

const years = ["All", ...Array.from(new Set(ITEMS.map((i) => i.year))).sort((a, b) => a - b).map(String)] as const;

function UnifiedCard({
  item,
  index,
  isOpen,
  onToggle,
}: {
  item: TimelineItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const flip = index % 2 === 1;

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.22 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={[
        "overflow-hidden rounded-3xl border",
        item.highlight ? "border-emerald-400/20" : item.debutHighlight ? "border-orange-400/20" : "border-white/10",
        "bg-neutral-950",
      ].join(" ")}
    >
      {/* One container, responsive grid */}
      <div
        className={[
          "grid",
          "grid-cols-1",
          "lg:grid-cols-12",
          "gap-0",
        ].join(" ")}
      >
        {/* TEXT (bigger share than image) */}
        <div
          className={[
            "order-2 lg:order-none",
            flip ? "lg:order-2" : "lg:order-1",
            "lg:col-span-7",
            "p-6 sm:p-8 lg:p-10",
          ].join(" ")}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={[
                "rounded-full px-4 py-2 text-xs font-semibold",
                item.highlight ? "bg-emerald-500/10 text-emerald-300" : item.debutHighlight ? "bg-orange-500/10 text-orange-300" : "bg-white/5 text-white/60",
              ].join(" ")}
            >
              {item.dateLabel}
            </span>
            {item.highlight && (
              <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-200">
                Milestone
              </span>
            )}
            {item.debutHighlight && (
              <span className="rounded-full border border-orange-400/20 bg-orange-500/10 px-4 py-2 text-xs font-semibold text-orange-200">
                Debut
              </span>
            )}
          </div>

          <h3 className="mt-5 text-2xl font-black tracking-tight text-white sm:text-3xl">
            {item.title}
          </h3>

          {item.detail && (
            <p className="mt-3 text-base text-white/70 sm:text-lg">
              {item.detail}
            </p>
          )}

          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={onToggle}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 transition hover:border-white/20 hover:bg-white/10"
            >
              {isOpen ? "Collapse" : "Expand"}
            </button>

            <div className="text-xs text-white/40">
              {item.year}
            </div>
          </div>

          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="text-sm text-white/80">
                  Add a short story here (what changed, why it mattered), and/or a YouTube link button.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* IMAGE (slightly smaller share) */}
        <div
          className={[
            "relative",
            "order-1 lg:order-none",
            flip ? "lg:order-1" : "lg:order-2",
            "lg:col-span-5",
            "min-h-[220px] sm:min-h-[280px] lg:min-h-full",
            "border-b lg:border-b-0",
            flip ? "lg:border-r" : "lg:border-l",
            "border-white/10",
            "bg-black/40",
          ].join(" ")}
        >
          {item.imageSrc ? (
            <Image
              src={item.imageSrc}
              alt={item.imageAlt || item.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center px-6 text-sm text-white/40">
              Add image in{" "}
              <span className="mx-2 rounded bg-white/5 px-2 py-1 text-white/60">
                /public/timeline
              </span>
            </div>
          )}

          {/* overlay gradient + subtle glow */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          {item.highlight && (
            <div className="pointer-events-none absolute -inset-10 bg-emerald-500/10 blur-3xl" />
          )}
          {item.debutHighlight && (
            <div className="pointer-events-none absolute -inset-10 bg-orange-500/10 blur-3xl" />
          )}

        </div>
      </div>
    </motion.article>
  );
}

export default function AboutTimeline() {
  const [yearFilter, setYearFilter] = useState<(typeof years)[number]>("All");
  const [openKey, setOpenKey] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (yearFilter === "All") return ITEMS;
    const y = Number(yearFilter);
    return ITEMS.filter((i) => i.year === y);
  }, [yearFilter]);

  return (
    <section className="mt-14">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            SDS Timeline
          </h2>
          <p className="mt-2 text-sm text-white/60 sm:text-base">
            A look back at some of the moments in SDS history.        
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-white/60">Filter:</span>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value as any)}
            className="rounded-2xl border border-white/10 bg-neutral-950 px-4 py-3 text-sm text-white outline-none"
          >
            {years.map((y) => (
              <option key={y} value={y} className="bg-neutral-950">
                {y === "All" ? "All years" : y}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-8">
        {filtered.map((item, idx) => {
          const key = `${item.dateLabel}-${idx}`;
          const isOpen = openKey === key;

          return (
            <UnifiedCard
              key={key}
              item={item}
              index={idx}
              isOpen={isOpen}
              onToggle={() => setOpenKey(isOpen ? null : key)}
            />
          );
        })}
      </div>
    </section>
  );
}
