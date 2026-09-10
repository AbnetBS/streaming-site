import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/lib/auth";
import { fetchFixtures, type ProviderId } from "@/lib/providers";
import { createMatch, readDB } from "@/lib/db";
import type { Match } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Import real fixtures for a given date from a legal schedule provider.
 * Duplicate-safe: skips matches that already exist (same teams + kickoff minute).
 */
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { date?: string; provider?: ProviderId };
  try {
    body = (await req.json()) as { date?: string; provider?: ProviderId };
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const date = body.date;
  const provider: ProviderId = body.provider === "football-data" ? "football-data" : "thesportsdb";
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "date (YYYY-MM-DD) is required" }, { status: 400 });
  }

  let fixtures;
  try {
    fixtures = await fetchFixtures(date, provider);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Provider request failed" },
      { status: 502 }
    );
  }

  // Dedupe against existing matches
  const keyOf = (m: Pick<Match, "homeTeam" | "awayTeam" | "kickoff">) =>
    `${m.homeTeam.trim().toLowerCase()}|${m.awayTeam.trim().toLowerCase()}|${m.kickoff.slice(0, 16)}`;
  const existing = new Set(readDB().matches.map(keyOf));

  let imported = 0;
  let skipped = 0;
  const MAX_PER_IMPORT = 150;
  for (const f of fixtures) {
    const k = keyOf({ ...f, kickoff: new Date(f.kickoff).toISOString() });
    if (existing.has(k) || imported >= MAX_PER_IMPORT) {
      skipped++;
      continue;
    }
    existing.add(k);
    createMatch(f);
    imported++;
  }

  return NextResponse.json({
    imported,
    skipped,
    providerTotal: fixtures.length,
    provider,
    date,
  });
}
