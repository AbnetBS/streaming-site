import { listMatches } from "@/lib/db";
import MatchCard from "@/components/MatchCard";
import AdSlot from "@/components/AdSlot";

export const dynamic = "force-dynamic";

function SectionTitle({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <h2 className="text-sm font-bold uppercase tracking-widest text-muted mb-3 flex items-center gap-2">
      {accent && <span className="text-accent">{accent}</span>}
      {children}
    </h2>
  );
}

export default function Home() {
  const matches = listMatches();
  const now = Date.now();

  const live = matches.filter((m) => m.status === "live");
  const upcoming = matches
    .filter((m) => m.status === "scheduled" && new Date(m.kickoff).getTime() >= now - 2 * 3600_000)
    .sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());
  const finished = matches
    .filter((m) => m.status === "finished")
    .sort((a, b) => new Date(b.kickoff).getTime() - new Date(a.kickoff).getTime())
    .slice(0, 6);

  // Group upcoming by calendar day (server-local date boundaries; kickoff time shown per visitor TZ)
  const byDay = new Map<string, typeof upcoming>();
  for (const m of upcoming) {
    const key = new Date(m.kickoff).toISOString().slice(0, 10);
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push(m);
  }

  const empty = matches.length === 0;

  return (
    <div className="space-y-8">
      {/* Top leaderboard ad */}
      <AdSlot format="leaderboard" slotId="home-top" className="mt-1" />

      <section>
        <div className="flex items-end justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Today&apos;s Football</h1>
            <p className="text-sm text-muted mt-1">
              Live matches and upcoming kickoffs — times shown in your local timezone.
            </p>
          </div>
        </div>

        {empty && (
          <div className="rounded-xl border border-line bg-surface p-8 text-center text-muted">
            <p className="font-medium text-slate-300">No matches yet</p>
            <p className="text-sm mt-1">
              Sign in to the <a href="/admin" className="text-accent underline underline-offset-2">admin panel</a> to add matches and stream links.
            </p>
          </div>
        )}

        {live.length > 0 && (
          <div className="mb-8">
            <SectionTitle accent="●">Live now</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {live.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          </div>
        )}

        {[...byDay.entries()].map(([day, dayMatches]) => (
          <div key={day} className="mb-8">
            <SectionTitle>
              {new Date(day + "T00:00:00Z").toLocaleDateString([], {
                weekday: "long",
                day: "numeric",
                month: "long",
                timeZone: "UTC",
              })}
            </SectionTitle>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {dayMatches.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          </div>
        ))}

        {finished.length > 0 && (
          <div>
            <SectionTitle>Recent results</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {finished.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          </div>
        )}
      </section>

      <AdSlot format="billboard" slotId="home-bottom" />
    </div>
  );
}
