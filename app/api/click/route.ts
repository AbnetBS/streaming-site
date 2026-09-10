import { NextResponse, type NextRequest } from "next/server";
import { trackClick } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { linkId } = (await req.json()) as { linkId?: string };
    if (!linkId) return NextResponse.json({ error: "linkId required" }, { status: 400 });
    trackClick(linkId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
