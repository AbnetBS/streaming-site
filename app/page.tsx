import { listMatches } from "@/lib/db";
import ScheduleBoard from "@/components/ScheduleBoard";
import AdSlot from "@/components/AdSlot";

export const dynamic = "force-dynamic";

export default function Home() {
  const matches = listMatches();

  return (
    <div className="space-y-8">
      {/* Top leaderboard ad */}
      <AdSlot format="leaderboard" slotId="home-top" className="mt-1" />

      <section>
        <div className="mb-5">
          <h1 className="text-2xl font-bold tracking-tight">Live Football Streams</h1>
          <p className="text-sm text-muted mt-1">
            Today&apos;s matches, live games and upcoming fixtures — kickoff times shown in your local
            timezone.
          </p>
        </div>

        {matches.length === 0 ? (
          <div className="rounded-xl border border-line bg-surface p-8 text-center text-muted">
            <p className="font-medium text-slate-300">No matches yet</p>
            <p className="text-sm mt-1">
              Sign in to the{" "}
              <a href="/admin" className="text-accent underline underline-offset-2">
                admin panel
              </a>{" "}
              to add matches and stream links.
            </p>
          </div>
        ) : (
          <ScheduleBoard matches={matches} />
        )}
      </section>

      <AdSlot format="billboard" slotId="home-bottom" />
    </div>
  );
}
