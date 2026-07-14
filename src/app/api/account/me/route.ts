import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  getSessionUser,
  isValidRole,
  sanitiseFavourites,
} from "@/lib/account";
import { sanitiseWidgets } from "@/lib/widgets";
import { sql } from "@/lib/db";

export const runtime = "nodejs";

/** Current signed-in user, or { user: null }. */
export async function GET() {
  try {
    const user = await getSessionUser();
    return NextResponse.json({ user });
  } catch (err) {
    console.error("me: lookup failed:", err);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}

interface PatchPayload {
  name?: unknown;
  role?: unknown;
  favourites?: unknown;
  widgets?: unknown;
}

/** Partial update of profile + personalisation (name, role, favourites, widgets). */
export async function PATCH(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let body: PatchPayload;
  try {
    body = (await req.json()) as PatchPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name =
    typeof body.name === "string"
      ? body.name.trim().slice(0, 100) || null
      : user.name;
  const role = isValidRole(body.role) ? body.role : user.role;
  const favourites = sanitiseFavourites(body.favourites) ?? user.favourites;
  const widgets = sanitiseWidgets(body.widgets) ?? user.widgets;

  try {
    await sql`
      UPDATE pulse_users
      SET name = ${name},
          role = ${role},
          favourites = ${JSON.stringify(favourites)}::jsonb,
          widgets = ${JSON.stringify(widgets)}::jsonb
      WHERE id = ${user.id}
    `;
    return NextResponse.json({
      user: { ...user, name, role, favourites, widgets },
    });
  } catch (err) {
    console.error("me: update failed:", err);
    return NextResponse.json(
      { error: "Could not save your changes right now." },
      { status: 500 },
    );
  }
}

/** Delete the account and everything stored with it (GDPR right to erasure). */
export async function DELETE() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  try {
    // Sessions cascade via FK.
    await sql`DELETE FROM pulse_users WHERE id = ${user.id}`;
    const store = await cookies();
    store.delete(SESSION_COOKIE);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("me: delete failed:", err);
    return NextResponse.json(
      { error: "Could not delete your account right now." },
      { status: 500 },
    );
  }
}
