"use client";

import dynamic from "next/dynamic";
import type { WidgetInstance, WidgetType } from "@/lib/widgets";
import type { PlanningCategory } from "@/components/dashboard/PlanningActivityWidget";

// ---------------------------------------------------------------------------
// Maps a saved widget instance to the live dashboard component that renders
// it. Dynamically imported so /my-pulse only ships the charts a user actually
// has on their board. Each widget fetches its own data - the host adds config
// controls where a widget supports them (planning's category filter).
// ---------------------------------------------------------------------------

const spinner = () => (
  <div className="flex h-48 items-center justify-center rounded-2xl bg-white">
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal border-t-transparent" />
  </div>
);

const CarbonIntensityWidget = dynamic(
  () =>
    import("@/components/dashboard/CarbonIntensityWidget").then(
      (m) => m.CarbonIntensityWidget,
    ),
  { loading: spinner },
);
const MaterialPricesWidget = dynamic(
  () =>
    import("@/components/dashboard/MaterialPricesWidget").then(
      (m) => m.MaterialPricesWidget,
    ),
  { loading: spinner },
);
const ConstructionOutputWidget = dynamic(
  () =>
    import("@/components/dashboard/ConstructionOutputWidget").then(
      (m) => m.ConstructionOutputWidget,
    ),
  { loading: spinner },
);
const PlanningActivityWidget = dynamic(
  () =>
    import("@/components/dashboard/PlanningActivityWidget").then(
      (m) => m.PlanningActivityWidget,
    ),
  { loading: spinner },
);
const PlanningCategoryTabs = dynamic(
  () =>
    import("@/components/dashboard/PlanningActivityWidget").then(
      (m) => m.PlanningCategoryTabs,
    ),
  { loading: () => null },
);
const RetrofitMarketWidget = dynamic(
  () =>
    import("@/components/dashboard/RetrofitMarketWidget").then(
      (m) => m.RetrofitMarketWidget,
    ),
  { loading: spinner },
);
const EPCLookupWidget = dynamic(
  () =>
    import("@/components/dashboard/EPCLookupWidget").then(
      (m) => m.EPCLookupWidget,
    ),
  { loading: spinner },
);

const PLANNING_CATEGORIES: PlanningCategory[] = [
  "all",
  "residential",
  "commercial",
  "mixed",
];

function planningCategory(config?: Record<string, string>): PlanningCategory {
  const raw = config?.category;
  return PLANNING_CATEGORIES.includes(raw as PlanningCategory)
    ? (raw as PlanningCategory)
    : "all";
}

export function WidgetHost({
  widget,
  onConfigChange,
}: {
  widget: WidgetInstance;
  onConfigChange: (type: WidgetType, config: Record<string, string>) => void;
}) {
  switch (widget.type) {
    case "carbon-intensity":
      return <CarbonIntensityWidget />;
    case "material-prices":
      return <MaterialPricesWidget />;
    case "construction-output":
      return <ConstructionOutputWidget />;
    case "planning": {
      const category = planningCategory(widget.config);
      return (
        <div>
          <div className="mb-4">
            <PlanningCategoryTabs
              value={category}
              onChange={(next: PlanningCategory) =>
                onConfigChange("planning", { ...widget.config, category: next })
              }
            />
          </div>
          <PlanningActivityWidget category={category} />
        </div>
      );
    }
    case "retrofit":
      return <RetrofitMarketWidget />;
    case "epc":
      return <EPCLookupWidget />;
    default:
      return null;
  }
}
