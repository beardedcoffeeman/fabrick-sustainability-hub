// PostHog client init. Next.js auto-loads this file on the client before
// hydration (Next 15.3+), so PostHog is ready before any interaction and the
// first pageview is never dropped.
//
// api_host points at our OWN domain ("/ingest"), which next.config rewrites to
// PostHog's EU ingestion endpoint. Routing through a first-party path means ad
// blockers (which block eu.i.posthog.com directly) can't drop the requests.
//
// No-op until NEXT_PUBLIC_POSTHOG_KEY is set, so previews without the key are
// unaffected.
import posthog from "posthog-js";

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;

if (key) {
  posthog.init(key, {
    api_host: "/ingest",
    ui_host: "https://eu.posthog.com",
    // 2025-05-24 defaults: SPA-aware pageviews (history_change), pageleave,
    // autocapture and sensible privacy settings.
    defaults: "2025-05-24",
  });
}
