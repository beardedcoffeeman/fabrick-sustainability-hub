// ──────────────────────────────────────────────────
// MHCLG EPC register: live postcode search (shared)
// ──────────────────────────────────────────────────
// The one real fetch against the MHCLG "Get Energy Performance of Buildings
// Data" API, used by GET /api/epc (which keeps its own sample-data fallback
// and cache) and by Ask Pulse's get_epc_postcode tool (which never falls
// back to sample data and only ever returns aggregates).
// Docs: https://get-energy-performance-data.communities.gov.uk/api-technical-documentation
// ──────────────────────────────────────────────────

export const EPC_API_BASE =
  "https://api.get-energy-performance-data.communities.gov.uk";

// Lean search endpoint row.
export interface MHCLGRow {
  certificateNumber: string;
  addressLine1: string | null;
  addressLine2: string | null;
  addressLine3: string | null;
  addressLine4: string | null;
  postcode: string;
  postTown: string | null;
  council: string | null;
  constituency: string | null;
  currentEnergyEfficiencyBand: string;
  registrationDate: string;
  uprn: number | null;
}

export type EpcSearchResult =
  /** Certificates found. totalResults is the register's own count (may exceed rows.length). */
  | { kind: "ok"; rows: MHCLGRow[]; totalResults: number }
  /** The API's 404 "No certificates could be found": a real empty result. */
  | { kind: "none" }
  /** The API answered with another non-OK status. */
  | { kind: "http-error"; status: number; statusText: string }
  /** The request itself failed (network, DNS, bad JSON). */
  | { kind: "fetch-error"; error: unknown };

/**
 * Search the domestic register for one postcode. Page size 500 covers
 * virtually any UK postcode (average about 15 properties).
 */
export async function searchEpcByPostcode(
  postcode: string,
  token: string,
): Promise<EpcSearchResult> {
  try {
    const url = `${EPC_API_BASE}/api/domestic/search?postcode=${encodeURIComponent(
      postcode.trim()
    )}&page_size=500`;

    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 3600 },
    });

    if (res.status === 404) return { kind: "none" };
    if (!res.ok) {
      return { kind: "http-error", status: res.status, statusText: res.statusText };
    }

    const json = await res.json();
    const rows: MHCLGRow[] = Array.isArray(json.data) ? json.data : [];
    const totalResults: number = json.pagination?.totalRecords ?? rows.length;
    return { kind: "ok", rows, totalResults };
  } catch (error) {
    return { kind: "fetch-error", error };
  }
}
