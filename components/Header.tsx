import Link from "next/link";
import { listMatches } from "@/lib/db";

export default async function Header() {
  let liveCount = 0;
  try {
    liveCount = listMatches().filter((m) => m.status === "live").length;
  } catch {
    liveCount = 0;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-[#070b14]/85 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-accent/15 border border-accent/30">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-accent" fill="currentColor">
              <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2.2 3.1 2.25-1.18 3.64h-3.84L8.9 6.45 12 4.2ZM5.7 9.1l2.94-.02 1.2 3.66-2.98 2.2-2.4-1.75A7.8 7.8 0 0 1 5.7 9.1Zm2.14 8.6 1.13-3.5h6.06l1.13 3.5a7.83 7.83 0 0 1-8.32 0Zm9.72-2.75-2.98-2.2 1.2-3.65 2.94.02a7.8 7.8 0 0 1 1.24 4.09l-2.4 1.74Z" />
            </svg>
          </span>
          <span className="font-bold text-lg tracking-tight">
            Match<span className="text-accent">Day</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-md text-muted hover:text-white hover:bg-surface-2 transition-colors"
          >
            Matches
          </Link>
          {liveCount > 0 && (
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-live hover:bg-live/10 transition-colors font-semibold"
            >
              <span className="live-dot w-1.5 h-1.5 rounded-full bg-live" />
              {liveCount} live
            </Link>
          )}
          <Link
            href="/admin"
            className="px-3 py-1.5 rounded-md text-muted hover:text-white hover:bg-surface-2 transition-colors"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
