import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  EMAIL_RE,
  SESSION_COOKIE,
  clientIp,
  createSession,
  findUserByEmail,
  isRateLimited,
  mergeLocalPrefs,
  recordFailure,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/account";

export const runtime = "nodejs";

interface LoginPayload {
  email?: unknown;
  password?: unknown;
  /** Anonymous localStorage prefs, merged into the account on sign-in. */
  prefs?: { role?: unknown; favourites?: unknown };
}

function badCredentials() {
  return NextResponse.json(
    { error: "Email or password is incorrect." },
    { status: 401 },
  );
}

export async function POST(req: NextRequest) {
  let body: LoginPayload;
  try {
    body = (await req.json()) as LoginPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const ip = clientIp(req);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again in a few minutes." },
      { status: 429 },
    );
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !EMAIL_RE.test(email) || !password) {
    return NextResponse.json(
      { error: "Enter your email and password." },
      { status: 400 },
    );
  }

  try {
    const found = await findUserByEmail(email);
    if (!found || !(await verifyPassword(password, found.passwordHash))) {
      recordFailure(ip);
      return badCredentials();
    }

    const user = await mergeLocalPrefs(found, body.prefs ?? {});
    const session = await createSession(user.id);
    const store = await cookies();
    store.set(
      SESSION_COOKIE,
      session.token,
      sessionCookieOptions(session.expires),
    );
    return NextResponse.json({ user });
  } catch (err) {
    console.error("login failed:", err);
    return NextResponse.json(
      { error: "Could not sign you in right now. Please try again." },
      { status: 500 },
    );
  }
}
