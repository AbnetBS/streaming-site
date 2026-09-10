import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/lib/auth";
import { createMatch } from "@/lib/db";
import type { MatchInput } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: MatchInput;
  try {
    body = (await req.json()) as MatchInput;
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const { competition, homeTeam, awayTeam, kickoff } = body;
  if (!competition?.trim() || !homeTeam?.trim() || !awayTeam?.trim() || !kickoff) {
    return NextResponse.json(
      { error: "competition, homeTeam, awayTeam and kickoff are required" },
      { status: 400 }
    );
  }
  if (Number.isNaN(new Date(kickoff).getTime())) {
    return NextResponse.json({ error: "kickoff must be a valid date" }, { status: 400 });
  }

  const match = createMatch({
    competition: competition.trim(),
    homeTeam: homeTeam.trim(),
    awayTeam: awayTeam.trim(),
    kickoff,
    status: body.status,
  });
  return NextResponse.json({ match }, { status: 201 });
}
