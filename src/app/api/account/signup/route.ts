import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  EMAIL_RE,
  EmailTakenError,
  SESSION_COOKIE,
  clientIp,
  createSession,
  createUser,
  isRateLimited,
  isValidRole,
  recordFailure,
  sanitiseFavourites,
  sessionCookieOptions,
} from "@/lib/account";
import { sendOpsEmail } from "@/lib/notify";
import { sql } from "@/lib/db";

export const runtime = "nodejs";

interface SignupPayload {
  email?: unknown;
  password?: unknown;
  name?: unknown;
  role?: unknown;
  /** Anonymous localStorage prefs, migrated into the new account. */
  prefs?: { role?: unknown; favourites?: unknown };
  /** Optional Data Point newsletter opt-in (explicit checkbox). */
  subscribe?: unknown;
  /** Honeypot - real users never see this field. */
  company?: unknown;
}

export async function POST(req: NextRequest) {
  let body: SignupPayload;
  try {
    body = (await req.json()) as SignupPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Honeypot: silently accept and discard.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const ip = clientIp(req);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again in a few minutes." },
      { status: 429 },
    );
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const password = typeof body.password === "string" ? body.password : "";
  if (password.length < 8 || password.length > 200) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }

  const name =
    typeof body.name === "string" && body.name.trim()
      ? body.name.trim().slice(0, 100)
      : null;

  const localPrefs = body.prefs ?? {};
  const role = isValidRole(body.role)
    ? body.role
    : isValidRole(localPrefs.role)
      ? localPrefs.role
      : "all";
  const favourites = sanitiseFavourites(localPrefs.favourites) ?? [];

  let user;
  try {
    user = await createUser({ email, password, name, role, favourites });
  } catch (err) {
    if (err instanceof EmailTakenError) {
      recordFailure(ip);
      return NextResponse.json(
        { error: "An account with that email already exists. Try signing in." },
        { status: 409 },
      );
    }
    console.error("signup failed:", err);
    return NextResponse.json(
      { error: "Could not create your account right now. Please try again." },
      { status: 500 },
    );
  }

  // Optional newsletter opt-in rides along - same table the hero form feeds.
  if (body.subscribe === true) {
    try {
      await sql`
        INSERT INTO data_point_subscribers (email, source)
        VALUES (${email}, 'account_signup')
        ON CONFLICT (email) DO NOTHING
      `;
    } catch (err) {
      console.error("signup newsletter opt-in failed:", err);
    }
  }

  const session = await createSession(user.id);
  const store = await cookies();
  store.set(SESSION_COOKIE, session.token, sessionCookieOptions(session.expires));

  // Lead-gen visibility: an account IS the data capture, so tell Tom.
  await sendOpsEmail(
    `New Pulse account: ${email}`,
    [
      `<p><strong>${email}</strong> just created a Pulse account.</p>`,
      "<table style=\"border-collapse:collapse;font-family:sans-serif;font-size:13px\">",
      `<tr><td style=\"padding:4px 12px 4px 0;color:#666\">Name</td><td>${name ?? "(none)"}</td></tr>`,
      `<tr><td style=\"padding:4px 12px 4px 0;color:#666\">Role</td><td>${role}</td></tr>`,
      `<tr><td style=\"padding:4px 12px 4px 0;color:#666\">Newsletter</td><td>${body.subscribe === true ? "opted in" : "no"}</td></tr>`,
      `<tr><td style=\"padding:4px 12px 4px 0;color:#666\">When</td><td>${new Date().toUTCString()}</td></tr>`,
      "</table>",
      "<p style=\"color:#888;font-size:11px;margin-top:24px\">Sent from Pulse by Fabrick - pulse.fabrick.agency</p>",
    ].join("\n"),
  );

  return NextResponse.json({ user });
}
