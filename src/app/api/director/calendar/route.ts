import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getCalendarEvents } from "@/lib/ms365";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  try {
    const url = new URL(req.url);
    const daysParam = url.searchParams.get("days") ?? "1";
    const days = Math.max(1, Math.min(parseInt(daysParam, 10) || 1, 14));

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + days);

    const events = await getCalendarEvents(start, end);
    return NextResponse.json({ events, generatedAt: new Date().toISOString() });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
