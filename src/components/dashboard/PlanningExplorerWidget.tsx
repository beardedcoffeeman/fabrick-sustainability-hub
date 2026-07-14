"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Landmark, Telescope } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  SECTOR_LABELS,
  type Sector,
  getDatasetCounts,
  loadApplications,
} from "@/lib/planning";

// ---------------------------------------------------------------------------
// Compact My Pulse widget over the Planning Explorer dataset: applications by
// sector plus the most active planning authorities, linking through to the
// full explorer at /research/planning-explorer. Data is bundled JSON (same
// source as the explorer) so it renders instantly.
// ---------------------------------------------------------------------------

const SECTOR_COLORS: Record<Sector, string> = {
  "data-centre": "#00A389",
  logistics: "#2D2D3F",
  "btr-pbsa": "#FF3D7F",
  healthcare: "#1A8FE3",
  education: "#F2994A",
  "renewable-energy": "#27AE60",
  hotels: "#9B51E0",
  "mixed-use": "#EB5757",
};

export function PlanningExplorerWidget() {
  const { bySector, topLpas, total, lastRefreshed } = useMemo(() => {
    const apps = loadApplications();
    const counts = getDatasetCounts();

    const sectorCounts = new Map<Sector, number>();
    const lpaCounts = new Map<string, number>();
    for (const app of apps) {
      sectorCounts.set(app.sector, (sectorCounts.get(app.sector) ?? 0) + 1);
      if (app.lpa) lpaCounts.set(app.lpa, (lpaCounts.get(app.lpa) ?? 0) + 1);
    }

    return {
      bySector: [...sectorCounts.entries()]
        .map(([sector, count]) => ({
          sector,
          label: SECTOR_LABELS[sector] ?? sector,
          count,
        }))
        .sort((a, b) => b.count - a.count),
      topLpas: [...lpaCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      total: apps.length,
      lastRefreshed: counts.lastRefreshed ?? null,
    };
  }, []);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cream">
            <Telescope className="h-4 w-4 text-teal" />
          </div>
          <div>
            <h3 className="font-semibold text-navy">Planning Explorer</h3>
            <p className="text-xs text-warm-gray">
              {total.toLocaleString()} real UK applications across{" "}
              {bySector.length} sectors
              {lastRefreshed
                ? ` - refreshed ${new Date(lastRefreshed).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`
                : ""}
            </p>
          </div>
        </div>
        <Link
          href="/research/planning-explorer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal hover:text-teal-dark transition-colors"
        >
          Open the full explorer
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        {/* Applications by sector */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-warm-gray mb-2">
            Applications by sector
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={bySector}
              margin={{ top: 4, right: 8, bottom: 4, left: 0 }}
            >
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "#8A8A9A" }}
                interval={0}
                angle={-28}
                textAnchor="end"
                height={58}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#8A8A9A" }}
                allowDecimals={false}
                width={32}
              />
              <Tooltip
                formatter={(value) => [`${value} applications`, ""]}
                labelStyle={{ color: "#2D2D3F", fontWeight: 600 }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid rgba(26,26,46,0.08)",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {bySector.map((entry) => (
                  <Cell
                    key={entry.sector}
                    fill={SECTOR_COLORS[entry.sector] ?? "#00BFA5"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Most active LPAs */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-warm-gray mb-2">
            Most active authorities
          </p>
          <ul className="space-y-2">
            {topLpas.map(([lpa, count], i) => (
              <li
                key={lpa}
                className="flex items-center justify-between gap-3 rounded-xl bg-cream px-3.5 py-2.5"
              >
                <span className="flex items-center gap-2.5 text-sm text-navy min-w-0">
                  <span className="text-[10px] font-bold text-warm-gray/70 w-3 shrink-0">
                    {i + 1}
                  </span>
                  <Landmark className="h-3.5 w-3.5 text-teal shrink-0" />
                  <span className="truncate">{lpa}</span>
                </span>
                <span className="text-xs font-semibold tabular-nums text-navy shrink-0">
                  {count}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
