import Link from "next/link";
import type { Match } from "@/lib/types";
import KickoffTime from "./KickoffTime";
import Countdown from "./Countdown";

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 3)
    .join("")
    .toUpperCase();
}

function StatusPill({ match }: { match: Match }) {
  if (match.status === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-live bg-live/10 border border-live/30 rounded-full px-2 py-0.5">
        <span className="live-dot w-1.5 h-1.5 rounded-full bg-live" />
        Live
      </span>
    );
  }
  if (match.status === "finished") {
    return (
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted bg-surface-2 border border-line rounded-full px-2 py-0.5">
        Full-time
      </span>
    );
  }
  return (
    <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-300 bg-sky-400/10 border border-sky-400/25 rounded-full px-2 py-0.5">
      Upcoming
    </span>
  );
}

export default function MatchCard({ match }: { match: Match }) {
  return (
    <Link
      href={`/match/${match.id}`}
      className="block group rounded-xl border border-line bg-surface hover:border-accent/50 hover:bg-surface-2 transition-all p-4"
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted truncate">
          {match.competition}
        </span>
        <StatusPill match={match} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="grid place-items-center w-8 h-8 rounded-md bg-surface-2 border border-line text-[11px] font-bold text-muted shrink-0">
            {initials(match.homeTeam)}
          </span>
          <span className="font-medium truncate">{match.homeTeam}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="grid place-items-center w-8 h-8 rounded-md bg-surface-2 border border-line text-[11px] font-bold text-muted shrink-0">
            {initials(match.awayTeam)}
          </span>
          <span className="font-medium truncate">{match.awayTeam}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-line/70 flex items-center justify-between text-xs text-muted">
        {match.status === "scheduled" ? (
          <span className="flex items-center gap-1.5">
            <span className="hidden sm:inline">Kickoff</span>
            <Countdown kickoff={match.kickoff} compact />
          </span>
        ) : (
          <KickoffTime iso={match.kickoff} />
        )}
        <span className="flex items-center gap-1 text-muted group-hover:text-accent transition-colors">
          {match.links.length > 0 ? `${match.links.length} stream${match.links.length > 1 ? "s" : ""}` : "Watch page"}
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
            <path
              fillRule="evenodd"
              d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z"
            />
          </svg>
        </span>
      </div>
    </Link>
  );
}
