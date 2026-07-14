"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { AccountUser } from "@/lib/account";
import { identify, resetIdentity, track } from "@/lib/analytics";
import { applyPrefs, getPrefs, onPrefsChange } from "@/lib/usePulsePrefs";
import type { WidgetInstance } from "@/lib/widgets";

// ---------------------------------------------------------------------------
// Pulse account - client store.
// ---------------------------------------------------------------------------
// Module-level store (same pattern as usePulsePrefs) so the Navbar, /account
// and /my-pulse all share one fetch of /api/account/me per page load. While
// signed in, local pref changes (role, pinned dashboards) are mirrored to the
// server debounced, so the account follows the user across devices.
// ---------------------------------------------------------------------------

export type { AccountUser };

export interface AccountState {
  /** "loading" until the first /api/account/me response lands. */
  status: "loading" | "ready";
  user: AccountUser | null;
}

let state: AccountState = { status: "loading", user: null };
const listeners = new Set<() => void>();
let fetchStarted = false;
let prefsUnsub: (() => void) | null = null;
let prefsTimer: ReturnType<typeof setTimeout> | null = null;

function emit() {
  listeners.forEach((l) => l());
}

function setState(next: AccountState) {
  state = next;
  emit();
}

/** Mirror local pref changes to the account, debounced. */
function startPrefsMirror() {
  if (prefsUnsub) return;
  prefsUnsub = onPrefsChange(() => {
    if (!state.user) return;
    if (prefsTimer) clearTimeout(prefsTimer);
    prefsTimer = setTimeout(() => {
      const prefs = getPrefs();
      void fetch("/api/account/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: prefs.role,
          favourites: prefs.favourites,
        }),
      }).catch(() => {
        /* best-effort mirror - localStorage still has the change */
      });
    }, 800);
  });
}

function stopPrefsMirror() {
  if (prefsTimer) clearTimeout(prefsTimer);
  prefsTimer = null;
  prefsUnsub?.();
  prefsUnsub = null;
}

function adoptUser(user: AccountUser | null) {
  setState({ status: "ready", user });
  if (user) {
    identify(`pulse-user-${user.id}`, {
      email: user.email,
      name: user.name ?? undefined,
      pulse_role: user.role,
    });
    // Server-merged prefs become the local truth so both views agree.
    applyPrefs({ role: user.role, favourites: user.favourites });
    startPrefsMirror();
  } else {
    stopPrefsMirror();
  }
}

async function fetchMe(): Promise<void> {
  try {
    const res = await fetch("/api/account/me");
    const json = (await res.json()) as { user: AccountUser | null };
    // Don't applyPrefs on a plain refresh - only sign-in/sign-up merge should
    // overwrite local prefs, otherwise two tabs could ping-pong stale copies.
    setState({ status: "ready", user: json.user ?? null });
    if (json.user) {
      identify(`pulse-user-${json.user.id}`, {
        email: json.user.email,
        name: json.user.name ?? undefined,
        pulse_role: json.user.role,
      });
      startPrefsMirror();
    }
  } catch {
    setState({ status: "ready", user: null });
  }
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): AccountState {
  return state;
}

const SERVER_STATE: AccountState = { status: "loading", user: null };

function getServerSnapshot(): AccountState {
  return SERVER_STATE;
}

// -- Public API ---------------------------------------------------------------

export interface AuthResult {
  ok: boolean;
  error?: string;
}

async function authRequest(
  url: string,
  payload: Record<string, unknown>,
): Promise<AuthResult> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, prefs: getPrefs() }),
    });
    const json = (await res.json()) as {
      user?: AccountUser;
      error?: string;
    };
    if (!res.ok || !json.user) {
      return { ok: false, error: json.error ?? "Something went wrong." };
    }
    adoptUser(json.user);
    return { ok: true };
  } catch {
    return { ok: false, error: "Network problem - please try again." };
  }
}

export function signup(opts: {
  email: string;
  password: string;
  name?: string;
  role?: string;
  subscribe?: boolean;
  /** Honeypot field - forwarded so the server can silently drop bots. */
  company?: string;
}): Promise<AuthResult> {
  track("account_signup_submitted");
  return authRequest("/api/account/signup", opts);
}

export function login(opts: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  track("account_signin_submitted");
  return authRequest("/api/account/login", opts);
}

export async function logout(): Promise<void> {
  try {
    await fetch("/api/account/logout", { method: "POST" });
  } catch {
    /* cookie may survive a network blip; next load re-checks */
  }
  resetIdentity();
  adoptUser(null);
  track("account_signed_out");
}

export async function deleteAccount(): Promise<AuthResult> {
  try {
    const res = await fetch("/api/account/me", { method: "DELETE" });
    if (!res.ok) {
      const json = (await res.json()) as { error?: string };
      return { ok: false, error: json.error ?? "Could not delete account." };
    }
    resetIdentity();
    adoptUser(null);
    return { ok: true };
  } catch {
    return { ok: false, error: "Network problem - please try again." };
  }
}

/** Persist a new widget layout (and optionally other fields) to the account. */
export async function saveAccount(patch: {
  name?: string;
  role?: string;
  widgets?: WidgetInstance[];
  favourites?: string[];
}): Promise<AuthResult> {
  try {
    const res = await fetch("/api/account/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const json = (await res.json()) as { user?: AccountUser; error?: string };
    if (!res.ok || !json.user) {
      return { ok: false, error: json.error ?? "Could not save changes." };
    }
    setState({ status: "ready", user: json.user });
    return { ok: true };
  } catch {
    return { ok: false, error: "Network problem - please try again." };
  }
}

/** Optimistically update the in-store user without waiting for the server. */
export function updateLocalUser(patch: Partial<AccountUser>): void {
  if (!state.user) return;
  setState({ status: "ready", user: { ...state.user, ...patch } });
}

export function useAccount(): AccountState {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    if (!fetchStarted) {
      fetchStarted = true;
      void fetchMe();
    }
  }, []);

  return snapshot;
}
