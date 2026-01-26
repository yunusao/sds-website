"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FaYoutube, FaSpotify } from "react-icons/fa";
import { Menu, X } from "lucide-react";

const nav = [
  { href: "/episodes", label: "Episodes" },
  { href: "/score", label: "SDS Score" },
  { href: "/community", label: "Community" },
  { href: "/about", label: "About" },
  { href: "/crew", label: "Crew" },
  { href: "/sds-fc", label: "SDS FC" },
];

// External links
const YOUTUBE_URL = "https://www.youtube.com/@sds";
const SPOTIFY_URL = "https://open.spotify.com/show/6noh4KwZrc3dgPcJx6tN4Q";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/sds-logo.webp"
            alt="SDS Logo"
            width={140}
            height={44}
            priority
            className="h-8 w-auto sm:h-9"
          />
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Desktop nav */}
          <nav className="hidden items-center gap-2 sm:flex">
            {nav.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-white/80 transition hover:text-white"
              >
                {i.label}
              </Link>
            ))}
          </nav>

          {/* Divider */}
          <div className="hidden h-6 w-px bg-white/15 sm:block" />

          {/* YouTube */}
          <a
            href={YOUTUBE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="SDS YouTube"
            title="YouTube"
            className="group inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 transition hover:scale-105 hover:border-red-500 hover:bg-red-500/10"
          >
            <FaYoutube className="h-4 w-4 text-white transition group-hover:text-red-500" />
          </a>

          {/* Spotify */}
          <a
            href={SPOTIFY_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="SDS Spotify"
            title="Spotify"
            className="group inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 transition hover:scale-105 hover:border-green-500 hover:bg-green-500/10"
          >
            <FaSpotify className="h-4 w-4 text-white transition group-hover:text-green-500" />
          </a>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="sm:hidden inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:bg-white/10"
            aria-label="Toggle menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="sm:hidden border-t border-white/10 bg-black">
          <nav className="flex flex-col gap-1 px-4 py-4">
            {nav.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/10"
              >
                {i.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
