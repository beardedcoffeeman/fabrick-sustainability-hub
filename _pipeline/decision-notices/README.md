# Decision-notice intake

This folder is where you drop UK planning decision-notice **PDFs** for the Planning Explorer Conditions tab.

## What goes here

For every decision notice you want to process, drop two files in this folder:

| File | Purpose |
|---|---|
| `<anything>.pdf` | The actual decision-notice PDF, as downloaded from the LPA's portal. |
| `<anything>.meta.json` | A small sidecar with the application's identifying details. |

The names must match (e.g. `slough-bath-road.pdf` + `slough-bath-road.meta.json`).

## Sidecar shape

```json
{
  "id": "slough-bath-road",
  "reference": "P/04321/006",
  "lpa": "Slough Borough Council",
  "region": "South East",
  "address": "Land at Bath Road, Slough",
  "postcode": "SL1 6AA",
  "useClass": "Sui Generis",
  "sector": "data-centre",
  "description": "Hyperscale data centre comprising three data halls...",
  "applicant": "Beacon Hyperscale Ltd",
  "agent": "Quod Planning",
  "decisionDate": "2025-11-14",
  "grossFloorAreaSqm": 142000,
  "sourceUrl": "https://publicaccess.slough.gov.uk/..."
}
```

Sectors must be one of: `data-centre`, `logistics`, `btr-pbsa`, `healthcare`, `education`, `renewable-energy`, `hotels`, `mixed-use`.

Regions must be one of: `London`, `South East`, `East of England`, `East Midlands`, `West Midlands`, `Yorkshire & Humber`, `North West`, `North East`, `Wales`, `Scotland`.

## Run the extractor

From the project root:

```bash
npm run extract:pdfs
```

Each PDF is parsed, the text is sent to Claude Sonnet 4.6, and conditions are returned tagged by type (noise, BNG, transport, etc.). Results are written to `src/data/extracted-real.json` and surfaced in the Conditions tab.

A SHA-256 cache at `.cache/extractions/` means re-running over the same PDF never re-bills Anthropic.

## Where to find decision notices

Most UK LPA portals expose decision-notice PDFs publicly. Useful starting points:

- **Idox Public Access** — the dominant portal software, used by ~250 councils. Application detail pages have a "Documents" tab with the decision notice as a PDF.
- **Northgate Planning Explorer** — used by some councils, similar pattern.
- **gov.uk infrastructure planning** — for NSIPs (data centres >50MW, solar farms, BESS) the Planning Inspectorate publishes formal decision letters.
- **Specific LPAs worth bookmarking for our sectors:**
  - Data centres: Slough, Hillingdon, Hertsmere, South Cambridgeshire
  - Logistics: Milton Keynes, Daventry, Coventry, Dover
  - BTR/PBSA: Tower Hamlets, Newham, Manchester, Birmingham
  - Healthcare: London boroughs (Camden, Lambeth), Manchester
  - Education: County councils
  - Renewables: Lincolnshire DCs, Norfolk DCs, Cambridgeshire

## Note on copyright

Decision notice PDFs are public documents, but the original files may carry council copyright. The `.gitignore` keeps real PDFs out of git by default. The synthetic `sample-notice.txt` (clearly marked as a smoke test) is committed.
