// get_embodied_carbon: embodied carbon factors and building benchmarks from
// src/lib/carbon-data.ts, the data behind the Carbon Calculator (/materials).
// Provenance is quoted from that file's own header: the ICE Database
// (Inventory of Carbon & Energy) v4.1 from Circular Ecology, recorded there as
// "Version: v4.1 (October 2025)", modules A1 to A3 (cradle to gate) unless a
// record notes otherwise, all values in kgCO2e per kg. The benchmarks are the
// LETI 2020 and RIBA 2030 targets as that file records them.
import { carbonBenchmarks, iceDatabase, materialCategories } from "@/lib/carbon-data";
import { closest, wordsMatch } from "../schema";
import { defineTool, fail } from "./common";

const ICE_SOURCE = {
  publisher: "Circular Ecology",
  dataset: "ICE Database (Inventory of Carbon & Energy) v4.1, as held in Pulse's Carbon Calculator",
  url: "https://circularecology.com/embodied-carbon-footprint-database.html",
};

// The version line exactly as the file's header records it.
const ICE_VERSION = "v4.1 (October 2025)";

const BENCHMARK_SCOPES: Record<string, string> = {
  leti: "LETI targets cover modules A1 to A5 (as recorded in Pulse's carbon data)",
  riba2030: "RIBA 2030 v2 covers modules A1 to A5, B1 to B5 and C1 to C4 (as recorded in Pulse's carbon data)",
  businessAsUsual: "Lifecycle scope not recorded in Pulse's carbon data",
};

const byId = new Map(iceDatabase.map((m) => [m.id, m]));

export const getEmbodiedCarbon = defineTool({
  name: "get_embodied_carbon",
  description:
    "Embodied carbon factors for construction materials from the ICE Database (Inventory of Carbon & Energy) v4.1, the data behind Pulse's Carbon Calculator: about 180 materials in 20 categories, each with its factor in kgCO2e per kg (modules A1 to A3, cradle to gate, unless the record notes otherwise), density in kg per m3 where recorded, notes, typical applications, lower-carbon alternatives and, for insulation, thermal conductivity and fire rating. " +
    "Optionally also the whole-building embodied carbon benchmarks (LETI 2020, RIBA 2030 and business as usual, in kgCO2e per m2 GIA) by building type. " +
    "These are generic industry-average values, not product-specific EPD figures.",
  spec: {
    material: {
      kind: "string",
      maxLength: 80,
      description: "Words that must all appear in the material name, e.g. \"glulam\", \"rebar\", \"mineral wool\". Empty for no name filter.",
    },
    category: {
      kind: "string",
      maxLength: 40,
      description: `A category, or empty for all: ${materialCategories.join(", ")}.`,
    },
    include_benchmarks: {
      kind: "boolean",
      description: "true to include the whole-building benchmarks by building type (residential, office, school, retail).",
    },
    limit: { kind: "integer", min: 0, max: 25, description: "How many materials to return, 1 to 25. 0 for the default of 25." },
  },
  status: () => "Checking embodied carbon factors",
  run: (input) => {
    let rows = iceDatabase;
    if (input.category && input.category.toLowerCase() !== "any") {
      const cat = materialCategories.find((c) => c.toLowerCase() === input.category.toLowerCase()) ?? materialCategories.find((c) => wordsMatch(c, input.category));
      if (!cat) return fail(`No material category called "${input.category}". Categories: ${materialCategories.join(", ")}.`);
      rows = rows.filter((m) => m.category === cat);
    }
    if (input.material) rows = rows.filter((m) => wordsMatch(`${m.name} ${m.id.replace(/-/g, " ")}`, input.material));
    const wantMaterials = !!(input.material || (input.category && input.category.toLowerCase() !== "any"));
    if (wantMaterials && !rows.length) {
      const near = closest(input.material || input.category, iceDatabase.map((m) => m.name), 8, 0.3);
      return fail(`No material in the ICE data held by Pulse matches "${input.material}"${input.category ? ` in ${input.category}` : ""}. ${near.length ? `Closest names: ${near.join("; ")}.` : `Categories: ${materialCategories.join(", ")}.`}`);
    }
    const limit = input.limit === 0 ? 25 : input.limit;
    const shown = wantMaterials || !input.include_benchmarks ? rows.slice(0, limit) : [];

    const benchmarks = input.include_benchmarks
      ? Object.entries(carbonBenchmarks).map(([key, b]) => ({
          benchmark: b.label,
          unit: "kgCO2e per m2 GIA",
          lifecycleScope: BENCHMARK_SCOPES[key] ?? "Lifecycle scope not recorded in Pulse's carbon data",
          residential: b.residential,
          office: b.office,
          school: b.school,
          retail: b.retail,
        }))
      : null;

    const sourceLine = `${ICE_SOURCE.dataset.replace(", as held in Pulse's Carbon Calculator", "")}, ${ICE_SOURCE.publisher}, ${ICE_VERSION} as recorded in Pulse. kgCO2e per kg, modules A1 to A3 unless noted. Generic values, not product EPDs.`;
    const tables = [];
    if (shown.length) {
      tables.push({
        title: "Embodied carbon factors (kgCO2e per kg, A1 to A3 unless noted)",
        columns: ["Material", "Category", "Embodied carbon (kgCO2e per kg)", "Density (kg per m3)", "Typical applications", "Notes"],
        rows: shown.map((m) => [m.name, m.category, m.embodiedCarbon, m.density ?? null, m.typicalApplications ?? "", m.notes ?? ""]),
        source: sourceLine,
        fileStem: "pulse-embodied-carbon",
        pulsePage: "/materials",
      });
    }
    if (benchmarks) {
      tables.push({
        title: "Whole-building embodied carbon benchmarks (kgCO2e per m2 GIA)",
        columns: ["Benchmark", "Residential", "Office", "School", "Retail", "Lifecycle scope"],
        rows: benchmarks.map((b) => [b.benchmark, b.residential, b.office, b.school, b.retail, b.lifecycleScope]),
        source: "LETI Climate Emergency Design Guide (2020) and RIBA 2030 Climate Challenge targets, as recorded in Pulse's carbon data.",
        fileStem: "pulse-embodied-carbon-benchmarks",
        pulsePage: "/materials",
      });
    }

    return {
      ok: true,
      payload: {
        source: ICE_SOURCE,
        dataPeriod: `ICE Database ${ICE_VERSION}, as recorded in Pulse's carbon data`,
        generatedAt: null,
        pulsePage: "/materials",
        caveats: [
          "Generic, representative industry-average values for the UK market, not product-specific EPD figures. For design-stage decisions use the manufacturer's EPD.",
          "Factors are kgCO2e per kg of material, modules A1 to A3 (cradle to gate) unless a record's notes say otherwise. They exclude transport to site, construction, use and end of life.",
          "To estimate a material's carbon, multiply the factor by the mass in kg (volume in m3 x density in kg per m3 gives the mass). For a whole building, use the Carbon Calculator at /materials.",
        ],
        unit: "kgCO2e per kg",
        materialsMatched: shown.length ? rows.length : 0,
        materialsReturned: shown.length,
        materials: shown.map((m) => ({
          name: m.name,
          category: m.category,
          embodiedCarbonKgCo2ePerKg: m.embodiedCarbon,
          unit: "kgCO2e per kg",
          densityKgPerM3: m.density ?? null,
          notes: m.notes ?? null,
          typicalApplications: m.typicalApplications ?? null,
          futureHomesStandardRecommended: m.fhsRecommended ?? null,
          lowerCarbonAlternatives: (m.alternatives ?? []).map((id) => {
            const alt = byId.get(id);
            return alt ? `${alt.name} (${alt.embodiedCarbon} kgCO2e per kg)` : id;
          }),
          ...(m.thermalConductivity != null ? { thermalConductivityWPerMK: m.thermalConductivity } : {}),
          ...(m.fireRating ? { fireRatingEuroclass: m.fireRating } : {}),
        })),
        benchmarks,
      },
      tables,
    };
  },
});
