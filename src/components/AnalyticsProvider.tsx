"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { initAnalytics, trackPageview } from "@/lib/analytics";

// Tracks client-side route changes as pageviews. Lives behind <Suspense>
// because useSearchParams() opts the subtree into client-side rendering.
function PageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Initialise here (idempotent) rather than in the parent: child effects run
    // before parent effects, so initialising in the parent would let this
    // effect fire trackPageview() before init and drop the very first pageview.
    initAnalytics();
    if (!pathname) return;
    const qs = searchParams?.toString();
    trackPageview(pathname + (qs ? `?${qs}` : ""));
  }, [pathname, searchParams]);

  return null;
}

/**
 * Mounts in the root layout. Initialises analytics and reports a pageview on
 * every navigation. A no-op until NEXT_PUBLIC_POSTHOG_KEY is set.
 */
export function AnalyticsProvider() {
  return (
    <Suspense fallback={null}>
      <PageviewTracker />
    </Suspense>
  );
}
