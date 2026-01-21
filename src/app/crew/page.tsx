import Link from "next/link";
import CrewGrid from "./crew-grid";

export const metadata = {
  title: "Crew | SDS Fan Hub",
  description: "Meet the SDS crew — profiles and socials.",
};

export default function CrewPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Crew</h1>
            <p className="mt-2 text-sm text-neutral-400">
              The faces behind the banter. Tap a card for socials.
            </p>
          </div>

          <Link
            href="/"
            className="w-fit rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"
          >
            ← Back Home
          </Link>
        </div>

        {/* Grid */}
        <div className="mt-8">
          <CrewGrid />
        </div>
      </div>
    </main>
  );
}
