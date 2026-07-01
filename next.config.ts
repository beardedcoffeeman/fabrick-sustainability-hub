import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Reverse-proxy PostHog through our own domain so ad blockers (which block
  // eu.i.posthog.com directly) can't drop analytics + session-recording
  // requests. posthog-js is configured with api_host: "/ingest".
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      },
    ];
  },
  // Required for the PostHog proxy: don't append/redirect trailing slashes on
  // the /ingest API requests.
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
