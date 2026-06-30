"use client";

import posthog from "posthog-js";

// ---------------------------------------------------------------------------
// Pulse analytics
// ---------------------------------------------------------------------------
// Provider-agnostic wrapper around our product analytics + session recording.
// Today this targets PostHog (session replay AND granular event analytics in
// one), but every call site only ever touches track()/identify(), so the
// provider can be swapped (Clarity, self-hosted rrweb, etc.) without changing
// any pages or components.
//
// It is a NO-OP until NEXT_PUBLIC_POSTHOG_KEY is set, so it is safe to ship
// before Tom has created the PostHog project. Once the key is added to the
// Vercel env, recordings + events start flowing with no code change.
// ---------------------------------------------------------------------------

let initialised = false;

export function initAnalytics(): void {
  if (initialised) return;
  if (typeof window === "undefined") return;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return; // not configured yet — stay a no-op

  posthog.init(key, {
    // EU cloud by default (Fabrick is UK). Override per-environment if needed.
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com",
    // App Router: we capture pageviews manually in AnalyticsProvider so that
    // client-side route changes are counted.
    capture_pageview: false,
    capture_pageleave: true,
    // Autocapture clicks/inputs gives us a baseline of "what are people doing"
    // without instrumenting every element; we add explicit track() calls on top
    // for the interactions Kate cared about (which data, which dashboards).
    autocapture: true,
    persistence: "localStorage+cookie",
    // Session recording is controlled by the PostHog project settings; leaving
    // it enabled here means it switches on as soon as Tom flips it on there.
  });

  initialised = true;
}

export function isAnalyticsReady(): boolean {
  return initialised;
}

/** Fire a named product event with optional properties. Safe to call always. */
export function track(event: string, props?: Record<string, unknown>): void {
  if (typeof window === "undefined" || !initialised) return;
  posthog.capture(event, props);
}

/** Manual pageview for App Router client-side navigation. */
export function trackPageview(url: string): void {
  if (!initialised) return;
  posthog.capture("$pageview", { $current_url: url });
}
