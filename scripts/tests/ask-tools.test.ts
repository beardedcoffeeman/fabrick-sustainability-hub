// Ask Pulse: the data tools against the real snapshot files, plus the pure
// parts (request checks, event stream, CSV, markdown, prompt rules).
//   npm run test:ask        (or: npx tsx scripts/tests/ask-tools.test.ts)
// No network: the live postcode and grid lookups are tested with stand-ins.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ASK_TOOLS, ASK_TOOL_DEFS, MAX_RESULT_CHARS, runAskTool, serialisePayload, type ToolContext } from "../../src/lib/ask/tools";
import { checkInput } from "../../src/lib/ask/schema";
import {
  ASK_MAX_CHARS,
  ASK_MAX_MESSAGES,
  ASK_SUGGESTIONS,
  EventLineReader,
  checkAskRequest,
  csvFileName,
  encodeEvent,
  saidNotHeld,
  tableToCsv,
} from "../../src/lib/ask/pure";
import { parseAnswerMarkdown } from "../../src/lib/ask/markdown";
import { ASK_INSTRUCTIONS, askContextText } from "../../src/lib/ask/prompt";
import type { AskTable, ToolOutcome, ToolPayload } from "../../src/lib/ask/types";
import { getDatasetCounts } from "../../src/lib/planning";
import { buildConstructionOutput, loadConstructionOutputSnapshot } from "../../src/lib/construction-output";
import type { EpcSearchResult, MHCLGRow } from "../../src/lib/epc-live";
import type { CarbonIntensityNow } from "../../src/lib/carbon-intensity";

const ctx: ToolContext = { now: new Date("2026-11-16T14:00:00Z") };
const DASHES = /[–—]/;

async function ok(name: string, input: unknown, c: ToolContext = ctx): Promise<{ payload: ToolPayload; tables: AskTable[] }> {
  const o: ToolOutcome = await runAskTool(name, input, c);
  if (!o.ok) assert.fail(`${name} failed: ${o.error}`);
  return o;
}

async function err(name: string, input: unknown, c: ToolContext = ctx): Promise<string> {
  const o = await runAskTool(name, input, c);
  assert.equal(o.ok, false, `${name} should have failed for ${JSON.stringify(input)}`);
  return (o as { ok: false; error: string }).error;
}

/** Every result names its source, period, Pulse page and caveats, and fits the size bound. */
function assertEnvelope(p: ToolPayload, pulsePage: RegExp) {
  assert.ok(p.source.publisher.length > 0, "publisher");
  assert.ok(p.source.dataset.length > 0, "dataset");
  assert.ok(p.dataPeriod.length > 0, "dataPeriod");
  assert.match(p.pulsePage, pulsePage);
  assert.ok(Array.isArray(p.caveats) && p.caveats.length > 0, "caveats");
  assert.ok(serialisePayload(p).length <= MAX_RESULT_CHARS, "bounded");
}

/** A display table is rectangular, has a source line and a safe file stem. */
function assertTable(t: AskTable) {
  assert.ok(t.title && t.source && t.pulsePage.startsWith("/"));
  assert.match(t.fileStem, /^pulse-[a-z0-9-]+$/);
  for (const r of t.rows) assert.equal(r.length, t.columns.length, `row width in ${t.title}`);
  for (const r of t.rows) for (const v of r) assert.ok(v === null || typeof v === "string" || typeof v === "number");
}

const PLANNING_DEFAULTS = { sector: "any", lpa: "", region: "any", decision: "any", date_from: "", date_to: "", text: "" };

// ----- Definitions ---------------------------------------------------------------------------------

test("tool definitions are strict, closed, fully required, union-free and fixed", () => {
  assert.equal(ASK_TOOL_DEFS.length, 9);
  assert.ok(ASK_TOOL_DEFS.length <= 20, "strict tools per request");
  assert.deepEqual(
    ASK_TOOL_DEFS.map((t) => t.name),
    [
      "get_material_prices",
      "get_construction_output",
      "get_epc_councils",
      "get_epc_postcode",
      "get_grid_carbon",
      "search_planning_applications",
      "get_planning_conditions",
      "get_regulations",
      "get_embodied_carbon",
    ],
  );
  let optional = 0;
  let unions = 0;
  for (const t of ASK_TOOL_DEFS) {
    assert.equal(t.strict, true);
    assert.equal(t.eager_input_streaming, true);
    const s = t.input_schema as { additionalProperties?: boolean; required?: string[]; properties: Record<string, Record<string, unknown>> };
    assert.equal(s.additionalProperties, false);
    const props = Object.keys(s.properties);
    optional += props.filter((p) => !s.required?.includes(p)).length;
    for (const p of Object.values(s.properties)) {
      if ("anyOf" in p || Array.isArray(p.type)) unions++;
      for (const banned of ["minimum", "maximum", "minLength", "maxLength", "pattern"]) assert.ok(!(banned in p), `${t.name}: ${banned} not supported`);
    }
    assert.ok(!DASHES.test(t.description ?? ""), `${t.name} description has a dash`);
  }
  assert.equal(optional, 0, "no optional parameters");
  assert.equal(unions, 0, "no union-typed parameters");
  // Deterministic, so the cached prefix holds.
  assert.equal(JSON.stringify(ASK_TOOL_DEFS), JSON.stringify(ASK_TOOLS.map((t) => ASK_TOOL_DEFS.find((d) => d.name === t.name))));
});

test("input validation rejects junk and accepts enum values in any case", async () => {
  const spec = ASK_TOOLS.find((t) => t.name === "get_epc_councils")!.spec;
  const good = { council: "", region: "", sort: "below_c_desc", limit: 0 };
  assert.equal(checkInput(spec, good).ok, true);
  assert.equal(checkInput(spec, null).ok, false);
  assert.equal(checkInput(spec, [good]).ok, false);
  assert.equal(checkInput(spec, "region=London").ok, false);
  assert.equal(checkInput(spec, { ...good, extra: 1 }).ok, false);
  assert.equal(checkInput(spec, { council: "", region: "", sort: "below_c_desc" }).ok, false);
  assert.equal(checkInput(spec, { ...good, limit: "5" }).ok, false);
  assert.equal(checkInput(spec, { ...good, limit: 2.5 }).ok, false);
  assert.equal(checkInput(spec, { ...good, limit: 51 }).ok, false);
  assert.equal(checkInput(spec, { ...good, limit: -1 }).ok, false);
  assert.equal(checkInput(spec, { ...good, sort: "random" }).ok, false);
  assert.equal(checkInput(spec, { ...good, council: "x".repeat(81) }).ok, false);
  const upper = checkInput(spec, { ...good, sort: "BELOW_C_DESC" });
  assert.ok(upper.ok && (upper.value as Record<string, unknown>).sort === "below_c_desc");
  assert.match(await err("get_epc_councils", { ...good, limit: 999 }), /^INVALID_INPUT/);
  assert.match(await err("no_such_tool", {}), /Unknown tool/);
});

// ----- Material prices -----------------------------------------------------------------------------

test("get_material_prices filters by name and category, and says these are indices", async () => {
  const { payload, tables } = await ok("get_material_prices", { query: "steel", category: "any" });
  assertEnvelope(payload, /^\/dashboard\/material-prices$/);
  const rows = payload.materials as Array<{ name: string; latestIndex: number; lastSixMonths: unknown[] }>;
  assert.ok(rows.length >= 1);
  for (const r of rows) assert.match(r.name.toLowerCase(), /steel/);
  for (const r of rows) assert.equal(r.lastSixMonths.length, 6);
  assert.ok(payload.caveats.some((c) => /not prices in pounds/.test(c)));
  assert.equal(tables.length, 1);
  assertTable(tables[0]);
  assert.equal(tables[0].rows.length, rows.length);

  const timber = await ok("get_material_prices", { query: "", category: "timber" });
  const t = timber.payload.materials as Array<{ category: string }>;
  assert.ok(t.length > 0 && t.every((m) => m.category === "Timber"));

  const all = await ok("get_material_prices", { query: "", category: "any" });
  assert.ok((all.payload.materials as unknown[]).length <= 30);

  assert.match(await err("get_material_prices", { query: "unobtainium", category: "any" }), /No material index/);
  assert.match(await err("get_material_prices", { query: "", category: "Glass" }), /No category/);
});

// ----- Construction output -------------------------------------------------------------------------

test("get_construction_output returns the months asked, with totals matching the dashboard's maths", async () => {
  const { payload, tables } = await ok("get_construction_output", { series: ["infrastructureNewWork"], months: 6 });
  assertEnvelope(payload, /^\/dashboard\/construction-output$/);
  const [s] = payload.series as Array<{
    key: string;
    monthly: Array<{ valueGbpMillion: number }>;
    window: { totalGbpMillion: number; months: number };
    monthOnMonthPct: number;
  }>;
  assert.equal(s.key, "infrastructureNewWork");
  assert.equal(s.monthly.length, 6);
  assert.equal(s.window.months, 6);
  assert.equal(s.window.totalGbpMillion, s.monthly.reduce((n, m) => n + m.valueGbpMillion, 0));
  assert.ok(payload.caveats.some((c) => /Great Britain/.test(c)));
  assertTable(tables[0]);
  assert.equal(tables[0].rows.length, 6);

  const def = await ok("get_construction_output", { series: [], months: 0 });
  const ds = def.payload.series as Array<{ key: string; monthly: unknown[]; monthOnMonthPct: number }>;
  assert.deepEqual(ds.map((x) => x.key), ["allWork", "allNewWork", "allRepairMaintenance"]);
  assert.equal(ds[0].monthly.length, 12);
  // Same maths as GET /api/construction-output.
  const route = buildConstructionOutput(loadConstructionOutputSnapshot());
  assert.equal(ds[0].monthOnMonthPct, Math.round((route.totalOutput.momChange as number) * 10) / 10);

  assert.match(await err("get_construction_output", { series: ["housing"], months: 6 }), /^INVALID_INPUT/);
  assert.match(await err("get_construction_output", { series: [], months: 37 }), /^INVALID_INPUT/);
});

// ----- EPC -----------------------------------------------------------------------------------------

test("get_epc_councils filters by region and name, sorts, limits and carries the national figure", async () => {
  const { payload, tables } = await ok("get_epc_councils", { council: "", region: "North West", sort: "below_c_desc", limit: 5 });
  assertEnvelope(payload, /^\/dashboard\/epc$/);
  const rows = payload.councils as Array<{ region: string; belowCPct: number; homesWithEpc: number }>;
  assert.equal(rows.length, 5);
  assert.ok(rows.every((r) => r.region === "North West"));
  for (let i = 1; i < rows.length; i++) assert.ok(rows[i - 1].belowCPct >= rows[i].belowCPct);
  assert.ok((payload.englandAndWales as { homesWithEpc: number }).homesWithEpc > 1_000_000);
  assert.ok(payload.caveats.some((c) => /England and Wales only/.test(c)));
  assertTable(tables[0]);

  const yorks = await ok("get_epc_councils", { council: "", region: "Yorkshire & Humber", sort: "name", limit: 50 });
  assert.ok((yorks.payload.councils as Array<{ region: string }>).every((r) => r.region === "Yorkshire and The Humber"));

  const leeds = await ok("get_epc_councils", { council: "leeds", region: "", sort: "name", limit: 0 });
  assert.ok((leeds.payload.councils as Array<{ council: string }>).every((r) => /leeds/i.test(r.council)));

  const big = await ok("get_epc_councils", { council: "", region: "", sort: "homes_desc", limit: 50 });
  assert.equal((big.payload.councils as unknown[]).length, 50);
  assert.equal(big.payload.councilsMatched, 318);

  assert.match(await err("get_epc_councils", { council: "Glasgow", region: "", sort: "name", limit: 0 }), /No council/);
  assert.match(await err("get_epc_councils", { council: "", region: "Scotland", sort: "name", limit: 0 }), /No region/);
});

const ROWS: MHCLGRow[] = [
  { certificateNumber: "1", addressLine1: "1 Secret Lane", addressLine2: null, addressLine3: null, addressLine4: null, postcode: "LS1 4AP", postTown: "LEEDS", council: "Leeds", constituency: null, currentEnergyEfficiencyBand: "D", registrationDate: "2019-01-01", uprn: 100 },
  { certificateNumber: "2", addressLine1: "1 Secret Lane", addressLine2: null, addressLine3: null, addressLine4: null, postcode: "LS1 4AP", postTown: "LEEDS", council: "Leeds", constituency: null, currentEnergyEfficiencyBand: "B", registrationDate: "2024-06-01", uprn: 100 },
  { certificateNumber: "3", addressLine1: "2 Hidden Road", addressLine2: "Flat 9", addressLine3: null, addressLine4: null, postcode: "LS1 4AP", postTown: "LEEDS", council: "Leeds", constituency: null, currentEnergyEfficiencyBand: "E", registrationDate: "2021-03-04", uprn: 101 },
  { certificateNumber: "4", addressLine1: "3 Private Close", addressLine2: null, addressLine3: null, addressLine4: null, postcode: "LS1 4AP", postTown: "LEEDS", council: "Leeds", constituency: null, currentEnergyEfficiencyBand: "C", registrationDate: "2022-07-08", uprn: null },
];

test("get_epc_postcode never returns sample data or addresses", async () => {
  // No token: an error, never the route's generated sample data.
  const noToken = await err("get_epc_postcode", { postcode: "LS1 4AP" });
  assert.match(noToken, /not available/);
  assert.doesNotMatch(noToken, /Sample Street/);

  let asked = "";
  const live: ToolContext = {
    ...ctx,
    epcToken: "test-token",
    searchEpc: async (postcode): Promise<EpcSearchResult> => {
      asked = postcode;
      return { kind: "ok", rows: ROWS, totalResults: ROWS.length };
    },
  };
  const { payload, tables } = await ok("get_epc_postcode", { postcode: "ls14ap" }, live);
  assert.equal(asked, "LS1 4AP");
  assertEnvelope(payload, /^\/dashboard\/epc$/);
  assert.equal(payload.certificatesReturned, 4);
  assert.equal(payload.propertiesCounted, 3, "deduped by UPRN, latest certificate");
  const bands = payload.bandCounts as Record<string, number>;
  assert.equal(bands.B, 1);
  assert.equal(bands.D, 0, "the older D certificate is superseded");
  assert.equal(payload.homesBelowC, 1);
  const out = JSON.stringify({ payload, tables });
  for (const secret of ["Secret Lane", "Hidden Road", "Private Close", "Flat 9", "Sample Street", "certificateNumber", "uprn"]) {
    assert.ok(!out.includes(secret), `output must not contain ${secret}`);
  }
  assertTable(tables[0]);

  const down: ToolContext = { ...live, searchEpc: async () => ({ kind: "http-error", status: 500, statusText: "Server Error" }) };
  assert.match(await err("get_epc_postcode", { postcode: "LS1 4AP" }, down), /could not be reached/);
  const thrown: ToolContext = { ...live, searchEpc: async () => ({ kind: "fetch-error", error: new Error("dns") }) };
  assert.match(await err("get_epc_postcode", { postcode: "LS1 4AP" }, thrown), /could not be reached/);
  const none: ToolContext = { ...live, searchEpc: async () => ({ kind: "none" }) };
  const empty = await ok("get_epc_postcode", { postcode: "LS1 4AP" }, none);
  assert.equal(empty.payload.certificatesFound, 0);
  assert.match(await err("get_epc_postcode", { postcode: "LS1" }, live), /not a full UK postcode/);
  assert.match(await err("get_epc_postcode", { postcode: "<script>" }, live), /not a full UK postcode/);
  assert.match(await err("get_epc_postcode", { postcode: "not a postcode" }, live), /^INVALID_INPUT/);
});

// ----- Grid ----------------------------------------------------------------------------------------

const GRID: CarbonIntensityNow = {
  current: { from: "2026-11-16T13:30Z", to: "2026-11-16T14:00Z", intensity: { forecast: 196, actual: 178, index: "high" } },
  generation: { from: "2026-11-16T13:30Z", to: "2026-11-16T14:00Z", generationmix: [{ fuel: "wind", perc: 12.9 }, { fuel: "gas", perc: 44.9 }] },
  regional: {
    from: "2026-11-16T13:30Z",
    to: "2026-11-16T14:00Z",
    regions: [{ regionid: 13, shortname: "London", intensity: { forecast: 210, index: "high" }, generationmix: [{ fuel: "gas", perc: 50 }] }],
  },
  forecast: [
    { from: "2026-11-16T13:30Z", to: "2026-11-16T14:00Z", intensity: { forecast: 196, actual: 178, index: "high" } },
    { from: "2026-11-16T14:00Z", to: "2026-11-16T14:30Z", intensity: { forecast: 150, index: "moderate" } },
    { from: "2026-11-16T14:30Z", to: "2026-11-16T15:00Z", intensity: { forecast: 120, index: "moderate" } },
  ],
};

test("get_grid_carbon reports the live reading, mix and rest of today, and errors when the API is down", async () => {
  const live: ToolContext = { ...ctx, now: new Date("2026-11-16T14:05:00Z"), fetchGrid: async () => GRID };
  const { payload, tables } = await ok("get_grid_carbon", { region: "london" }, live);
  assertEnvelope(payload, /^\/dashboard\/carbon-intensity$/);
  assert.equal((payload.national as { actualGCo2PerKwh: number }).actualGCo2PerKwh, 178);
  assert.equal((payload.generationMixPct as Array<{ fuel: string }>)[0].fuel, "gas");
  const rest = payload.restOfToday as { halfHours: number; lowest: { forecastGCo2PerKwh: number } };
  assert.equal(rest.halfHours, 2);
  assert.equal(rest.lowest.forecastGCo2PerKwh, 120);
  assert.equal((payload.region as { name: string }).name, "London");
  assert.equal(tables.length, 2);
  tables.forEach(assertTable);
  assert.match(await err("get_grid_carbon", { region: "Atlantis" }, live), /No grid region/);
  const down: ToolContext = { ...ctx, fetchGrid: async () => Promise.reject(new Error("down")) };
  assert.match(await err("get_grid_carbon", { region: "" }, down), /could not be reached/);
});

// ----- Planning ------------------------------------------------------------------------------------

test("search_planning_applications filters, bounds and always carries the coverage caveat", async () => {
  const counts = getDatasetCounts();
  const { payload, tables } = await ok("search_planning_applications", {
    ...PLANNING_DEFAULTS,
    sector: "data-centre",
    lpa: "Ealing",
    decision: "approved",
    condition_type: "any",
    has_conditions: "any",
    limit: 0,
  });
  assertEnvelope(payload, /^\/research\/planning-explorer/);
  const apps = payload.applications as Array<{ sector: string; authority: string; decision: string }>;
  assert.ok(apps.length > 0 && apps.length <= 25);
  assert.ok(apps.every((a) => a.sector === "Data centres" && /Ealing/.test(a.authority) && a.decision === "approved"));
  const caveat = payload.caveats.join(" ");
  assert.match(caveat, /sample, not national coverage/);
  assert.ok(caveat.includes(`${counts.total.toLocaleString("en-GB")} applications from ${counts.lpas.length} planning authorities`));
  assert.ok(caveat.includes(`${counts.extracted.toLocaleString("en-GB")} applications have had their decision notice read`));
  assertTable(tables[0]);
  assert.ok(tables[0].source.includes("not national coverage"));

  const all = await ok("search_planning_applications", { ...PLANNING_DEFAULTS, condition_type: "any", has_conditions: "any", limit: 25 });
  assert.equal(all.payload.totalMatches, counts.total);
  assert.equal((all.payload.applications as unknown[]).length, 25);
  const bySector = (all.payload.breakdown as { bySector: Record<string, number> }).bySector;
  assert.equal(Object.values(bySector).reduce((a, b) => a + b, 0), counts.total);

  const withConds = await ok("search_planning_applications", { ...PLANNING_DEFAULTS, condition_type: "any", has_conditions: "yes", limit: 25 });
  assert.ok((withConds.payload.applications as Array<{ conditionsRead: number }>).every((a) => a.conditionsRead > 0));

  const dated = await ok("search_planning_applications", { ...PLANNING_DEFAULTS, date_from: "2025-01-01", date_to: "2025-12-31", condition_type: "any", has_conditions: "any", limit: 25 });
  assert.ok((dated.payload.applications as Array<{ decisionDate: string }>).every((a) => a.decisionDate >= "2025-01-01" && a.decisionDate <= "2025-12-31"));

  assert.match(await err("search_planning_applications", { ...PLANNING_DEFAULTS, date_from: "2024/01/01", condition_type: "any", has_conditions: "any", limit: 0 }), /YYYY-MM-DD/);
  assert.match(await err("search_planning_applications", { ...PLANNING_DEFAULTS, lpa: "Manchester", condition_type: "any", has_conditions: "any", limit: 0 }), /does not hold/);
  assert.match(await err("search_planning_applications", { ...PLANNING_DEFAULTS, sector: "casinos", condition_type: "any", has_conditions: "any", limit: 0 }), /^INVALID_INPUT/);
  assert.match(await err("search_planning_applications", { ...PLANNING_DEFAULTS, condition_type: "any", has_conditions: "any", limit: 26 }), /^INVALID_INPUT/);
});

test("get_planning_conditions finds conditions by type, by lens and for one application", async () => {
  const base = { application: "", discipline: "any", ...PLANNING_DEFAULTS, limit: 0 };
  const { payload, tables } = await ok("get_planning_conditions", { ...base, condition_type: "noise", sector: "logistics" });
  assertEnvelope(payload, /^\/research\/planning-explorer/);
  const conds = payload.conditions as Array<{ type: string; sector: string; reference: string; authority: string; excerpt: string }>;
  assert.ok(conds.length > 0 && conds.length <= 30);
  assert.ok(conds.every((c) => c.type === "Noise" && c.sector === "Logistics & warehousing" && c.reference && c.authority));
  assert.ok(conds.every((c) => c.excerpt.length <= 303));
  assert.ok(payload.caveats.join(" ").includes("not national coverage"));
  assertTable(tables[0]);

  const lens = await ok("get_planning_conditions", { ...base, condition_type: "any", discipline: "acoustic" });
  const lensConds = lens.payload.conditions as Array<{ excerpt: string; summary: string }>;
  assert.ok(lensConds.every((c) => !/construction (environmental )?management plan/i.test(`${c.summary} ${c.excerpt}`)));
  assert.ok(lens.payload.caveats.some((c) => /Discipline lens/.test(c)));

  const first = conds[0];
  const one = await ok("get_planning_conditions", { ...base, condition_type: "any", application: first.reference });
  const app = one.payload.application as { reference: string };
  assert.equal(app.reference, first.reference);
  assert.ok((one.payload.conditions as unknown[]).length > 0);

  assert.match(await err("get_planning_conditions", { ...base, condition_type: "any", application: "NOT-A-REF-123" }), /No application/);
});

// ----- Regulations ---------------------------------------------------------------------------------

test("get_regulations filters by date range and category", async () => {
  const { payload, tables } = await ok("get_regulations", { category: "any", status: "any", date_from: "2027-01-01", date_to: "2027-12-31", text: "" });
  assertEnvelope(payload, /^\/regulations$/);
  const regs = payload.regulations as Array<{ date: string }>;
  assert.ok(regs.length > 0);
  assert.ok(regs.every((r) => r.date.startsWith("2027")));
  assert.ok(payload.caveats.some((c) => /not legal advice/.test(c)));
  assertTable(tables[0]);
  const energy = await ok("get_regulations", { category: "energy", status: "any", date_from: "", date_to: "", text: "" });
  assert.ok((energy.payload.regulations as Array<{ category: string }>).every((r) => r.category === "energy"));
  assert.match(await err("get_regulations", { category: "any", status: "any", date_from: "next year", date_to: "", text: "" }), /YYYY-MM-DD/);
});

// ----- Embodied carbon -----------------------------------------------------------------------------

test("get_embodied_carbon returns factors with units, the ICE source line and the EPD caveat", async () => {
  const { payload, tables } = await ok("get_embodied_carbon", { material: "glulam", category: "", include_benchmarks: false, limit: 0 });
  assertEnvelope(payload, /^\/materials$/);
  const mats = payload.materials as Array<{ name: string; unit: string; embodiedCarbonKgCo2ePerKg: number }>;
  assert.ok(mats.length > 0);
  assert.ok(mats.every((m) => /glulam/i.test(m.name) && m.unit === "kgCO2e per kg" && typeof m.embodiedCarbonKgCo2ePerKg === "number"));
  assert.match(payload.source.dataset, /ICE Database/);
  assert.match(payload.dataPeriod, /v4\.1/);
  assert.ok(payload.caveats.some((c) => /not product-specific EPD/.test(c)));
  assert.ok(payload.caveats.some((c) => /A1 to A3/.test(c)));
  assert.equal(tables.length, 1);
  assertTable(tables[0]);
  assert.match(tables[0].source, /ICE Database .*v4\.1/);
  assert.match(tables[0].columns.join(" "), /kgCO2e per kg/);

  const cat = await ok("get_embodied_carbon", { material: "", category: "insulation", include_benchmarks: false, limit: 25 });
  const ins = cat.payload.materials as Array<{ category: string }>;
  assert.ok(ins.length > 0 && ins.length <= 25 && ins.every((m) => m.category === "Insulation"));

  const all = await ok("get_embodied_carbon", { material: "", category: "", include_benchmarks: false, limit: 0 });
  assert.equal((all.payload.materials as unknown[]).length, 25, "bounded to 25 rows");

  const bench = await ok("get_embodied_carbon", { material: "", category: "", include_benchmarks: true, limit: 0 });
  const b = bench.payload.benchmarks as Array<{ unit: string; lifecycleScope: string; residential: number }>;
  assert.equal(b.length, 3);
  assert.ok(b.every((x) => x.unit === "kgCO2e per m2 GIA" && x.lifecycleScope && typeof x.residential === "number"));
  assert.equal((bench.payload.materials as unknown[]).length, 0, "benchmarks only");
  bench.tables.forEach(assertTable);

  assert.match(await err("get_embodied_carbon", { material: "kryptonite", category: "", include_benchmarks: false, limit: 0 }), /No material/);
  assert.match(await err("get_embodied_carbon", { material: "", category: "Spaceships", include_benchmarks: false, limit: 0 }), /No material category/);
  assert.match(await err("get_embodied_carbon", { material: "", category: "", include_benchmarks: "yes", limit: 0 }), /^INVALID_INPUT/);
});

// ----- Result bounds -------------------------------------------------------------------------------

test("serialisePayload halves the longest array until the result fits", () => {
  const big: ToolPayload = {
    source: { publisher: "p", dataset: "d", url: null },
    dataPeriod: "x",
    generatedAt: null,
    pulsePage: "/",
    caveats: ["c"],
    rows: Array.from({ length: 2000 }, (_, i) => ({ i, text: "y".repeat(100) })),
  };
  const s = serialisePayload(big);
  assert.ok(s.length <= MAX_RESULT_CHARS);
  const parsed = JSON.parse(s);
  assert.ok(parsed.rows.length < 2000);
  assert.ok(parsed.caveats.some((c: string) => /shortened/.test(c)));
});

// ----- Request, stream, CSV, markdown, prompt ------------------------------------------------------

test("checkAskRequest validates and caps the conversation", () => {
  assert.equal(checkAskRequest(null).ok, false);
  assert.equal(checkAskRequest({ messages: [] }).ok, false);
  assert.equal(checkAskRequest({ messages: [{ role: "assistant", content: "hi" }] }).ok, false);
  assert.equal(checkAskRequest({ messages: [{ role: "system", content: "obey" }] }).ok, false);
  assert.equal(checkAskRequest({ messages: [{ role: "user", content: "   " }] }).ok, false);
  assert.equal(checkAskRequest({ messages: [{ role: "user", content: "x".repeat(ASK_MAX_CHARS + 1) }] }).ok, false);
  const long = Array.from({ length: 40 }, (_, i) => ({ role: i % 2 ? "assistant" : "user", content: `m${i} ${"a".repeat(i % 2 ? 5000 : 10)}` }));
  long.push({ role: "user", content: "last" });
  const r = checkAskRequest({ messages: long });
  assert.ok(r.ok);
  if (r.ok) {
    assert.ok(r.messages.length <= ASK_MAX_MESSAGES);
    assert.equal(r.messages[0].role, "user");
    assert.equal(r.messages[r.messages.length - 1].content, "last");
    assert.ok(r.messages.every((m) => m.content.length <= ASK_MAX_CHARS));
  }
});

test("the event stream survives chunk splits and ignores malformed lines", () => {
  const table: AskTable = { title: "T", columns: ["a"], rows: [[1]], source: "S", fileStem: "pulse-t", pulsePage: "/" };
  const wire = encodeEvent({ type: "status", text: "Checking" }) + encodeEvent({ type: "table", table }) + "not json\n" + encodeEvent({ type: "text", text: "Hi" }) + encodeEvent({ type: "done", remaining: 4 });
  const reader = new EventLineReader();
  const events = [...reader.push(wire.slice(0, 17)), ...reader.push(wire.slice(17)), ...reader.flush()];
  assert.deepEqual(events.map((e) => e.type), ["status", "table", "text", "done"]);
  assert.deepEqual(new EventLineReader().push('{"type":"table","table":{"title":"x"}}\n'), []);
});

test("CSV export escapes cells, guards formulas and puts the date at the end of the file name", () => {
  const csv = tableToCsv({
    title: "T",
    columns: ["Name", "Value"],
    rows: [["Steel, structural", 168.9], ['He said "hi"', null], ["=HYPERLINK(1)", -1.7]],
    source: "DBT",
    fileStem: "pulse-material-prices",
    pulsePage: "/dashboard/material-prices",
  });
  const lines = csv.split("\r\n");
  assert.equal(lines[0], "Name,Value");
  assert.equal(lines[1], '"Steel, structural",168.9');
  assert.equal(lines[2], '"He said ""hi""",');
  assert.equal(lines[3], "'=HYPERLINK(1),-1.7");
  assert.ok(csv.includes("Source: DBT"));
  assert.equal(csvFileName("pulse-material-prices", new Date("2026-11-16T12:00:00Z")), "pulse-material-prices-2026-11-16.csv");
  assert.match(csvFileName("Pulse EPC LS1!", new Date("2026-01-02T12:00:00Z")), /^pulse-epc-ls1-2026-01-02\.csv$/);
});

test("the answer markdown keeps only safe links and reads small tables", () => {
  const blocks = parseAnswerMarkdown("See [EPC](/dashboard/epc) and [bad](javascript:alert(1)).\n\n| Council | % below C |\n|---|---|\n| Leeds | 51.2 |");
  assert.equal(blocks[0].type, "p");
  const p = JSON.stringify(blocks[0]);
  assert.ok(p.includes('"href":"/dashboard/epc"'));
  assert.ok(!p.includes("javascript"));
  assert.equal(blocks[1].type, "table");
  if (blocks[1].type === "table") assert.equal(blocks[1].rows.length, 1);
});

test("the prompt and copy follow the voice rules", () => {
  assert.ok(!DASHES.test(ASK_INSTRUCTIONS), "no en or em dashes in the prompt");
  assert.ok(!DASHES.test(askContextText(new Date("2026-11-16T12:00:00Z"))));
  assert.match(askContextText(new Date("2026-11-16T12:00:00Z")), /16 November 2026/);
  assert.match(ASK_INSTRUCTIONS, /Never use the phrase "plain English"/);
  assert.match(ASK_INSTRUCTIONS, /get_embodied_carbon/);
  assert.doesNotMatch(ASK_INSTRUCTIONS, /not available in chat/);
  assert.ok(saidNotHeld("Pulse does not hold house prices."));
  assert.ok(!saidNotHeld("Steel rose 19.9%."));
  for (const s of ASK_SUGGESTIONS) assert.ok(!DASHES.test(s) && !/plain english/i.test(s));
  assert.ok(ASK_SUGGESTIONS.some((s) => /embodied carbon/i.test(s)));
  const ui = readFileSync(join(process.cwd(), "src/components/my-pulse/AskPulse.tsx"), "utf8");
  assert.ok(!DASHES.test(ui), "no en or em dashes in the panel");
  assert.ok(!/plain english/i.test(ui));
  assert.ok(!/dangerouslySetInnerHTML/.test(ui));
});
