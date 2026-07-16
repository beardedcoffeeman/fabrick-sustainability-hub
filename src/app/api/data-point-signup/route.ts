import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { Resend } from "resend";
import { sql } from "@/lib/db";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Resend free tier only delivers to the email that owns the Resend account,
// which is tom@fabrick.agency (not tom.colgan@). Once fabrick.agency is
// verified as a sending domain in Resend, both NOTIFY_TO and NOTIFY_FROM
// can be tightened up (signups@fabrick.agency → tom.colgan@fabrick.agency).
const NOTIFY_TO = "tom@fabrick.agency";
const NOTIFY_FROM = "onboarding@resend.dev"; // Resend free-tier sandbox sender

interface SignupPayload {
  email?: unknown;
  source?: unknown;
  // Honeypot: bots fill every visible-looking field. Real users never see it.
  company?: unknown;
}

interface InsertResult {
  inserted: boolean; // false if email was already on the list
  totalSubscribers: number;
}

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

/**
 * Notify Tom that someone signed up. Fire-and-don't-wait — a Resend hiccup
 * must not break the signup form. Errors are logged for diagnosis.
 */
async function notifySignup(opts: {
  email: string;
  source: string;
  userAgent: string | null;
  ipHash: string | null;
  totalSubscribers: number;
}) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("RESEND_API_KEY not set — skipping notification");
    return;
  }
  try {
    const resend = new Resend(key);
    const { email, source, userAgent, ipHash, totalSubscribers } = opts;
    const sub = `New newsletter subscriber: ${email}`;
    const lines = [
      `<p><strong>${email}</strong> just signed up for The signal before the noise.</p>`,
      "<table style=\"border-collapse:collapse;font-family:sans-serif;font-size:13px\">",
      `<tr><td style=\"padding:4px 12px 4px 0;color:#666\">Source</td><td><code>${source}</code></td></tr>`,
      `<tr><td style=\"padding:4px 12px 4px 0;color:#666\">User-Agent</td><td><code>${userAgent ?? "(none)"}</code></td></tr>`,
      `<tr><td style=\"padding:4px 12px 4px 0;color:#666\">IP hash</td><td><code>${ipHash ?? "(none)"}</code></td></tr>`,
      `<tr><td style=\"padding:4px 12px 4px 0;color:#666\">Total subscribers</td><td><strong>${totalSubscribers.toLocaleString()}</strong></td></tr>`,
      `<tr><td style=\"padding:4px 12px 4px 0;color:#666\">When</td><td>${new Date().toUTCString()}</td></tr>`,
      "</table>",
      "<p style=\"color:#888;font-size:11px;margin-top:24px\">Sent from Pulse by Fabrick — pulse.fabrick.agency</p>",
    ];
    const result = await resend.emails.send({
      from: `Pulse Signups <${NOTIFY_FROM}>`,
      to: NOTIFY_TO,
      subject: sub,
      html: lines.join("\n"),
    });
    if (result.error) {
      console.error("Resend send error:", result.error);
    }
  } catch (err) {
    console.error("notifySignup threw:", err);
  }
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

  let result: InsertResult;
  try {
    // ON CONFLICT keeps the endpoint idempotent: re-submitting the same email
    // is treated as success without leaking whether it was already on the
    // list. RETURNING tells us whether this was a real new row, which lets
    // us suppress the notification for duplicate signups.
    const rows = (await sql`
      INSERT INTO data_point_subscribers (email, source, user_agent, ip_hash)
      VALUES (${rawEmail}, ${source}, ${userAgent}, ${ipHash})
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `) as unknown as Array<{ id: number }>;
    const countRows = (await sql`
      SELECT COUNT(*)::int AS n FROM data_point_subscribers
    `) as unknown as Array<{ n: number }>;
    result = {
      inserted: rows.length > 0,
      totalSubscribers: countRows[0]?.n ?? 0,
    };
  } catch (err) {
    console.error("data-point-signup insert failed:", err);
    return NextResponse.json(
      { error: "Could not save your email right now. Please try again." },
      { status: 500 }
    );
  }

  // Best-effort notification. We DO await it because Vercel serverless can
  // kill the function as soon as the response is sent — fire-and-forget
  // sends were getting clipped in production. notifySignup catches its own
  // errors so a Resend hiccup still returns 200 to the user.
  if (result.inserted) {
    await notifySignup({
      email: rawEmail,
      source,
      userAgent,
      ipHash,
      totalSubscribers: result.totalSubscribers,
    });
  }

  return NextResponse.json({ ok: true });
}
