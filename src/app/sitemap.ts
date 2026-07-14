import type { MetadataRoute } from "next";
import { articleContent } from "@/lib/article-content";

const BASE = "https://pulse.fabrick.agency";

// Static routes with hand-tuned priorities: live dashboards and the
// calculator are the money pages; account/session surfaces are excluded
// (robots.ts disallows them too).
const STATIC_ROUTES: Array<{
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}> = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/dashboard", priority: 0.9, changeFrequency: "daily" },
  { path: "/dashboard/carbon-intensity", priority: 0.9, changeFrequency: "hourly" },
  { path: "/dashboard/material-prices", priority: 0.9, changeFrequency: "weekly" },
  { path: "/dashboard/construction-output", priority: 0.9, changeFrequency: "weekly" },
  { path: "/dashboard/planning", priority: 0.9, changeFrequency: "weekly" },
  { path: "/dashboard/epc", priority: 0.9, changeFrequency: "weekly" },
  { path: "/materials", priority: 0.9, changeFrequency: "monthly" },
  { path: "/regulations", priority: 0.8, changeFrequency: "monthly" },
  { path: "/knowledge", priority: 0.8, changeFrequency: "weekly" },
  { path: "/research", priority: 0.8, changeFrequency: "weekly" },
  { path: "/research/planning-explorer", priority: 0.9, changeFrequency: "weekly" },
  { path: "/research/ai-construction-search", priority: 0.8, changeFrequency: "monthly" },
  { path: "/methodology", priority: 0.5, changeFrequency: "monthly" },
  { path: "/showcase", priority: 0.5, changeFrequency: "monthly" },
  { path: "/my-pulse", priority: 0.6, changeFrequency: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${BASE}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const articleEntries: MetadataRoute.Sitemap = Object.keys(articleContent).map(
    (slug) => ({
      url: `${BASE}/knowledge/${slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    }),
  );

  return [...staticEntries, ...articleEntries];
}
