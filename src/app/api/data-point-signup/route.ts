import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { sql } from "@/lib/db";

export const runtime = "nodejs";

// RFC 5322 is brutal; this matches the same shape the browser <input type=email>
// already enforces. Good enough to reject obvious garbage.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SignupPayload {
  email?: unknown;
  source?: unknown;
  // Honeypot: bots fill every visible-looking field. Real users never see it.
  company?: unknown;
}

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

export async function POST(req: NextRequest) {
  let body: SignupPayload;
  try {
    body = (await req.json()) as SignupPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Honeypot: silently accept and discard. Don't tell the bot it was caught.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const rawEmail = typeof body.email === "string" ? body.email.trim() : "";
  if (!rawEmail || rawEmail.length > 254 || !EMAIL_RE.test(rawEmail)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  const source =
    typeof body.source === "string" && body.source.length <= 64
      ? body.source
      : "home_hero";

  const userAgent = req.headers.get("user-agent")?.slice(0, 512) ?? null;
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    null;
  const ipHash = ip ? hashIp(ip) : null;

  try {
    // ON CONFLICT keeps the endpoint idempotent: re-submitting the same email
    // is treated as success without leaking whether the address was already
    // on the list.
    await sql`
      INSERT INTO data_point_subscribers (email, source, user_agent, ip_hash)
      VALUES (${rawEmail}, ${source}, ${userAgent}, ${ipHash})
      ON CONFLICT (email) DO NOTHING
    `;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("data-point-signup insert failed:", err);
    return NextResponse.json(
      { error: "Could not save your email right now. Please try again." },
      { status: 500 }
    );
  }
}
