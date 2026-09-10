import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/lib/auth";
import { deleteMatch, updateMatch } from "@/lib/db";
import type { MatchStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  let body: {
    competition?: string;
    homeTeam?: string;
    awayTeam?: string;
    kickoff?: string;
    status?: MatchStatus;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  if (body.status && !["scheduled", "live", "finished"].includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const match = updateMatch(id, body);
  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });
  return NextResponse.json({ match });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const ok = deleteMatch(id);
  if (!ok) return NextResponse.json({ error: "Match not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
