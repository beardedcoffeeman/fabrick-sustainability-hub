import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, destroySession } from "@/lib/account";

export const runtime = "nodejs";

export async function POST() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    try {
      await destroySession(token);
    } catch (err) {
      console.error("logout: session delete failed:", err);
    }
    store.delete(SESSION_COOKIE);
  }
  return NextResponse.json({ ok: true });
}
