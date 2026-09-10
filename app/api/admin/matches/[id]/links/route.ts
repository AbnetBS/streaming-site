import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/lib/auth";
import { addStreamLink } from "@/lib/db";
import type { StreamLinkInput } from "@/lib/types";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  let body: StreamLinkInput;
  try {
    body = (await req.json()) as StreamLinkInput;
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const { label, url } = body;
  if (!label?.trim() || !url?.trim()) {
    return NextResponse.json({ error: "label and url are required" }, { status: 400 });
  }
  if (!/^https?:\/\//i.test(url.trim())) {
    return NextResponse.json({ error: "url must start with http:// or https://" }, { status: 400 });
  }

  const link = addStreamLink(id, {
    label: label.trim(),
    url: url.trim(),
    quality: body.quality?.trim() || "HD",
    language: body.language?.trim() || "EN",
    embeddable: body.embeddable ?? false,
  });
  if (!link) return NextResponse.json({ error: "Match not found" }, { status: 404 });
  return NextResponse.json({ link }, { status: 201 });
}
