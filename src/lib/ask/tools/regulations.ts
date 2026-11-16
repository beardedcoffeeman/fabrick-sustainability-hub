// get_regulations: the Pulse regulations timeline (src/lib/regulations-data.json).
import regulationsData from "@/lib/regulations-data.json";
import { checkDate, wordsMatch } from "../schema";
import { defineTool, fail } from "./common";

interface RegulationItem {
  id: string;
  title: string;
  date: string;
  status: string;
  category: string;
  description: string;
  impact: string;
  affectedRoles: string[];
}

const ITEMS = regulationsData as RegulationItem[];
const CATEGORIES = ["carbon", "energy", "reporting", "trade"] as const;
const STATUSES = ["active", "upcoming", "consultation", "future"] as const;

export const getRegulations = defineTool({
  name: "get_regulations",
  description:
    "The Pulse regulations timeline: about 20 UK construction regulation and policy milestones (Future Homes and Buildings Standards, Part Z, UK CBAM, UK SRS reporting, MEES and EPC changes, Biodiversity Net Gain, Building Safety Act), each with its date, status, category, description, impact and the roles affected. " +
    "Filter by category, status, date range and words. Use for \"what regulations change in 2027\" and similar. Report what the timeline says; do not give legal advice.",
  spec: {
    category: { kind: "enum", values: ["any", ...CATEGORIES], description: "carbon, energy, reporting, trade, or \"any\"." },
    status: { kind: "enum", values: ["any", ...STATUSES], description: "active, upcoming, consultation, future, or \"any\"." },
    date_from: { kind: "string", maxLength: 10, description: "Earliest milestone date, YYYY-MM-DD, or empty." },
    date_to: { kind: "string", maxLength: 10, description: "Latest milestone date, YYYY-MM-DD, or empty." },
    text: { kind: "string", maxLength: 80, description: "Words that must all appear in the title, description or impact. Empty for none." },
  },
  status: () => "Checking the regulations timeline",
  run: (input) => {
    for (const [k, v] of [["date_from", input.date_from], ["date_to", input.date_to]] as const) {
      const err = checkDate(k, v);
      if (err) return fail(err);
    }
    let rows = ITEMS;
    if (input.category !== "any") rows = rows.filter((r) => r.category === input.category);
    if (input.status !== "any") rows = rows.filter((r) => r.status === input.status);
    if (input.date_from) rows = rows.filter((r) => r.date >= input.date_from);
    if (input.date_to) rows = rows.filter((r) => r.date <= input.date_to);
    if (input.text) rows = rows.filter((r) => wordsMatch(`${r.title} ${r.description} ${r.impact}`, input.text));
    rows = [...rows].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 30);
    const dates = ITEMS.map((r) => r.date).sort();
    const period = `timeline items dated ${dates[0]} to ${dates[dates.length - 1]}`;
    return {
      ok: true,
      payload: {
        source: {
          publisher: "Fabrick (Pulse)",
          dataset: "Pulse regulations timeline, compiled from government and regulator announcements and reviewed monthly",
          url: null,
        },
        dataPeriod: period,
        generatedAt: null,
        pulsePage: "/regulations",
        caveats: [
          "Summaries for awareness, not legal advice: check the official guidance or legislation before acting.",
          "Dates for proposed and expected measures can move; the status says whether an item is active, upcoming, a consultation or further off.",
        ],
        matched: rows.length,
        regulations: rows.map((r) => ({
          title: r.title,
          date: r.date,
          status: r.status,
          category: r.category,
          description: r.description,
          impact: r.impact,
          affectedRoles: r.affectedRoles,
        })),
      },
      tables: [
        {
          title: "UK construction regulations timeline",
          columns: ["Date", "Title", "Status", "Category", "Description", "Impact", "Roles affected"],
          rows: rows.map((r) => [r.date, r.title, r.status, r.category, r.description, r.impact, r.affectedRoles.join("; ")]),
          source: `Pulse regulations timeline (Fabrick), ${period}. Not legal advice.`,
          fileStem: "pulse-regulations",
          pulsePage: "/regulations",
        },
      ],
    };
  },
});
