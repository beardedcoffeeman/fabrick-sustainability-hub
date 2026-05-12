/**
 * Playwright-based decision-notice PDF fetcher for Idox Public Access portals.
 *
 * Modern Idox PA loads the documents tab via AJAX from an external Idox
 * document store. Server-rendered scraping (the rest of our adapter) can't
 * reach those documents. This module uses headless Chromium to render the
 * page, wait for the docs table to load, find the Decision Notice row, and
 * download the PDF via Playwright's request context (which carries the
 * session cookies automatically).
 *
 * Used by scripts/scrape-lpa.ts to enrich the metadata scrape with real
 * decision-notice PDFs, which then feed scripts/extract-pdfs.ts for Claude
 * condition extraction.
 *
 * One Chromium instance is reused across all documents in a run for speed.
 */
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, type Browser, type BrowserContext } from "playwright";
import type { IdoxLpa } from "./idox-adapter";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..", "..");
const PIPELINE_DIR = join(PROJECT_ROOT, "_pipeline", "decision-notices");
const STATE_DIR = join(PROJECT_ROOT, ".cache", "idox-doc-fetch");

const UA =
  "FabrickPlanningExplorer/0.1 (+https://fabrick-sustainability-hub.vercel.app) " +
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export interface FetchResult {
  keyVal: string;
  status: "downloaded" | "no-decision-notice" | "error" | "cached";
  pdfPath?: string;
  pdfUrl?: string;
  error?: string;
}

export class IdoxDocFetcher {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;

  async start() {
    this.browser = await chromium.launch({
      headless: true,
      // Hertsmere etc. have incomplete cert chains.
      args: ["--ignore-certificate-errors"],
    });
    this.context = await this.browser.newContext({
      userAgent: UA,
      ignoreHTTPSErrors: true,
      viewport: { width: 1280, height: 800 },
    });
  }

  async stop() {
    await this.context?.close();
    await this.browser?.close();
    this.browser = null;
    this.context = null;
  }

  /**
   * Try to download the Decision Notice PDF for a single application.
   * Returns the on-disk path on success, or a status indicating why not.
   *
   * Idempotent: if a PDF already exists at the target path, returns
   * status="cached" without re-rendering.
   */
  async fetchDecisionNotice(lpa: IdoxLpa, keyVal: string): Promise<FetchResult> {
    if (!this.context) throw new Error("call start() before fetchDecisionNotice");

    const filename = `${lpa.id}-${keyVal}.pdf`;
    const target = join(PIPELINE_DIR, filename);
    await mkdir(PIPELINE_DIR, { recursive: true });
    await mkdir(STATE_DIR, { recursive: true });

    if (existsSync(target)) {
      return { keyVal, status: "cached", pdfPath: target };
    }

    const docsUrl = `${lpa.baseUrl}/online-applications/applicationDetails.do?activeTab=documents&keyVal=${keyVal}`;
    const page = await this.context.newPage();
    try {
      const resp = await page.goto(docsUrl, {
        waitUntil: "networkidle",
        timeout: 30_000,
      });
      if (!resp || !resp.ok()) {
        return {
          keyVal,
          status: "error",
          error: `docs page → ${resp?.status() ?? "no response"}`,
        };
      }

      // The Idox documents table renders after page load. We try multiple
      // document labels in priority order — different LPAs name the same
      // thing differently ("Decision Notice", "Permit", "Refusal Notice"
      // etc).
      const DOC_LABELS: Array<RegExp> = [
        /^Decision Notice$/i,
        /^Decision Letter$/i,
        /^Notice of Decision$/i,
        /Decision Notice/i,
        /Decision Letter/i,
        /Notice of Decision/i,
        /^Permit$/i,
        /^Refusal Notice$/i,
        /Refusal Notice/i,
        /Decision\b/i,
      ];

      // First, wait for ANY documents to appear (so we know the AJAX has
      // finished loading), then iterate through labels.
      try {
        await page
          .locator("table tr, .dataTable tr, #ListResult tr")
          .filter({ hasText: /\b(Decision|Permit|Notice|Letter)\b/i })
          .first()
          .waitFor({ state: "visible", timeout: 15_000 });
      } catch {
        return { keyVal, status: "no-decision-notice" };
      }

      let absoluteUrl: string | null = null;
      for (const pattern of DOC_LABELS) {
        const row = page
          .locator("table tr, .dataTable tr, #ListResult tr")
          .filter({ hasText: pattern })
          .first();
        const count = await row.count().catch(() => 0);
        if (count === 0) continue;
        const link = row.locator("a").first();
        const href = await link.getAttribute("href").catch(() => null);
        if (!href) continue;
        absoluteUrl = new URL(href, lpa.baseUrl).toString();
        break;
      }
      if (!absoluteUrl) {
        return { keyVal, status: "no-decision-notice" };
      }

      // Use Playwright's request fixture so cookies and TLS settings carry
      // over from the page context.
      const docResp = await this.context.request.get(absoluteUrl, {
        timeout: 60_000,
      });
      if (!docResp.ok()) {
        return {
          keyVal,
          status: "error",
          error: `pdf fetch → ${docResp.status()}`,
        };
      }
      const buf = await docResp.body();
      // Crude shape check: PDFs start with %PDF-.
      if (!buf.subarray(0, 5).toString().startsWith("%PDF-")) {
        return {
          keyVal,
          status: "error",
          error: `pdf fetch returned non-PDF (content-type=${docResp.headers()["content-type"] ?? "?"})`,
        };
      }
      await writeFile(target, buf);
      return { keyVal, status: "downloaded", pdfPath: target, pdfUrl: absoluteUrl };
    } catch (err) {
      return {
        keyVal,
        status: "error",
        error: err instanceof Error ? err.message : String(err),
      };
    } finally {
      await page.close();
    }
  }
}

/**
 * Convenience: write the sidecar JSON file required by extract-pdfs alongside
 * each downloaded PDF.
 */
export async function writeSidecar(
  pdfPath: string,
  sidecar: Record<string, unknown>
): Promise<void> {
  const sidecarPath = pdfPath.replace(/\.pdf$/i, ".meta.json");
  if (existsSync(sidecarPath)) {
    // Merge with existing (defensive — don't overwrite user-edited metadata)
    try {
      const cur = JSON.parse(await readFile(sidecarPath, "utf-8"));
      sidecar = { ...cur, ...sidecar };
    } catch {
      /* fall through */
    }
  }
  await writeFile(sidecarPath, JSON.stringify(sidecar, null, 2));
}
