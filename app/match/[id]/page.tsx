import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getMatch, listMatches } from "@/lib/db";
import StreamTabs from "@/components/StreamTabs";
import Countdown from "@/components/Countdown";
import KickoffTime from "@/components/KickoffTime";
import MatchCard from "@/components/MatchCard";
import AdSlot from "@/components/AdSlot";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const match = getMatch(id);
  if (!match) return { title: "Match not found" };
  return {
    title: `${match.homeTeam} vs ${match.awayTeam} — Live Stream & Kickoff Time`,
    description: `Watch ${match.homeTeam} vs ${match.awayTeam} (${match.competition}). Kickoff time in your timezone, stream links and more.`,
  };
}

function TeamBadge({ name, align = "left" }: { name: string; align?: "left" | "right" }) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 3)
    .join("")
    .toUpperCase();
  return (
    <div className={`flex flex-col items-center gap-2 ${align === "right" ? "items-end text-right" : ""}`}>
      <span className="grid place-items-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-surface-2 border border-line text-lg font-bold text-muted">
        {initials}
      </span>
      <span className="font-semibold leading-tight sm:text-lg">{name}</span>
    </div>
  );
}

export default async function MatchPage({ params }: Props) {
  const { id } = await params;
  const match = getMatch(id);
  if (!match) notFound();

  const others = listMatches()
    .filter((m) => m.id !== match.id && m.status !== "finished")
    .slice(0, 3);

  const statusLabel =
    match.status === "live" ? "Live now" : match.status === "finished" ? "Full-time" : "Upcoming";

  return (
    <div className="space-y-6">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted hover:text-white transition-colors">
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 0 1-.02 1.06L8.832 10l3.938 3.71a.75.75 0 1 1-1.04 1.08l-4.5-4.25a.75.75 0 0 1 0-1.08l4.5-4.25a.75.75 0 0 1 1.06.02Z" />
        </svg>
        All matches
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_336px]">
        <div className="space-y-6 min-w-0">
          {/* Match header */}
          <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
            <div className="flex items-center justify-between gap-2 mb-5">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-muted">
                {match.competition}
              </span>
              <span
                className={`text-[11px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1 border ${
                  match.status === "live"
                    ? "text-live bg-live/10 border-live/30"
                    : match.status === "finished"
                      ? "text-muted bg-surface-2 border-line"
                      : "text-sky-300 bg-sky-400/10 border-sky-400/25"
                }`}
              >
                {match.status === "live" && <span className="live-dot mr-1.5 inline-block w-1.5 h-1.5 rounded-full bg-live align-middle" />}
                {statusLabel}
              </span>
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-5">
              <TeamBadge name={match.homeTeam} />
              <div className="text-center">
                <div className="text-muted text-xs font-bold uppercase tracking-widest">vs</div>
                <div className="mt-2 text-sm">
                  {match.status === "scheduled" ? (
                    <div className="space-y-1">
                      <div className="text-accent font-mono font-semibold">
                        <Countdown kickoff={match.kickoff} />
                      </div>
                      <div className="text-[11px] text-muted">until kickoff</div>
                    </div>
                  ) : (
                    <div className="text-muted text-xs">
                      <KickoffTime iso={match.kickoff} />
                    </div>
                  )}
                </div>
              </div>
              <TeamBadge name={match.awayTeam} align="right" />
            </div>

            <div className="mt-5 pt-4 border-t border-line/70 text-center text-xs text-muted">
              Kickoff: <KickoffTime iso={match.kickoff} className="text-slate-300" />
            </div>
          </div>

          {/* Streams */}
          <section aria-label="Streams">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted mb-3">
              {match.status === "finished" ? "Replays" : "Streams"} ({match.links.length})
            </h2>
            <StreamTabs match={match} />
          </section>

          {/* Where to watch officially (affiliate/official slot) */}
          {match.broadcast && (
            <a
              href={match.broadcast.url}
              target="_blank"
              rel="noopener noreferrer nofollow sponsored"
              className="block rounded-xl border border-accent/40 bg-gradient-to-r from-accent/15 to-transparent hover:from-accent/25 transition-colors p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-accent">
                    ✦ Where to watch officially
                  </p>
                  <p className="font-semibold mt-1">{match.broadcast.label}</p>
                  {match.broadcast.note && (
                    <p className="text-xs text-muted mt-0.5">{match.broadcast.note}</p>
                  )}
                </div>
                <span className="shrink-0 text-xs font-bold rounded-md border border-accent/50 text-accent px-2.5 py-1">
                  Open
                </span>
              </div>
            </a>
          )}

          <AdSlot format="inline" slotId="match-inline" />
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <AdSlot format="rectangle" slotId="match-side-1" />
          {others.length > 0 && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted mb-3">Up next</h3>
              <div className="space-y-3">
                {others.map((m) => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
