// Article content for the Knowledge Hub
// Each article has structured sections for rendering

export interface ArticleSection {
  heading?: string;
  body: string; // supports basic markdown-style formatting
}

export interface ArticleContent {
  id: string;
  title: string;
  category: string;
  readTime: string;
  author: string;
  publishDate: string;
  heroSubtitle: string;
  sections: ArticleSection[];
  keyTakeaways: string[];
  relatedArticles: string[];
}

export const articleContent: Record<string, ArticleContent> = {
  "what-is-embodied-carbon": {
    id: "what-is-embodied-carbon",
    title: "What Is Embodied Carbon? A Plain-English Guide for Construction",
    category: "Fundamentals",
    readTime: "8 min read",
    author: "Fabrick Sustainability Team",
    publishDate: "2026-01-15",
    heroSubtitle:
      "Embodied carbon accounts for up to 50% of a building's total lifecycle emissions. Here's everything you need to know.",
    sections: [
      {
        heading: "The basics: operational vs embodied carbon",
        body: "When we talk about a building's carbon footprint, there are two distinct components. Operational carbon is the energy used to heat, cool, light, and power the building throughout its life. Embodied carbon is everything else — the emissions from extracting raw materials, manufacturing products, transporting them to site, constructing the building, maintaining it, and eventually demolishing and disposing of it.\n\nFor decades, the industry focused almost exclusively on operational carbon. Building regulations like Part L targeted energy efficiency with better insulation and airtightness. But as buildings become more energy-efficient and the electricity grid decarbonises, embodied carbon now represents an increasingly dominant share — often 50% or more of total lifecycle emissions for new buildings.",
      },
      {
        heading: "Why it matters now",
        body: "The urgency is simple: embodied carbon is locked in at the point of construction. Unlike operational carbon, which can be reduced over time by switching to renewable energy, the carbon emitted to produce and install your materials cannot be recovered. Every tonne of concrete poured, every steel beam erected — that carbon is spent.\n\nWith the UK committed to net zero by 2050 and construction responsible for approximately 40 MtCO₂e annually, the industry must act on embodied carbon now. Upcoming regulations like Part Z will make whole-life carbon reporting mandatory for large projects.",
      },
      {
        heading: "The lifecycle stages (Modules A to D)",
        body: "The EN 15978 framework breaks a building's lifecycle into modules:\n\nModules A1–A3 (Product Stage): Raw material extraction, transport to factory, manufacturing. This is where most embodied carbon sits — typically 60–80% of total embodied emissions.\n\nModule A4 (Transport): Moving products from factory to construction site.\n\nModule A5 (Construction): On-site energy use, waste, and temporary works.\n\nModules B1–B5 (Use Stage): Maintenance, repair, replacement of materials over the building's life.\n\nModules C1–C4 (End of Life): Demolition, transport, waste processing, disposal.\n\nModule D (Beyond Lifecycle): Credits for recycling potential, energy recovery, and reuse. This is where materials like steel and timber can claim benefits.",
      },
      {
        heading: "How to measure it",
        body: "The primary data source for embodied carbon in UK construction is Environmental Product Declarations (EPDs). These are third-party verified documents that declare the environmental impact of a specific product.\n\nWhere specific EPDs aren't available, generic data from the ICE Database (Inventory of Carbon & Energy) by Circular Ecology provides widely-used default values. Tools like OneClick LCA, eTool, and the RICS Whole Life Carbon Assessment methodology help practitioners calculate project-level embodied carbon.\n\nOur Carbon Calculator uses ICE database values to give you an immediate understanding of material-level carbon impacts and suggest lower-carbon alternatives.",
      },
      {
        heading: "Practical steps to reduce it",
        body: "The carbon reduction hierarchy for embodied carbon follows a clear logic:\n\n1. Build less: Can you refurbish instead of demolish and rebuild? Can you reduce floor area or structural spans?\n\n2. Build clever: Optimise structural design to use less material. Right-size foundations based on actual ground conditions rather than conservative assumptions.\n\n3. Build with low-carbon materials: Swap CEM I concrete for GGBS or PFA blends. Use recycled steel instead of virgin. Specify timber where structurally appropriate.\n\n4. Build efficiently: Minimise construction waste, use off-site manufacturing, plan deliveries to reduce transport emissions.\n\n5. Plan for the future: Design for disassembly so materials can be reused. Specify materials with strong recycling pathways.",
      },
    ],
    keyTakeaways: [
      "Embodied carbon is locked in at construction — it can't be reduced later",
      "It now represents 50%+ of a new building's total carbon footprint",
      "The EN 15978 framework (Modules A–D) is the standard measurement approach",
      "EPDs and the ICE Database are the primary data sources",
      "Part Z will make reporting mandatory — start measuring now",
    ],
    relatedArticles: ["what-is-epd", "whole-life-carbon-assessment", "low-carbon-concrete"],
  },

  "part-z-explained": {
    id: "part-z-explained",
    title: "Part Z Explained: What Whole-Life Carbon Regulation Means for You",
    category: "Regulations",
    readTime: "10 min read",
    author: "Fabrick Sustainability Team",
    publishDate: "2026-02-01",
    heroSubtitle:
      "Part Z is progressing through Parliament. We break down what this means for developers, architects, and contractors.",
    sections: [
      {
        heading: "What is Part Z?",
        body: "Part Z is a proposed amendment to UK Building Regulations that would require measurement and reporting of whole-life carbon emissions for new buildings above a certain size threshold. Unlike existing regulations that focus on operational energy (Part L), Part Z addresses the embodied carbon of construction materials — the emissions from extraction, manufacturing, transport, and construction.\n\nThe proposal, championed by the Part Z campaign group and supported by organisations including LETI, RIBA, and the UKGBC, has gained significant cross-party parliamentary support.",
      },
      {
        heading: "What would it require?",
        body: "Based on the latest proposals, Part Z would initially require:\n\nWhole-life carbon assessment: Projects above the threshold must calculate and report their total carbon impact across all lifecycle stages (Modules A1–C4, with Module D reported separately).\n\nUpfront carbon limits: Mandatory maximum limits on Modules A1–A5 (product and construction stage), with limits tightening over time.\n\nThe initial threshold is expected to apply to buildings over 1,000m² or residential developments of 10+ units. This targets the projects with the greatest impact while giving smaller builders time to adapt.",
      },
      {
        heading: "Timeline and current status",
        body: "Part Z is progressing through parliamentary stages. While the exact timeline depends on legislative scheduling, the current expectation is:\n\n2025–2026: Consultation and parliamentary progress, with reporting requirements beginning for large projects.\n\n2027–2028: Expected introduction of mandatory embodied carbon limits.\n\nThe government has signalled strong support for whole-life carbon regulation, and the UKNZCBS (UK Net Zero Carbon Building Standard) launched in early 2026 provides a complementary voluntary framework.",
      },
      {
        heading: "What it means for developers",
        body: "For developers, Part Z means embodied carbon must now factor into feasibility studies and land appraisals. Material choices that were previously driven purely by cost and programme will need to account for carbon performance. Developers should begin requiring whole-life carbon assessments from their design teams now, even before Part Z becomes mandatory, to understand their carbon baseline and identify reduction opportunities.",
      },
      {
        heading: "What it means for architects and engineers",
        body: "Design teams will need competency in whole-life carbon assessment. The RIBA Plan of Work already includes sustainability checkpoints, but Part Z makes these legally binding for qualifying projects. Architects and structural engineers should be able to demonstrate how design decisions — material selection, structural system, building form — influence embodied carbon. Tools like OneClick LCA and our Carbon Calculator can help quantify these trade-offs early in the design process.",
      },
      {
        heading: "What it means for contractors",
        body: "Contractors will need to demonstrate that as-built carbon matches or improves on the design-stage assessment. This means tracking actual materials delivered to site, managing substitutions carefully, and reporting construction-stage emissions (Module A5). Procurement teams will increasingly need to source materials with EPDs and prioritise lower-carbon options.",
      },
    ],
    keyTakeaways: [
      "Part Z will require whole-life carbon measurement and reporting for large projects",
      "Mandatory upfront carbon limits (A1–A5) will follow, tightening over time",
      "Projects over 1,000m² or 10+ homes are likely in the initial scope",
      "The design team, not just the contractor, carries responsibility",
      "Start measuring now to understand your baseline before it becomes mandatory",
    ],
    relatedArticles: ["what-is-embodied-carbon", "future-homes-standard-2026", "uknzcbs-guide"],
  },

  "future-homes-standard-2026": {
    id: "future-homes-standard-2026",
    title: "Future Homes Standard 2026: The Complete Guide",
    category: "Regulations",
    readTime: "12 min read",
    author: "Fabrick Sustainability Team",
    publishDate: "2026-02-15",
    heroSubtitle:
      "Taking full legal effect in December 2026, the Future Homes Standard requires 75–80% less carbon in new homes.",
    sections: [
      {
        heading: "What is the Future Homes Standard?",
        body: "The Future Homes Standard (FHS) is a major update to Part L (conservation of fuel and power) and Part F (ventilation) of the Building Regulations for England. When it takes full legal effect in December 2026, new homes must produce 75–80% less carbon emissions than under 2013 regulations.\n\nThis effectively means the end of fossil fuel heating in new homes — no more gas boilers. New homes will need to be designed around heat pumps, with much higher levels of insulation, airtightness, and energy efficiency.",
      },
      {
        heading: "Key technical requirements",
        body: "While the full technical specification is still being finalised through the 2025 consultation, the key requirements include:\n\nHeat pumps (or equivalent low-carbon heating) as standard — gas boilers will not meet the new carbon targets.\n\nHigher fabric performance: U-values for walls, floors, and roofs will tighten significantly. Triple glazing may become the norm.\n\nAirtightness: Much tighter air permeability requirements, pushing towards 3–5 m³/h.m² at 50Pa.\n\nOverheating risk: Compliance with Part O (overheating) ensures homes don't sacrifice comfort for energy efficiency.\n\nNo new gas connections: While not an outright ban, the carbon targets make gas heating unviable for compliance.",
      },
      {
        heading: "Transitional arrangements",
        body: "The transitional provisions are critical for the industry. Plans submitted and approved before the full FHS takes effect can be built out under the current (2021) Part L standards for a defined period. This has triggered a wave of applications as developers rush to lock in existing standards for their pipeline schemes.\n\nHowever, industry leaders argue that building to the old standards now is a false economy — these homes will need costly retrofits within their lifetime to meet future energy performance requirements.",
      },
      {
        heading: "Impact on material specification",
        body: "While the FHS primarily targets operational carbon, the material implications are significant:\n\nInsulation thickness increases, meaning more material per dwelling — making low-carbon insulation choices (cellulose, wood fibre) even more important.\n\nMechanical ventilation with heat recovery (MVHR) becomes standard, adding embodied carbon from ductwork and equipment.\n\nHeat pump systems require different pipework and potentially different radiators or underfloor heating.\n\nHigher-performance windows (triple glazing) have higher embodied carbon than double glazing, creating a tension between operational and embodied carbon that designers must navigate.",
      },
      {
        heading: "Preparing your business",
        body: "Whether you're a developer, architect, contractor, or manufacturer, preparation is essential:\n\nUpskill your team: Ensure your workforce understands heat pump installation, MVHR commissioning, and airtightness testing.\n\nReview your supply chain: Secure relationships with heat pump manufacturers, high-performance window suppliers, and insulation providers.\n\nUpdate your cost models: FHS-compliant homes cost more to build, but the premium is reducing as the supply chain scales up.\n\nCommunicate with buyers: Educate homebuyers about the benefits — lower energy bills, better comfort, future-proofed against rising energy costs.",
      },
    ],
    keyTakeaways: [
      "Full legal effect from December 2026 — 75–80% less carbon than 2013 standards",
      "Gas boilers effectively eliminated from new homes",
      "Heat pumps, higher insulation, better airtightness become standard",
      "Transitional arrangements allow current standards for approved plans",
      "Material specification must balance operational and embodied carbon",
    ],
    relatedArticles: ["part-z-explained", "what-is-embodied-carbon", "uknzcbs-guide"],
  },

  "what-is-epd": {
    id: "what-is-epd",
    title: "What Is an EPD and Why Does It Matter?",
    category: "Fundamentals",
    readTime: "6 min read",
    author: "Fabrick Sustainability Team",
    publishDate: "2026-01-20",
    heroSubtitle:
      "Environmental Product Declarations are becoming essential for material specification. Learn how to read them.",
    sections: [
      {
        heading: "EPDs explained",
        body: "An Environmental Product Declaration (EPD) is a standardised, third-party verified document that transparently communicates the environmental performance of a product over its lifecycle. Think of it as a nutrition label, but for building materials — instead of calories and fat content, it declares carbon emissions, resource depletion, and other environmental impacts.\n\nEPDs follow international standards (EN 15804 for construction products in Europe) and are produced using Life Cycle Assessment (LCA) methodology. They cover the product from cradle to gate (Modules A1–A3) at minimum, with many now extending to cover the full lifecycle.",
      },
      {
        heading: "Why they matter for construction",
        body: "As embodied carbon regulation tightens, EPDs become the primary evidence base for carbon claims. Generic database values (like ICE) provide useful defaults, but project-specific EPDs offer much more accurate data — and regulators increasingly prefer them.\n\nSpecifying products with EPDs demonstrates due diligence and enables accurate whole-life carbon assessments. Many green building standards (BREEAM, LEED) now award credits for EPD use.",
      },
      {
        heading: "How to read one",
        body: "The key metric in an EPD for embodied carbon is the Global Warming Potential (GWP), measured in kgCO₂e per declared unit. The declared unit varies — it might be per kg, per m², per m³, or per unit (e.g., per brick).\n\nLook for the A1–A3 figure first (product stage), as this represents the manufacturing emissions and is the most commonly reported and compared. If available, review A4–A5 (transport and construction) and the full lifecycle (B and C modules) for a complete picture.\n\nAlways check the declared unit carefully when comparing EPDs — a lower GWP number might simply reflect a different functional unit rather than genuinely lower carbon.",
      },
    ],
    keyTakeaways: [
      "EPDs are verified environmental 'nutrition labels' for building products",
      "They follow EN 15804 and use LCA methodology",
      "Global Warming Potential (GWP) is the key carbon metric",
      "Product-specific EPDs are more accurate than generic database values",
      "Always check the declared unit when comparing products",
    ],
    relatedArticles: ["what-is-embodied-carbon", "whole-life-carbon-assessment", "low-carbon-concrete"],
  },

  "whole-life-carbon-assessment": {
    id: "whole-life-carbon-assessment",
    title: "How to Conduct a Whole-Life Carbon Assessment",
    category: "Guides",
    readTime: "15 min read",
    author: "Fabrick Sustainability Team",
    publishDate: "2026-02-10",
    heroSubtitle:
      "A step-by-step guide to assessing the total carbon footprint of a building project.",
    sections: [
      {
        heading: "What is a WLCA?",
        body: "A Whole-Life Carbon Assessment (WLCA) quantifies the total greenhouse gas emissions associated with a building across its entire lifecycle — from raw material extraction through construction, operation, maintenance, and end of life. It follows the EN 15978 standard and the RICS Professional Statement on Whole Life Carbon Assessment.\n\nThe WLCA combines embodied carbon (Modules A, B4–B5, C) with operational carbon (Module B6 for energy, B7 for water) to give a complete picture of the building's climate impact.",
      },
      {
        heading: "Step 1: Define scope and building model",
        body: "Start with a clear scope definition. Which lifecycle modules are you assessing? What is the reference study period (typically 60 years for UK buildings)? What is the functional equivalent — the building's size, function, and performance requirements?\n\nYou'll need a building information model or bill of quantities that identifies all significant materials and their quantities. At RIBA Stage 2, this can be based on elemental cost plan data. By Stage 4, it should reflect detailed design quantities.",
      },
      {
        heading: "Step 2: Assign carbon data",
        body: "For each material, assign embodied carbon data. The hierarchy of data quality is:\n\n1. Product-specific EPDs — most accurate\n2. Industry-average EPDs — good where product hasn't been specified\n3. Generic database values (ICE, KBOB) — acceptable as defaults\n\nFor operational energy, use Part L compliance modelling or dynamic energy simulation results. Apply carbon emission factors from the government's SAP methodology or the grid decarbonisation projections.",
      },
      {
        heading: "Step 3: Calculate and benchmark",
        body: "Sum the emissions across all modules and lifecycle stages. Express results as kgCO₂e per m² of gross internal area (GIA) to enable benchmarking.\n\nCompare against established benchmarks: LETI targets (500 kgCO₂e/m² for residential upfront carbon), RIBA 2030 Challenge targets, and emerging Part Z limits. Identify which materials and building elements contribute the most — typically structure and substructure dominate, followed by external envelope.",
      },
      {
        heading: "Step 4: Identify reduction opportunities",
        body: "Use the assessment results to inform design decisions. Where are the carbon hotspots? Can you substitute high-carbon materials for lower-carbon alternatives without compromising performance? Can you reduce quantities through structural optimisation?\n\nOur Carbon Calculator helps with this step — input your specification, see the total impact, and discover alternatives that could reduce your project's embodied carbon by 20–40%.",
      },
    ],
    keyTakeaways: [
      "WLCA covers both embodied and operational carbon across the full lifecycle",
      "Follow EN 15978 and RICS Professional Statement methodology",
      "Product-specific EPDs give the most accurate data",
      "Benchmark against LETI (500 kgCO₂e/m²) and RIBA 2030 targets",
      "Structure and substructure typically dominate embodied carbon — focus there first",
    ],
    relatedArticles: ["what-is-embodied-carbon", "what-is-epd", "carbon-reduction-case-studies"],
  },

  "low-carbon-concrete": {
    id: "low-carbon-concrete",
    title: "The Carbon Footprint of Concrete: Alternatives and Reduction Strategies",
    category: "Materials",
    readTime: "9 min read",
    author: "Fabrick Sustainability Team",
    publishDate: "2026-01-28",
    heroSubtitle:
      "Concrete is responsible for 8% of global CO₂ emissions. Here's how to cut your concrete carbon by up to 50%.",
    sections: [
      {
        heading: "Why concrete matters",
        body: "Concrete is the most widely used construction material on Earth. The UK construction industry uses approximately 100 million tonnes of it annually. The carbon problem lies primarily in the cement — specifically Portland cement (CEM I) — which requires heating limestone to 1,450°C. This process releases CO₂ both from the energy used and from the chemical reaction (calcination) itself.\n\nA typical CEM I Portland cement has an embodied carbon of 0.912 kgCO₂e/kg. For a standard RC 32/40 concrete mix, this translates to approximately 0.132 kgCO₂e/kg — which sounds small until you consider the volumes used in construction.",
      },
      {
        heading: "Cement replacements: GGBS and PFA",
        body: "The most established strategy for reducing concrete carbon is replacing a proportion of Portland cement with supplementary cementitious materials (SCMs):\n\nGGBS (Ground Granulated Blast-furnace Slag): A by-product of iron manufacturing. Replacing 50% of cement with GGBS reduces the concrete carbon by approximately 33%, giving around 0.089 kgCO₂e/kg. It also improves durability and resistance to chloride and sulphate attack.\n\nPFA (Pulverised Fuel Ash / Fly Ash): A by-product of coal power stations. A 30% replacement reduces carbon by approximately 22%, giving around 0.103 kgCO₂e/kg. Availability is declining as coal plants close, so long-term reliance on PFA is risky.",
      },
      {
        heading: "Emerging alternatives",
        body: "Beyond traditional SCMs, several innovative approaches are gaining traction:\n\nLC3 (Limestone Calcined Clay Cement): Uses calcined clay and limestone to replace up to 50% of clinker. Being actively trialled in the UK.\n\nCarbon capture and utilisation: Some manufacturers are injecting captured CO₂ into concrete during mixing, where it mineralises permanently.\n\nGeopolymer concrete: Replaces cement entirely with alkali-activated binders. Early stage but promising for precast applications.\n\nBiochar addition: Small additions of biochar can sequester carbon within the concrete while maintaining performance.",
      },
      {
        heading: "Design strategies to reduce concrete volume",
        body: "Beyond material substitution, design decisions can dramatically reduce the volume of concrete needed:\n\nPost-tensioned slabs: Can reduce slab thickness by 20–30%, directly cutting concrete volume.\n\nVoided slabs: Technologies like BubbleDeck or Cobiax use void formers to reduce concrete in areas where it's structurally unnecessary.\n\nTimber hybrid structures: Using CLT or glulam for upper floors while retaining concrete for foundations and lower storeys.\n\nOptimised foundation design: Ground investigations that reduce conservative over-design can cut foundation concrete by 20%+.",
      },
    ],
    keyTakeaways: [
      "Cement is the carbon culprit — focus on cement replacement strategies",
      "50% GGBS replacement gives ~33% carbon reduction with performance benefits",
      "PFA availability is declining as coal plants close — plan alternatives",
      "Design optimisation (voided slabs, post-tensioning) can reduce volume by 20–30%",
      "Emerging tech like LC3 and carbon capture could transform the industry",
    ],
    relatedArticles: ["what-is-embodied-carbon", "timber-vs-steel", "carbon-reduction-case-studies"],
  },

  "timber-vs-steel": {
    id: "timber-vs-steel",
    title: "Timber vs Steel Frame: A Carbon Comparison",
    category: "Materials",
    readTime: "7 min read",
    author: "Fabrick Sustainability Team",
    publishDate: "2026-02-20",
    heroSubtitle:
      "With CLT and glulam gaining ground in UK construction, we compare the embodied carbon, cost, and performance of timber versus steel framing systems.",
    sections: [
      {
        heading: "The carbon case for timber",
        body: "Timber is fundamentally different from other structural materials because trees absorb CO₂ as they grow. A cubic metre of softwood stores approximately 250 kgCO₂e of biogenic carbon. When that timber is used in construction, this carbon remains sequestered for the life of the building.\n\nCross-Laminated Timber (CLT) has an embodied carbon of approximately 0.437 kgCO₂e/kg (A1–A3), while glulam sits at around 0.512 kgCO₂e/kg. When biogenic carbon sequestration is credited (Module D), both can achieve net-negative embodied carbon at the product stage — a claim no steel or concrete product can make.",
      },
      {
        heading: "Steel's strengths and carbon challenges",
        body: "Structural steel has an embodied carbon of approximately 1.55 kgCO₂e/kg for virgin material. However, recycled steel dramatically improves this to around 0.44 kgCO₂e/kg — making steel specification heavily dependent on the recycled content percentage.\n\nSteel offers clear advantages in long spans, high-rise structures, and speed of erection. Hot-rolled steel sections are readily available and the industry has deep expertise. The recyclability of steel is also excellent — virtually 100% of structural steel is recycled at end of life, which provides significant Module D credits.",
      },
      {
        heading: "Comparing real-world performance",
        body: "For a typical 4–8 storey residential building, the structural frame carbon comparison looks like this:\n\nSteel frame (50% recycled content): approximately 80–120 kgCO₂e/m² GIA for the structural frame alone.\n\nCLT frame: approximately 40–70 kgCO₂e/m² GIA before biogenic carbon credits, potentially net-negative with sequestration credits.\n\nReinforced concrete frame: approximately 100–150 kgCO₂e/m² GIA.\n\nHowever, the comparison isn't purely about carbon numbers. Fire strategy, acoustic performance, moisture management, and insurance requirements all influence material selection. CLT buildings above 18m require sprinklers and may face higher insurance premiums.",
      },
      {
        heading: "Hybrid approaches",
        body: "Increasingly, the most carbon-efficient approach combines materials where each performs best. A concrete or steel core for stability, CLT floor plates for carbon reduction, and steel connections for robustness creates a system that optimises structural performance and carbon simultaneously.\n\nThis hybrid approach also manages supply chain risk — CLT availability in the UK is growing but still limited compared to steel and concrete. Projects specifying 100% timber structures may face lead time challenges.",
      },
      {
        heading: "Future Homes Standard implications",
        body: "The Future Homes Standard doesn't directly mandate structural material choices, but the emerging Part Z requirements will make embodied carbon reporting mandatory. Projects that can demonstrate lower embodied carbon through timber specification will have a competitive advantage.\n\nSpecifiers should also consider the whole-building picture: timber structures are typically lighter, enabling smaller foundations (less concrete), and timber's thermal performance can reduce insulation requirements in some wall build-ups.",
      },
    ],
    keyTakeaways: [
      "CLT can achieve net-negative embodied carbon when biogenic sequestration is credited",
      "Recycled steel (0.44 kgCO₂e/kg) dramatically outperforms virgin steel (1.55 kgCO₂e/kg)",
      "Hybrid timber-steel-concrete structures often give the best carbon outcome",
      "Fire strategy and insurance are key non-carbon factors for timber above 18m",
      "Lighter timber structures reduce foundation requirements — consider the whole building",
    ],
    relatedArticles: ["what-is-embodied-carbon", "low-carbon-concrete", "carbon-reduction-case-studies"],
  },

  "uk-cbam-construction": {
    id: "uk-cbam-construction",
    title: "UK CBAM: What It Means for Construction Material Imports",
    category: "Regulations",
    readTime: "8 min read",
    author: "Fabrick Sustainability Team",
    publishDate: "2026-03-01",
    heroSubtitle:
      "From January 2027, the UK Carbon Border Adjustment Mechanism will apply to steel, aluminium, and cement imports.",
    sections: [
      {
        heading: "What is the UK CBAM?",
        body: "The UK Carbon Border Adjustment Mechanism (CBAM) is a policy tool designed to prevent 'carbon leakage' — where companies shift production to countries with weaker climate policies to avoid carbon costs. It does this by applying a carbon price to certain imported goods, ensuring they face similar carbon costs to domestically produced equivalents.\n\nThe UK CBAM was confirmed in the Autumn Budget and will apply from January 2027. It covers steel, aluminium, cement, ceramics, glass, and fertiliser — materials that are energy-intensive to produce and heavily traded internationally.",
      },
      {
        heading: "Impact on construction material costs",
        body: "For the UK construction industry, the CBAM will primarily affect:\n\nImported steel: The UK imports approximately 60% of its steel. Steel from countries without equivalent carbon pricing (notably Turkey, India, and China) will face an additional cost reflecting the carbon intensity of production. Estimates suggest this could add 5–15% to imported steel costs depending on the source country's carbon intensity.\n\nImported cement and clinker: While the UK produces most of its cement domestically, imports of clinker and speciality cements will be affected.\n\nAluminium: Heavily used in curtain walling and cladding, imported aluminium will see cost increases, particularly from smelters powered by coal-generated electricity.",
      },
      {
        heading: "Transitional arrangements",
        body: "The CBAM will operate in phases:\n\n2027: Reporting requirements begin. Importers must declare the embedded emissions in covered goods but won't yet pay a carbon price.\n\n2027–2028: The carbon price will be phased in, initially at a reduced rate, increasing to the full rate over 2–3 years.\n\nThe transitional period gives importers time to build reporting systems and for supply chains to adapt. However, the reporting requirements themselves will be significant — importers will need verified emissions data from overseas producers.",
      },
      {
        heading: "What specifiers should do now",
        body: "Even before the CBAM takes full effect, construction specifiers should:\n\nReview supply chains: Understand where your steel, aluminium, and cement originate. Products from countries with strong climate policies (EU, Norway) will face lower CBAM charges.\n\nPrefer low-carbon products: Materials with EPDs demonstrating lower embodied carbon will be less affected. Recycled steel, low-carbon aluminium, and GGBS-blended cements become more cost-competitive.\n\nEngage with suppliers: Ask manufacturers about their carbon intensity data and CBAM preparedness. Those who can provide verified emissions data will be preferred partners.\n\nConsider domestic sourcing: UK-produced materials subject to the UK ETS already carry a carbon price. CBAM levels the playing field, potentially making domestic production more competitive.",
      },
    ],
    keyTakeaways: [
      "UK CBAM starts January 2027 — covering steel, aluminium, cement, and more",
      "Imported steel could see 5–15% cost increases depending on source country",
      "Low-carbon and recycled materials become more cost-competitive under CBAM",
      "Reporting requirements begin immediately — get your supply chain data ready",
      "Domestic UK production becomes more competitive as import carbon costs rise",
    ],
    relatedArticles: ["part-z-explained", "what-is-embodied-carbon", "future-homes-standard-2026"],
  },

  "uknzcbs-guide": {
    id: "uknzcbs-guide",
    title: "UK Net Zero Carbon Building Standard: Requirements Explained",
    category: "Regulations",
    readTime: "11 min read",
    author: "Fabrick Sustainability Team",
    publishDate: "2026-02-05",
    heroSubtitle:
      "Launched early 2026, the UKNZCBS defines what 'net zero carbon' means for UK buildings.",
    sections: [
      {
        heading: "Why a standard was needed",
        body: "Until the launch of the UK Net Zero Carbon Building Standard (UKNZCBS), there was no agreed definition of what 'net zero carbon' meant for buildings in the UK. This created confusion — developers could claim 'net zero' based on operational energy alone, ignoring embodied carbon, or rely on offsetting without meaningful on-site reductions.\n\nThe UKNZCBS, developed by a cross-industry coalition including LETI, RIBA, CIBSE, the UKGBC, and others, provides a clear, science-based framework that covers both operational and embodied carbon, with strict limits on offsetting.",
      },
      {
        heading: "The two pillars: operational and embodied",
        body: "The UKNZCBS sets requirements across two pillars:\n\nOperational carbon: Buildings must demonstrate ultra-low energy demand through excellent fabric performance and efficient systems. Energy use must be met as far as possible by on-site or local renewable generation. Any remaining operational emissions must be offset through approved mechanisms.\n\nEmbodied carbon: Buildings must report and limit their upfront embodied carbon (Modules A1–A5) against benchmarks. The standard sets different limits for different building types, broadly aligned with LETI targets. Residual embodied carbon cannot currently be offset — the emphasis is on reduction.",
      },
      {
        heading: "Embodied carbon limits",
        body: "The UKNZCBS embodied carbon limits for upfront carbon (A1–A5) are:\n\nResidential: 500 kgCO₂e/m² GIA (aligned with LETI)\n\nCommercial offices: 600 kgCO₂e/m² GIA\n\nSchools: 550 kgCO₂e/m² GIA\n\nThese targets are challenging but achievable with good design and material specification. They require designers to actively consider embodied carbon from RIBA Stage 2 onwards, rather than treating it as a late-stage check.\n\nThe standard also requires whole-life carbon reporting (Modules A–C) with Module D reported separately, and sets aspirational targets for whole-life performance.",
      },
      {
        heading: "Verification and compliance",
        body: "Unlike Part Z (which will be a legal requirement), the UKNZCBS is currently a voluntary standard. However, it carries significant weight:\n\nLocal authorities are beginning to reference it in planning policy.\n\nInvestors and funders increasingly require UKNZCBS compliance for green finance.\n\nMajor clients are adopting it as a procurement requirement.\n\nCompliance requires third-party verification, with assessment at both design stage and completion. The design-stage assessment must be based on a whole-life carbon assessment following the RICS methodology.",
      },
      {
        heading: "Getting started",
        body: "To work towards UKNZCBS compliance:\n\nEstablish a carbon budget at project inception — use the target limits as a design driver, not just a compliance check.\n\nTrack carbon through design stages — our Carbon Calculator can help you understand material-level impacts and identify reduction opportunities.\n\nSpecify materials with EPDs — product-specific data is preferred over generic database values.\n\nDesign for disassembly — the standard values circular economy principles and end-of-life material recovery.",
      },
    ],
    keyTakeaways: [
      "UKNZCBS provides the UK's first agreed definition of 'net zero carbon' for buildings",
      "Covers both operational and embodied carbon with science-based targets",
      "Residential limit: 500 kgCO₂e/m² GIA for upfront carbon (A1–A5)",
      "Voluntary but increasingly referenced in planning, finance, and procurement",
      "Start with a carbon budget at project inception and track through design stages",
    ],
    relatedArticles: ["part-z-explained", "future-homes-standard-2026", "whole-life-carbon-assessment"],
  },

  "carbon-reduction-case-studies": {
    id: "carbon-reduction-case-studies",
    title: "5 UK Construction Projects That Slashed Embodied Carbon",
    category: "Case Studies",
    readTime: "10 min read",
    author: "Fabrick Sustainability Team",
    publishDate: "2026-01-25",
    heroSubtitle:
      "Real-world examples showing how leading UK projects achieved 30–60% reductions in embodied carbon.",
    sections: [
      {
        heading: "Why case studies matter",
        body: "The construction industry learns by doing. While guidance documents and benchmarks provide targets, real project examples demonstrate what's achievable, what trade-offs were made, and what lessons were learned. These five projects represent different building types and scales, but share a common thread: they treated embodied carbon as a primary design driver from the earliest stages.",
      },
      {
        heading: "Residential: low-rise timber frame housing",
        body: "A 45-unit affordable housing scheme in the Midlands achieved a 42% reduction in embodied carbon compared to the RIBA 2030 baseline. The key strategies were: closed-panel timber frame construction replacing traditional masonry, cellulose insulation from recycled newspaper replacing mineral wool, GGBS concrete in foundations (50% cement replacement), and locally sourced materials reducing transport emissions.\n\nThe upfront cost premium was 3.2%, offset by faster construction time and reduced preliminaries. The project achieved 385 kgCO₂e/m² GIA — well inside the LETI residential target of 500.",
      },
      {
        heading: "Commercial: office retrofit vs new build",
        body: "A developer in Manchester compared the carbon impact of demolishing a 1960s office building and constructing new versus a deep retrofit. The assessment showed the retrofit option saved 65% of the embodied carbon that a new build would have required — approximately 480 kgCO₂e/m² of avoided emissions.\n\nThe retrofit stripped the building back to its concrete frame, upgraded the facade to meet current Part L standards, and installed new building services. While the operational energy performance doesn't quite match a new build, the whole-life carbon assessment showed the retrofit was decisively better.",
      },
      {
        heading: "Education: a net-zero-carbon school",
        body: "A new secondary school in East London targeted UKNZCBS compliance from inception. The structural engineer used parametric design tools to optimise the concrete frame, reducing structural material quantities by 18%. All concrete specified 50% GGBS replacement, and the roof structure used glulam beams instead of steel.\n\nThe school achieved 510 kgCO₂e/m² GIA — close to the UKNZCBS school target of 550. The design team reported that early-stage carbon analysis at RIBA Stage 2 was critical, as 80% of the carbon reduction opportunities would have been locked out by Stage 3.",
      },
      {
        heading: "Mixed-use: hybrid structure in a city centre",
        body: "A 12-storey mixed-use development in Bristol used a hybrid structure: reinforced concrete core and transfer structures, CLT floor plates from RIBA Stage 4 upwards, and steel connections. This approach reduced the structural carbon by 35% compared to a full RC frame option.\n\nThe CLT floor plates also enabled a lighter overall structure, reducing foundation loads and allowing smaller piles — an additional 12% carbon saving in the substructure. The project achieved 620 kgCO₂e/m² GIA for the commercial floors, meeting the RIBA 2030 office target.",
      },
      {
        heading: "Infrastructure: low-carbon concrete in foundations",
        body: "A large residential basement car park in Surrey specified 70% GGBS replacement in all substructure concrete, combined with optimised pile design based on actual ground investigation data rather than conservative assumptions. This reduced the piling concrete volume by 22% and the concrete carbon intensity by approximately 40%.\n\nThe combined effect was a 52% reduction in substructure embodied carbon. The contractor reported no significant programme impact, though the GGBS concrete required longer curing times for early-age striking of formwork.",
      },
    ],
    keyTakeaways: [
      "30–60% carbon reductions are achievable across all building types",
      "Early-stage carbon analysis (RIBA Stage 2) is critical — most opportunities are locked out by Stage 3",
      "Retrofit consistently outperforms new build on whole-life carbon",
      "Hybrid structures optimise carbon by using each material where it performs best",
      "Cost premiums of 2–5% are typical, often offset by programme and operational savings",
    ],
    relatedArticles: ["what-is-embodied-carbon", "low-carbon-concrete", "timber-vs-steel"],
  },
};

export function getArticleContent(slug: string): ArticleContent | null {
  return articleContent[slug] || null;
}
