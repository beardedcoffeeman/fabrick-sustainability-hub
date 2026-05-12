# Planning Explorer — Idiot's Guide

Live at: **`/research/planning-explorer`** on **Pulse by Fabrick** (`pulse.fabrick.agency`). Linked from the research index card so visitors can find it.

## Positioning (this is what we're selling)

The Planning Explorer is **industry intelligence for the people who supply UK construction**. It turns the UK planning register into a working sales-and-strategy tool that answers:

- Where is the sector active right now?
- Which LPAs are doing the most work in our space?
- Who's applying, where can we find them?
- What conditions are being imposed (so we can spot demand signals for our products)?

The audience is not just "consultants with a niche service" — it's anyone whose business depends on knowing where UK construction is happening:

- **Building product manufacturers** — insulation, cladding, glazing, M&E, fit-out, structural, roofing, sanitaryware, ironmongery, fire, lighting. They want to find schemes before the specification is set.
- **Specifier and BD teams** — architects, M&E consultants, contractors. They want to identify projects in their patch and the applicants behind them.
- **Marketing and strategy** — spot sector momentum, geographic clusters, demand signals. Inform budget allocation across sales, marketing, content, trade shows.
- **Investors and analysts** — planning activity is a leading indicator of construction output.

This wider audience matters because it lines up almost perfectly with **Fabrick's prospect base** — most of our existing and target clients are construction-product companies that need this.

## What's on the page right now

### Header
- "Where UK construction is actually building, by sector."
- Counts strip: total real applications + 8 sectors + source attribution

### Audience panel (navy block)
Four cards covering manufacturers / specifier teams / marketing-strategy / investors-analysts.

### How to use it (3-step)
Pick sector → see activity → drill into specific schemes.

### Trends tab
- Sector, region, decision filters
- KPIs: total / approved / refused / approval rate
- Bar chart: applications by sector under current filters
- **Most active LPAs** table (replaces the old "Top applicants" — LPAs are populated for every record; applicants are mostly blank in current open data)
- **Applicants we've identified** sub-table — only renders when we actually have applicant names (currently empty until we add LPA-portal scrapes)
- Application list (top 50 by decision date)

### Conditions tab
- **Live** with real conditions extracted by Claude Sonnet 4.6 from real decision notices
- Search by condition type (noise, ecology, BNG, transport, lighting, hours, drainage, materials, S106, heritage, air-quality, daylight, fire) and sector
- Each row links to a drawer with the full condition text + the rest of the conditions on that notice

### Footer
- "How this is built" panel — names planning.data.gov.uk + Idox Public Access + Claude Sonnet
- Counts LPAs covered + last-refreshed date + "Auto-updates weekly"

## What's REAL in the demo

| Source | Count | Detail |
|---|---|---|
| **planning.data.gov.uk** (UK government open data) | 469 applications | Description, LPA, decision date. Applicant blank. |
| **LPA portal scrapes** (5 councils via Idox adapter) | 118 applications | Hertsmere 27, Mid Sussex 36, Basingstoke 46, Greater Cambridge 8, Brent 1. Applicants populated ~96%. |
| **Decision-notice PDFs fetched via Playwright** | 41 PDFs downloaded | From the LPA-scraped applications. |
| **Real conditions extracted by Claude Sonnet 4.6** | 141 conditions / 35 applications | Across noise, ecology, BNG, transport, lighting, hours, drainage, daylight, fire, materials, S106, heritage, air-quality, other. |

**Real applicants surfaced** include: Barchester Healthcare Ltd (14 conditions across 2 applications), Bramley BESS 2 Limited, St Modwen Strategic Land Ltd, UK Power Networks, Hampshire Hospitals CS Ltd, DCo1 UK Limited, Spire Bushey Hospital, Redrow Homes Ltd, Fairfax Acquisitions Ltd, Oakside International Ltd, Nyadowa Homes Ltd, SPV PPR Bushey 1 LLP.

**No fictional applicants. No invented references. No synthetic decision notices.**

**No fictional applicants. No invented references. No synthetic decision notices.** Everything that's displayed is either real or honestly flagged as missing.

## How the data flows

```
planning.data.gov.uk (open data, 100k+ apps)
       │
       ├─ scripts/ingest-planning-data.ts (npm run ingest:planning)
       │   └─ writes src/data/applications-real.json
       │
LPA Idox portals (Hertsmere, Mid Sussex, Basingstoke, Greater Cambridge, Brent…)
       │
       ├─ scripts/scrape-lpa.ts <lpa-id>  (npm run scrape:lpa <id>)
       │   ├─ uses scripts/lib/idox-adapter.ts (cheerio-based, no browser)
       │   ├─ search + hydrate metadata, applicant, agent, decision
       │   └─ merges into src/data/applications-scraped.json
       │
       ├─ scripts/fetch-docs.ts  (npm run fetch:docs)
       │   ├─ uses scripts/lib/idox-doc-fetcher.ts (Playwright headless)
       │   ├─ renders the AJAX-loaded documents tab
       │   ├─ finds "Decision Notice" link and downloads the PDF
       │   └─ writes PDF + sidecar to _pipeline/decision-notices/
       │
       └─ scripts/extract-pdfs.ts  (npm run extract:pdfs)
           ├─ uses scripts/lib/extract-conditions.ts
           ├─ sends each PDF's text to Claude Sonnet 4.6
           ├─ structured tool output → typed conditions list
           ├─ caches at .cache/extractions/<sha256>.json
           └─ writes src/data/extracted-real.json

       │
       ▼
src/lib/planning.ts  ← loadApplications() merges all three sources
       │
       ▼
src/app/research/planning-explorer/page.tsx  ← single-page UI
```

## The honest position on coverage

### 1. Applicant names — now in place for scraped LPAs

LPA portal scrapes now give us real applicant names for ~96% of records on every scraped LPA. The 469 records from gov.uk open data still don't carry applicant names (alpha-phase publication doesn't include them).

Adding more LPAs is mostly a config exercise — append to `LPAS` in `scripts/scrape-lpa.ts` and `LPA_BASE` in `scripts/fetch-docs.ts`.

Manchester, Slough, Hillingdon, Newham use different portal flavours (Cloudflare-protected, Northgate, or custom). Each needs its own adapter — ~2-3 days each.

### 2. Decision-notice conditions — Playwright pipeline live

The Conditions tab is now populated with real conditions extracted from real Hertsmere, Mid Sussex, Basingstoke, Greater Cambridge and Brent decision-notice PDFs. The Playwright doc fetcher (`scripts/lib/idox-doc-fetcher.ts`) renders the AJAX-loaded documents tab, finds the Decision Notice link, downloads the PDF via the same browser session, and hands it to the Claude extractor.

About 70% of decided applications have a downloadable Decision Notice in the docs tab. The remaining 30% either haven't had their decision notice uploaded yet, are too old (archived), or use a different document label that the locator doesn't catch. Worth a follow-up to broaden the locator (look for "Permit", "Refusal Notice", "Decision Letter" variants).

## Pitch ranking (which sectors to prioritise scrape investment)

If we were going to invest the next 2-3 weeks of engineering on LPA-portal scrapes, the order should be:

1. **Data centres** — Slough, Hillingdon, Hertsmere, South Cambridgeshire, Tameside, Newport. ~50-200 applications/year nationally. Plays into Casslen + grid/cooling/fire engineering prospects.
2. **BTR / PBSA** — Tower Hamlets, Newham, Manchester, Birmingham, Camden, Lambeth. High volume, lots of cross-discipline conditions.
3. **Renewable energy & BESS** — Lincolnshire DCs, Norfolk DCs, South Holland. Massive growth area, lots of ecology/landscape conditions.
4. **Logistics** — Milton Keynes, Daventry, Coventry, Dover. Lower-value per scheme but high volume.

Healthcare, education, hotels, mixed-use are secondary priorities.

## Live URLs

| Page | Where |
|---|---|
| Hub research index | `/research` — Planning Explorer card is the first study |
| Planning Explorer | `/research/planning-explorer` |

## Live updates

A GitHub Action (`.github/workflows/refresh-planning-explorer.yml`) runs the whole pipeline weekly — **Sunday 22:00 UTC** by default. It:

1. Pulls latest from planning.data.gov.uk
2. Scrapes every LPA in the registry (cached aggressively so it's mostly delta)
3. Downloads any new decision-notice PDFs via Playwright
4. Runs Claude over the new PDFs
5. Commits the refreshed JSONs — Vercel auto-deploys

You can also trigger it manually: GitHub → Actions tab → "Refresh Planning Explorer" → "Run workflow". Pick `all` (everything) or a comma-separated subset of LPA ids.

### Setup (one-off, when you first push to GitHub)

In the repo's **Settings → Secrets and variables → Actions**, add:

| Secret name | Value |
|---|---|
| `ANTHROPIC_API_KEY` | Your Claude API key (current one needs rotating — was pasted in chat) |

That's it. The workflow file already lives at the right path, schedule + manual trigger both work.

## How to refresh the data manually (locally)

```bash
cd ~/Work/Fabrick/sustainability-hub
npm run ingest:planning            # pull latest from gov.uk (last 36 months)
npm run scrape:lpa all             # scrape every Idox-classic LPA in the registry
npm run scrape:lpa <lpa-id>        # ...or just one
npm run fetch:docs                 # download decision notices via Playwright
npm run extract:pdfs               # run Claude over downloaded PDFs
npm run dev                        # see the result
```

### LPAs in the registry (27 confirmed Idox-classic)

**London** — Brent, Ealing, Lambeth, Lewisham, Redbridge
**South East** — Basingstoke, Bracknell, Windsor and Maidenhead, Wokingham, Guildford, Mid Sussex, Ashford, Tunbridge Wells, Tonbridge and Malling, Dover, Swale, New Forest
**East of England** — Hertsmere, East Herts, Welwyn Hatfield, Greater Cambridge, North Hertfordshire, Stevenage, Huntingdonshire, East Cambridgeshire
**West Midlands** — Shropshire
**East Midlands** — North Kesteven, Rutland, Harborough
**Yorkshire & Humber** — Leeds
**North West** — Trafford
**South West** — Bristol

To add another classic-Idox LPA, run `tsx scripts/probe-lpas.ts` (extend the candidates list at the top first), then append the working ones to `LPAS` in `scripts/scrape-lpa.ts` AND to `LPA_BASE` in `scripts/fetch-docs.ts`.

Caches:
- `.cache/datasets/` — gov.uk CSVs (7 day TTL)
- `.cache/idox/` — search-result + detail-page HTML (indefinite; clear by deleting files)
- `.cache/extractions/` — Claude responses keyed by SHA-256 of PDF text (so re-runs never re-bill)

`fetch:docs` is idempotent — already-downloaded PDFs aren't re-fetched.

## Files to know

| Path | What it is |
|---|---|
| `src/app/research/planning-explorer/page.tsx` | The whole page — header, audience panel, how-to, both tabs, drawer |
| `src/app/research/page.tsx` | Research index — Planning Explorer card was added here |
| `src/lib/planning.ts` | Types, sector labels, condition labels, `loadApplications()` |
| `src/data/applications-real.json` | Real apps from gov.uk (regenerated by `npm run ingest:planning`) |
| `scripts/ingest-planning-data.ts` | gov.uk fetcher + keyword sector classifier |
| `scripts/extract-pdfs.ts` | Batch Claude extractor for decision-notice PDFs |
| `scripts/lib/extract-conditions.ts` | Reusable Claude extraction with structured tool output + cache |
| `scripts/scrape-lpa.ts` | Scrape one LPA's Idox portal (metadata via cheerio) |
| `scripts/lib/idox-adapter.ts` | Generic classic-Idox-PA adapter (works for many UK councils) |
| `scripts/fetch-docs.ts` | Walk scraped apps + download decision notice PDFs |
| `scripts/lib/idox-doc-fetcher.ts` | Playwright-based PDF fetcher (handles AJAX docs tab) |
| `src/data/applications-scraped.json` | Real LPA-portal scrape results (27 LPAs in registry today) |
| `scripts/probe-lpas.ts` | Test candidate LPA URLs to find Idox-classic matches |
| `src/data/extracted-real.json` | Real applications + Claude-extracted conditions |
| `_pipeline/decision-notices/` | Downloaded PDFs + sidecars (gitignored — content may be copyrighted) |

## What to do next

1. **Look at it** — http://localhost:3000/research/planning-explorer and http://localhost:3000/research
2. **Rotate the Anthropic API key** that was pasted in chat. console.anthropic.com → revoke + create new → update `.env.local`. (Still outstanding from last session.)
3. **Decide on the scraper investment** — that's how we close the applicant-names gap and turn the Conditions tab from a teaser into the killer feature. ~2-3 weeks for the top 10 LPAs across data centres + BTR.
4. **Decide on deployment** — current state is local-only. To get this on the public Hub URL, just push to main (Vercel auto-deploys). If you want it gated behind a password or as an unlisted page first, say the word.
5. **Pitch follow-up to Chris** — even without conditions wired up yet, the trends/LPA/audience framing is much stronger than the original. Worth sending him a screenshare invite.
