// ---------------------------------------------------------------------------
// My Pulse widget catalogue (data only - no JSX, safe to import server-side).
// The component registry that maps these types to the actual dashboard widget
// components lives in src/components/my-pulse/WidgetHost.tsx.
// ---------------------------------------------------------------------------

export const WIDGET_TYPES = [
  "carbon-intensity",
  "material-prices",
  "construction-output",
  "planning",
  "planning-explorer",
  "retrofit",
  "epc",
  "regulations",
  "research",
] as const;

export type WidgetType = (typeof WIDGET_TYPES)[number];

export interface WidgetInstance {
  type: WidgetType;
  /** Per-widget settings, e.g. { category: "residential" } for planning. */
  config?: Record<string, string>;
}

export interface WidgetMeta {
  type: WidgetType;
  title: string;
  description: string;
}

export const WIDGET_CATALOGUE: WidgetMeta[] = [
  {
    type: "carbon-intensity",
    title: "UK Grid Carbon",
    description: "Live carbon intensity, generation mix and 48h forecast.",
  },
  {
    type: "material-prices",
    title: "Material Prices",
    description: "BEIS/ONS material price indices with YoY movers.",
  },
  {
    type: "construction-output",
    title: "Construction Output",
    description: "Monthly ONS output by sector: housing, infrastructure, R&M.",
  },
  {
    type: "planning",
    title: "Planning Activity",
    description: "Recent applications and decisions, filterable by category.",
  },
  {
    type: "planning-explorer",
    title: "Planning Explorer",
    description:
      "Live planning intelligence: applications by sector and the most active authorities.",
  },
  {
    type: "retrofit",
    title: "Retrofit Market",
    description: "EPC retrofit market snapshot from the MHCLG register.",
  },
  {
    type: "epc",
    title: "EPC Lookup",
    description: "Search live energy ratings for any UK postcode.",
  },
  {
    type: "regulations",
    title: "Regulations Watch",
    description:
      "What is changing in built-environment regulation, soonest first.",
  },
  {
    type: "research",
    title: "Fabrick Research",
    description: "Original Fabrick studies into how UK construction decides.",
  },
];

/**
 * Dashboard-card id -> widget type, used to seed a brand-new account's
 * My Pulse layout from the dashboards they had already pinned anonymously.
 */
const CARD_TO_WIDGET: Record<string, WidgetType> = {
  "carbon-intensity": "carbon-intensity",
  "material-prices": "material-prices",
  "construction-output": "construction-output",
  planning: "planning",
  "planning-explorer": "planning-explorer",
  epc: "epc",
  regulations: "regulations",
};

/** Role id -> starter widgets, mirroring RecommendedDashboards. */
const ROLE_DEFAULT_WIDGETS: Record<string, WidgetType[]> = {
  architect: ["material-prices", "carbon-intensity", "construction-output"],
  specifier: ["material-prices", "planning-explorer", "carbon-intensity"],
  "site-manager": ["carbon-intensity", "construction-output", "planning"],
  contractor: ["planning-explorer", "construction-output", "material-prices"],
  manufacturer: ["planning-explorer", "material-prices", "construction-output"],
  "sustainability-lead": ["carbon-intensity", "material-prices", "epc"],
};

const FALLBACK_WIDGETS: WidgetType[] = [
  "carbon-intensity",
  "material-prices",
  "construction-output",
];

/**
 * Build the starter widget layout for a new account: pinned dashboards first
 * (they chose those), topped up from role recommendations, else a default trio.
 */
export function defaultWidgets(
  favourites: string[],
  role: string,
): WidgetInstance[] {
  const types: WidgetType[] = [];
  for (const fav of favourites) {
    const t = CARD_TO_WIDGET[fav];
    if (t && !types.includes(t)) types.push(t);
  }
  if (types.length === 0) {
    for (const t of ROLE_DEFAULT_WIDGETS[role] ?? FALLBACK_WIDGETS) {
      if (!types.includes(t)) types.push(t);
    }
  }
  return types.map((type) => ({ type }));
}

function isWidgetType(v: unknown): v is WidgetType {
  return typeof v === "string" && (WIDGET_TYPES as readonly string[]).includes(v);
}

/**
 * Validate/normalise an untrusted widgets payload. Unknown types are dropped,
 * duplicates removed, configs restricted to short string values. Returns null
 * if the payload is not an array at all.
 */
export function sanitiseWidgets(raw: unknown): WidgetInstance[] | null {
  if (!Array.isArray(raw)) return null;
  const out: WidgetInstance[] = [];
  for (const entry of raw.slice(0, 24)) {
    if (typeof entry !== "object" || entry === null) continue;
    const { type, config } = entry as { type?: unknown; config?: unknown };
    if (!isWidgetType(type)) continue;
    if (out.some((w) => w.type === type)) continue;
    const cleanConfig: Record<string, string> = {};
    if (typeof config === "object" && config !== null) {
      for (const [k, v] of Object.entries(config).slice(0, 8)) {
        if (typeof v === "string" && k.length <= 32 && v.length <= 64) {
          cleanConfig[k] = v;
        }
      }
    }
    out.push(
      Object.keys(cleanConfig).length > 0
        ? { type, config: cleanConfig }
        : { type },
    );
  }
  return out;
}
