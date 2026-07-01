"use client";

import posthog from "posthog-js";

// ---------------------------------------------------------------------------
// Pulse analytics
// ---------------------------------------------------------------------------
// Thin, swappable wrapper for custom event tracking. PostHog itself is
// initialised in src/instrumentation-client.ts (before hydration), which also
// handles pageviews and autocapture. Call sites only use track(), so the
// provider can change without touching pages/components.
//
// No-op until NEXT_PUBLIC_POSTHOG_KEY is set.
// ---------------------------------------------------------------------------

/** Fire a named product event with optional properties. Safe to call always. */
export function track(event: string, props?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  posthog.capture(event, props);
}
