import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/lib/auth";
import { deleteStreamLink } from "@/lib/db";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const ok = deleteStreamLink(id);
  if (!ok) return NextResponse.json({ error: "Link not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
