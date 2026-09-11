import "server-only";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { toYouTubeEmbedUrl } from "./embed";
import type { DBData, Match, MatchInput, StreamLink, StreamLinkInput } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function uid() {
  return crypto.randomUUID();
}

/**
 * Seed data created on first boot. Kickoff times are relative to "now" so the
 * demo always shows a live match, upcoming matches and a finished one.
 *
 * NOTE: these are demo entries with example links to legal, free, official
 * sources. Replace them with your own matches/links in /admin.
 */
function seedData(): DBData {
  const now = Date.now();
  const mins = (n: number) => new Date(now + n * 60_000).toISOString();
  const hours = (n: number) => new Date(now + n * 3_600_000).toISOString();

  return {
    matches: [
      {
        id: uid(),
        competition: "Demo Super League",
        homeTeam: "Northgate United",
        awayTeam: "Riverside FC",
        kickoff: mins(-35),
        status: "live",
        broadcast: {
          label: "Also streaming free officially on FIFA+",
          url: "https://www.plus.fifa.com",
          note: "Official free stream — example affiliate/official slot",
        },
        links: [
          {
            id: uid(),
            label: "Official free stream (example)",
            url: "https://www.plus.fifa.com",
            quality: "HD",
            language: "EN",
            embeddable: false,
            clicks: 0,
            createdAt: new Date().toISOString(),
          },
          {
            id: uid(),
            label: "Embedded demo player",
            url: "https://player.vimeo.com/video/76979871?h=8272103f5f",
            quality: "SD",
            language: "EN",
            embeddable: true,
            clicks: 0,
            createdAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
      },
      {
        id: uid(),
        competition: "Demo Super League",
        homeTeam: "Harbor City",
        awayTeam: "Atlas FC",
        kickoff: hours(2),
        status: "scheduled",
        links: [],
        createdAt: new Date().toISOString(),
      },
      {
        id: uid(),
        competition: "Demo Cup",
        homeTeam: "Ironside SC",
        awayTeam: "Northgate United",
        kickoff: hours(26),
        status: "scheduled",
        links: [],
        createdAt: new Date().toISOString(),
      },
      {
        id: uid(),
        competition: "Demo Super League",
        homeTeam: "Atlas FC",
        awayTeam: "Ironside SC",
        kickoff: hours(-20),
        status: "finished",
        links: [
          {
            id: uid(),
            label: "Full match replay (example)",
            url: "https://www.plus.fifa.com",
            quality: "HD",
            language: "EN",
            embeddable: false,
            clicks: 0,
            createdAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

export function readDB(): DBData {
  ensureDir();
  if (!fs.existsSync(DB_PATH)) {
    const seeded = seedData();
    writeDB(seeded);
    return seeded;
  }
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, "utf-8")) as DBData;
  } catch {
    const seeded = seedData();
    writeDB(seeded);
    return seeded;
  }
}

export function writeDB(data: DBData) {
  ensureDir();
  const tmp = DB_PATH + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tmp, DB_PATH);
}

export function listMatches(): Match[] {
  return readDB().matches.sort(
    (a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()
  );
}

export function getMatch(id: string): Match | undefined {
  return readDB().matches.find((m) => m.id === id);
}

export function createMatch(input: MatchInput): Match {
  const db = readDB();
  const match: Match = {
    id: uid(),
    competition: input.competition,
    homeTeam: input.homeTeam,
    awayTeam: input.awayTeam,
    kickoff: new Date(input.kickoff).toISOString(),
    status: input.status ?? "scheduled",
    links: [],
    createdAt: new Date().toISOString(),
  };
  db.matches.push(match);
  writeDB(db);
  return match;
}

export function updateMatch(
  id: string,
  patch: Partial<
    Pick<Match, "competition" | "homeTeam" | "awayTeam" | "kickoff" | "status" | "broadcast">
  >
): Match | undefined {
  const db = readDB();
  const match = db.matches.find((m) => m.id === id);
  if (!match) return undefined;
  if (patch.competition !== undefined) match.competition = patch.competition;
  if (patch.homeTeam !== undefined) match.homeTeam = patch.homeTeam;
  if (patch.awayTeam !== undefined) match.awayTeam = patch.awayTeam;
  if (patch.kickoff !== undefined) match.kickoff = new Date(patch.kickoff).toISOString();
  if (patch.status !== undefined) match.status = patch.status;
  if (patch.broadcast !== undefined) match.broadcast = patch.broadcast;
  writeDB(db);
  return match;
}

export function deleteMatch(id: string): boolean {
  const db = readDB();
  const before = db.matches.length;
  db.matches = db.matches.filter((m) => m.id !== id);
  writeDB(db);
  return db.matches.length < before;
}

export function addStreamLink(matchId: string, input: StreamLinkInput): StreamLink | undefined {
  const db = readDB();
  const match = db.matches.find((m) => m.id === matchId);
  if (!match) return undefined;
  const link: StreamLink = {
    id: uid(),
    label: input.label,
    url: input.url,
    quality: input.quality || "HD",
    language: input.language || "EN",
    embeddable: input.embeddable ?? false,
    clicks: 0,
    createdAt: new Date().toISOString(),
  };
  match.links.push(link);
  writeDB(db);
  return link;
}

export function deleteStreamLink(linkId: string): boolean {
  const db = readDB();
  let found = false;
  for (const m of db.matches) {
    const before = m.links.length;
    m.links = m.links.filter((l) => l.id !== linkId);
    if (m.links.length < before) {
      found = true;
      break;
    }
  }
  if (found) writeDB(db);
  return found;
}

export function trackClick(linkId: string): boolean {
  const db = readDB();
  let found = false;
  for (const m of db.matches) {
    const link = m.links.find((l) => l.id === linkId);
    if (link) {
      link.clicks += 1;
      found = true;
      break;
    }
  }
  if (found) writeDB(db);
  return found;
}
