// Planning Explorer "discipline lens" + applicant classification.
//
// Two pure, data-only helpers used by the Planning Explorer page:
//
//   1. DISCIPLINES - a lens per type of consultancy/supplier. Each lens says
//      which extracted condition types count, which keywords in the
//      condition wording also count, and which wording to EXCLUDE. The
//      acoustic lens, for example, excludes construction-phase noise
//      (construction management plans, working hours, demolition) because an
//      acoustic consultant is briefed on operational noise and sound
//      insulation, not site noise during the build.
//
//   2. classifyApplicant() - buckets a free-text applicant name from an LPA
//      portal into an organisation type (housebuilder, NHS trust, council,
//      private individual...). Heuristic, keyword-based, deterministic. The
//      categories are deliberately coarse so the chart stays readable.
//
// Both are plain TypeScript with no React so they can be unit-tested with
// tsx and reused by the API/health layer later.

import type { Application, Condition, ConditionType, Region } from "@/lib/planning";

// ---------------------------------------------------------------------------
// Disciplines
// ---------------------------------------------------------------------------

export type DisciplineId =
  | "acoustic"
  | "ecology"
  | "landscape"
  | "transport"
  | "drainage"
  | "lighting"
  | "heritage"
  | "air-quality"
  | "contamination"
  | "energy"
  | "materials"
  | "waste"
  | "security"
  | "construction-management";

export interface Discipline {
  id: DisciplineId;
  /** Short label for the chip. */
  label: string;
  /** Who this lens is for, e.g. "Acoustic consultants". */
  audience: string;
  /** One line on what the lens picks up and leaves out. */
  rule: string;
  conditionTypes: ConditionType[];
  include: RegExp;
  exclude?: RegExp;
}

// Wording that marks a condition as being about the construction phase
// rather than the finished building.
//
// CONSTRUCTION_PHASE_STRICT is used to EXCLUDE conditions from lenses like
// acoustics. It deliberately does not match bare "demolition" or "piling",
// because standard pre-commencement wording ("no development other than
// demolition shall commence until...") appears on operational conditions
// too. CONSTRUCTION_PHASE is the broader net used by the construction
// management lens itself.
const CONSTRUCTION_PHASE_STRICT =
  /construction (environmental )?management plan|construction (hours|noise|logistics|method|traffic|working|phase|period|activities)|\bcemp\b|\bcmp\b|\bclp\b|during (the )?(construction|demolition) (works?|phase|period)|hours of (construction|work(ing)?)|site working hours|wheel (wash|cleaning)|demolition noise/i;
const CONSTRUCTION_PHASE =
  /construction (environmental )?management plan|construction (hours|noise|logistics|method|traffic|working|phase|period|activities)|demolition|piling|\bcemp\b|\bcmp\b|\bclp\b|during (the )?(construction|demolition)|hours of (construction|work(ing)?)|site working hours|wheel (wash|cleaning)/i;

export const DISCIPLINES: Discipline[] = [
  {
    id: "acoustic",
    label: "Acoustics",
    audience: "Acoustic consultants",
    rule: "Noise conditions and acoustic wording: plant noise limits, BS4142 and BS8233, sound insulation, vibration. Construction-phase noise (CMPs, working hours, demolition) is left out.",
    conditionTypes: ["noise"],
    include:
      /acoustic|sound insulation|noise|\bdba?\b|bs ?4142|bs ?8233|vibration|decibel|amplified (music|sound)/i,
    exclude: CONSTRUCTION_PHASE_STRICT,
  },
  {
    id: "ecology",
    label: "Ecology & BNG",
    audience: "Ecologists and biodiversity net gain consultants",
    rule: "Ecology and BNG conditions plus habitat, protected species, bat and nesting-bird wording.",
    conditionTypes: ["ecology", "bng"],
    include:
      /ecolog|biodiversity|habitat|\bbats?\b|nesting bird|protected species|net gain|\bbng\b|great crested newt|badger|reptile/i,
  },
  {
    id: "landscape",
    label: "Landscape & trees",
    audience: "Landscape architects and arboriculturists",
    rule: "Hard and soft landscaping schemes, planting, tree protection and arboricultural method statements.",
    conditionTypes: [],
    include: /landscap|planting|arboricultur|\btrees?\b|hedgerow|tree protection|bs ?5837/i,
  },
  {
    id: "transport",
    label: "Transport & highways",
    audience: "Transport planners and highways engineers",
    rule: "Transport conditions plus parking, cycle storage, travel plans, access and delivery/servicing management.",
    conditionTypes: ["transport"],
    include:
      /highway|parking|cycle (storage|parking)|travel plan|vehicular access|delivery and servicing|servicing management|construction logistics|visibility splay|electric vehicle charging/i,
  },
  {
    id: "drainage",
    label: "Drainage & SuDS",
    audience: "Civil and drainage engineers",
    rule: "Drainage conditions plus SuDS, surface water, flood risk, sewer and foul water wording.",
    conditionTypes: ["drainage"],
    include: /drainage|\bsuds\b|surface water|flood|sewer|foul water|attenuation tank/i,
  },
  {
    id: "lighting",
    label: "Lighting",
    audience: "Lighting designers",
    rule: "External lighting schemes, light spill and bat-sensitive lighting.",
    conditionTypes: ["lighting"],
    include: /lighting|luminaire|\blux\b|light spill|illumination/i,
  },
  {
    id: "heritage",
    label: "Heritage & archaeology",
    audience: "Heritage consultants and archaeologists",
    rule: "Heritage conditions plus archaeology, listed-building, conservation-area and historic-fabric wording.",
    conditionTypes: ["heritage"],
    include: /heritage|archaeolog|listed building|conservation area|historic|written scheme of investigation/i,
  },
  {
    id: "air-quality",
    label: "Air quality",
    audience: "Air quality consultants",
    rule: "Air quality conditions plus dust management, NOx limits, emissions standards and air-pollution wording.",
    conditionTypes: ["air-quality"],
    include:
      /air quality|dust (management|mitigation)|\bnox\b|emissions? (standard|limit)|ultra low nox|air pollution|aq neutral|non-road mobile machinery|\bnrmm\b/i,
  },
  {
    id: "contamination",
    label: "Ground & contamination",
    audience: "Geo-environmental and remediation consultants",
    rule: "Contaminated land, remediation, ground investigation, gas protection and coal-mining legacy conditions.",
    conditionTypes: [],
    include:
      /contaminat|remediation|ground (condition|investigation|gas)|geotechnical|gas protection|coal mining|site investigation|phase (i|ii|1|2) /i,
  },
  {
    id: "energy",
    label: "Energy & sustainability",
    audience: "Energy, carbon and sustainability consultants",
    rule: "Energy strategy, carbon, BREEAM, overheating, PV, heat pump and low or zero carbon technology conditions.",
    conditionTypes: [],
    include:
      /energy (strategy|statement|efficiency|performance)|carbon|breeam|overheating|photovoltaic|\bpv\b|renewable|heat pump|\bashp\b|sustainab|low or zero carbon|\blzc\b|solar (thermal|panel)|\bepc\b/i,
  },
  {
    id: "materials",
    label: "Facade & materials",
    audience: "Cladding, brick and facade manufacturers",
    rule: "Materials conditions plus facade, cladding, sample panel and external finishes wording.",
    conditionTypes: ["materials"],
    include: /facade|façade|cladding|sample panel|external materials|finishes|brick|fenestration|glazing/i,
  },
  {
    id: "waste",
    label: "Waste & recycling",
    audience: "Waste management and bin-store suppliers",
    rule: "Refuse, recycling and waste storage and collection conditions.",
    conditionTypes: [],
    include: /\bwaste\b|refuse|recycling|bin store/i,
    exclude: /energy from waste/i,
  },
  {
    id: "security",
    label: "Security",
    audience: "Security consultants and Secured by Design",
    rule: "Secured by Design, security strategy and CCTV conditions.",
    conditionTypes: [],
    include: /secured by design|security (strategy|measures|scheme)|\bcctv\b/i,
  },
  {
    id: "construction-management",
    label: "Construction phase",
    audience: "Main contractors and construction logistics planners",
    rule: "Construction management and environmental management plans, construction hours, logistics, demolition and piling conditions.",
    conditionTypes: [],
    include: CONSTRUCTION_PHASE,
  },
];

export const DISCIPLINE_BY_ID: Record<DisciplineId, Discipline> = Object.fromEntries(
  DISCIPLINES.map((d) => [d.id, d])
) as Record<DisciplineId, Discipline>;

export function conditionMatches(c: Condition, d: Discipline): boolean {
  const text = `${c.summary} ${c.text}`;
  if (d.exclude && d.exclude.test(text)) return false;
  if (d.conditionTypes.includes(c.type)) return true;
  return d.include.test(text);
}

export interface LensHit {
  application: Application;
  condition: Condition;
}

export function lensHits(apps: Application[], d: Discipline): LensHit[] {
  const out: LensHit[] = [];
  for (const a of apps) {
    for (const c of a.conditions) {
      if (conditionMatches(c, d)) out.push({ application: a, condition: c });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Applicant classification
// ---------------------------------------------------------------------------

export type ApplicantType =
  | "developer"
  | "housing-association"
  | "local-authority"
  | "healthcare"
  | "education"
  | "energy"
  | "hotel-leisure"
  | "logistics"
  | "data-centre"
  | "retail"
  | "community"
  | "other-business"
  | "private-individual"
  | "not-stated";

export const APPLICANT_TYPE_LABELS: Record<ApplicantType, string> = {
  developer: "Developer / housebuilder / investor",
  "housing-association": "Housing association",
  "local-authority": "Council / public body",
  healthcare: "Healthcare provider",
  education: "School / university / academy trust",
  energy: "Energy developer / utility",
  "hotel-leisure": "Hotel / leisure / sport operator",
  logistics: "Logistics / industrial occupier",
  "data-centre": "Data centre operator",
  retail: "Retailer",
  community: "Charity / faith / community group",
  "other-business": "Other business",
  "private-individual": "Private individual",
  "not-stated": "Not stated (agent only)",
};

const NOT_STATED = /^(c\/?o\b|-+\s*$|\.$|_+$|n\/?a$|none$|not (known|available|supplied|stated)|see (company|agent)|tom -$)/i;
const TITLE = /^(mr|mrs|ms|miss|dr|prof|sir|lady|lord|rev|cllr)\.?\s/i;

const RULES: Array<[ApplicantType, RegExp]> = [
  [
    "local-authority",
    /\b(council|borough|county|district|city of|combined authority|greater london authority|\bgla\b|homes england|nhs property services|ministry|department (of|for)|transport for london|\btfl\b|network rail|highways england|national highways|environment agency|police|fire (and|&) rescue)\b/i,
  ],
  [
    "healthcare",
    /\b(nhs|hospital|healthcare|health care|spire|nuffield|bupa|circle health|medical|care (home|ltd|limited|group)|nursing home|dental|surgery|hospice|priory|health centre|clinic)\b/i,
  ],
  [
    "education",
    /\b(university|college|school|academy|academies|education|nursery|students?|sixth form|chancellor, masters and scholars)\b/i,
  ],
  [
    "housing-association",
    /\b(housing association|housing trust|housing group|homes trust|peabody|l&q|london & quadrant|clarion|notting hill genesis|guinness partnership|places for people|hyde|sanctuary|sovereign|optivo|metropolitan thames valley|a2dominion|network homes|riverside|platform housing|orbit|home group|catalyst|one housing|southern housing|together housing|yorkshire housing|stonewater|bromford|vivid|abri)\b/i,
  ],
  [
    "data-centre",
    /\b(data ?cent(re|er)s?|colocation|digital realty|equinix|vantage|global switch|ark data|kao|cyrusone|virtus|telehouse|iron mountain|colt dcs|yondr|stack infrastructure)\b/i,
  ],
  [
    "energy",
    /\b(solar|energy|power|renewables?|wind|battery|bess|grid|electric|utilities|npower|sse|edf|e\.?on|octopus|lightsource|ib vogt|anesco|gridserve|national gas|cadent|uk power networks|scottish power|heat network)\b/i,
  ],
  [
    "hotel-leisure",
    /\b(hotel|hotels|hospitality|inn\b|leisure|premier inn|travelodge|whitbread|accor|hilton|marriott|ihg|football club|\bfc\b|rugby|cricket|gym|fitness|\bpub\b|brewery|taverns|mitchells|padel|spa\b|stadium)\b/i,
  ],
  [
    "logistics",
    /\b(logistics|distribution|warehous|industrial|prologis|segro|panattoni|tritax|gazeley|\bglp\b|dhl|amazon|royal mail|parcel|freight|haulage|self storage|storage ltd|tankers)\b/i,
  ],
  [
    "retail",
    /\b(lidl|aldi|tesco|sainsbury|asda|morrisons|waitrose|retail|stores?|supermarket|b&q|costa|greggs|mcdonald|kfc|starbucks)\b/i,
  ],
  [
    "community",
    /\b(church|mosque|masjid|temple|gurdwara|synagogue|parish|diocese|charity|charitable|foundation|community|friends of|association|society|trustees?)\b/i,
  ],
  [
    "developer",
    /\b(homes|housing|developments?|development co|properties|property|estates?|land\b|regeneration|living|residential|build to rent|\bbtr\b|\bpbsa\b|berkeley|barratt|taylor wimpey|persimmon|bellway|redrow|vistry|crest nicholson|countryside|st modwen|harworth|greystar|construction|builders?|build ltd|urban|quarter|partnership|investments?|capital|holdings?|realty|ventures|assets|reit|fund|\blp\b|\bllp\b|general partner|\bgp\b|pension)\b/i,
  ],
  ["other-business", /\b(ltd|limited|plc|inc|group|co\.?|company|corporation|\bllc\b|enterprises|services|solutions|international|uk\b)\b/i],
];

export function classifyApplicant(raw: string | null | undefined): ApplicantType {
  let name = (raw ?? "").trim();
  if (!name) return "not-stated";
  if (NOT_STATED.test(name)) {
    // "C/O Prologis UK" names a real organisation; "C/o Agent" / "C/o Savills"
    // does not. Strip the prefix and only accept a specific (non-generic) hit.
    const stripped = name.replace(/^c\/?o\b\.?\s*/i, "").trim();
    if (!stripped || /^(agent|savills|jll|cbre|knight frank|lambert smith|gerald eve|montagu evans|quod|dp9|turley|barton willmore|lichfields)\b/i.test(stripped)) {
      return "not-stated";
    }
    name = stripped;
    for (const [type, re] of RULES) {
      if (type === "developer" || type === "other-business") break;
      if (re.test(name)) return type;
    }
    return "not-stated";
  }
  if (TITLE.test(name)) return "private-individual";
  for (const [type, re] of RULES) {
    if (re.test(name)) return type;
  }
  // "Jamie Jackson", "Wing Lau": two or three capitalised alphabetic words
  // with no company suffix is almost always a person.
  const words = name.split(/\s+/);
  if (
    words.length >= 1 &&
    words.length <= 3 &&
    words.every((w) => /^[A-Z][a-z'-]+$/.test(w))
  ) {
    return "private-individual";
  }
  return "other-business";
}

// ---------------------------------------------------------------------------
// Region tile grid (schematic map of Great Britain for the geography panel)
// ---------------------------------------------------------------------------

export const REGION_GRID: Array<Array<Region | null>> = [
  [null, "Scotland", null],
  [null, "North West", "North East"],
  ["Wales", "West Midlands", "Yorkshire & Humber"],
  [null, "East Midlands", "East of England"],
  ["South West", "London", "South East"],
];
