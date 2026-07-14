import type { MetadataRoute } from "next";

// Everything is crawlable except account/session surfaces and the API.
// AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended etc.) are
// deliberately welcome: Pulse's play is to be cited by answer engines, so
// they inherit the general allow rather than being blocked.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/account"],
      },
    ],
    sitemap: "https://pulse.fabrick.agency/sitemap.xml",
  };
}
