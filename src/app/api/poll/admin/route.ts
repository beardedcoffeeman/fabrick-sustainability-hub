import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { sql } from "@/lib/db";
import { ensurePollTable } from "@/lib/poll-table";

export const runtime = "nodejs";

// Same lightweight passcode gate as the other internal Fabrick tools.
// Override with POLL_ADMIN_PASSCODE on Vercel if it ever needs rotating.
const PASSCODE = process.env.POLL_ADMIN_PASSCODE ?? "fabrick2026";

function passcodeMatches(candidate: string): boolean {
  const a = Buffer.from(candidate);
  const b = Buffer.from(PASSCODE);
  return a.length === b.length && timingSafeEqual(a, b);
}

interface AdminPayload {
  passcode?: unknown;
}

export async function POST(req: NextRequest) {
  let body: AdminPayload;
  try {
    body = (await req.json()) as AdminPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const passcode = typeof body.passcode === "string" ? body.passcode : "";
  if (!passcodeMatches(passcode)) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  try {
    await ensurePollTable();
    const responses = (await sql`
      SELECT id, feature, data_wish, question, created_at
      FROM pulse_poll_responses
      ORDER BY created_at DESC
      LIMIT 500
    `) as unknown as Array<{
      id: number;
      feature: string | null;
      data_wish: string | null;
      question: string | null;
      created_at: string;
    }>;
    const featureCounts = (await sql`
      SELECT feature, COUNT(*)::int AS n
      FROM pulse_poll_responses
      WHERE feature IS NOT NULL
      GROUP BY feature
      ORDER BY n DESC
    `) as unknown as Array<{ feature: string; n: number }>;
    return NextResponse.json({
      total: responses.length,
      featureCounts,
      responses,
    });
  } catch (err) {
    console.error("poll admin query failed:", err);
    return NextResponse.json(
      { error: "Could not load responses." },
      { status: 500 }
    );
  }
}
