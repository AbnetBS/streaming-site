"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Match, MatchStatus } from "@/lib/types";

type Tab = "yest" | "today" | "upcoming";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function localDayKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Kickoff time in visitor's local timezone (client-only to avoid hydration drift). */
function TimeText({ iso }: { iso: string }) {
  const [t, setT] = useState("");
  useEffect(() => {
    setT(new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  }, [iso]);
  return (
    <span className="tabular-nums" suppressHydrationWarning>
      {t}
    </span>
  );
}

function StatusBadge({ status }: { status: MatchStatus }) {
  if (status === "live") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-live shrink-0">
        <span className="live-dot w-1.5 h-1.5 rounded-full bg-live" />
        Live
      </span>
    );
  }
  if (status === "finished") {
    return (
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted/70 shrink-0">FT</span>
    );
  }
  return null;
}

function MatchRow({ match }: { match: Match }) {
  const hasLinks = match.links.length > 0;
  return (
    <Link
      href={`/match/${match.id}`}
      className="group flex items-center gap-3 rounded-lg border border-line bg-surface hover:border-accent/50 hover:bg-surface-2 transition-colors px-3 py-2.5"
    >
      <span className="w-12 shrink-0 text-sm text-muted">
        <TimeText iso={match.kickoff} />
      </span>
      <span className="flex-1 min-w-0 truncate text-sm">
        <span className="font-medium">{match.homeTeam}</span>
        <span className="text-muted"> vs </span>
        <span className="font-medium">{match.awayTeam}</span>
      </span>
      <StatusBadge status={match.status} />
      {hasLinks && (
        <span className="hidden sm:inline-block text-[10px] font-semibold text-muted border border-line rounded px-1.5 py-0.5 shrink-0">
          {match.links.length} link{match.links.length !== 1 ? "s" : ""}
        </span>
      )}
      <span
        className={`shrink-0 text-xs font-bold rounded-md px-2.5 py-1 border transition-colors ${
          match.status === "finished"
            ? "border-line text-muted"
            : "border-accent/50 text-accent group-hover:bg-accent group-hover:text-[#052e12]"
        }`}
      >
        {match.status === "finished" ? "Replay" : "Watch"}
      </span>
    </Link>
  );
}

export default function ScheduleBoard({ matches }: { matches: Match[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const buckets = useMemo(() => {
    const live: Match[] = [];
    const yest: Match[] = [];
    const today: Match[] = [];
    const upcoming: Match[] = [];

    const now = new Date();
    const tKey = localDayKey(now);
    const yKey = localDayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));

    for (const m of matches) {
      if (m.status === "live") {
        live.push(m);
        continue;
      }
      const k = localDayKey(new Date(m.kickoff));
      const past = new Date(m.kickoff).getTime() < now.getTime();
      if (k === tKey) today.push(m);
      else if (k === yKey || (past && k !== tKey)) yest.push(m);
      else upcoming.push(m);
    }

    const byKick = (a: Match, b: Match) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime();
    [live, yest, today, upcoming].forEach((arr) => arr.sort(byKick));
    return { live, yest, today, upcoming };
  }, [matches]);

  const [tab, setTab] = useState<Tab>(() => {
    if (buckets.today.length > 0) return "today";
    if (buckets.upcoming.length > 0) return "upcoming";
    return "yest";
  });

  if (!mounted) {
    return <div className="rounded-xl border border-line bg-surface/60 h-44 animate-pulse" aria-hidden />;
  }

  const current = buckets[tab];
  const groups = new Map<string, Match[]>();
  for (const m of current) {
    const c = m.competition || "Other";
    if (!groups.has(c)) groups.set(c, []);
    groups.get(c)!.push(m);
  }

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "yest", label: "Yesterday", count: buckets.yest.length },
    { id: "today", label: "Today", count: buckets.today.length },
    { id: "upcoming", label: "Upcoming", count: buckets.upcoming.length },
  ];

  return (
    <div className="space-y-6">
      {buckets.live.length > 0 && (
        <section aria-label="Live now">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted mb-3">
            <span className="text-live mr-1.5">●</span> Live now
          </h2>
          <div className="space-y-2">
            {buckets.live.map((m) => (
              <MatchRow key={m.id} match={m} />
            ))}
          </div>
        </section>
      )}

      <section aria-label="Schedule">
        <div className="flex items-center gap-2 mb-4">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold border transition-colors ${
                tab === t.id
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-line bg-surface text-muted hover:text-white hover:border-accent/40"
              }`}
            >
              {t.label}
              {t.count > 0 && <span className="ml-1.5 text-xs opacity-70">{t.count}</span>}
            </button>
          ))}
        </div>

        {current.length === 0 ? (
          <div className="rounded-xl border border-line bg-surface p-6 text-center text-sm text-muted">
            No matches in this list yet.
          </div>
        ) : (
          <div className="space-y-5">
            {[...groups.entries()].map(([competition, list]) => (
              <div key={competition}>
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted/80 mb-2 flex items-center gap-2">
                  <span className="w-1 h-3.5 rounded bg-accent/70 inline-block" />
                  {competition}
                </h3>
                <div className="space-y-2">
                  {list.map((m) => (
                    <MatchRow key={m.id} match={m} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
