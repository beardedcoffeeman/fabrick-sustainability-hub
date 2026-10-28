// Article content for the Knowledge Hub
// Each article has structured sections for rendering.
//
// ACCURACY RULE (26 Oct 2026): every factual claim in these articles must be
// traceable to an official or primary source listed in that article's
// `sources` array (legislation, government, the standard-setting body, the
// design team's own published figures). Do not add figures from trade press,
// consultancies or memory. If a claim cannot be sourced, leave it out.

export type ArticleFigure =
  | { kind: "stats"; title?: string; source?: string; items: { label: string; value: string; note?: string }[] }
  | { kind: "bars"; title: string; unit?: string; source?: string; caption?: string; items: { label: string; value: number; note?: string }[] }
  | { kind: "diverging"; title: string; unit?: string; source?: string; caption?: string; items: { label: string; value: number }[] }
  | { kind: "lines"; title: string; unit?: string; source?: string; caption?: string; xLabels: string[]; yMin?: number; forecastFrom?: number; series: { name: string; values: (number | null)[]; emphasis?: boolean }[] }
  | { kind: "dumbbell"; title: string; unit?: string; source?: string; caption?: string; fromLabel: string; toLabel: string; items: { label: string; from: number; to: number }[] }
  | { kind: "timeline"; title: string; source?: string; items: { date: string; label: string; highlight?: boolean }[] };

export interface ArticleSection {
  heading?: string;
  body: string; // paragraphs separated by \n\n
  figures?: ArticleFigure[]; // rendered after the body, data from the article's sources
}

export interface ArticleSource {
  title: string;
  url: string;
}

export interface ArticleContent {
  id: string;
  title: string;
  category: string;
  readTime: string;
  author: string;
  publishDate: string;
  reviewedDate: string; // last full fact-check against the listed sources
  heroSubtitle: string;
  sections: ArticleSection[];
  keyTakeaways: string[];
  sources: ArticleSource[];
  relatedArticles: string[];
}

export const articleContent: Record<string, ArticleContent> = {
  "what-is-embodied-carbon": {
    id: "what-is-embodied-carbon",
    title: "What Is Embodied Carbon? A Plain-English Guide for Construction",
    category: "Fundamentals",
    readTime: "5 min read",
    author: "Fabrick Sustainability Team",
    publishDate: "2026-01-15",
    reviewedDate: "2026-10-26",
    heroSubtitle:
      "Embodied carbon can represent 40 to 70% of a new building's whole-life carbon, according to LETI. Here is what it is, how it is measured, and where UK policy stands.",
    sections: [
      {
        heading: "The basics: operational vs embodied carbon",
        body: "A building's carbon footprint has two parts. Operational carbon is the emissions from the energy used to heat, cool, light and power the building, and from the water it uses, throughout its life. Embodied carbon is everything else: the emissions from extracting raw materials, manufacturing products, transporting them to site, building, maintaining and repairing the building, replacing components, and finally demolishing it and dealing with the waste.\n\nThe RICS professional standard Whole life carbon assessment for the built environment (2nd edition) defines embodied carbon as life cycle modules A0 to A5, B1 to B5 and C1 to C4, and operational carbon as modules B6 (energy) and B7 (water). Whole-life carbon is the two added together.\n\nFor decades, building regulations focused almost entirely on operational energy through Part L. As buildings become more energy efficient and the electricity grid decarbonises, embodied carbon becomes a larger share of the total.",
      },
      {
        heading: "How big a share is it?",
        body: "LETI's Embodied Carbon Primer states that embodied carbon has become significant and can represent 40 to 70% of whole-life carbon in a new building. The exact share depends on the building type, its energy performance and how long it is assumed to stand.\n\nAt national level, the UK Green Building Council states that the built environment is responsible for 25% of the UK's greenhouse gas emissions, and that embodied carbon makes up around 20% of built environment emissions.\n\nThe UK is legally committed to net zero greenhouse gas emissions by 2050 under the Climate Change Act 2008, as amended in 2019. Unlike operational carbon, which can fall over time as the grid decarbonises or a building is upgraded, embodied carbon is largely emitted before the building opens and cannot be recovered afterwards.",
      },
      {
        heading: "The life cycle stages (modules A to D)",
        body: "Whole-life carbon is assessed using a common module structure set out in BS EN 15978 (the 2026 edition was published by BSI on 31 July 2026) and applied in the UK through the RICS standard:\n\nModules A0 to A5 (product and construction stage): pre-construction activities (A0, taken as zero for buildings), raw material supply, transport to factory and manufacturing (A1 to A3), transport to site (A4) and the construction process itself (A5). Together these are known as upfront carbon.\n\nModules B1 to B5 (use stage, embodied): use, maintenance, repair, replacement and refurbishment over the building's life.\n\nModules B6 and B7 (use stage, operational): energy and water in use. B8, user activities, is optional.\n\nModules C1 to C4 (end of life): demolition, transport, waste processing and disposal.\n\nModule D (beyond the life cycle): benefits and loads from reuse, recycling and energy recovery. RICS requires module D to be reported separately, not netted off the total.\n\nLETI's primer notes that in an ultra-low-energy development the product stage (A1 to A3) makes up the largest proportion of whole-life carbon.",
      },
      {
        heading: "How it is measured",
        body: "The primary data source for a specific product is an Environmental Product Declaration (EPD). EPDs for construction products follow EN 15804 (current edition EN 15804:2012+A2:2019) and must be independently verified in line with ISO 14025; RICS states that third-party verification is preferred.\n\nWhere a product has not yet been chosen, generic data is used. The Greater London Authority's whole-life carbon assessment guidance lists verified EN 15804 EPDs first in its order of preference and generic datasets such as the ICE Database as the fallback. RICS takes the same approach: generic data at early design, then the manufacturer's own EPD once the actual product is specified.\n\nThe method itself is set by the RICS professional standard, which is mandatory for RICS members from 1 July 2024 and is the methodology referenced by the UK Net Zero Carbon Buildings Standard. Results are reported in kgCO₂e per square metre of gross internal area.",
      },
      {
        heading: "Is embodied carbon regulated in the UK?",
        body: "Not nationally, as of October 2026. Part Z is an industry proposal to add whole-life carbon assessment and upfront carbon limits to the Building Regulations in England. A private member's bill based on it was introduced in December 2024 but was never debated and fell when Parliament was prorogued in April 2026. In a Commons debate on 13 July 2026 the Minister described Part Z as \"one possible approach\" and said the Government had commissioned research on embodied carbon data before deciding next steps.\n\nIn London, the London Plan requires whole-life carbon assessments for planning applications referable to the Mayor, using the GLA's guidance. Elsewhere, the main driver is the voluntary UK Net Zero Carbon Buildings Standard, whose Version 1 was published in March 2026 and sets upfront carbon limits by building type and start year.",
      },
      {
        heading: "Practical steps to reduce it",
        body: "The reduction logic is the same whatever the project:\n\n1. Build less: refurbish rather than demolish and rebuild where the existing structure can be kept. Reduce floor area and structural spans.\n\n2. Build clever: optimise the structure to use less material, and size foundations on actual ground investigation data rather than conservative assumptions.\n\n3. Build with lower-carbon materials: the Mineral Products Association's Fact Sheet 18 shows that cements blended with GGBS or fly ash carry a lower carbon factor than CEM I. For steel, the British Constructional Steelwork Association advises asking for a product EPD and notes that electric arc furnace steel, made almost entirely from scrap, has a much lower factor than blast furnace steel. Timber stores biogenic carbon, but UK standards report that separately from upfront carbon.\n\n4. Build efficiently: minimise waste on site and plan deliveries.\n\n5. Plan for the end: design for disassembly so materials can be reused, and report module D separately so that benefit is visible without overstating it.",
      },
    ],
    keyTakeaways: [
      "Embodied carbon can represent 40 to 70% of a new building's whole-life carbon (LETI)",
      "The built environment is responsible for 25% of UK greenhouse gas emissions, and embodied carbon is around 20% of that (UKGBC)",
      "BS EN 15978 and the RICS professional standard define the modules; upfront carbon is A0 to A5",
      "EPDs to EN 15804 are the preferred data; generic data is for early design only",
      "There is no national regulation yet: Part Z is a proposal, the London Plan requires assessments in London, and the UK Net Zero Carbon Buildings Standard is voluntary",
    ],
    sources: [
      { title: "LETI, Embodied Carbon Primer (January 2020)", url: "https://www.leti.uk/_files/ugd/252d09_8ceffcbcafdb43cf8a19ab9af5073b92.pdf" },
      { title: "UKGBC, Embodied carbon (topic page) and Whole life carbon explainer", url: "https://ukgbc.org/our-work/topics/advancing-net-zero/embodied-carbon/" },
      { title: "RICS, Whole life carbon assessment for the built environment, 2nd edition (effective 1 July 2024)", url: "https://www.rics.org/content/dam/ricsglobal/documents/standards/Whole_life_carbon_assessment_PS_Sept23.pdf" },
      { title: "BSI, BS EN 15978:2026 Sustainability of construction works. Assessment of environmental performance of buildings", url: "https://knowledge.bsigroup.com/products/sustainability-of-construction-works-assessment-of-environmental-performance-of-buildings-requirements-and-guidance" },
      { title: "BSI, BS EN 15804:2012+A2:2019 Environmental product declarations. Core rules", url: "https://knowledge.bsigroup.com/products/sustainability-of-construction-works-environmental-product-declarations-core-rules-for-the-product-category-of-construction-products-2" },
      { title: "Greater London Authority, Whole Life-Cycle Carbon Assessments guidance (March 2022)", url: "https://www.london.gov.uk/sites/default/files/lpg_-_wlca_guidance.pdf" },
      { title: "Climate Change Act 2008 (2050 Target Amendment) Order 2019", url: "https://www.legislation.gov.uk/uksi/2019/1056/made" },
      { title: "UK Parliament, Carbon Emissions from Buildings (Net Zero) Bill (2024-26 session)", url: "https://bills.parliament.uk/bills/3904" },
      { title: "Hansard, Embodied Carbon: Buildings, 13 July 2026", url: "https://hansard.parliament.uk/commons/2026-07-13/debates/56B246B6-E95F-4815-84A7-206E4CD5296C/EmbodiedCarbonBuildings" },
      { title: "UK Net Zero Carbon Buildings Standard, history", url: "https://www.nzcbuildings.co.uk/history" },
      { title: "MPA, Fact Sheet 18: Embodied CO2e of UK cement, additions and cementitious material", url: "https://sustainableconcrete.org.uk/getattachment/Publications/FS_18_Embodied_CO2e.pdf.aspx?lang=en-GB" },
      { title: "BCSA, Steel sustainability FAQs", url: "https://www.bcsa.org.uk/resources/sustainability/steel-sustainability-faqs/" },
    ],
    relatedArticles: ["what-is-epd", "whole-life-carbon-assessment", "low-carbon-concrete"],
  },

  "part-z-explained": {
    id: "part-z-explained",
    title: "Part Z Explained: Where the Whole-Life Carbon Proposal Stands",
    category: "Regulations",
    readTime: "3 min read",
    author: "Fabrick Sustainability Team",
    publishDate: "2026-02-01",
    reviewedDate: "2026-10-26",
    heroSubtitle:
      "Part Z is an industry proposal, not law. The bill based on it fell in April 2026 and the Government has commissioned research rather than committed to regulate. Here is what it proposes and what applies today.",
    sections: [
      {
        heading: "What is Part Z?",
        body: "Part Z is a proposed amendment to the Building Regulations 2010, which apply in England, drafted by an industry campaign group as a proof of concept. The current draft, Proposed Document Z revision 2, is dated 31 January 2024 and is published at part-z.uk.\n\nThe campaign states that the document is aligned with the RICS whole-life carbon professional statement and with guidance from RIBA, IStructE, CIBSE, UKGBC and LETI. It carries statements of support from developers and investors including Landsec, Lendlease, Morgan Sindall, Laing O'Rourke, abrdn and Royal London Asset Management, with the note that they support the principle of embodied carbon regulation rather than necessarily every detail of the draft.",
      },
      {
        heading: "What Proposed Document Z would require",
        body: "The draft sets out two requirements:\n\nRequirement Z1, whole-life carbon assessment: a whole-life carbon assessment covering modules A1 to A5, B1 to B7, C1 to C4 and D, carried out in accordance with the RICS methodology, with module D reported separately.\n\nRequirement Z2, upfront carbon limits: mandatory maximum limits on upfront embodied carbon (modules A1 to A5), with the intention that limits extend to other modules and tighten over time.\n\nThe thresholds and dates in the draft are placeholders shown in square brackets: the requirements would apply to projects with a gross internal area of [1,000] m² or that create more than [10] dwellings, with Z1 applying from [1 January 2026] and Z2 from [1 January 2028]. None of these figures has been adopted by government.",
      },
      {
        heading: "Parliamentary history",
        body: "Bills based on Part Z have been introduced by backbench MPs in three sessions. The Carbon Emissions (Buildings) Bill was presented in the 2021-22 session and again in 2022-23, when it was sponsored by Jerome Mayhew. Neither reached a second reading.\n\nIn the 2024-26 session the Carbon Emissions from Buildings (Net Zero) Bill, a presentation bill sponsored by Ellie Chowns, had its first reading on 10 December 2024. No date was ever set for a second reading, and the bill fell when Parliament was prorogued on 29 April 2026. No successor bill has been introduced in the 2026-27 session.",
      },
      {
        heading: "The Government's position",
        body: "In March 2026 the Government published its response to the Environmental Audit Committee and declined the Committee's recommendation to mandate whole-life carbon assessments, saying it would rely on a voluntary approach.\n\nIn a Commons adjournment debate on embodied carbon in buildings on 13 July 2026, the Minister, Samantha Dixon, said: \"We are aware of the industry-led Part Z proposal, and setting expectations in this way is one possible approach.\" She added that the Government had \"commissioned research to help improve our understanding of the data currently available on embodied carbon\", that \"taking time does not mean inaction; it means doing the work properly\", and that \"we are considering the next steps very carefully.\" No consultation has been launched and no timetable has been given.",
      },
      {
        heading: "What applies today",
        body: "In London, the London Plan requires whole-life carbon assessments for planning applications that are referable to the Mayor, following the GLA's whole-life carbon assessment guidance (March 2022).\n\nNationally, the UK Net Zero Carbon Buildings Standard is a voluntary standard. Version 1 was published in March 2026 and third-party verification opened in July 2026. It sets upfront carbon limits by building type and by the year works start on site.\n\nThe RICS professional standard Whole life carbon assessment for the built environment (2nd edition) has been mandatory for RICS members since 1 July 2024 and is the methodology both Part Z and the UK Net Zero Carbon Buildings Standard reference.",
      },
      {
        heading: "What it would mean if adopted",
        body: "If Part Z, or something like it, were brought into the Building Regulations, qualifying projects would need a whole-life carbon assessment as part of compliance, and later would need to stay under an upfront carbon limit. That would make embodied carbon a compliance matter for the design team as well as a client or planning matter.\n\nThe practical preparation is the same whether or not it is adopted: carry out a RICS-compliant assessment at early design, specify products with EPDs, and design to the UK Net Zero Carbon Buildings Standard limit for the year works will start.",
      },
    ],
    keyTakeaways: [
      "Part Z is an industry proposal to amend the Building Regulations in England; it is not law",
      "The draft proposes whole-life carbon assessment (Z1) and upfront carbon limits (Z2), with placeholder thresholds of 1,000 m² or more than 10 dwellings",
      "The latest bill fell at prorogation on 29 April 2026 without a second reading",
      "In March 2026 the Government declined to mandate assessments; in July 2026 it said it had commissioned research",
      "Today the drivers are the London Plan, the voluntary UK Net Zero Carbon Buildings Standard and the RICS standard",
    ],
    sources: [
      { title: "Part Z campaign, Proposed Document Z revision 2 (31 January 2024)", url: "https://part-z.uk/proposal" },
      { title: "UK Parliament, Carbon Emissions from Buildings (Net Zero) Bill (2024-26)", url: "https://bills.parliament.uk/bills/3904" },
      { title: "UK Parliament, Carbon Emissions (Buildings) Bill (2022-23)", url: "https://bills.parliament.uk/bills/3211" },
      { title: "UK Parliament, Prorogation of Parliament, April 2026", url: "https://www.parliament.uk/business/news/2026/april-2026/prorogation-of-parliament-2026/" },
      { title: "Environmental Audit Committee, Government response (8th Special Report, 13 March 2026)", url: "https://committees.parliament.uk/publications/52135/documents/289425/default/" },
      { title: "Hansard, Embodied Carbon: Buildings, 13 July 2026", url: "https://hansard.parliament.uk/commons/2026-07-13/debates/56B246B6-E95F-4815-84A7-206E4CD5296C/EmbodiedCarbonBuildings" },
      { title: "Greater London Authority, Whole Life-Cycle Carbon Assessments guidance (March 2022)", url: "https://www.london.gov.uk/sites/default/files/lpg_-_wlca_guidance.pdf" },
      { title: "UK Net Zero Carbon Buildings Standard, history", url: "https://www.nzcbuildings.co.uk/history" },
      { title: "RICS, Whole life carbon assessment for the built environment, 2nd edition", url: "https://www.rics.org/content/dam/ricsglobal/documents/standards/Whole_life_carbon_assessment_PS_Sept23.pdf" },
    ],
    relatedArticles: ["what-is-embodied-carbon", "future-homes-standard-2026", "uknzcbs-guide"],
  },

  "future-homes-standard-2026": {
    id: "future-homes-standard-2026",
    title: "Future Homes Standard: What the March 2026 Regulations Require and When",
    category: "Regulations",
    readTime: "3 min read",
    author: "Fabrick Sustainability Team",
    publishDate: "2026-03-24",
    reviewedDate: "2026-10-26",
    heroSubtitle:
      "Laid on 24 March 2026 and in force from 24 March 2027, the Future Homes Standard requires new homes in England to emit on average at least 75% less carbon than homes built to 2013 standards.",
    sections: [
      {
        heading: "What was published on 24 March 2026",
        body: "On 24 March 2026 the Government laid the Building Regulations etc. (Amendment) (England) Regulations 2026 (SI 2026/335) and published the consultation response, impact assessment and new Approved Documents L and F. Together these are the Future Homes Standard for new dwellings and the Future Buildings Standard for other new buildings.\n\nThe regulations amend the energy efficiency requirements in Part 6 of the Building Regulations 2010 and Part L (conservation of fuel and power) and Part F (ventilation) of Schedule 1. They add a new requirement, L3, for on-site renewable electricity generation. They apply to building work in England only.\n\nThe Written Ministerial Statement says new homes will \"emit, on average, at least 75% less carbon than 2013 standards homes\" and that the majority of new homes will have solar panels installed.",
      },
      {
        heading: "When it applies",
        body: "The standards come into force on 24 March 2027 for building work that is not higher-risk building work. For higher-risk buildings the amended regulations take effect on 24 September 2027.\n\nThere is a 12-month transition. Under regulation 5 of SI 2026/335, work can be carried out to the previous requirements only if a building notice, initial notice or full plans were given to building control before 24 March 2027 and work on that building had commenced before 24 March 2028. Both conditions must be met, and the commencement test applies building by building. Planning approval is not the test.",
      },
      {
        heading: "The main requirements",
        body: "On-site renewable electricity: the new requirement L3 means most new dwellings must generate renewable electricity on site. The consultation response sets this at solar PV equivalent to 40% of the dwelling's ground-floor area, with exemptions where 720 kWh a year cannot be achieved and for buildings with a storey 18 m or more above ground. The Government anticipates the majority of installations will be rooftop solar.\n\nLow-carbon heating: the Government's announcement describes new homes \"built with low carbon heating such as heat pumps and heat networks\".\n\nFabric: the notional dwelling used for compliance keeps the fabric specification presented as Option 1 in the consultation. The Ministerial Statement refers to \"good quality building fabric\".\n\nOverheating: Part O is unchanged, and the Government has announced a technical review of Approved Document O.",
      },
      {
        heading: "Compliance calculation: SAP 10.3 first, then the Home Energy Model",
        body: "At launch, compliance is demonstrated using SAP 10.3. The consultation response said the Home Energy Model (HEM) would follow no earlier than three months after the response was published and would then run alongside SAP 10.3 for at least 24 months before becoming the sole method.\n\nOn 8 June 2026 the Government's SAP guidance page recorded that HEM had been delayed and that \"SAP 10.3 is currently available as the sole approved methodology\", with HEM expected \"in the coming months\". As of October 2026 no new date has been published.",
      },
      {
        heading: "Costs and savings",
        body: "The Government says a home built to the standard \"could save families up to £830 a year on their energy bills, compared to a standard home with an EPC rating of C\". The comparison is with an existing EPC C home, not with a home built to the 2021 regulations.\n\nThe impact assessment estimates a weighted average additional capital cost of £4,350 per dwelling.\n\nThe Government's announcement also notes that \"more than a million homes were built with higher bills following the cancellation of the Zero Carbon Homes standard in 2015\".",
      },
      {
        heading: "Where the market is now",
        body: "Office for National Statistics analysis of Energy Performance Certificate records to March 2025 found that 4.2% of new dwellings in England had heat pumps, compared with 0.8% of existing dwellings. The ONS has since discontinued this series.\n\nThe Future Homes Hub launched its \"Get Future Homes Standard Ready\" campaign on 4 March 2026 to help homebuilders, housing associations and developers prepare.",
      },
    ],
    keyTakeaways: [
      "Laid 24 March 2026; in force 24 March 2027 (24 September 2027 for higher-risk buildings); England only",
      "Transition: notice or plans before 24 March 2027 and work on that building started before 24 March 2028",
      "At least 75% less carbon on average than 2013 standards; low-carbon heating such as heat pumps and heat networks",
      "New requirement L3: on-site renewable electricity, set at solar equivalent to 40% of ground-floor area, with exemptions",
      "SAP 10.3 is the compliance method at launch; the Home Energy Model is delayed with no new date",
      "Up to £830 a year saving is measured against an existing EPC C home; the impact assessment puts extra build cost at £4,350 per dwelling",
    ],
    sources: [
      { title: "Written Ministerial Statement HCWS1445, Future Homes and Buildings Standards, 24 March 2026", url: "https://questions-statements.parliament.uk/written-statements/detail/2026-03-24/hcws1445" },
      { title: "The Building Regulations etc. (Amendment) (England) Regulations 2026, SI 2026/335", url: "https://www.legislation.gov.uk/uksi/2026/335/made" },
      { title: "MHCLG, Future Homes and Buildings Standards: consultation response (24 March 2026)", url: "https://assets.publishing.service.gov.uk/media/69c13592bb0dfe55b83e4b85/Future_Homes_and_Buildings_Standards_Consultation_Response.pdf" },
      { title: "MHCLG, Future Homes Standard impact assessment (24 March 2026)", url: "https://assets.publishing.service.gov.uk/media/69c16a87bb0dfe55b83e4bd3/Future_Homes_Standards_Impact_Assessment.pdf" },
      { title: "gov.uk news, 24 March 2026 (Future Homes Standard section)", url: "https://www.gov.uk/government/news/government-to-make-plug-in-solar-available-within-months" },
      { title: "gov.uk guidance, Standard Assessment Procedure (updated 8 June 2026)", url: "https://www.gov.uk/guidance/standard-assessment-procedure" },
      { title: "ONS, Energy efficiency of housing in England and Wales: 2025", url: "https://www.ons.gov.uk/peoplepopulationandcommunity/housing/articles/energyefficiencyofhousinginenglandandwales/2025" },
      { title: "Future Homes Hub, Get Future Homes Standard Ready (4 March 2026)", url: "https://futurehomes.org.uk/get-future-homes-standard-ready-uk-new-homes-sector-unites-on-mission-to-deliver-next-generation-of-low-energy-homes" },
    ],
    relatedArticles: ["part-z-explained", "what-is-embodied-carbon", "uknzcbs-guide"],
  },

  "what-is-epd": {
    id: "what-is-epd",
    title: "What Is an EPD and Why Does It Matter?",
    category: "Fundamentals",
    readTime: "3 min read",
    author: "Fabrick Sustainability Team",
    publishDate: "2026-01-20",
    reviewedDate: "2026-10-26",
    heroSubtitle:
      "Environmental Product Declarations are the preferred carbon data for specified products under UK guidance. Here is what they contain and how to read one.",
    sections: [
      {
        heading: "EPDs explained",
        body: "An Environmental Product Declaration (EPD) is a Type III environmental declaration: a standardised document that reports the environmental performance of a product across its life cycle, produced using life cycle assessment and independently verified. Think of it as a nutrition label for a building product, declaring carbon emissions and other impacts per unit of product.\n\nEPDs for construction products follow EN 15804. The current edition is EN 15804:2012+A2:2019 (with the 2021 corrigendum). The RICS whole-life carbon standard requires that any EPD used in an assessment is independently verified in line with ISO 14025, and states that third-party verification is preferred.",
      },
      {
        heading: "What an EPD must cover",
        body: "Under EN 15804+A2, all construction products must declare modules A1 to A3 (product stage), C1 to C4 (end of life) and module D (benefits beyond the system boundary). A cradle-to-gate-only EPD is permitted only for products that meet all three exemption conditions: physically integrated with other products at installation, no longer identifiable at end of life, and containing no biogenic carbon. Any product containing biogenic carbon, such as timber, must therefore declare the end-of-life modules.\n\nModules A4 and A5 (transport and construction) and the B modules (use stage) are declared where the product category rules require them or the manufacturer chooses to include them.",
      },
      {
        heading: "Why they matter for construction",
        body: "UK guidance ranks EPDs above generic data for specified products. The Greater London Authority's whole-life carbon assessment guidance lists verified Type III EPDs to EN 15804 first in its order of preference, and says to use data from the manufacturer of the actual materials and products being used. Generic datasets are the fallback. The RICS standard takes the same approach: generic data is preferred at early design, and once products are specified the first choice is an EPD from the chosen manufacturer that covers the actual product used.\n\nCertification schemes also reward them. In LEED v4.1 the EPD option awards one point for 20 products with EPDs, and a product-specific Type III EPD with external verification counts as 1.5 products. BREEAM's materials credits also recognise EPDs, and BRE guidance confirms that expired EPDs cannot contribute to credits.",
      },
      {
        heading: "How to read one",
        body: "The key carbon metric is Global Warming Potential (GWP), reported in kgCO₂e per declared unit. Under EN 15804+A2 GWP is split into four indicators: GWP-total, GWP-fossil, GWP-biogenic and GWP-luluc (land use and land use change). This matters for timber and other bio-based products, because GWP-biogenic carries the carbon stored in the product as a negative number in A1 to A3 and a matching positive number at end of life.\n\nFor UK upfront carbon reporting, the UK Net Zero Carbon Buildings Standard notes that upfront carbon can be calculated by adding the GWP-fossil and GWP-luluc indicators, which excludes sequestered biogenic carbon. RICS likewise reports sequestered carbon separately.\n\nThe declared unit varies between EPDs: per kilogram, per square metre, per cubic metre or per item. Always check the declared unit before comparing two products. A lower GWP figure may simply reflect a different unit rather than a lower-carbon product.",
      },
    ],
    keyTakeaways: [
      "EPDs are independently verified Type III declarations to EN 15804+A2",
      "Modules A1 to A3, C1 to C4 and D are mandatory for most products; cradle-to-gate-only EPDs need all three exemption conditions",
      "GLA guidance and the RICS standard rank the manufacturer's own EPD first once a product is specified",
      "GWP is split into total, fossil, biogenic and luluc; UK upfront carbon uses fossil plus luluc",
      "Always check the declared unit before comparing products",
    ],
    sources: [
      { title: "BSI, BS EN 15804:2012+A2:2019 Environmental product declarations. Core rules for construction products", url: "https://knowledge.bsigroup.com/products/sustainability-of-construction-works-environmental-product-declarations-core-rules-for-the-product-category-of-construction-products-2" },
      { title: "BRE, PN514 Product Category Rules for EN 15804+A2 (reproduces the mandatory module and GWP indicator clauses)", url: "https://www.greenbooklive.com/filelibrary/EN_15804/BRE-PN514-EN15804-A2-PCR-V3.1.pdf" },
      { title: "RICS, Whole life carbon assessment for the built environment, 2nd edition, section 4.7 and Table 8", url: "https://www.rics.org/content/dam/ricsglobal/documents/standards/Whole_life_carbon_assessment_PS_Sept23.pdf" },
      { title: "Greater London Authority, Whole Life-Cycle Carbon Assessments guidance (March 2022), section 2.7", url: "https://www.london.gov.uk/sites/default/files/lpg_-_wlca_guidance.pdf" },
      { title: "UK Net Zero Carbon Buildings Standard, Version 1, clause 3.1.1.7", url: "https://www.nzcbuildings.co.uk/_files/ugd/790941_c050829805364847b15590dc1d579b2d.pdf" },
      { title: "USGBC, LEED v4.1 Materials and Resources credit webinar", url: "https://leeduser.buildinggreen.com/sites/default/files/USGBC_LEEDv4.1_MR_Webinar_1.28.19.pdf" },
      { title: "BRE, BREEAM Knowledge Base, UK New Construction 2018 Materials", url: "https://kb.breeam.com/wp-content/plugins/breeamkb-pdf/pdf/?c=982" },
    ],
    relatedArticles: ["what-is-embodied-carbon", "whole-life-carbon-assessment", "low-carbon-concrete"],
  },

  "whole-life-carbon-assessment": {
    id: "whole-life-carbon-assessment",
    title: "How to Conduct a Whole-Life Carbon Assessment",
    category: "Guides",
    readTime: "4 min read",
    author: "Fabrick Sustainability Team",
    publishDate: "2026-02-10",
    reviewedDate: "2026-10-26",
    heroSubtitle:
      "A step-by-step guide to assessing a building's whole-life carbon to the RICS professional standard, with the benchmarks it is measured against.",
    sections: [
      {
        heading: "What is a WLCA?",
        body: "A whole-life carbon assessment (WLCA) quantifies the greenhouse gas emissions of a building across its whole life cycle, from raw material extraction through construction, use, maintenance and replacement, to demolition and disposal.\n\nIn the UK the method is set by the RICS professional standard Whole life carbon assessment for the built environment, 2nd edition, effective from 1 July 2024 and mandatory for RICS members. It applies the module structure of BS EN 15978, whose 2026 edition was published on 31 July 2026.\n\nRICS defines embodied carbon as modules A0 to A5, B1 to B5 and C1 to C4; operational carbon as B6 (energy) and B7 (water); and user carbon as B8 (optional). Whole-life carbon is A0 to A5, B1 to B7 (B8 optional) and C1 to C4. Module D (D1 and D2) is reported separately and never netted off.",
      },
      {
        heading: "Step 1: Define scope, study period and quantities",
        body: "State which modules are being assessed and the reference study period. The RICS standard requires 60 years for domestic and non-domestic buildings and 120 years for infrastructure, with 20 and 60 year periods for fit-out.\n\nBuild a quantity take-off for every significant material. At early design this can come from the cost plan or a 3D model where available; by technical design it should reflect the detailed design quantities. Report results per square metre of gross internal area (GIA) measured to the RICS property measurement standards.",
      },
      {
        heading: "Step 2: Assign carbon data",
        body: "RICS sets a data hierarchy that changes with design stage. At early design, generic data is the preferred data type, because products have not been chosen. Once products are specified, and at construction and post-completion, the first choice is an EPD from the chosen manufacturer that covers the actual product used, then a collective EPD for the regional sector, then generic data.\n\nIn the UK the generic datasets commonly referenced include the Built Environment Carbon Database and the ICE Database. KBOB is the Swiss federal equivalent and is not a UK default.\n\nFor operational energy (B6), RICS requires a predictive energy model using CIBSE TM54, NABERS UK, ASHRAE Standard 90.1, the Passive House Planning Package or a local equivalent. The standard states that in the UK the results of Part L calculations must not be used under any circumstances, because they are not a prediction of energy consumption. Where the building is in use, metered data is used.\n\nTo convert energy to carbon, RICS requires the most recent greenhouse gas conversion factors for company reporting issued by the designated body, which in the UK is the Department for Energy Security and Net Zero. Results must be calculated and reported both with and without grid decarbonisation, using the National Grid Future Energy Scenarios \"falling short\" scenario for the decarbonised case.",
      },
      {
        heading: "Step 3: Calculate and benchmark",
        body: "Sum emissions by module and report upfront carbon (A0 to A5), embodied carbon (A to C excluding B6 and B7) and whole-life carbon separately, each in kgCO₂e per m² GIA, with module D on its own line.\n\nThree published UK reference points, each with a different scope:\n\nLETI Embodied Carbon Primer (2020): upfront carbon (A1 to A5) targets of 500 kgCO₂e/m² for residential and 600 for non-residential buildings designed in 2020, and 300 for residential by 2030. LETI's target dates relate to the year of design.\n\nRIBA 2030 Climate Challenge, version 2 (2021): embodied carbon over modules A1 to A5, B1 to B5 and C1 to C4 including sequestration, per m² GIA. Domestic: business as usual 1,200, 2025 target below 800, 2030 target below 625. Offices: 1,400, below 970, below 750. Schools: 1,000, below 675, below 540.\n\nUK Net Zero Carbon Buildings Standard, Version 1 (2026): pass/fail upfront carbon limits (A0 to A5, excluding sequestered biogenic carbon) by building type and by the year works start on site. For works starting in 2026: single-family homes 400, flats 525, offices (whole building) 765, schools 555 kgCO₂e/m² GIA, falling every year to 2050.\n\nDo not compare a figure against a benchmark with a different module scope. LETI's Target Alignment note states that typical structures contribute 50 to 60% of a project's upfront carbon, so substructure and superstructure are where to look first.",
      },
      {
        heading: "Step 4: Identify reduction opportunities",
        body: "Use the assessment to find the hotspots and test alternatives before the design is fixed: retaining existing structure, reducing spans and quantities, swapping cement for blended cements, choosing the steel production route, or using timber where the fire strategy allows.\n\nThe UK Net Zero Carbon Buildings Standard recommends designing to the limit for the year works are expected to commence on site, with an appropriate contingency. Re-run the assessment at each stage and, for a verified net zero claim, with as-built quantities.",
      },
    ],
    keyTakeaways: [
      "Use the RICS professional standard (2nd edition, effective 1 July 2024) and BS EN 15978:2026",
      "Embodied carbon is A0 to A5, B1 to B5 and C1 to C4; operational is B6 and B7; module D is reported separately",
      "Reference study period: 60 years for buildings, 120 for infrastructure",
      "Part L calculations must not be used for operational energy; use TM54, NABERS UK, ASHRAE 90.1 or PHPP, with DESNZ conversion factors",
      "Benchmark only against figures with the same module scope: LETI (A1 to A5), RIBA 2030 (A to C) and the UKNZCBS limits (A0 to A5)",
    ],
    sources: [
      { title: "RICS, Whole life carbon assessment for the built environment, 2nd edition, Version 3 (August 2024)", url: "https://www.rics.org/content/dam/ricsglobal/documents/standards/Whole_life_carbon_assessment_PS_Sept23.pdf" },
      { title: "BSI, BS EN 15978:2026", url: "https://knowledge.bsigroup.com/products/sustainability-of-construction-works-assessment-of-environmental-performance-of-buildings-requirements-and-guidance" },
      { title: "LETI, Embodied Carbon Primer (January 2020)", url: "https://www.leti.uk/_files/ugd/252d09_8ceffcbcafdb43cf8a19ab9af5073b92.pdf" },
      { title: "LETI, Embodied Carbon Target Alignment (2021)", url: "https://www.leti.uk/_files/ugd/252d09_25fc266f7fe44a24b55cce95a92a3878.pdf" },
      { title: "RIBA, 2030 Climate Challenge, version 2 (2021)", url: "https://www.riba.org/media/rqtb35wb/riba-2030-climate-challenge.pdf" },
      { title: "UK Net Zero Carbon Buildings Standard, Version 1 Rev 1 (April 2026), Annex A Table EC-1", url: "https://www.nzcbuildings.co.uk/_files/ugd/790941_c050829805364847b15590dc1d579b2d.pdf" },
      { title: "DESNZ, Greenhouse gas reporting: conversion factors (collection)", url: "https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting" },
      { title: "KBOB (Switzerland), Ökobilanzdaten im Baubereich", url: "https://www.kbob.admin.ch" },
    ],
    relatedArticles: ["what-is-embodied-carbon", "what-is-epd", "carbon-reduction-case-studies"],
  },

  "low-carbon-concrete": {
    id: "low-carbon-concrete",
    title: "The Carbon Footprint of Concrete: Alternatives and Reduction Strategies",
    category: "Materials",
    readTime: "3 min read",
    author: "Fabrick Sustainability Team",
    publishDate: "2026-01-28",
    reviewedDate: "2026-10-26",
    heroSubtitle:
      "Cement production accounts for around 8% of global CO₂ emissions. Blended cements published by the Mineral Products Association carry 20 to 70% less carbon than CEM I.",
    sections: [
      {
        heading: "Why concrete matters",
        body: "Concrete is the most used construction material in the UK. The Mineral Products Association states that over 90 million tonnes is consumed in a typical year, supplied from around 1,000 sites. Demand has since fallen: the MPA reported that UK cement production was 7.3 million tonnes in 2024, the lowest since 1950.\n\nThe carbon sits mainly in the cement. Chatham House's 2018 report Making Concrete Change states that cement production accounts for around 8% of global CO₂ emissions. Portland cement is made by heating limestone and clay in a kiln; the emissions come both from the fuel and from the chemical reaction (calcination) that drives CO₂ out of the limestone.\n\nThe MPA's Fact Sheet 18, based on the UK average CEM I EPD published in April 2022, gives UK average CEM I a factor of 840 kgCO₂e per tonne, cradle to factory gate.",
      },
      {
        heading: "Cement replacements: GGBS and fly ash",
        body: "The most established way to cut concrete carbon is to replace part of the Portland cement with other cementitious materials. Fact Sheet 18 gives the factors, all cradle to factory gate:\n\nGround granulated blast-furnace slag (GGBS), a by-product of iron making: 155 kgCO₂e per tonne. Cements blended with GGBS are CEM II/B-S (21 to 35% GGBS) at 705 to 586 kgCO₂e per tonne, CEM III/A (36 to 65% GGBS) at 596 to 369, and CEM III/B (66 to 80% GGBS) at 378 to 260. Against CEM I at 840, that is a cement-level saving of roughly 16 to 69% depending on the blend.\n\nFly ash (pulverised fuel ash), a by-product of coal-fired power: 22 kgCO₂e per tonne. CEM II/B-V cements (21 to 35% fly ash) are 678 to 542 kgCO₂e per tonne, 19 to 35% below CEM I.\n\nLimestone fines: 44 kgCO₂e per tonne, used in limestone-blended cements.\n\nThe saving at concrete level is smaller than at cement level, because cement is only one part of the mix. Ask the ready-mix supplier for a product EPD for the actual mix.",
      },
      {
        heading: "Fly ash supply has changed",
        body: "The UK no longer produces fresh fly ash. The last coal-fired power station closed in September 2024, and the Department for Energy Security and Net Zero's provisional figures show coal in electricity supply falling to zero in 2025.\n\nThe UK Quality Ash Association states that since 2016 there has been net extraction of fly ash from single-use deposits, augmented by imports, and that by 2025 all fly ash demand was likely to be sourced from those deposits. Fly ash is therefore a recovered and imported material, and should be treated as constrained when specifying.",
      },
      {
        heading: "Emerging alternatives",
        body: "Limestone calcined clay cement (LC3): the Concrete Centre's case study of House Made by Many Hands records the first UK building structure to specify LC3, with a cement of 50% clinker, 30% calcined clay, 15% limestone and 5% gypsum. Fact Sheet 18 lists calcined clay as a permitted addition.\n\nCarbon mineralisation: Heidelberg Materials UK announced in December 2025 the first UK trials of CarbonCure, injecting captured CO₂ into fresh concrete so that it mineralises. The company reported an average of 5% less cement in the trial mixes and a saving of 7 to 11 kgCO₂ per cubic metre. The effect is modest and the technology is at trial stage in the UK.",
      },
      {
        heading: "Design strategies to reduce concrete volume",
        body: "Material substitution is only half the answer. Using less concrete cuts carbon regardless of the mix.\n\nPost-tensioned flat slabs: the Concrete Centre's technical compendium reports savings equating to about 20% of the concrete and 50% of the reinforcing steel compared with a conventional reinforced concrete flat slab, and a tower case study where slab depth was reduced by about 17%.\n\nVoided slabs: void formers remove concrete from parts of the slab that are not structurally needed.\n\nHybrid structures: timber upper floors on a concrete substructure, where the fire strategy allows, reduce the weight of the building and the size of the foundations.\n\nFoundation design: ground investigation that supports a less conservative design reduces the volume of substructure concrete, which is often the single largest concrete element.",
      },
    ],
    keyTakeaways: [
      "Cement production is around 8% of global CO₂ emissions (Chatham House, 2018)",
      "UK average CEM I is 840 kgCO₂e per tonne; GGBS and fly ash blends range from 705 down to 260 (MPA Fact Sheet 18)",
      "The UK no longer makes fresh fly ash; supply is recovered from deposits and imported (UKQAA)",
      "LC3 has been used in a UK building structure; CO₂ mineralisation is at UK trial stage with savings of 7 to 11 kgCO₂/m³",
      "Post-tensioned flat slabs save about 20% of concrete and 50% of reinforcement (Concrete Centre)",
    ],
    sources: [
      { title: "MPA, Fact Sheet 18: Embodied CO2e of UK cement, additions and cementitious material", url: "https://sustainableconcrete.org.uk/getattachment/Publications/FS_18_Embodied_CO2e.pdf.aspx?lang=en-GB" },
      { title: "MPA UK Concrete, This is UK Concrete (2020)", url: "https://thisisukconcrete.co.uk/getmedia/b0c070e8-d998-4fc6-b203-cdf9754d6bbb/This-Is-UK-Concrete-2020.aspx" },
      { title: "MPA, press release 3 September 2025 (cement production 2024)", url: "https://mineralproducts.org/News/2025/release28.aspx" },
      { title: "Chatham House, Making Concrete Change: Innovation in Low-carbon Cement and Concrete (2018)", url: "https://www.chathamhouse.org/2018/06/making-concrete-change-innovation-low-carbon-cement-and-concrete" },
      { title: "DESNZ, 2025 UK greenhouse gas emissions, provisional figures", url: "https://www.gov.uk/government/statistics/provisional-uk-greenhouse-gas-emissions-statistics-2025/2025-uk-greenhouse-gas-emissions-provisional-figures-statistical-release" },
      { title: "UK Quality Ash Association, Fly ash as a secondary material", url: "https://www.ukqaa.org.uk/wp-content/uploads/2024/05/UKQAA_SECONDARY_MATERIAL.pdf" },
      { title: "The Concrete Centre, House Made by Many Hands (LC3 case study)", url: "https://concretecentre.com/Concrete-Quarterly-magazine/Application2.aspx" },
      { title: "Heidelberg Materials UK, First trials of CarbonCure (4 December 2025)", url: "https://www.heidelbergmaterials.co.uk/en/news-and-events/first-trials-of-carboncure" },
      { title: "The Concrete Centre, Concrete Quarterly Technical Compendium 2020-21", url: "https://www.concretecentre.com/getmedia/52068787-3e6b-4eec-a8f3-a009b803ef84/CQ_Tech_compendium_20-21.aspx" },
    ],
    relatedArticles: ["what-is-embodied-carbon", "timber-vs-steel", "carbon-reduction-case-studies"],
  },

  "timber-vs-steel": {
    id: "timber-vs-steel",
    title: "Timber vs Steel Frame: A Carbon Comparison",
    category: "Materials",
    readTime: "4 min read",
    author: "Fabrick Sustainability Team",
    publishDate: "2026-02-20",
    reviewedDate: "2026-10-26",
    heroSubtitle:
      "Published factors from IStructE, the BCSA and manufacturer EPDs, how biogenic carbon is counted, and the fire rules that actually apply to timber in England.",
    sections: [
      {
        heading: "The carbon case for timber",
        body: "Timber is different from other structural materials because trees absorb CO₂ as they grow. The IStructE and Arup review of embodied carbon in timber states that trees store approximately one tonne of CO₂ per cubic metre of wood. IStructE's guide to calculating embodied carbon gives the sequestered carbon as 1.64 kgCO₂e per kilogram of timber.\n\nFor the manufacturing emissions themselves, the same IStructE and Arup review recommends factors drawn from current manufacturer EPDs of around 0.25 kgCO₂e per kilogram for cross-laminated timber (CLT) and 0.28 for glulam, for modules A1 to A3 and excluding the stored biogenic carbon. Always use the EPD of the actual product where one exists.",
      },
      {
        heading: "How biogenic carbon is counted",
        body: "Under EN 15804+A2 the CO₂ taken up by the tree is entered as a negative figure in module A1 and released as a positive figure at end of life in modules C3 and C4. Across the whole life cycle (A to C) the stored carbon therefore nets to zero; it is a temporary store, not a permanent removal.\n\nThis is why UK standards keep it separate. RICS requires sequestered carbon to be reported separately from upfront carbon, and the UK Net Zero Carbon Buildings Standard excludes biogenic carbon sequestered in installed products from its upfront carbon limits. Module D is a different thing again: it covers only the benefits from reuse, recycling or energy recovery at end of life, and is reported separately.\n\nA timber product can therefore show a net-negative product-stage figure if the stored carbon is included, but a whole-life assessment must not count that as a saving.",
      },
      {
        heading: "Steel: the production route is what matters",
        body: "Structural steel's carbon factor depends on how it was made, not on a recycled content percentage in the specification. The British Constructional Steelwork Association (BCSA) gives a UK average for sections of 1.74 kgCO₂e per kilogram (A1 to A3), about 2.4 for the blast furnace route and about 0.5 for European electric arc furnace sections. British Steel's 2026 EPD for rails and sections declares 2.94 tCO₂e per tonne for A1 to A3. Celsa Steel UK's EPD for electric arc furnace reinforcing bar declares 0.437 kgCO₂e per kilogram.\n\nThe BCSA states that specifying a high recycled content for steel is not a useful climate driver, because electric arc furnace steel is essentially 100% scrap based and all structural steel already contains recycled material. Ask for the product EPD and, where the design allows, specify sections from the electric arc route.\n\nAt end of life the BCSA's UK demolition survey found 93% of heavy structural sections recycled and 7% reused, and an overall recovery rate of around 99% is generally assumed for structural steelwork. This supports a module D credit of about 0.93 kgCO₂e per kilogram for sections, reported separately.",
      },
      {
        heading: "Fire rules for timber in England",
        body: "Two separate rules are often confused.\n\nSprinklers: since 26 November 2020 Approved Document B expects sprinkler systems to BS 9251 throughout new blocks of flats with a top storey more than 11 m above ground. This applies whatever the frame material.\n\nThe combustible materials ban: regulation 7(2) of the Building Regulations 2010, inserted in 2018, requires materials in the external walls of a \"relevant building\" (one with a storey at least 18 m above ground containing dwellings, institutions or residential rooms) to achieve European class A2-s1,d0 or A1. Hotels, hostels and boarding houses were added from 1 December 2022. Structural timber is therefore not permitted in the external walls of those buildings above 18 m, but is permitted below.\n\nA Building Safety Regulator consultation on Approved Document B, open from 25 March to 1 July 2026, proposed a threshold above which the guidance should not be applied where combustible elements of structure are used. The outcome had not been published at the time of review.\n\nThe Government's Timber in Construction Roadmap (2025) also records continuing caution from insurers and warranty providers about mass timber, and notes that carbon storage is approximately 50% higher in timber-framed homes.",
      },
      {
        heading: "Hybrid approaches",
        body: "Many recent UK projects combine materials: a concrete substructure and cores, timber floors or roof, and steel where spans or connections demand it. The LETI case study of Harris Academy Sutton records a hybrid CLT, glulam, timber frame, concrete and steel structure, with concrete kept for below-ground elements and fire-rated cores using 50% GGBS replacement, and reports that the switch from concrete to timber alone represented a 20% saving in embodied carbon in the design team's early-stage analysis.\n\nThe same case study notes that using timber above upper ground level significantly reduced the weight of the building and allowed a change from deep piles to a raft slab. Lighter superstructures mean smaller foundations, which is often where the largest concrete saving lies.",
      },
    ],
    keyTakeaways: [
      "Trees store about one tonne of CO₂ per cubic metre of wood (IStructE and Arup); EPD-based factors are about 0.25 kgCO₂e/kg for CLT and 0.28 for glulam, A1 to A3",
      "Stored biogenic carbon nets to zero across A to C and is reported separately by RICS and the UKNZCBS",
      "Steel: UK average sections 1.74 kgCO₂e/kg, blast furnace about 2.4, electric arc furnace about 0.5 (BCSA); recycled content in the spec is not the lever",
      "In England, sprinklers apply to flats over 11 m; the 18 m combustible ban applies to external walls",
      "Hybrid structures with timber above a concrete base cut weight and foundation size",
    ],
    sources: [
      { title: "IStructE, A brief guide to calculating embodied carbon (2020)", url: "https://www.istructe.org/IStructE/media/Public/TSE-Archive/2020/A-brief-guide-to-calculating-embodied-carbon.pdf" },
      { title: "IStructE and Arup, Embodied carbon in timber: a review (v2)", url: "https://www.istructe.org/IStructE/media/Public/Resources/ARUP-Embodied-carbon-timber-v2.pdf" },
      { title: "BCSA, Steel sustainability FAQs", url: "https://www.bcsa.org.uk/resources/sustainability/steel-sustainability-faqs/" },
      { title: "steelconstruction.info (BCSA), Recycling and reuse", url: "https://steelconstruction.info/Recycling_and_reuse" },
      { title: "British Steel, Rails and Sections EPD (2026)", url: "https://www.britishsteel.co.uk/wp-content/uploads/2026/07/British-Steel-Rails-and-Sections-EPD-2026.pdf" },
      { title: "RICS, Whole life carbon assessment for the built environment, 2nd edition", url: "https://www.rics.org/content/dam/ricsglobal/documents/standards/Whole_life_carbon_assessment_PS_Sept23.pdf" },
      { title: "UK Net Zero Carbon Buildings Standard, Version 1, clause 3.1.1.7", url: "https://www.nzcbuildings.co.uk/_files/ugd/790941_c050829805364847b15590dc1d579b2d.pdf" },
      { title: "MHCLG, Sprinklers and other fire safety measures in high-rise blocks of flats: government response (2020)", url: "https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/887224/Government_Response_-_Sprinklers_and_other_fire_safety_measures_in_high-rise_blocks_of_flats_2020.pdf" },
      { title: "The Building (Amendment) Regulations 2018, SI 2018/1230, regulation 2 (combustible materials)", url: "https://www.legislation.gov.uk/uksi/2018/1230/regulation/2/made" },
      { title: "The Building etc. (Amendment) (England) Regulations 2022, SI 2022/603", url: "https://www.legislation.gov.uk/uksi/2022/603/made" },
      { title: "Building Safety Regulator, Review of Approved Document B consultation (2026)", url: "https://consultations.hse.gov.uk/bsr/review-of-approved-document-b-fire-safety/" },
      { title: "gov.uk, Timber in Construction Roadmap 2025", url: "https://www.gov.uk/government/publications/timber-in-construction-roadmap-2025/timber-in-construction-roadmap-2025" },
      { title: "LETI, Embodied Carbon Case Study: Harris Academy Sutton (2023)", url: "https://www.leti.uk/_files/ugd/252d09_01e214c417b9490894960538bb256b2c.pdf" },
    ],
    relatedArticles: ["what-is-embodied-carbon", "low-carbon-concrete", "carbon-reduction-case-studies"],
  },

  "uk-cbam-construction": {
    id: "uk-cbam-construction",
    title: "UK CBAM: What It Means for Construction Material Imports",
    category: "Regulations",
    readTime: "3 min read",
    author: "Fabrick Sustainability Team",
    publishDate: "2026-03-01",
    reviewedDate: "2026-10-26",
    heroSubtitle:
      "From 1 January 2027 the UK Carbon Border Adjustment Mechanism charges a carbon price on imported iron and steel, aluminium, cement, fertiliser and hydrogen. It is a tax from day one, with the first return due 31 May 2028.",
    sections: [
      {
        heading: "What is the UK CBAM?",
        body: "The UK Carbon Border Adjustment Mechanism (CBAM) is designed to prevent carbon leakage, where production moves to countries with weaker carbon pricing. It applies a carbon price to the emissions embodied in certain imported goods so that they face a cost comparable to UK-made goods covered by the UK Emissions Trading Scheme.\n\nThe 2027 start was confirmed in the Government's response to the policy design consultation on 30 October 2024, restated at Budget 2025, and enacted in Part 5 of the Finance Act 2026, which received Royal Assent on 18 March 2026. Section 143 provides that \"CBAM is charged on the emissions embodied in a CBAM good when the good is imported into the United Kingdom.\"",
      },
      {
        heading: "What is in scope",
        body: "Schedule 16 to the Finance Act 2026 lists five sectors: aluminium goods, cement, fertilisers, hydrogen, and iron and steel goods, identified by specific commodity codes.\n\nGlass and ceramics, which were in the original December 2023 proposal, are not in scope from 2027. HM Treasury's factsheet states that \"the glass and ceramic sectors will not be in scope of CBAM from 2027 as originally proposed\".\n\nIndirect emissions from the electricity used in production are also excluded at the start. The factsheet states that their inclusion \"will be delayed until 2029 at the earliest\". For aluminium, this means the initial charge reflects direct process emissions only, not the carbon intensity of the smelter's electricity.",
      },
      {
        heading: "Who pays, and when",
        body: "The liable person is the importer: the person in whose name the customs declaration is made, or on whose behalf it is made. There is a registration threshold of £50,000 of CBAM goods, tested on a forward-looking 30-day basis and a backward-looking 12-month basis.\n\nThere is no reporting-only phase and no reduced introductory rate. CBAM is charged on goods imported from 1 January 2027. The first accounting period runs for the whole of 2027, with the first return and payment due by 31 May 2028. Registration opens on 1 January 2028, with a deadline of 31 January 2028 for those liable in 2027. Accounting periods are quarterly from 2028.\n\nThe rate is set per sector by reference to the UK ETS price, adjusted for free allocation, and published quarterly from 1 January 2027. Relief is available where an explicit carbon price has already been paid overseas under a qualifying scheme. Importers can use verified actual emissions data from the producer or, where that is not available, HMRC default values.",
      },
      {
        heading: "What it means for construction",
        body: "Steel: the UK Steel Strategy published by the Government states that only 30% of domestic demand was met by domestic production in 2024, so most structural steel used in the UK is imported and potentially within scope. The charge depends on the embodied emissions of the specific product, so steel from the blast furnace route carries a higher charge than electric arc furnace steel, and relief applies where a carbon price was paid at origin.\n\nCement and clinker: imports are in scope.\n\nAluminium: in scope for direct emissions, used widely in curtain walling and cladding.\n\nHMRC's tax information and impact note states that the measure is not expected to significantly affect prices for individuals, households or families. No official estimate of the impact on construction material prices has been published.",
      },
      {
        heading: "What specifiers should do now",
        body: "Know the origin and production route of imported steel, aluminium and cement, and ask suppliers for product EPDs and verified emissions data: the same data that supports a whole-life carbon assessment will support a CBAM return.\n\nLower-carbon products carry a lower charge, because the tax is on embodied emissions. Electric arc furnace steel, cements with lower clinker content and aluminium from producers with verified data will be less exposed.\n\nUK-produced materials already carry a carbon price through the UK ETS. CBAM is intended to put imports on a comparable footing.",
      },
    ],
    keyTakeaways: [
      "UK CBAM applies to goods imported from 1 January 2027, enacted in the Finance Act 2026",
      "Scope: iron and steel, aluminium, cement, fertiliser and hydrogen; glass and ceramics are out; indirect emissions excluded until at least 2029",
      "It is a tax from day one: first accounting period is all of 2027, return and payment due 31 May 2028",
      "The importer is liable, above a £50,000 threshold; rates track the UK ETS price with a free-allocation adjustment",
      "Only 30% of UK steel demand was met domestically in 2024 (UK Steel Strategy), so steel is the main construction exposure",
    ],
    sources: [
      { title: "Finance Act 2026, Part 5 (section 143) and Schedule 16", url: "https://www.legislation.gov.uk/ukpga/2026/11/section/143" },
      { title: "HMRC and HM Treasury, Carbon Border Adjustment Mechanism (CBAM) policy summary (updated 16 October 2026)", url: "https://www.gov.uk/government/publications/carbon-border-adjustment-mechanism-cbam-policy-summary/carbon-border-adjustment-mechanism-cbam-policy-summary" },
      { title: "HM Treasury, Factsheet: Carbon Border Adjustment Mechanism (updated 28 November 2025)", url: "https://www.gov.uk/government/publications/factsheet-carbon-border-adjustment-mechanism-cbam/factsheet-carbon-border-adjustment-mechanism" },
      { title: "HM Treasury and HMRC, Government response to the consultation on the introduction of a UK CBAM (30 October 2024)", url: "https://www.gov.uk/government/consultations/consultation-on-the-introduction-of-a-uk-carbon-border-adjustment-mechanism" },
      { title: "HMRC, Tax information and impact note: introduction of CBAM (updated 9 September 2026)", url: "https://www.gov.uk/government/publications/introduction-of-carbon-border-adjustment-mechanism/carbon-border-adjustment-mechanism" },
      { title: "HMRC, Rates for the Carbon Border Adjustment Mechanism", url: "https://www.gov.uk/guidance/rates-for-the-carbon-border-adjustment-mechanism-cbam" },
      { title: "HMRC, Getting the emissions intensity when importing CBAM goods", url: "https://www.gov.uk/guidance/getting-the-emissions-intensity-when-importing-carbon-border-adjustment-mechanism-cbam-goods" },
      { title: "gov.uk, The UK Steel Strategy (updated 14 October 2026)", url: "https://www.gov.uk/government/publications/steel-strategy/the-uk-steel-strategy-web-version" },
    ],
    relatedArticles: ["part-z-explained", "what-is-embodied-carbon", "timber-vs-steel"],
  },

  "uknzcbs-guide": {
    id: "uknzcbs-guide",
    title: "UK Net Zero Carbon Buildings Standard: Requirements Explained",
    category: "Regulations",
    readTime: "3 min read",
    author: "Fabrick Sustainability Team",
    publishDate: "2026-02-05",
    reviewedDate: "2026-10-26",
    heroSubtitle:
      "Piloted in September 2024 and published as Version 1 in March 2026, the UK Net Zero Carbon Buildings Standard sets pass/fail limits for upfront carbon and energy use by building type and start year. Verification opened in July 2026.",
    sections: [
      {
        heading: "Why a standard was needed",
        body: "Before the Standard there was no single agreed method for what \"net zero carbon\" meant for a building in the UK. A building could be called net zero on operational energy alone, or on the strength of offsets, with no common definition. The Standard's stated purpose is to create a unified definition for \"Net Zero Carbon Aligned Buildings\" in the UK.\n\nIt was developed by nine founding organisations: the Better Buildings Partnership, BRE, the Carbon Trust, CIBSE, IStructE, LETI, RIBA, RICS and UKGBC. The Pilot Version was launched on 24 September 2024. Version 1 was published in March 2026 (the current document is Version 1 Revision 1, April 2026), and third-party verification opened in July 2026 with Bureau Veritas as Verification Administrator.\n\nThe Standard is voluntary. There is currently no Building Regulations requirement for embodied carbon in England; Part Z remains an industry proposal.",
      },
      {
        heading: "Operational requirements",
        body: "The operational side is set as pass/fail metrics rather than a fabric specification:\n\nEnergy use intensity limits in kWh per m² GIA per year, by sector and by the date works commence, with space heating and cooling limits in some sectors.\n\nA fossil-fuel-free requirement for on-site energy, with limited exemptions.\n\nAnnual on-site renewable electricity generation targets, set per sector, and an upfront carbon limit of 750 kgCO₂e per kWp for the renewables themselves.\n\nOffsetting is optional. The Standard states that offsets \"may be used to complement, but not replace, the core elements of the Standard\". A building that meets all limits can claim to be \"Net Zero Carbon Aligned\"; if residual emissions are offset under section 5.10 it may claim \"Net Zero Carbon Aligned (plus offsets)\". Offsets never substitute for meeting a limit.",
      },
      {
        heading: "Upfront carbon limits",
        body: "Upfront carbon is defined as modules A0 to A5, with A0 taken as zero for buildings, and excludes biogenic carbon sequestered in the installed products. Limits are pass/fail, set by sector and subsector, by new works or retrofit, and by the year works commence on site, and they fall every year to 2050.\n\nSelected limits from Table EC-1 (new works, kgCO₂e per m² GIA, whole building), for works commencing in 2025, 2026 and 2030:\n\nHomes, single-family: 430, 400, 290.\n\nHomes, flats: 565, 525, 380.\n\nCommercial residential (student residences, care homes): 580, 550, 435.\n\nOffices, whole building: 805, 765, 595. Offices, shell and core plus Category A: 595, 565, 440.\n\nSchools: 585, 555, 435.\n\nHigher education: 640, 610, 480. Retail: 715, 680, 535. Healthcare: 790, 750, 590.\n\nRetrofit works have their own, lower limits in Table EC-2; for 2026 these include 625 for whole-building offices, 395 for flats and 255 for single-family homes.\n\nThe Standard recommends designing to the limit for the year works are expected to commence, allowing an appropriate contingency.",
      },
      {
        heading: "Life cycle reporting",
        body: "All life cycle stages must be assessed and reported, with module D reported separately. The reporting metric is life cycle embodied carbon over modules A to C. Version 1 contains no life cycle embodied carbon limits; the Standard notes these are intended for a future version.\n\nAssessments must follow the current edition of the RICS professional standard Whole life carbon assessment for the built environment. The RICS data hierarchy applies: once products are specified, the manufacturer's own EPD for the actual product is the first choice.",
      },
      {
        heading: "Verification",
        body: "A claim under the Standard must be third-party verified. Full verification is carried out on a building in use, using 12 months of measured data, and is what supports a \"Net Zero Carbon Aligned\" claim. An optional \"PC on track\" check is available at practical completion.\n\nThere is no design-stage verification. Design-stage assessments are for the project team's own use in steering the design; the verified claim is based on as-built quantities and measured performance.",
      },
    ],
    keyTakeaways: [
      "Pilot 24 September 2024; Version 1 March 2026; verification opened July 2026; voluntary",
      "Nine founders: BBP, BRE, Carbon Trust, CIBSE, IStructE, LETI, RIBA, RICS and UKGBC",
      "Upfront carbon limits (A0 to A5, excluding sequestered biogenic carbon) for works starting in 2026: single-family homes 400, flats 525, offices 765, schools 555 kgCO₂e/m² GIA",
      "Offsetting is optional and never replaces meeting a limit",
      "Verification uses 12 months of in-use data; there is no design-stage verification",
    ],
    sources: [
      { title: "UK Net Zero Carbon Buildings Standard, Version 1 Rev 1 (April 2026), including Annex A Tables EC-1 and EC-2", url: "https://www.nzcbuildings.co.uk/_files/ugd/790941_c050829805364847b15590dc1d579b2d.pdf" },
      { title: "UK Net Zero Carbon Buildings Standard, The Standard and history pages", url: "https://www.nzcbuildings.co.uk/the-standard" },
      { title: "UK Net Zero Carbon Buildings Standard, Verification Process for Claimants, Rev 1 (July 2026)", url: "https://www.nzcbuildings.co.uk/_files/ugd/790941_c02318782e8e48489399c849cd322720.pdf" },
      { title: "RIBA, UK Net Zero Carbon Buildings Standard pilot version launched (24 September 2024)", url: "https://www.riba.org/news/uk-net-zero-carbon-buildings-standard-pilot-version-launched/" },
      { title: "Bureau Veritas, Opening of UK NZCBS verification (27 July 2026)", url: "https://www.bureauveritas.co.uk/newsroom/bureau-veritas-and-nzcbs-announce-opening-uk-nzcbs-verification" },
      { title: "RICS, Whole life carbon assessment for the built environment, 2nd edition", url: "https://www.rics.org/content/dam/ricsglobal/documents/standards/Whole_life_carbon_assessment_PS_Sept23.pdf" },
    ],
    relatedArticles: ["part-z-explained", "future-homes-standard-2026", "whole-life-carbon-assessment"],
  },

  "carbon-reduction-case-studies": {
    id: "carbon-reduction-case-studies",
    title: "Five UK Projects With Published Embodied Carbon Figures",
    category: "Case Studies",
    readTime: "4 min read",
    author: "Fabrick Sustainability Team",
    publishDate: "2026-01-25",
    reviewedDate: "2026-10-26",
    heroSubtitle:
      "Five named UK projects whose design teams have published their embodied carbon results through LETI, UKGBC or their own case studies, with the figures quoted as they were published.",
    sections: [
      {
        heading: "Why published figures matter",
        body: "Benchmarks set the target; real projects show what has been achieved and how. The five projects below were chosen because their carbon figures are published by the design team or by a recognised body, with the modules and area basis stated. Each figure is given as published, with its scope, so that it can be compared properly. Where the source gives a percentage saving, the baseline it was measured against is stated too. Where it does not, no percentage is claimed.",
      },
      {
        heading: "Residential: Stephen Taylor Court, Cambridge",
        body: "A three-storey new-build and refurbishment scheme for King's College, Cambridge, providing 60 graduate study rooms and 24 one- and two-bed apartments, completed in 2022. Architect FCBStudios, structural engineer Smith and Wallwork, services and Passivhaus engineer Max Fordham. Gross internal area 4,400 m². Cross-laminated timber structure with brick facing walls and no basement.\n\nThe LETI case study reports upfront carbon (A1 to A5) of 273 kgCO₂e/m², use-stage embodied carbon (B1 to B5) of 22, end of life (C1 to C4) of 343, and sequestered carbon of 364 kgCO₂e/m² reported separately. Substructure accounts for 34 and superstructure 202 of the upfront total. The assessment was made at RIBA Stage 4 to 5 over a 60-year study period.\n\nThe design team's note on strategy: use of a CLT frame allowed a reduction in substructure and the use of a raft foundation with no piling, a thinner slab and 70% GGBS. No percentage saving is claimed in the source.",
      },
      {
        heading: "Office retrofit: The Entopia Building, Cambridge",
        body: "A deep retrofit of a 1930s telephone exchange for the Cambridge Institute for Sustainability Leadership, with Architype and Feilden+Mawson as architects and Max Fordham, BDP and CAR as engineers.\n\nThe UKGBC case study reports 487 kgCO₂e/m² upfront embodied carbon, and states that reuse of the original structure saved around 60% of the embodied carbon compared with demolishing and rebuilding the structure. The overall project embodied carbon for the newly added materials, over modules A1 to A5, B1 to B5 and C1 to C4 across an assumed 100-year lifespan, is 408 kgCO₂e/m², excluding fit-out. UKGBC describes the expected whole-life saving against a standard office refurbishment as 80%, and notes that calculations were still in progress at publication, so the figures are design-stage rather than verified as-built.",
      },
      {
        heading: "Education: Harris Academy Sutton, London",
        body: "A four-storey Passivhaus secondary school completed in 2019, 10,625 m² GIA. Architype as lead consultant and Passivhaus designer, Willmott Dixon as contractor, Price & Myers as structural engineer, BDP as services engineer, KLH UK as CLT supplier. The structure is a hybrid of CLT, glulam, timber frame, concrete and steel.\n\nThe LETI case study, assessed at RIBA Stage 6 over a 60-year study period, reports upfront carbon (A1 to A5) of 563 kgCO₂e/m², use stage (B1 to B5) of 108, end of life (C1 to C4) of 305, and sequestered carbon of 250 kgCO₂e/m² reported separately. Superstructure is 392 of the upfront total, building services 90.\n\nThe design team states that the switch from concrete to timber alone represented a 20% saving in embodied carbon in their early-stage analysis, that concrete was kept for below-ground elements and fire-rated cores with 50% GGBS replacement, and that using timber above upper ground level reduced the weight of the building enough to change from deep piles to a minimal raft slab.",
      },
      {
        heading: "Timber office: The Black & White Building, London",
        body: "A new office building in Hackney for The Office Group, 4,480 m², completed in November 2022, with an engineered timber superstructure on a concrete substructure. Architect Waugh Thistleton, structural engineer Eckersley O'Callaghan.\n\nWaugh Thistleton publishes an embodied carbon figure of 410 kgCO₂e/m² for modules A1 to A5. Eckersley O'Callaghan states that the embodied carbon of the structure was limited to 165 kgCO₂e/m², below the LETI 2030 target for office buildings. Neither source publishes a percentage saving or a baseline, so none is claimed here.",
      },
      {
        heading: "Low-carbon concrete: Temple Quarter Enterprise Campus, Bristol",
        body: "A 38,500 m² six-storey academic building for the University of Bristol, with Buro Happold as engineer and Sir Robert McAlpine as contractor.\n\nBuro Happold reports that the optimised design reduced upfront embodied carbon by almost half, from an estimated 29,560 tCO₂e to around 15,569 tCO₂e (A1 to A5), measured against the original design. On procurement, the design assumed a minimum of 35% GGBS in every mix, individual mixes used up to 85% GGBS, and 93.7% of the concrete poured by volume met the definition of low embodied carbon concrete. Buro Happold states that 2,254 tCO₂e (A1 to A3) was saved through low-carbon procurement relative to industry-average concrete, a 25.7% saving.\n\nThe halving came mainly from changing the structural grid and frame, not from the concrete mix alone, which is the usual order of priority: use less, then use lower-carbon.",
      },
      {
        heading: "Reading across the five",
        body: "Three of the five quote a percentage saving, each against a different baseline: Entopia's 60% against demolition and rebuild, Harris Academy's 20% against the concrete option in early-stage analysis, and Temple Quarter's near-halving against the original design. They cannot be averaged into a single headline figure.\n\nThe absolute figures can be compared with care. The two LETI case studies report upfront carbon (A1 to A5) of 273 and 563 kgCO₂e/m² GIA. For reference, the UK Net Zero Carbon Buildings Standard's upfront limits for works starting in 2026 are 525 for flats and 555 for schools, and LETI's 2020 design-year targets are 500 for residential and 600 for non-residential.",
      },
    ],
    keyTakeaways: [
      "Stephen Taylor Court: 273 kgCO₂e/m² upfront (A1 to A5), CLT frame on a raft with 70% GGBS (LETI)",
      "Entopia Building: 487 kgCO₂e/m² upfront; structural reuse saved around 60% versus demolish and rebuild (UKGBC)",
      "Harris Academy Sutton: 563 kgCO₂e/m² upfront; timber instead of concrete saved 20% in early-stage analysis (LETI)",
      "Black & White Building: 410 kgCO₂e/m² (A1 to A5), structure 165 kgCO₂e/m² (design team)",
      "Temple Quarter: upfront carbon almost halved against the original design; 25.7% saved through low-carbon concrete procurement (Buro Happold)",
    ],
    sources: [
      { title: "LETI, Embodied Carbon Case Study: Stephen Taylor Court (January 2023)", url: "https://www.leti.uk/_files/ugd/252d09_bd7a24ad3d6640d18eaff7ffc6b53114.pdf" },
      { title: "UKGBC, The Entopia Building case study", url: "https://ukgbc.org/resources/the-entopia-building/" },
      { title: "LETI, Embodied Carbon Case Study: Harris Academy Sutton (January 2023)", url: "https://www.leti.uk/_files/ugd/252d09_01e214c417b9490894960538bb256b2c.pdf" },
      { title: "Waugh Thistleton Architects, The Black & White Building", url: "https://waughthistleton.com/black-white-building/" },
      { title: "Eckersley O'Callaghan, The Black and White Building", url: "https://www.eocengineers.com/projects/the-black-and-white-building-424/" },
      { title: "Buro Happold, Reducing carbon emissions at Bristol's Temple Quarter Enterprise Campus (19 March 2025)", url: "https://www.burohappold.com/news/reducing-carbon-emissions-at-bristols-temple-quarter-enterprise-campus/" },
      { title: "LETI, Embodied Carbon Primer (January 2020)", url: "https://www.leti.uk/_files/ugd/252d09_8ceffcbcafdb43cf8a19ab9af5073b92.pdf" },
      { title: "UK Net Zero Carbon Buildings Standard, Version 1 Rev 1, Annex A Table EC-1", url: "https://www.nzcbuildings.co.uk/_files/ugd/790941_c050829805364847b15590dc1d579b2d.pdf" },
    ],
    relatedArticles: ["what-is-embodied-carbon", "low-carbon-concrete", "timber-vs-steel"],
  },
  "budget-2026-construction": {
    id: "budget-2026-construction",
    title: "Budget 2026: What It Means for Construction and Housing",
    category: "Policy",
    readTime: "7 min read",
    author: "Fabrick Sustainability Team",
    publishDate: "2026-10-28",
    reviewedDate: "2026-10-28",
    heroSubtitle:
      "John Healey's first Budget, delivered on 28 October 2026, left business taxes alone, added £1.5 billion for social housing and confirmed a £4.7 billion equity loan scheme for first-time buyers. The OBR's same-day forecast expects fewer homes, not more. Every figure below is taken from the Treasury, OBR, MHCLG, NHBC and ONS documents listed at the end.",
    sections: [
      {
        heading: "The short version",
        body: "The Budget contains no new taxes on employers. The Treasury's rates annex confirms that for 2027-28 employer National Insurance stays at 15% above a secondary threshold of £96 a week, the Employment Allowance stays at £10,500, employee National Insurance stays at 8% and 2%, and dividend tax rates are unchanged. Corporation Tax stays at 25% with a 19% small profits rate, now set through to the financial year beginning April 2028. Income tax and National Insurance thresholds remain frozen until 2030-31.\n\nFor construction the substance is on the demand side: an extra £1.5 billion for social and affordable housing, a £4.7 billion equity loan scheme for first-time buyers of new-build homes from April 2027, a VAT relief on land sold to social housing providers, and an exemption from Biodiversity Net Gain for small residential brownfield sites.\n\nThe Office for Budget Responsibility's forecast, published the same day, is the counterweight. It expects net additions to the UK housing stock to fall from around 230,000 in 2025-26 to 220,000 in 2026-27 and 2027-28, which is 190,000 fewer homes over the forecast period than it expected in March. It describes the new first-time buyer scheme as having 'only a marginal impact on housing supply given its limited overall size'.",
        figures: [{"kind": "stats", "title": "The Budget in four numbers", "source": "HM Treasury, Budget 2026; OBR, Economic and fiscal outlook, October 2026", "items": [{"label": "Employer National Insurance", "value": "15%", "note": "Unchanged for 2027-28, with the £96 a week threshold and £10,500 Employment Allowance also unchanged"}, {"label": "Social and affordable homes", "value": "£1.5bn", "note": "Extra funding for around 10,000 homes in England, 2027-28 to 2030-31"}, {"label": "Your First Home", "value": "£4.7bn", "note": "Equity loans for around 70,000 first-time buyers from April 2027"}, {"label": "OBR net additions, 2026-27", "value": "220,000", "note": "190,000 fewer homes over the forecast than the OBR expected in March"}]}],
      },
      {
        heading: "Housing: what was announced",
        body: "Social and Affordable Homes Programme. An additional £1.5 billion to deliver around 10,000 homes in England, allocated between 2027-28 and 2030-31, rising over the period to let councils build capacity, and prioritised for Social Rent, especially council homes. The Treasury says this takes total investment in the programme to more than £40 billion over 10 years and complements the £9.6 billion allocated earlier in 2026.\n\nCouncil borrowing. The preferential Public Works Loan Board rate for council housebuilding, 40 basis points below the normal rate, is extended by one year.\n\nVAT. A new relief on land sold to registered social housing providers, listed in the Treasury's tax measures as a zero rate for land sold to a relevant housing association, intended to speed up the construction of social housing.\n\nRough sleeping. Total additional rough sleeping funding rises to £874 million across 2026-27 to 2028-29, building on the £442 million announced in July and August 2026.\n\nYour First Home. A £4.7 billion equity loan scheme for first-time buyers of new-build homes in England, set out in the next section. The Budget document says the scheme will support delivery of an estimated 20,000 new homes.\n\nNext steps for council housebuilding are to be set out in a 10 Year Plan. No publication date is given.",
        figures: [{"kind": "bars", "title": "Housing money in the Budget and the programme it adds to", "unit": "£bn", "source": "HM Treasury, Budget 2026", "caption": "The £9.6bn was allocated to the Social and Affordable Homes Programme earlier in 2026; the Budget adds £1.5bn to it. Your First Home is lending, recovered as buyers repay. Rough sleeping funding is the total for 2026-27 to 2028-29.", "items": [{"label": "Affordable homes, allocated earlier in 2026", "value": 9.6}, {"label": "Your First Home equity loans", "value": 4.7}, {"label": "Affordable homes, added at this Budget", "value": 1.5}, {"label": "Rough sleeping, 2026-27 to 2028-29", "value": 0.874}]}],
      },
      {
        heading: "Your First Home: the scheme rules as published",
        body: "The Budget document sets out the final details of the scheme, which the Treasury's policy decisions table dates from April 2027.\n\nLoan: a Government equity loan of up to 20% of the price of a new-build home, for first-time buyers who would not otherwise be in a position to buy.\n\nDeposit: a minimum of 2.5% and a maximum of 15%.\n\nInterest: a five-year interest-free period, with a gradual increase after five years.\n\nIncome caps: £110,000 per household outside London and £140,000 inside London.\n\nPrice caps: set from local authority median prices, with caps of £650,000 in inner London and £500,000 in outer London.\n\nScale: around 70,000 households over the life of the scheme. The OBR records the loans as £0.7 billion in 2027-28 and £1 billion a year from 2028-29.\n\nDeveloper contribution: developers will be expected to make a contribution when signing up, set on a sliding scale to protect smaller developments.\n\nFunding: the £4.7 billion comes from reprioritised departmental financial transactions, including reallocations by the Department for Energy Security and Net Zero from the Warm Homes Fund, and an updated delivery pathway for the Woodland Carbon Purchase Fund.\n\nThe OBR's assessment is that the scheme 'could marginally raise house prices by stimulating housing demand' while having only a marginal effect on supply.",
        figures: [{"kind": "stats", "title": "Your First Home at a glance", "source": "HM Treasury, Budget 2026", "items": [{"label": "Equity loan", "value": "up to 20%", "note": "Of the price of a new-build home in England"}, {"label": "Minimum deposit", "value": "2.5%", "note": "Maximum deposit 15%"}, {"label": "Interest-free period", "value": "5 years", "note": "Then a gradual increase"}, {"label": "Household income cap", "value": "£110k / £140k", "note": "Outside London / inside London"}, {"label": "London price caps", "value": "£650k / £500k", "note": "Inner / outer London; elsewhere set from local authority median prices"}, {"label": "Scale", "value": "70,000", "note": "Households supported; the Treasury estimates 20,000 new homes"}]}],
      },
      {
        heading: "Planning and environmental rules",
        body: "Biodiversity Net Gain. Residential brownfield developments on sites up to 1.5 hectares in England are to be exempted from BNG requirements. The Budget says the full Government response to the consultation, the impact assessment and the implementation timeline will be published 'in due course', so the exemption is not yet in force. In the other direction, BNG becomes mandatory for Nationally Significant Infrastructure Projects from November 2026.\n\nJudicial review. The Treasury points to the Planning and Infrastructure Act 2025 reforms, noting that the judicial review of the Stonestreet Green Solar project concluded in six months against a previous average of 1.4 years.\n\nGrid connections. A consultation response on strategic demand connections confirms the use of Planning and Infrastructure Act powers to prioritise grid connections for strategically important projects, including data centres.\n\nDevolution. The Fiscal Devolution Roadmap published with the Budget gives Mayors a 20% share of locally retained business rates from next year, moving to 100% local retention of business rates income by the end of the decade, with income tax assignment for Mayors from 2028. Strategic Authorities receive £150 million of capacity funding in 2027-28 and a £1.5 billion borrowing facility that will be operational by April 2028. The first wave of Business Rates Retention Zones covers Greater Manchester, East Midlands, Hull and East Yorkshire, Liverpool City Region, Tees Valley, West of England, North East, York and North Yorkshire, and the Greater London Authority, subject to business case approval and legislation.",
      },
      {
        heading: "Business costs: what changes and what does not",
        body: "Wages. On 1 April 2027 the National Living Wage rises by 3.9% to £13.21 an hour. The National Minimum Wage rises by 3.9% to £11.27 for 18 to 20 year olds and to £8.31 for 16 to 17 year olds and eligible apprentices. The Treasury expects around 2.3 million workers to benefit.\n\nCapital allowances. The main rate first-year allowance rises to 50% for expenditure incurred on or after 1 January 2027. The main rate writing-down allowance falls to 12% from 1 April 2027 for Corporation Tax and 6 April 2027 for Income Tax.\n\nBusiness Asset Disposal Relief. The lifetime limit falls from £1 million to £500,000 for disposals on or after 6 April 2027. The Treasury says three-quarters of claimants will still receive relief on their entire gain.\n\nIndustrial energy. The British Industrial Competitiveness Scheme will cut electricity bills by up to 25% for over 10,000 eligible energy-intensive manufacturers in Great Britain from 1 April 2027, by exempting them from the indirect costs of the Renewables Obligation, Feed-in Tariffs and Capacity Market schemes, with an additional payment in 2027 reflecting the support they would have received in 2026-27. Applications are open. No new policy costs will be placed on bills until a Cost Control Framework is set at the spending review in 2027.\n\nBusiness rates. Retail, hospitality and leisure properties in England get a two-year real-terms freeze, with bill increases capped at CPI inflation in 2027-28 and 2028-29. Construction and manufacturing premises are not covered by these reliefs.\n\nMileage. The tax-free mileage rate for business travel above 10,000 miles rises from 25p to 35p per mile from 6 April 2027.\n\nSavings and property income. Income tax rates on savings and property income rise by 2 percentage points from 6 April 2027, to 24%, 44% and 49%, which affects landlords and investors rather than trading companies.",
      },
      {
        heading: "Infrastructure and public capital",
        body: "The Budget states that capital investment over this Parliament will be £120 billion higher than under the previous government's spring 2024 plans, and that day-to-day departmental spending will be over £40 billion a year higher by 2028-29.\n\nAn updated Infrastructure Pipeline will be published before the end of 2026. The Treasury says it will set out over £750 billion of planned investment over 10 years and an expected workforce requirement of over 650,000 people.\n\nAt least 3% of the workforce on large government construction and infrastructure projects must be apprentices.\n\nDefence. The details of how the Government will reach 3% of GDP in 2030 and the NATO commitment of 3.5% by 2035 will be set out at the spending review next year. The National Wealth Fund and British Business Bank will deploy up to £5 billion over the next four years into defence, dual use and related sectors.\n\nEnergy. £2 billion is provided for a new Energy Wealth Fund within the National Wealth Fund, and the Government is prioritising mature carbon capture and hydrogen projects at the Teesside, Merseyside and North Wales clusters.\n\nNot in the Budget: there is no new funding for retrofit or the Warm Homes Plan, no construction skills package beyond the apprenticeship requirement, and no new departmental capital settlements. Those will be set at the spending review in 2027.",
      },
      {
        heading: "The OBR forecast: the numbers behind the housing outlook",
        body: "The OBR's October 2026 Economic and Fiscal Outlook sets the economic context. Real GDP growth slows from around 1¼% in 2026 to 1% in 2027, half a percentage point below the March forecast. CPI inflation rises from around 3.1% in 2026 to 3.4% in 2027, with a quarterly peak of 3.8% in early 2027, and returns to the 2% target halfway through 2028. The forecast is conditioned on Bank Rate averaging 4.0% across 2026 and 2027 against 3.4% assumed in March, and a 10-year gilt yield of 5.0% against 4.6%. Public sector net borrowing falls from 4.4% of GDP in 2025-26 to 1.8% of GDP in 2031-32.\n\nOn housing the OBR says:\n\nNet additions to the housing stock fall from around 230,000 in 2025-26 to 220,000 in 2026-27 and 2027-28, then rise gradually to 260,000 in 2030-31. That is 190,000 fewer cumulative net additions over the forecast than expected in March.\n\nThe OBR has not changed its view that the 2024 planning reforms will have a positive impact. It attributes the downgrade to weak demand, rising material costs and the cumulative effect of regulatory and fiscal changes since 2019, naming the Building Safety Levy, the Building Safety Regulator regime, Biodiversity Net Gain, nutrient mitigation schemes, the residential property developer tax and higher Corporation Tax rates. It says these 'appear to have weighed on housebuilding activity to a greater extent than we had previously assumed'.\n\nAverage house prices are forecast to grow by around 2% in 2026 and 2½% in 2027, below CPI inflation, then average 2¾% a year from 2028. Property transactions grow from around 1.2 million in 2026 to around 1.3 million in 2031, around 4% fewer across the forecast than in March.\n\nReal residential investment rises by 0.5% in 2026 and is 6¾% lower in 2030 than in the March forecast, partly offset by investment diverted into improving the existing stock.",
        figures: [{"kind": "dumbbell", "title": "How the OBR's view moved between March and October 2026", "unit": "%", "fromLabel": "March 2026 forecast", "toLabel": "October 2026 forecast", "source": "OBR, Economic and fiscal outlook, October 2026, Table 2.1", "caption": "Averages across 2026 and 2027. The October forecast is conditioned on market pricing to 19 August 2026.", "items": [{"label": "Real GDP growth", "from": 1.3, "to": 1.1}, {"label": "CPI inflation", "from": 2.1, "to": 3.3}, {"label": "Bank Rate", "from": 3.4, "to": 4.0}, {"label": "10-year gilt yield", "from": 4.6, "to": 5.0}]}, {"kind": "lines", "title": "Net additions to the UK housing stock: March vs October forecast", "unit": "thousand", "source": "OBR, Economic and fiscal outlook, October 2026, Chart 2.18 data", "caption": "Thousands of homes a year. Outturn to 2024-25, forecast from 2025-26. Across the forecast period the October line adds up to 190,000 fewer homes than March.", "xLabels": ["2019-20", "2020-21", "2021-22", "2022-23", "2023-24", "2024-25", "2025-26", "2026-27", "2027-28", "2028-29", "2029-30", "2030-31", "2031-32"], "yMin": 150, "forecastFrom": 6, "series": [{"name": "October 2026", "emphasis": true, "values": [285.2, 250.2, 270.4, 269.8, 254.0, 238.8, 229.1, 221.2, 218.9, 227.2, 244.9, 259.6, 268.9]}, {"name": "March 2026", "values": [284.9, 250.2, 270.5, 269.6, 253.2, 240.4, 235.7, 219.0, 252.1, 285.8, 300.5, 307.3, null]}]}],
      },
      {
        heading: "Where the market stands today",
        body: "Official statistics give the baseline the Budget is working against.\n\nMHCLG net additional dwellings. Annual housing supply in England was 208,600 net additional dwellings in 2024-25, a 6% decrease on 2023-24. Using Energy Performance Certificate lodgements, MHCLG estimates 124,800 net additional homes were delivered between 1 April and 9 November 2025. The Government's target, restated in June 2025, is 1.5 million homes over this Parliament.\n\nNHBC registrations, Q2 2026 (the latest published). 29,162 new homes were registered, 4% down on Q2 2025. Private sector registrations were 19,045, down 5%, and rental and affordable registrations were 10,117, level with a year earlier. Completions were 32,973, up 1%. Registrations fell in 6 of 12 UK regions. NHBC's Q3 2026 review had not been published at the time of writing.\n\nONS construction output to August 2026, as tracked on the Pulse dashboard. Comparing the three months to August 2026 with the same three months of 2025, using the ONS chained volume series for Great Britain: total new housing output was down 9.0%, with public new housing down 27.9% and private new housing down 6.1%. All new work was down 5.0%. Infrastructure new work was flat at minus 0.1%, and repair and maintenance was up 3.0%. These percentages are calculated by Pulse from ONS Table 2a; the underlying series are shown on our construction output tracker.",
        figures: [{"kind": "stats", "title": "NHBC new home statistics, Q2 2026", "source": "NHBC, New home statistics review Q2 2026", "items": [{"label": "Registrations", "value": "29,162", "note": "Down 4% on Q2 2025"}, {"label": "Private sector registrations", "value": "19,045", "note": "Down 5% on Q2 2025"}, {"label": "Rental and affordable registrations", "value": "10,117", "note": "Level with Q2 2025"}, {"label": "Completions", "value": "32,973", "note": "Up 1% on Q2 2025"}, {"label": "Regions with fewer registrations", "value": "6 of 12", "note": "UK regions, Q2 2026 vs Q2 2025"}, {"label": "Next release", "value": "Q3 2026", "note": "Not published at the time of writing"}]}, {"kind": "diverging", "title": "Construction output by sector: three months to August 2026 vs a year earlier", "unit": "%", "source": "ONS, Output in the construction industry, Table 2a (chained volume, seasonally adjusted, Great Britain); percentages calculated by Pulse", "caption": "Three-month averages compared with the same three months of 2025, to smooth the monthly series.", "items": [{"label": "Public new housing", "value": -27.9}, {"label": "Public other new work", "value": -12.9}, {"label": "Private industrial", "value": -8.8}, {"label": "Private new housing", "value": -6.1}, {"label": "All new work", "value": -5.0}, {"label": "Infrastructure", "value": -0.1}, {"label": "Private commercial", "value": 1.6}, {"label": "Non-housing repair and maintenance", "value": 2.9}, {"label": "Housing repair and maintenance", "value": 3.1}]}, {"kind": "lines", "title": "New housing output, monthly, £ million (2023 prices)", "unit": "£m", "source": "ONS, Output in the construction industry, Table 2a, release of 15 October 2026", "caption": "Total new housing (public and private), Great Britain, chained volume measures, seasonally adjusted. Tracked live on the Pulse dashboard.", "xLabels": ["Sep 2023", "Oct 2023", "Nov 2023", "Dec 2023", "Jan 2024", "Feb 2024", "Mar 2024", "Apr 2024", "May 2024", "Jun 2024", "Jul 2024", "Aug 2024", "Sep 2024", "Oct 2024", "Nov 2024", "Dec 2024", "Jan 2025", "Feb 2025", "Mar 2025", "Apr 2025", "May 2025", "Jun 2025", "Jul 2025", "Aug 2025", "Sep 2025", "Oct 2025", "Nov 2025", "Dec 2025", "Jan 2026", "Feb 2026", "Mar 2026", "Apr 2026", "May 2026", "Jun 2026", "Jul 2026", "Aug 2026"], "series": [{"name": "New housing", "values": [4168, 4047, 4013, 3952, 4054, 4039, 4058, 3887, 3966, 3946, 3949, 3987, 3962, 3918, 3954, 3959, 3976, 3979, 4011, 4044, 3976, 3956, 3879, 3934, 4075, 3886, 3762, 3771, 3643, 3710, 3773, 3698, 3743, 3663, 3558, 3483]}]}],
      },
      {
        heading: "The 2027 calendar for construction businesses",
        body: "The dates below come from the Budget documents and the regulations already on the Pulse tracker. Three matter most for planning: the Future Homes Standard on 24 March 2027, the wage and capital allowance changes on 1 and 6 April 2027, and the arrival of Your First Home equity loans in April 2027. The implementation date for the Biodiversity Net Gain brownfield exemption and the 10 Year Plan for council housebuilding have not been set.",
        figures: [{"kind": "timeline", "title": "Key dates", "source": "HM Treasury, Budget 2026; HM Treasury OOTLAR; Pulse regulations tracker", "items": [{"date": "November 2026", "label": "Biodiversity Net Gain becomes mandatory for Nationally Significant Infrastructure Projects"}, {"date": "30 November 2026", "label": "Founders' Relief technical consultation closes"}, {"date": "By end of 2026", "label": "Updated Infrastructure Pipeline published: over £750bn of planned investment over 10 years"}, {"date": "1 January 2027", "label": "UK CBAM starts charging a carbon price on imported steel, aluminium, cement, fertiliser and hydrogen. Main rate first-year allowance rises to 50%"}, {"date": "24 March 2027", "label": "Future Homes Standard in force for new homes in England", "highlight": true}, {"date": "1 April 2027", "label": "National Living Wage £13.21. British Industrial Competitiveness Scheme discounts begin. Writing-down allowance 12%"}, {"date": "6 April 2027", "label": "Business Asset Disposal Relief limit £500,000. Savings and property income tax up 2 points. Mileage over 10,000 miles 35p"}, {"date": "April 2027", "label": "Your First Home equity loans available. Social and Affordable Homes Programme uplift begins", "highlight": true}, {"date": "Spending review 2027", "label": "Departmental capital budgets, defence spending path, energy Cost Control Framework"}, {"date": "Date not set", "label": "BNG brownfield exemption implementation; 10 Year Plan for council housebuilding; Founders' Relief rate"}]}],
      },
    ],
    keyTakeaways: [
      "No new employer taxes: National Insurance, Corporation Tax and dividend rates are unchanged for 2027-28. The National Living Wage rises 3.9% to £13.21 from 1 April 2027",
      "£1.5bn more for social and affordable housing (around 10,000 homes, 2027-28 to 2030-31) and a £4.7bn Your First Home equity loan scheme from April 2027: 70,000 buyers, 20% loans, 2.5% minimum deposit",
      "Biodiversity Net Gain exemption for residential brownfield sites up to 1.5 hectares, with the implementation date still to be published; BNG becomes mandatory for NSIPs from November 2026",
      "The OBR forecasts net housing additions falling to 220,000 in 2026-27 and 2027-28, 190,000 fewer over the forecast than in March, and calls the supply effect of Your First Home marginal",
      "Latest official data: 208,600 net additional dwellings in 2024-25 (down 6%), NHBC Q2 2026 registrations down 4%, and ONS new housing output down 9% in the three months to August 2026",
    ],
    sources: [
      { title: "HM Treasury, Budget 2026 (28 October 2026)", url: "https://www.gov.uk/government/publications/budget-2026-document/budget-2026-html" },
      { title: "HM Treasury, Budget 2026: Overview of tax legislation and rates (OOTLAR)", url: "https://www.gov.uk/government/publications/budget-2026-overview-of-tax-legislation-and-rates-ootlar/budget-2026-overview-of-tax-legislation-and-rates-ootlar" },
      { title: "HM Treasury, Budget 2026 OOTLAR Annex A: rates and allowances", url: "https://www.gov.uk/government/publications/budget-2026-overview-of-tax-legislation-and-rates-ootlar/annex-a-rates-and-allowances" },
      { title: "Office for Budget Responsibility, Economic and fiscal outlook, October 2026", url: "https://obr.uk/efo/economic-and-fiscal-outlook-october-2026/" },
      { title: "MHCLG, Housing supply: net additional dwellings, England: 2024-25 (20 November 2025)", url: "https://www.gov.uk/government/statistics/housing-supply-net-additional-dwellings-england-2024-to-2025/housing-supply-net-additional-dwellings-england-2024-to-2025" },
      { title: "Prime Minister's Office, PM unveils AI breakthrough to slash planning delays and help build 1.5 million homes (9 June 2025)", url: "https://www.gov.uk/government/news/pm-unveils-ai-breakthrough-to-slash-planning-delays-and-help-build-15-million-homes-6-june-2025" },
      { title: "NHBC, New home statistics review Q2 2026", url: "https://www.nhbc.co.uk/kontentdocuments/9fb2f46b-51a9-4bbc-b3cb-3346ef5c457c/NHBC%20new%20home%20statistics%20review%20Q2%202026.pdf" },
      { title: "ONS, Output in the construction industry, Table 2a (release of 15 October 2026, data to August 2026)", url: "https://www.ons.gov.uk/businessindustryandtrade/constructionindustry/datasets/outputintheconstructionindustry" },
    ],
    relatedArticles: ["future-homes-standard-2026", "uk-cbam-construction", "part-z-explained"],
  },
};

export function getArticleContent(slug: string): ArticleContent | null {
  return articleContent[slug] || null;
}
