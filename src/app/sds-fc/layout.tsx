import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "SDS FC",
  description: "For Each Other. For The Green Army.",
};

export default function SdsFcLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Top bar (different from main site) */}
      <header className="sticky top-0 z-50 border-b border-[#C7A24A]/15 bg-black/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <img
              src="/sds-fc/logo.jpg"
              alt="SDS FC"
              className="h-9 w-9 rounded-lg border border-[#C7A24A]/25 bg-black object-cover"
            />
            <div className="leading-tight">
              <div className="text-sm font-black tracking-wide text-[#F3E6C8]">SDS FC</div>
              <div className="text-[11px] font-semibold text-white/55">
                For Each Other. For The Green Army.
              </div>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-full border border-[#C7A24A]/25 bg-[#0B0B0B] px-4 py-2 text-xs font-bold text-[#F3E6C8] transition hover:bg-[#C7A24A]/10"
            >
              ← Back to SDS
            </Link>

            <a
              href="https://www.youtube.com/@sds"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-[#C7A24A]/25 bg-[#0B0B0B] px-4 py-2 text-xs font-bold text-[#F3E6C8] transition hover:bg-[#C7A24A]/10"
            >
              Highlights
            </a>
          </nav>
        </div>
      </header>

      {children}

      <footer className="border-t border-[#C7A24A]/10 bg-black/40">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="text-xs text-white/50">
            SDS FC Fan Page • Not affiliated with SDS • Built for the Green Army.
          </div>
        </div>
      </footer>
    </div>
  );
}
