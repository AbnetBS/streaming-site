import { NextResponse } from "next/server";
import { listMatches } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ matches: listMatches() });
}
