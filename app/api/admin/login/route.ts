import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, checkPassword, makeSessionToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let password: string | undefined;
  try {
    ({ password } = (await req.json()) as { password?: string });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  if (!password || !checkPassword(password)) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, makeSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
