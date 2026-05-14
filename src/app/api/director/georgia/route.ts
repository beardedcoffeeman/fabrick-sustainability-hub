import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getGeorgiaActivity } from "@/lib/digital-tool";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const url = new URL(req.url);
  const daysParam = url.searchParams.get("days") ?? "30";
  const days = Math.max(1, Math.min(parseInt(daysParam, 10) || 30, 180));

  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - days);
  const iso = (d: Date) => d.toISOString().slice(0, 10);

  try {
    const rows = await getGeorgiaActivity(iso(start), iso(end));
    const totalMinutes = rows.reduce((s, r) => s + (r.duration_minutes ?? 0), 0);
    const byClient: Record<string, number> = {};
    for (const r of rows) {
      byClient[r.client] = (byClient[r.client] ?? 0) + (r.duration_minutes ?? 0);
    }
    return NextResponse.json({
      activity: rows,
      totals: {
        entries: rows.length,
        minutes: totalMinutes,
        hoursDecimal: Math.round((totalMinutes / 60) * 10) / 10,
        byClient,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
