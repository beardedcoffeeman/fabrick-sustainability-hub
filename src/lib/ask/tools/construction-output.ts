// get_construction_output: ONS output in the construction industry, GB, £m
// chained volume measures, seasonally adjusted, 12 series x 36 months.
import { at, loadConstructionOutputSnapshot, pctChange } from "@/lib/construction-output";
import { round } from "../schema";
import { defineTool, fail } from "./common";

export const OUTPUT_SERIES = [
  "allWork",
  "allNewWork",
  "allRepairMaintenance",
  "totalNewHousing",
  "publicNewHousing",
  "privateNewHousing",
  "infrastructureNewWork",
  "publicOtherNewWork",
  "privateIndustrialNewWork",
  "privateCommercialNewWork",
  "totalHousingRM",
  "nonHousingRM",
] as const;

const DEFAULT_SERIES = ["allWork", "allNewWork", "allRepairMaintenance"];

export const getConstructionOutput = defineTool({
  name: "get_construction_output",
  description:
    "Monthly construction output for Great Britain from the ONS (Output in the construction industry, Table 2a), as held by Pulse: GBP million, chained volume measures, seasonally adjusted, the latest 36 months. " +
    "Series: allWork (all work), allNewWork, allRepairMaintenance, totalNewHousing, publicNewHousing, privateNewHousing, infrastructureNewWork, publicOtherNewWork (public non-housing), privateIndustrialNewWork, privateCommercialNewWork, totalHousingRM (housing repair and maintenance), nonHousingRM. " +
    "Returns each series' monthly values for the months asked, the latest month-on-month and year-on-year change, and the total over the window with the same months a year earlier and the percentage change between them (computed by Pulse, so you do not need to add up months yourself).",
  spec: {
    series: {
      kind: "enumArray",
      values: OUTPUT_SERIES,
      maxItems: 12,
      description: "The series to return. Empty for all work, all new work and all repair and maintenance.",
    },
    months: {
      kind: "integer",
      min: 0,
      max: 36,
      description: "How many of the latest months to return, 1 to 36. 0 for the default of 12.",
    },
  },
  status: () => "Checking ONS construction output",
  run: (input) => {
    const snap = loadConstructionOutputSnapshot();
    const keys = input.series.length ? input.series : DEFAULT_SERIES;
    const months = input.months === 0 ? 12 : input.months;
    const byKey = new Map(snap.series.map((s) => [s.key, s]));
    const missing = keys.filter((k) => !byKey.has(k));
    if (missing.length) return fail(`Pulse does not hold the series ${missing.join(", ")}. Held: ${snap.series.map((s) => s.key).join(", ")}.`);

    const series = keys.map((k) => {
      const s = byKey.get(k)!;
      const v = s.values;
      const latest = v[v.length - 1];
      const prev = at(v, 1);
      const yearAgo = at(v, 12);
      const window = v.slice(-months);
      const yearEarlier = v.length >= months + 12 ? v.slice(v.length - months - 12, v.length - 12) : [];
      const sum = (pts: typeof v) => (pts.length && pts.every((p) => p.value != null) ? pts.reduce((n, p) => n + (p.value as number), 0) : null);
      const total = sum(window);
      const totalYearEarlier = yearEarlier.length === months ? sum(yearEarlier) : null;
      return {
        key: s.key,
        name: s.name,
        cdid: s.cdid,
        latest: { period: latest?.period ?? null, valueGbpMillion: latest?.value ?? null },
        monthOnMonthPct: latest?.value != null && prev != null ? round(pctChange(latest.value, prev)) : null,
        yearOnYearPct: latest?.value != null && yearAgo != null ? round(pctChange(latest.value, yearAgo)) : null,
        window: {
          months: window.length,
          from: window[0]?.period ?? null,
          to: window[window.length - 1]?.period ?? null,
          totalGbpMillion: total,
          sameMonthsYearEarlier:
            yearEarlier.length === months ? { from: yearEarlier[0].period, to: yearEarlier[yearEarlier.length - 1].period, totalGbpMillion: totalYearEarlier } : null,
          changeOnYearEarlierPct: total != null && totalYearEarlier ? round(pctChange(total, totalYearEarlier)) : null,
        },
        monthly: window.map((p) => ({ period: p.period, valueGbpMillion: p.value })),
      };
    });

    const periods = series[0].monthly.map((m) => m.period);
    const src = snap.source;
    return {
      ok: true,
      payload: {
        source: { publisher: src.publisher, dataset: `${src.name} (${src.table})`, url: src.url },
        dataPeriod: src.dataPeriod,
        generatedAt: snap.generatedAt,
        pulsePage: "/dashboard/construction-output",
        caveats: [
          "Great Britain only (not Northern Ireland).",
          `Unit: ${src.unit}. Values are volumes in constant prices, not cash spend.`,
          `Release date ${src.releaseDate}; next release ${src.nextRelease}.`,
          src.notes,
        ],
        series,
      },
      tables: [
        {
          title: `Construction output, GB, GBP million (chained volume, seasonally adjusted), ${periods[0]} to ${periods[periods.length - 1]}`,
          columns: ["Month", ...series.map((s) => s.name)],
          rows: periods.map((p, i) => [p, ...series.map((s) => s.monthly[i]?.valueGbpMillion ?? null)]),
          source: `${src.publisher}, ${src.name}, ${src.table}, data to ${src.dataPeriod}.`,
          fileStem: "pulse-construction-output",
          pulsePage: "/dashboard/construction-output",
        },
      ],
    };
  },
});
