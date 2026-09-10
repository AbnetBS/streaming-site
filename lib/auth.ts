import "server-only";
import { cookies } from "next/headers";
import crypto from "crypto";

export const ADMIN_COOKIE = "admin_session";

function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || "admin123";
}

export function checkPassword(password: string): boolean {
  return password.length > 0 && password === adminPassword();
}

export function makeSessionToken(): string {
  return crypto.createHash("sha256").update(`matchday-admin:${adminPassword()}`).digest("hex");
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value === makeSessionToken();
}
