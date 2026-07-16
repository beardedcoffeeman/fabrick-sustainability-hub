import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { Resend } from "resend";
import { sql } from "@/lib/db";
import { ensurePollTable } from "@/lib/poll-table";

export const runtime = "nodejs";

// Same Resend constraint as data-point-signup: free tier only delivers to
// the account owner's address until fabrick.agency is verified as a domain.
const NOTIFY_TO = "tom@fabrick.agency";
const NOTIFY_FROM = "onboarding@resend.dev";

const FEATURES = [
  "Grid carbon analysis",
  "Material prices",
  "Construction output",
  "Planning activity",
  "Planning explorer",
  "EPC lookup",
] as const;

const MAX_ANSWER_LENGTH = 2000;

interface PollPayload {
  feature?: unknown;
  dataWish?: unknown;
  question?: unknown;
  // Honeypot: bots fill every visible-looking field. Real users never see it.
  company?: unknown;
}

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

function cleanText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, MAX_ANSWER_LENGTH);
  return trimmed === "" ? null : trimmed;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

/**
 * Notify Tom that a poll response landed. Awaited (Vercel can kill the
 * function once the response is sent) but catches its own errors so a
 * Resend hiccup never breaks the form.
 */
async function notifyResponse(opts: {
  feature: string | null;
  dataWish: string | null;
  question: string | null;
  totalResponses: number;
}) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("RESEND_API_KEY not set — skipping notification");
    return;
  }
  try {
    const resend = new Resend(key);
    const { feature, dataWish, question, totalResponses } = opts;
    const row = (label: string, value: string | null) =>
      `<tr><td style="padding:4px 12px 4px 0;color:#666;vertical-align:top">${label}</td><td>${
        value ? escapeHtml(value) : "<em>(skipped)</em>"
      }</td></tr>`;
    const html = [
      "<p>A new Pulse poll response just came in.</p>",
      '<table style="border-collapse:collapse;font-family:sans-serif;font-size:13px">',
      row("Most useful dashboard", feature),
      row("Data they wish was easier", dataWish),
      row("Question for Pulse", question),
      row("Total responses", String(totalResponses)),
      "</table>",
      '<p style="color:#888;font-size:11px;margin-top:24px">Sent from Pulse by Fabrick — pulse.fabrick.agency/poll</p>',
    ];
    const result = await resend.emails.send({
      from: `Pulse Poll <${NOTIFY_FROM}>`,
      to: NOTIFY_TO,
      subject: `New Pulse poll response (#${totalResponses})`,
      html: html.join("\n"),
    });
    if (result.error) {
      console.error("Resend send error:", result.error);
    }
  } catch (err) {
    console.error("notifyResponse threw:", err);
  }
}

export async function POST(req: NextRequest) {
  let body: PollPayload;
  try {
    body = (await req.json()) as PollPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Honeypot: silently accept and discard. Don't tell the bot it was caught.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const feature =
    typeof body.feature === "string" &&
    (FEATURES as readonly string[]).includes(body.feature)
      ? body.feature
      : null;
  const dataWish = cleanText(body.dataWish);
  const question = cleanText(body.question);

  if (!feature && !dataWish && !question) {
    return NextResponse.json(
      { error: "Please answer at least one question before submitting." },
      { status: 400 }
    );
  }

  const userAgent = req.headers.get("user-agent")?.slice(0, 512) ?? null;
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    null;
  const ipHash = ip ? hashIp(ip) : null;

  let totalResponses: number;
  try {
    await ensurePollTable();
    await sql`
      INSERT INTO pulse_poll_responses (feature, data_wish, question, user_agent, ip_hash)
      VALUES (${feature}, ${dataWish}, ${question}, ${userAgent}, ${ipHash})
    `;
    const countRows = (await sql`
      SELECT COUNT(*)::int AS n FROM pulse_poll_responses
    `) as unknown as Array<{ n: number }>;
    totalResponses = countRows[0]?.n ?? 0;
  } catch (err) {
    console.error("poll insert failed:", err);
    return NextResponse.json(
      { error: "Could not save your response right now. Please try again." },
      { status: 500 }
    );
  }

  await notifyResponse({ feature, dataWish, question, totalResponses });

  return NextResponse.json({ ok: true });
}
