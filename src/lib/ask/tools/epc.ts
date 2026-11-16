// get_epc_councils: EPC band counts per council from the full MHCLG register
// (src/data/epc-snapshot.json). get_epc_postcode: a live MHCLG lookup for one
// postcode, returning aggregates only, never addresses or certificates, and
// never sample data.
import epcSnapshot from "@/data/epc-snapshot.json";
import { searchEpcByPostcode, type MHCLGRow } from "@/lib/epc-live";
import { closest, norm, round, wordsMatch } from "../schema";
import { defineTool, fail } from "./common";

const BANDS = ["A", "B", "C", "D", "E", "F", "G"] as const;
type BandCounts = Record<(typeof BANDS)[number], number>;

interface CouncilRow {
  council: string;
  code: string;
  region: string;
  total: number;
  bandCounts: BandCounts;
  belowCPct: number;
  urgentPct: number;
  compliantPct: number;
}

interface EpcSnapshot {
  generatedAt: string;
  method: string;
  source: string;
  dataTo: string;
  certificatesProcessed: number;
  propertiesCounted: number;
  notes: string[];
  national: Omit<CouncilRow, "council" | "code" | "region">;
  councils: CouncilRow[];
}

const snap = epcSnapshot as unknown as EpcSnapshot;

// Regions as the ONS list names them, with the spellings people use.
const REGION_ALIASES: Record<string, string> = {
  yorkshire: "Yorkshire and The Humber",
  yorkshireandhumber: "Yorkshire and The Humber",
  yorkshireandthehumber: "Yorkshire and The Humber",
  eastofengland: "East of England",
  eastengland: "East of England",
  east: "East of England",
};

export function resolveEpcRegion(asked: string): string | null {
  const regions = [...new Set(snap.councils.map((c) => c.region))];
  const n = norm(asked);
  return regions.find((r) => norm(r) === n) ?? REGION_ALIASES[n] ?? null;
}

const SORTS = ["below_c_desc", "below_c_asc", "homes_desc", "name"] as const;

const EPC_SOURCE = {
  publisher: "Ministry of Housing, Communities and Local Government (MHCLG)",
  dataset: "Energy Performance of Buildings register (domestic), full download",
  url: "https://get-energy-performance-data.communities.gov.uk",
};

export const getEpcCouncils = defineTool({
  name: "get_epc_councils",
  description:
    "Domestic EPC band counts for every council in England and Wales (318 councils) plus the England and Wales total, computed by Pulse from the full MHCLG Energy Performance of Buildings register, latest certificate per property. " +
    "Each row: council, region, homes with an EPC, homes in each band A to G, % below band C (D to G), % in bands E to G, % at C or above. " +
    "Use for questions about councils, regions or the national picture: which councils have the most homes below C, how a council compares, a region's councils. Filter by council name and/or region, choose the sort and how many rows.",
  spec: {
    council: {
      kind: "string",
      maxLength: 80,
      description: "Words that must appear in the council name, e.g. \"Leeds\", \"Camden\". Empty for no name filter.",
    },
    region: {
      kind: "string",
      maxLength: 40,
      description:
        "One region, or empty for all: North East, North West, Yorkshire and The Humber, East Midlands, West Midlands, East of England, London, South East, South West, Wales.",
    },
    sort: {
      kind: "enum",
      values: SORTS,
      description: "below_c_desc (highest share below C first), below_c_asc, homes_desc (most homes with an EPC first) or name.",
    },
    limit: {
      kind: "integer",
      min: 0,
      max: 50,
      description: "How many councils to return, 1 to 50. 0 for the default of 20.",
    },
  },
  status: (i) => (i.region ? `Checking EPC ratings for councils in ${i.region}` : "Checking EPC ratings by council"),
  run: (input) => {
    let rows = snap.councils;
    if (input.region) {
      const region = resolveEpcRegion(input.region);
      if (!region) {
        const regions = [...new Set(snap.councils.map((c) => c.region))].sort();
        return fail(`No region called "${input.region}". EPC regions held (England and Wales only): ${regions.join(", ")}. Scotland and Northern Ireland are not covered.`);
      }
      rows = rows.filter((c) => c.region === region);
    }
    if (input.council) {
      rows = rows.filter((c) => wordsMatch(c.council, input.council));
      if (!rows.length) {
        const near = closest(input.council, snap.councils.map((c) => c.council));
        return fail(
          `No council in England and Wales matches "${input.council}"${input.region ? ` in ${input.region}` : ""}. ${near.length ? `Closest names: ${near.join("; ")}.` : "Councils in Scotland and Northern Ireland are not covered."}`,
        );
      }
    }
    const sorted = [...rows].sort((a, b) => {
      switch (input.sort) {
        case "below_c_asc":
          return a.belowCPct - b.belowCPct;
        case "homes_desc":
          return b.total - a.total;
        case "name":
          return a.council.localeCompare(b.council);
        default:
          return b.belowCPct - a.belowCPct;
      }
    });
    const limit = input.limit === 0 ? 20 : input.limit;
    const shown = sorted.slice(0, limit);
    const belowC = (b: BandCounts) => b.D + b.E + b.F + b.G;

    return {
      ok: true,
      payload: {
        source: EPC_SOURCE,
        dataPeriod: `certificates lodged to ${snap.dataTo}`,
        generatedAt: snap.generatedAt,
        pulsePage: "/dashboard/epc",
        caveats: [
          "England and Wales only.",
          "Counts the latest certificate per property, and only homes that have an EPC: homes never assessed are not counted.",
          ...snap.notes.filter((n) => /below-c|band d/i.test(n)),
        ],
        englandAndWales: {
          homesWithEpc: snap.national.total,
          bandCounts: snap.national.bandCounts,
          homesBelowC: belowC(snap.national.bandCounts),
          belowCPct: snap.national.belowCPct,
          bandsEtoGPct: snap.national.urgentPct,
          atCOrAbovePct: snap.national.compliantPct,
        },
        councilsMatched: rows.length,
        councilsReturned: shown.length,
        sortedBy: input.sort,
        councils: shown.map((c) => ({
          council: c.council,
          region: c.region,
          homesWithEpc: c.total,
          bandCounts: c.bandCounts,
          homesBelowC: belowC(c.bandCounts),
          belowCPct: c.belowCPct,
          bandsEtoGPct: c.urgentPct,
          atCOrAbovePct: c.compliantPct,
        })),
      },
      tables: [
        {
          title: `Domestic EPC ratings by council${input.region ? `, ${resolveEpcRegion(input.region)}` : ""} (latest certificate per home)`,
          columns: ["Council", "Region", "Homes with an EPC", ...BANDS.map((b) => `Band ${b}`), "Homes below C", "% below C", "% bands E to G"],
          rows: shown.map((c) => [c.council, c.region, c.total, ...BANDS.map((b) => c.bandCounts[b]), belowC(c.bandCounts), c.belowCPct, c.urgentPct]),
          source: `${EPC_SOURCE.publisher}, ${EPC_SOURCE.dataset}, certificates to ${snap.dataTo}. England and Wales only.`,
          fileStem: "pulse-epc-councils",
          pulsePage: "/dashboard/epc",
        },
      ],
    };
  },
});

// UK postcode, loosely: outward code + inward code, space optional.
const POSTCODE = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s*[0-9][A-Z]{2}$/;

export function normalisePostcode(raw: string): string | null {
  const p = raw.toUpperCase().replace(/\s+/g, " ").trim();
  if (!POSTCODE.test(p)) return null;
  const compact = p.replace(/\s/g, "");
  return `${compact.slice(0, -3)} ${compact.slice(-3)}`;
}

/** Aggregates from register rows: one record per property (latest by UPRN), no addresses. */
export function aggregateEpcRows(rows: MHCLGRow[]) {
  const byUprn = new Map<number, MHCLGRow>();
  const noUprn: MHCLGRow[] = [];
  for (const r of rows) {
    if (r.uprn == null) {
      noUprn.push(r);
      continue;
    }
    const existing = byUprn.get(r.uprn);
    if (!existing || (r.registrationDate ?? "") > (existing.registrationDate ?? "")) byUprn.set(r.uprn, r);
  }
  const unique = [...byUprn.values(), ...noUprn];
  const bandCounts = Object.fromEntries(BANDS.map((b) => [b, 0])) as BandCounts;
  let other = 0;
  for (const r of unique) {
    const band = (r.currentEnergyEfficiencyBand ?? "").toUpperCase() as (typeof BANDS)[number];
    if (BANDS.includes(band)) bandCounts[band]++;
    else other++;
  }
  const rated = unique.length - other;
  const below = bandCounts.D + bandCounts.E + bandCounts.F + bandCounts.G;
  const dates = rows.map((r) => r.registrationDate).filter(Boolean).sort();
  const councils = [...new Set(rows.map((r) => r.council).filter((c): c is string => !!c))];
  return {
    certificatesReturned: rows.length,
    propertiesCounted: unique.length,
    bandCounts,
    unknownBand: other,
    homesBelowC: below,
    belowCPct: rated ? round((below / rated) * 100) : null,
    earliestCertificate: dates[0]?.slice(0, 10) ?? null,
    latestCertificate: dates[dates.length - 1]?.slice(0, 10) ?? null,
    councils,
  };
}

export const getEpcPostcode = defineTool({
  name: "get_epc_postcode",
  description:
    "Live lookup of one postcode in the MHCLG domestic EPC register (England and Wales). Returns aggregates only: certificates found, homes counted (latest certificate per property), homes in each band A to G, homes below band C and the % below C, and the date range of the certificates. It never returns addresses or individual certificates. " +
    "Use when the person gives a specific postcode. For a council or region use get_epc_councils instead.",
  spec: {
    postcode: { kind: "string", maxLength: 10, description: "A full UK postcode, e.g. \"LS1 4AP\"." },
  },
  status: (i) => `Looking up EPC certificates in ${i.postcode.toUpperCase()}`,
  run: async (input, ctx) => {
    const postcode = normalisePostcode(input.postcode);
    if (!postcode) return fail(`"${input.postcode}" is not a full UK postcode. Ask the person for a full postcode such as "LS1 4AP".`);
    if (!ctx.epcToken) {
      return fail("The live EPC postcode lookup is not available right now. Say so, and offer the council-level figures (get_epc_councils) instead.");
    }
    const search = ctx.searchEpc ?? searchEpcByPostcode;
    const found = await search(postcode, ctx.epcToken);
    if (found.kind === "http-error" || found.kind === "fetch-error") {
      return fail("The MHCLG EPC register could not be reached just now. Say the live postcode lookup is unavailable, suggest trying again later, and offer the council-level figures instead.");
    }
    const fetchedAt = ctx.now.toISOString();
    const base = {
      source: { publisher: EPC_SOURCE.publisher, dataset: "Energy Performance of Buildings register (domestic), live search", url: EPC_SOURCE.url },
      dataPeriod: `live register, looked up ${fetchedAt.slice(0, 10)}`,
      generatedAt: fetchedAt,
      pulsePage: "/dashboard/epc",
    };
    if (found.kind === "none") {
      return {
        ok: true,
        payload: { ...base, caveats: ["England and Wales only.", "No domestic certificates are lodged for this postcode, or it is not a valid postcode in England and Wales."], postcode, certificatesFound: 0 },
        tables: [],
      };
    }
    const agg = aggregateEpcRows(found.rows);
    const caveats = [
      "England and Wales only.",
      "Only homes with an EPC are counted; one record per property (the latest certificate).",
      "Aggregates only: Pulse does not show addresses or individual certificates in Ask Pulse.",
    ];
    if (found.totalResults > found.rows.length) {
      caveats.push(`The register holds ${found.totalResults} certificates for this postcode; these figures are based on the first ${found.rows.length}.`);
    }
    return {
      ok: true,
      payload: { ...base, caveats, postcode, registerTotal: found.totalResults, ...agg },
      tables: [
        {
          title: `Domestic EPC ratings in ${postcode} (latest certificate per home)`,
          columns: ["Band", "Homes"],
          rows: [...BANDS.map((b) => [b, agg.bandCounts[b]] as Array<string | number>), ["Below C (D to G)", agg.homesBelowC], ["All homes counted", agg.propertiesCounted]],
          source: `${EPC_SOURCE.publisher}, Energy Performance of Buildings register, live search on ${fetchedAt.slice(0, 10)}. England and Wales only.`,
          fileStem: `pulse-epc-${postcode.replace(/\s/g, "").toLowerCase()}`,
          pulsePage: "/dashboard/epc",
        },
      ],
    };
  },
});
