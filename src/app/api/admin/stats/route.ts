import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { sql } from "@/lib/db";
import { ensureSchema } from "@/lib/account";

export const runtime = "nodejs";

// Same lightweight passcode gate as the other internal Fabrick tools.
// Override with PULSE_ADMIN_PASSCODE on Vercel if it ever needs rotating.
const PASSCODE = process.env.PULSE_ADMIN_PASSCODE ?? "fabrick2026";

function passcodeMatches(candidate: string): boolean {
  const a = Buffer.from(candidate);
  const b = Buffer.from(PASSCODE);
  return a.length === b.length && timingSafeEqual(a, b);
}

interface StatsPayload {
  passcode?: unknown;
}

export async function POST(req: NextRequest) {
  let body: StatsPayload;
  try {
    body = (await req.json()) as StatsPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const passcode = typeof body.passcode === "string" ? body.passcode : "";
  if (!passcodeMatches(passcode)) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  try {
    await ensureSchema();

    const accountTotals = (await sql`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int AS new_7d,
        COUNT(*) FILTER (WHERE last_login_at >= NOW() - INTERVAL '7 days')::int AS active_7d
      FROM pulse_users
    `) as unknown as Array<{ total: number; new_7d: number; active_7d: number }>;

    const recentAccounts = (await sql`
      SELECT name, email::text AS email, role, created_at
      FROM pulse_users
      WHERE created_at >= NOW() - INTERVAL '7 days'
      ORDER BY created_at DESC
      LIMIT 100
    `) as unknown as Array<{
      name: string | null;
      email: string;
      role: string;
      created_at: string;
    }>;

    const subscriberTotals = (await sql`
      SELECT COUNT(*)::int AS total, COALESCE(MAX(id), 0)::int AS max_id
      FROM data_point_subscribers
      WHERE email NOT ILIKE '%@example.com'
    `) as unknown as Array<{ total: number; max_id: number }>;

    const recentSubscribers = (await sql`
      SELECT id, email, source
      FROM data_point_subscribers
      WHERE email NOT ILIKE '%@example.com'
      ORDER BY id DESC
      LIMIT 50
    `) as unknown as Array<{ id: number; email: string; source: string | null }>;

    // data_point_subscribers predates the repo and may not carry created_at;
    // callers fall back to id watermarks when this comes back null.
    let subscribersNew7d: number | null = null;
    try {
      const rows = (await sql`
        SELECT COUNT(*)::int AS n
        FROM data_point_subscribers
        WHERE created_at >= NOW() - INTERVAL '7 days'
          AND email NOT ILIKE '%@example.com'
      `) as unknown as Array<{ n: number }>;
      subscribersNew7d = rows[0]?.n ?? null;
    } catch {
      subscribersNew7d = null;
    }

    let pollTotal = 0;
    let pollNew7d = 0;
    try {
      const rows = (await sql`
        SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int AS new_7d
        FROM pulse_poll_responses
      `) as unknown as Array<{ total: number; new_7d: number }>;
      pollTotal = rows[0]?.total ?? 0;
      pollNew7d = rows[0]?.new_7d ?? 0;
    } catch {
      // Poll table is created lazily on first response; absent means zero.
    }

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      accounts: {
        total: accountTotals[0]?.total ?? 0,
        new7d: accountTotals[0]?.new_7d ?? 0,
        activeLast7d: accountTotals[0]?.active_7d ?? 0,
        recent: recentAccounts,
      },
      newsletter: {
        total: subscriberTotals[0]?.total ?? 0,
        maxId: subscriberTotals[0]?.max_id ?? 0,
        new7d: subscribersNew7d,
        recent: recentSubscribers,
      },
      poll: {
        total: pollTotal,
        new7d: pollNew7d,
      },
    });
  } catch (err) {
    console.error("admin/stats failed", err);
    return NextResponse.json({ error: "Stats query failed" }, { status: 500 });
  }
}
