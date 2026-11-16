// get_grid_carbon: the live National Grid ESO Carbon Intensity API, through
// the same fetch as the dashboard (src/lib/carbon-intensity.ts).
import { fetchCarbonIntensityNow } from "@/lib/carbon-intensity";
import { closest, norm } from "../schema";
import { defineTool, fail } from "./common";

const GRID_SOURCE = {
  publisher: "National Grid ESO",
  dataset: "Carbon Intensity API",
  url: "https://carbonintensity.org.uk",
};

const REGION_ALIASES: Record<string, string> = {
  northwest: "North West England",
  northeast: "North East England",
  southwest: "South West England",
  southeast: "South East England",
  yorkshireandhumber: "Yorkshire",
  eastofengland: "East England",
  eastanglia: "East England",
  merseyside: "North Wales & Merseyside",
  northwales: "North Wales & Merseyside",
};

export const getGridCarbon = defineTool({
  name: "get_grid_carbon",
  description:
    "Live carbon intensity of the GB electricity grid from the National Grid ESO Carbon Intensity API: the current half-hour's national intensity (gCO2/kWh, actual and forecast, with its index from very low to very high), the current generation mix by fuel, the forecast for the rest of today in half hours (with the lowest and highest upcoming slots), and optionally one region's current intensity and mix. " +
    "Use for \"how clean is the grid right now\", \"when is the grid greenest today\" and regional grid questions.",
  spec: {
    region: {
      kind: "string",
      maxLength: 40,
      description:
        "One region for its current intensity and mix, or empty for national only. Regions: North Scotland, South Scotland, North West England, North East England, Yorkshire, North Wales & Merseyside, South Wales, West Midlands, East Midlands, East England, South West England, South England, London, South East England, England, Scotland, Wales.",
    },
  },
  status: () => "Checking the live grid carbon intensity",
  run: async (input, ctx) => {
    let data;
    try {
      data = await (ctx.fetchGrid ?? fetchCarbonIntensityNow)();
    } catch {
      return fail("The Carbon Intensity API could not be reached just now. Say the live grid figures are unavailable and suggest trying again shortly or opening /dashboard/carbon-intensity.");
    }
    const current = data.current;
    if (!current) return fail("The Carbon Intensity API returned no current reading. Say the live grid figures are unavailable right now.");

    const regions = data.regional?.regions ?? [];
    let region = null;
    if (input.region) {
      const n = norm(input.region);
      const target = REGION_ALIASES[n];
      region = regions.find((r) => norm(r.shortname) === n || (target && r.shortname === target)) ?? null;
      if (!region) {
        const names = regions.map((r) => r.shortname);
        if (!names.length) return fail("Regional figures are not available from the Carbon Intensity API right now. Offer the national figures instead.");
        const near = closest(input.region, names, 4, 0.3);
        return fail(`No grid region called "${input.region}". ${near.length ? `Closest: ${near.join("; ")}. ` : ""}Regions: ${names.join("; ")}.`);
      }
    }

    const nowMs = ctx.now.getTime();
    const upcoming = (data.forecast ?? []).filter((p) => Date.parse(p.to) > nowMs && p.intensity.forecast != null);
    const byForecast = [...upcoming].sort((a, b) => (a.intensity.forecast ?? 0) - (b.intensity.forecast ?? 0));
    const mix = [...(data.generation?.generationmix ?? [])].sort((a, b) => b.perc - a.perc);
    const fetchedAt = ctx.now.toISOString();

    return {
      ok: true,
      payload: {
        source: GRID_SOURCE,
        dataPeriod: `half-hour ${current.from} to ${current.to} (UTC)`,
        generatedAt: fetchedAt,
        pulsePage: "/dashboard/carbon-intensity",
        caveats: [
          "Live figures for the GB electricity grid; they change every half hour.",
          "Times are UTC as the API gives them.",
          "Regional figures are forecasts (the API publishes no regional actuals).",
        ],
        national: {
          period: { from: current.from, to: current.to },
          actualGCo2PerKwh: current.intensity.actual ?? null,
          forecastGCo2PerKwh: current.intensity.forecast,
          index: current.intensity.index,
        },
        generationMixPct: mix,
        restOfToday: {
          halfHours: upcoming.length,
          lowest: byForecast[0] ? { from: byForecast[0].from, to: byForecast[0].to, forecastGCo2PerKwh: byForecast[0].intensity.forecast, index: byForecast[0].intensity.index } : null,
          highest: byForecast.length
            ? { from: byForecast[byForecast.length - 1].from, to: byForecast[byForecast.length - 1].to, forecastGCo2PerKwh: byForecast[byForecast.length - 1].intensity.forecast, index: byForecast[byForecast.length - 1].intensity.index }
            : null,
          forecast: upcoming.slice(0, 48).map((p) => ({ from: p.from, forecastGCo2PerKwh: p.intensity.forecast, index: p.intensity.index })),
        },
        region: region
          ? {
              name: region.shortname,
              forecastGCo2PerKwh: region.intensity.forecast,
              index: region.intensity.index,
              generationMixPct: [...(region.generationmix ?? [])].sort((a, b) => b.perc - a.perc),
            }
          : null,
      },
      tables: [
        {
          title: `GB generation mix, ${current.from} to ${current.to} (UTC)`,
          columns: ["Fuel", "Share %"],
          rows: mix.map((m) => [m.fuel, m.perc]),
          source: `${GRID_SOURCE.publisher}, ${GRID_SOURCE.dataset}, live at ${fetchedAt.slice(0, 16).replace("T", " ")} UTC.`,
          fileStem: "pulse-grid-mix",
          pulsePage: "/dashboard/carbon-intensity",
        },
        ...(region
          ? [
              {
                title: `${region.shortname} generation mix, ${data.regional?.from ?? ""} to ${data.regional?.to ?? ""} (UTC, forecast)`,
                columns: ["Fuel", "Share %"],
                rows: [...(region.generationmix ?? [])].sort((a, b) => b.perc - a.perc).map((m) => [m.fuel, m.perc] as Array<string | number>),
                source: `${GRID_SOURCE.publisher}, ${GRID_SOURCE.dataset}, regional forecast, live at ${fetchedAt.slice(0, 16).replace("T", " ")} UTC.`,
                fileStem: `pulse-grid-mix-${norm(region.shortname)}`,
                pulsePage: "/dashboard/carbon-intensity",
              },
            ]
          : []),
      ],
    };
  },
});
