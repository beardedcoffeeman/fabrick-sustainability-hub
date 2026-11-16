// get_material_prices: the DBT construction material price indices (2015 = 100).
import { loadMaterialPrices } from "@/lib/material-prices";
import { closest, wordsMatch } from "../schema";
import { defineTool, fail } from "./common";

export const getMaterialPrices = defineTool({
  name: "get_material_prices",
  description:
    "Construction material price INDICES from the Department for Business and Trade (DBT) Building Materials and Components Statistics, as held by Pulse: about 27 materials, index 2015 = 100, with the latest month, the month before, a year earlier, month-on-month and year-on-year percentage change, and the last six monthly index values. " +
    "Use for questions about how material prices or costs have moved (steel, rebar, cement, concrete, timber, plywood, insulation, plastics pipes, aggregates, paint and so on). These are price indices, not prices in pounds: never present an index value as a price. " +
    "Leave query empty and category \"any\" to list every material.",
  spec: {
    query: {
      kind: "string",
      maxLength: 80,
      description:
        "Words that must all appear in the material name, e.g. \"steel\", \"timber\", \"pipes\". Empty for no name filter.",
    },
    category: {
      kind: "string",
      maxLength: 40,
      description:
        "A category name to keep, or \"any\". Categories: Metals, Cement & Concrete, Aggregates, Timber, Plastics, Other.",
    },
  },
  status: () => "Checking material price indices",
  run: (input) => {
    const { materials, source } = loadMaterialPrices();
    const categories = [...new Set(materials.map((m) => m.category))];
    const cat = input.category.trim();
    let rows = materials;
    if (cat && cat.toLowerCase() !== "any") {
      const match = categories.find((c) => c.toLowerCase() === cat.toLowerCase());
      if (!match) return fail(`No category called "${cat}". Categories held: ${categories.join(", ")}.`);
      rows = rows.filter((m) => m.category === match);
    }
    if (input.query) rows = rows.filter((m) => wordsMatch(`${m.name} ${m.id.replace(/-/g, " ")}`, input.query));
    if (!rows.length) {
      const near = closest(input.query, materials.map((m) => m.name));
      return fail(
        `No material index matches "${input.query}"${cat && cat !== "any" ? ` in ${cat}` : ""}. ${near.length ? `Closest names: ${near.join("; ")}. ` : ""}All materials held: ${materials.map((m) => m.name).join("; ")}.`,
      );
    }
    rows = rows.slice(0, 30);
    const labels = rows[0]?.sparklineLabels ?? [];
    const sourceLine = `${source.publisher}, ${source.name}, data to ${source.dataPeriod}. Index 2015 = 100.`;
    return {
      ok: true,
      payload: {
        source: { publisher: source.publisher, dataset: source.name, url: source.url || null },
        dataPeriod: source.dataPeriod,
        generatedAt: source.releaseDate || null,
        pulsePage: "/dashboard/material-prices",
        caveats: [
          "These are price indices (2015 = 100), not prices in pounds. A change in the index is a change in price relative to 2015.",
          `Monthly figures. Release date ${source.releaseDate}; next release ${source.nextRelease}.`,
          ...(source.note ? [source.note] : []),
        ],
        indexBase: source.indexBase,
        matched: rows.length,
        materials: rows.map((m) => ({
          name: m.name,
          category: m.category,
          latestIndex: m.currentIndex,
          previousMonthIndex: m.previousMonthIndex,
          yearAgoIndex: m.yearAgoIndex,
          monthOnMonthPct: m.momChange,
          yearOnYearPct: m.yoyChange,
          lastSixMonths: m.sparkline.map((v, i) => ({ month: m.sparklineLabels[i] ?? "", index: v })),
        })),
      },
      tables: [
        {
          title: "Construction material price indices (2015 = 100)",
          columns: [
            "Material",
            "Category",
            `Index ${source.dataPeriod}`,
            "Previous month",
            "A year earlier",
            "Month on month %",
            "Year on year %",
            ...labels.map((l) => `Index ${l}`),
          ],
          rows: rows.map((m) => [
            m.name,
            m.category,
            m.currentIndex,
            m.previousMonthIndex,
            m.yearAgoIndex,
            m.momChange,
            m.yoyChange,
            ...labels.map((_, i) => m.sparkline[i] ?? null),
          ]),
          source: sourceLine,
          fileStem: "pulse-material-prices",
          pulsePage: "/dashboard/material-prices",
        },
      ],
    };
  },
});
