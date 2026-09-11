export type MatchStatus = "scheduled" | "live" | "finished";

export interface StreamLink {
  id: string;
  label: string;
  url: string;
  quality: string; // "HD" | "SD" | "FHD" | free text
  language: string; // e.g. "EN", "ES", "AM"
  embeddable: boolean; // true = render in the in-page player, false = open in new tab
  clicks: number;
  createdAt: string;
}

export interface BroadcastInfo {
  label: string; // e.g. "Watch officially on DAZN"
  url: string; // official or affiliate URL
  note?: string; // e.g. "Free with account" / "Subscription required"
}

export interface Match {
  id: string;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  kickoff: string; // ISO 8601 datetime
  status: MatchStatus;
  links: StreamLink[];
  broadcast?: BroadcastInfo | null; // "where to watch officially" / affiliate slot
  createdAt: string;
}

export interface DBData {
  matches: Match[];
}

export interface StreamLinkInput {
  label: string;
  url: string;
  quality?: string;
  language?: string;
  embeddable?: boolean;
}

export interface MatchInput {
  competition: string;
  homeTeam: string;
  awayTeam: string;
  kickoff: string;
  status?: MatchStatus;
}
