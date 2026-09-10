import "server-only";
import type { MatchInput, MatchStatus } from "./types";

/**
 * Fixture providers — legal sources of match schedule data.
 *
 * 1. TheSportsDB  — free tier works with the public test key "3".
 *    For better limits, get a free personal key and set THE_SPORTSDB_KEY.
 * 2. football-data.org — free tier covers major competitions
 *    (Premier League, Champions League, La Liga, ...). Sign up at
 *    https://www.football-data.org/client/register and set FOOTBALL_DATA_KEY.
 *
 * Schedules are factual data — importing them is legal. What this system
 * deliberately does NOT do is scrape stream links from other sites.
 */

export type ProviderId = "thesportsdb" | "football-data";

/* ----------------------------- TheSportsDB ----------------------------- */

interface TSDBEvent {
  idEvent: string;
  strLeague: string;
  strHomeTeam: string | null;
  strAwayTeam: string | null;
  dateEvent: string;
  strTime: string | null;
  strTimestamp: string | null;
  strStatus?: string | null;
}

function tsdbStatus(raw: string | null | undefined): MatchStatus {
  const s = (raw || "").toLowerCase();
  if (/(^|\b)(1h|2h|ht|live|in play|playing)/.test(s)) return "live";
  if (/(ft|aet|pen|finished|ended)/.test(s)) return "finished";
  return "scheduled";
}

async function fetchTheSportsDB(date: string): Promise<MatchInput[]> {
  const key = process.env.THESPORTSDB_KEY || "3";
  const url = `https://www.thesportsdb.com/api/v1/json/${key}/eventsday.php?d=${encodeURIComponent(
    date
  )}&s=Soccer`;
  const res = await fetch(url, {
    cache: "no-store",
    headers: { "User-Agent": "MatchDay/1.0 (+schedule aggregator)" },
  });
  if (!res.ok) {
    throw new Error(
      `TheSportsDB returned ${res.status}. If this persists, get a free personal key at thesportsdb.com and set THE_SPORTSDB_KEY.`
    );
  }
  const json = (await res.json()) as { events: TSDBEvent[] | null };
  const events = json.events ?? [];

  const out: MatchInput[] = [];
  for (const e of events) {
    if (!e.strHomeTeam || !e.strAwayTeam) continue;
    let kickoff: string;
    if (e.strTimestamp) {
      kickoff = new Date(e.strTimestamp.replace(" ", "T").replace(/Z?$/, "Z")).toISOString();
    } else {
      kickoff = new Date(`${e.dateEvent}T${e.strTime || "00:00:00"}`).toISOString();
    }
    if (Number.isNaN(new Date(kickoff).getTime())) continue;
    out.push({
      competition: e.strLeague || "Football",
      homeTeam: e.strHomeTeam,
      awayTeam: e.strAwayTeam,
      kickoff,
      status: tsdbStatus(e.strStatus),
    });
  }
  return out;
}

/* --------------------------- football-data.org --------------------------- */

interface FDMatch {
  id: number;
  utcDate: string;
  status: string;
  homeTeam: { name: string | null };
  awayTeam: { name: string | null };
  competition: { name: string | null };
}

function fdStatus(raw: string): MatchStatus {
  switch (raw) {
    case "IN_PLAY":
    case "PAUSED":
      return "live";
    case "FINISHED":
    case "AWARDED":
      return "finished";
    default:
      return "scheduled";
  }
}

async function fetchFootballData(date: string): Promise<MatchInput[]> {
  const key = process.env.FOOTBALL_DATA_KEY;
  if (!key) {
    throw new Error(
      "No football-data.org API key configured. Register free at football-data.org and set FOOTBALL_DATA_KEY — or use TheSportsDB."
    );
  }
  const url = `https://api.football-data.org/v4/matches?dateFrom=${date}&dateTo=${date}`;
  let res: Response;
  try {
    res = await fetch(url, { cache: "no-store", headers: { "X-Auth-Token": key } });
  } catch {
    throw new Error("Could not reach football-data.org (network error). Check this server's connection.");
  }
  if (!res.ok) {
    throw new Error(`football-data.org returned ${res.status} — check your FOOTBALL_DATA_KEY.`);
  }
  const json = (await res.json()) as { matches: FDMatch[] };
  const out: MatchInput[] = [];
  for (const m of json.matches ?? []) {
    if (!m.homeTeam?.name || !m.awayTeam?.name) continue;
    const kickoff = new Date(m.utcDate);
    if (Number.isNaN(kickoff.getTime())) continue;
    out.push({
      competition: m.competition?.name || "Football",
      homeTeam: m.homeTeam.name,
      awayTeam: m.awayTeam.name,
      kickoff: kickoff.toISOString(),
      status: fdStatus(m.status),
    });
  }
  return out;
}

/* -------------------------------- facade -------------------------------- */

export async function fetchFixtures(date: string, provider: ProviderId): Promise<MatchInput[]> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("date must be YYYY-MM-DD");
  return provider === "football-data" ? fetchFootballData(date) : fetchTheSportsDB(date);
}
