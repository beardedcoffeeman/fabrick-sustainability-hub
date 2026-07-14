"use client";

import { useCallback, useSyncExternalStore } from "react";

// ---------------------------------------------------------------------------
// Pulse saved view (no login)
// ---------------------------------------------------------------------------
// Kate's ask: "when you log on it's just already there." Rather than gate a
// free public tool behind a sign-in, we persist the user's choices in the
// browser so their personalised view is already set up next time they visit:
//   - role:       which job role they picked (drives recommended dashboards)
//   - favourites: dashboards they pinned, surfaced first as "Your dashboards"
//
// Backed by useSyncExternalStore so it is hydration-safe (server renders the
// default, the client syncs to stored prefs after mount) and reactive across
// tabs. Deliberately swappable: if we add real accounts later, the same shape
// can sync server-side without changing call sites.
// ---------------------------------------------------------------------------

const STORAGE_KEY = "pulse-prefs-v1";

export interface PulsePrefs {
  /** RoleSelector role id; "all" means no specific role chosen. */
  role: string;
  /** Dashboard card ids the user has pinned. */
  favourites: string[];
}

const DEFAULT_PREFS: PulsePrefs = { role: "all", favourites: [] };

function parse(raw: string | null): PulsePrefs {
  if (!raw) return DEFAULT_PREFS;
  try {
    const parsed = JSON.parse(raw) as Partial<PulsePrefs>;
    return {
      role: typeof parsed.role === "string" ? parsed.role : "all",
      favourites: Array.isArray(parsed.favourites)
        ? parsed.favourites.filter((f): f is string => typeof f === "string")
        : [],
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

// Cache keyed on the raw string so getSnapshot returns a stable reference
// unless the stored value actually changed (required by useSyncExternalStore).
let cachedRaw: string | null = null;
let cachedPrefs: PulsePrefs = DEFAULT_PREFS;

function getSnapshot(): PulsePrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedPrefs;
  cachedRaw = raw;
  cachedPrefs = parse(raw);
  return cachedPrefs;
}

function getServerSnapshot(): PulsePrefs {
  return DEFAULT_PREFS;
}

const listeners = new Set<() => void>();

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  // Sync changes made in other tabs/windows too.
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

function write(next: PulsePrefs): void {
  const raw = JSON.stringify(next);
  try {
    window.localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    /* storage disabled/full — keep the in-memory value for this session */
  }
  cachedRaw = raw;
  cachedPrefs = next;
  listeners.forEach((l) => l());
}

// -- Account sync hooks (used by useAccount, one-way dependency) --------------

/** Current prefs outside React, e.g. to send with a login request. */
export function getPrefs(): PulsePrefs {
  return getSnapshot();
}

/**
 * Overwrite local prefs with the account's server-merged copy after
 * sign-in/sign-up, so the anonymous view and the account agree.
 */
export function applyPrefs(next: PulsePrefs): void {
  if (typeof window === "undefined") return;
  write({
    role: typeof next.role === "string" ? next.role : "all",
    favourites: Array.isArray(next.favourites) ? next.favourites : [],
  });
}

/**
 * Subscribe to local pref changes outside React. useAccount uses this to
 * mirror pin/role changes to the server while signed in.
 */
export function onPrefsChange(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function usePulsePrefs() {
  const prefs = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const setRole = useCallback((role: string) => {
    write({ ...getSnapshot(), role });
  }, []);

  const toggleFavourite = useCallback((id: string) => {
    const cur = getSnapshot();
    const favourites = cur.favourites.includes(id)
      ? cur.favourites.filter((f) => f !== id)
      : [...cur.favourites, id];
    write({ ...cur, favourites });
    return favourites.includes(id);
  }, []);

  const isFavourite = useCallback(
    (id: string) => prefs.favourites.includes(id),
    [prefs.favourites],
  );

  return { prefs, setRole, toggleFavourite, isFavourite };
}
