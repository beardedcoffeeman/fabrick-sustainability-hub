# Fabrick Sustainability Hub -- Full Site Audit
**Date:** 30 March 2026
**URL:** https://fabrick-sustainability-hub.vercel.app/
**Auditor:** Claude (for Tom Colgan)

---

## GLOBAL ELEMENTS (present on every page)

### Navigation Bar
- Logo: "FABRICK / Sustainability Hub" (links to homepage)
- Links: Live Dashboard, Carbon Calculator, Regulations, Knowledge Hub
- CTA button: "Get Started" (links to /knowledge -- should this go somewhere more action-oriented?)
- Mobile: hamburger menu toggle

### Footer
- Fabrick branding + tagline about marketing specialists for the built environment
- Hub links: Live Dashboard, Carbon Calculator, Regulations, Knowledge Hub
- Resources links: Embodied Carbon Guide, Part Z Explained, Future Homes Standard, What Is an EPD?
- "Stay Updated" email signup form (email input + submit button)
- Copyright: 2026 Fabrick
- Data sources credited: Carbon Intensity API, ICE Database, BECD

### "Built by Fabrick" CTA Block (appears on Dashboard, Calculator, Regulations, Knowledge Hub)
- Heading: "Want a platform like this for your business?"
- Lists capabilities: Carbon Calculators, Data Dashboards, Content Hubs, Lead-Gen Tools, CPD Platforms, Product Selectors
- CTA: "Let's Build Yours" (links to fabrick.agency/contact-us)
- Email: hello@fabrick.agency

### "About Fabrick" Block (appears on Homepage, Calculator, Regulations)
- Heading: "Built on insight. Powered by creativity. Driven to make a difference."
- Agency description (40 years, 25+ team, awards)
- Service pills: Strategy & Planning, Design & Development, PR & Media Relations, SEO & PPC, Content Marketing, Global Marketing
- CTA: "Work with Fabrick" (links to fabrick.agency)
- Three sub-sections: Smart Design, PR, Drive the conversation

---

## PAGE 1: HOMEPAGE (/)

**Title tag:** Fabrick Sustainability Hub | UK Construction Carbon Data & Tools

### Section 1 -- Hero
- Eyebrow text: "Live Data . Free Tools . Expert Insight"
- **Main heading: "Construction sustainability, decoded."** <-- NEEDS CHANGING per feedback
- Subheading: "The UK construction industry's sustainability data hub. Live carbon data, material calculators, regulatory intelligence, and practical tools -- all in one place."
- Two CTA buttons: "Explore the Dashboard" + "Carbon Calculator"
- Four stat boxes:
  - 100+ Materials in database
  - 10+ Regulations tracked
  - Live Carbon intensity data
  - 10+ Expert articles

### Section 2 -- "Coming up" Regulation Ticker
- Three upcoming regulations displayed as cards:
  - Future Homes Standard -- Dec 2026
  - UK CBAM Launch -- Jan 2027
  - EPC Rating C Minimum -- Apr 2027*
- Link: "View all regulations"

### Section 3 -- "The Challenge" / Regulatory Avalanche
- Eyebrow: "The Challenge"
- Heading: "A regulatory avalanche is coming"
- Body text about unprecedented regulation
- Three stat blocks:
  - 25% of UK carbon from built environment
  - 8% of global CO2 from cement production
  - 78% reduction required by 2035

### Section 4 -- "Tools & Data"
- Heading: "Everything you need in one place"
- Four tool cards (each links to relevant page):
  - Live Carbon Dashboard -- real-time grid carbon intensity
  - Material Carbon Calculator -- 100+ materials from ICE database
  - Regulation Tracker -- filterable timeline
  - Knowledge Hub -- plain-English guides

### Section 5 -- "Built for the people building Britain"
- Body text mentioning developer, architect, manufacturer use cases
- Two CTAs: "Start Exploring" + "Read the Guides"
- Four audience pills: Developers, Architects, Manufacturers, Contractors

### Section 6 -- About Fabrick (global block)

### HOMEPAGE ISSUES vs FEEDBACK:
1. **"Doesn't say what the platform does"** -- The hero subheading does describe it, but it's generic and buried. The h1 "Construction sustainability, decoded" is a clever tagline but tells you nothing about what this IS or what you can DO here. A first-time visitor wouldn't know this is a free tool suite.
2. **"Construction Sustainability Decoded" title needs changing** -- Confirmed. This is the hero h1. Needs to be replaced with something that communicates the value proposition clearly.
3. **"Live data should be hero/front and centre"** -- Currently the live data is on a separate /dashboard page. The homepage hero has zero live data. The only live element is the stat "Live - Carbon intensity data" which is just a label, not actual data. The real-time carbon intensity number, fuel mix, regional map -- none of that appears on the homepage.
4. **"Needs to be more visual and interactive"** -- The homepage is entirely text-based. No charts, no visualisations, no animations, no interactive elements. Just headings, body text, stat boxes, and link cards. Very flat.
5. **"Needs data capture / lead generation"** -- The only data capture is the email input in the footer ("Stay Updated"). No gated content, no downloadable resources, no "get your personalised report" flow, no quiz/assessment, no consultation booking.
6. **"Needs audience segmentation"** -- There are audience pills listed (Developers, Architects, Manufacturers, Contractors) but they are purely decorative labels. They don't link anywhere. There is no "I am a..." selector that customises the experience. No personalised landing paths.

---

## PAGE 2: LIVE DASHBOARD (/dashboard)

**Title tag:** Live Dashboard | Fabrick Sustainability Hub

### Section 1 -- Hero
- Eyebrow: "Live Data"
- Heading: "UK Carbon Dashboard"
- Description about real-time carbon intensity from UK National Grid
- Four audience use-case cards:
  - Architects & Specifiers -- grid carbon when specifying materials
  - Site Managers & Contractors -- plan for low-carbon periods
  - Manufacturers -- grid intensity affects embodied carbon
  - Sustainability Leads -- operational carbon reporting

### Section 2 -- UK Construction Emissions (Static Stats)
- Three stat cards:
  - ~40 MtCO2e per year
  - ~25% of UK total
  - 78% reduction target by 2035

### Section 3 -- Live UK Grid Carbon Intensity
- "Refresh data" button
- Current reading in gCO2/kWh with severity label (e.g. "low")
- Explanatory text about what carbon intensity measures
- Today's forecast -- half-hourly readings listed (e.g. "00:00: 39 gCO2/kWh (low)")
  - Shows lowest point highlighted
  - Time-axis labels at bottom
- Fuel mix breakdown:
  - Renewable: 74.6% (wind 49.7%, solar 21.8%, biomass 3.1%, hydro 0.0%)
  - Fossil: 3.6% (gas 3.6%, coal 0.0%)
  - Nuclear: 12.3%

### Section 4 -- Regional Intensity
- Heading: "Regional Intensity"
- Description about regional variation
- List of regions with their gCO2/kWh values:
  - North Scotland, South Scotland, North West England, North East England, Yorkshire (37g), North Wales & Merseyside, South Wales, West Midlands, East Midlands (28g), East England, South West England (44g), South England (64g), London (52g), South East England (83g), England (38g), Scotland, Wales (28g)
- Data source attribution: National Grid ESO Carbon Intensity API
- Note: refreshes every 30 minutes at source, dashboard polls every 5 minutes

### Section 5 -- "Why This Matters for Construction"
- Four text blocks:
  - Operational Carbon
  - Material Manufacturing
  - Future Homes Standard
  - Best Time to Build?

### Section 6 -- "Built by Fabrick" CTA block (global)

### DASHBOARD ISSUES vs FEEDBACK:
1. **Live data is good but presentation is flat** -- The forecast data is displayed as a simple text list of half-hourly readings, not a visual chart or graph. This should be an interactive line chart or area chart.
2. **Regional map is text-only** -- The regions are listed as text with values. This should be a colour-coded UK map visualisation. There appear to be region names listed suggesting a map layout was intended but the accessibility tree shows it as plain text.
3. **No interactivity** -- Can't click regions, can't hover for details, can't change date range, can't compare dates.
4. **Fuel mix has no visual** -- Percentages are listed as text. Should be a donut chart or bar visualisation.
5. **No data capture** -- Opportunity for "Get alerts when carbon drops below X" or "Email me the weekly grid report".
6. **Audience cards in hero are read-only** -- They describe use cases but don't let you filter or customise the view.

---

## PAGE 3: CARBON CALCULATOR (/materials)

**Title tag:** Material Carbon Calculator | Fabrick Sustainability Hub

### Section 1 -- Hero
- Eyebrow: "ICE Database . LETI Benchmarks"
- Heading: "Carbon Calculator"
- Description about specifying materials and seeing carbon impact
- Four audience use-case cards:
  - Architects -- compare embodied carbon at design stage
  - Contractors -- demonstrate carbon awareness in tenders
  - Manufacturers -- benchmark against industry averages
  - Sustainability Leads -- evidence for Part Z compliance

### Section 2 -- Tool Interface (Two tabs)
- Tab buttons: "Specification Tool" | "Browse Database"
- Currently showing Specification Tool:

**Project Settings:**
- Building Type dropdown: Residential, Office/Commercial, Education, Retail
- Gross Internal Area (m2) -- number input for benchmarking

**Add Material to Specification:**
- Category dropdown with 20 categories:
  Concrete & Cement, Steel & Metals, Timber & Wood, Insulation, Glass, Bricks & Blocks, Plastics & Polymers, Aggregates, Plaster & Render, Roofing, Flooring, Waterproofing & Membranes, Adhesives & Sealants, Paints & Coatings, Pipes & Drainage, MEP & Services, Fixings & Connections, Asphalt & Bituminous, Geotextiles & Ground, Fire Protection
- Material dropdown (populates based on category selection)
- Quantity input + unit selector (kg / t / m3)
- "Add" button

**Empty state:** "Start your specification -- Add materials above to calculate the embodied carbon of your project. The tool will suggest lower-carbon alternatives."

- Collapsible "Data Sources & Methodology" section

### CALCULATOR ISSUES vs FEEDBACK:
1. **This is actually the strongest interactive element** -- The calculator has real form inputs, dropdowns, and a functional specification tool. However, it still feels like a form rather than a visual, engaging experience.
2. **No visual output visible yet** -- The empty state suggests results appear after adding materials, but the initial view shows nothing visual. A sample/demo calculation would make it more compelling on first load.
3. **"Browse Database" tab not explored** -- There's a second tab to browse all 100+ materials, which I didn't click into but it exists.
4. **No data capture / gating** -- Anyone can use the calculator freely. Opportunity to gate the full report/export behind an email capture (e.g. "Enter your email to download your specification as PDF").
5. **No share/save/export** -- No way to save a specification, share it with colleagues, or export results.
6. **No audience segmentation in tool** -- The audience cards are in the hero but the tool itself doesn't adapt based on role.
7. **LETI benchmarks mentioned but not visible** -- The eyebrow references LETI benchmarks but it's unclear where/how these appear in the results.

---

## PAGE 4: REGULATIONS (/regulations)

**Title tag:** UK Construction Sustainability Regulations | Fabrick Sustainability Hub

### Section 1 -- Hero
- Eyebrow: "Regulatory Intelligence"
- Heading: "UK Regulation Tracker"
- Description about upcoming UK sustainability regulations
- Four audience cards:
  - Developers -- know which regulations affect upcoming projects
  - Contractors -- stay ahead of compliance deadlines
  - Manufacturers -- prepare for CBAM, EPD requirements
  - Policy & Compliance -- track everything in one place

### Section 2 -- Filters
- Role filter: All Roles, Developer, Architect, Manufacturer, Contractor
- Category filter: All, Carbon, Energy, Reporting, Trade

### Section 3 -- Timeline
Organised by year with status badges (Active/Upcoming/Future):

**2025 (3 regulations):**
1. Future Homes Standard -- Transitional Arrangements (Active, Energy, 1 June 2025)
2. Part Z (Whole-Life Carbon) -- Government Consultation (Active, Carbon, 1 September 2025)
3. Building Safety Act -- Principal Designer Registration Deadline (Active, Reporting, 1 October 2025)

**2026 (5 regulations):**
4. UK Net Zero Carbon Building Standard (Active, Carbon, 15 January 2026)
5. UK Sustainability Reporting Standards -- Voluntary Adoption (Active, Reporting, 1 March 2026)
6. Future Homes & Buildings Standards -- Published (Active, Energy, 24 March 2026)
7. Future Buildings Standard -- Published (Active, Energy, 24 March 2026)
8. UK SRS -- Mandatory FCA Rules Expected (Upcoming, Reporting, 1 October 2026)
9. UK CBAM -- Importer Registration Opens (Upcoming, Trade, 1 October 2026)

**2027 (5 regulations):**
10. UK CBAM -- Full Launch (Future, Trade, 1 January 2027)
11. UK SRS -- First Mandatory Reports Due (Future, Reporting, 1 April 2027)
12. EPC Rating C Minimum -- Non-Domestic (Future, Energy, 1 April 2027)
13. Biodiversity Net Gain -- Small Sites Compliance (Future, Reporting, 1 April 2027)

**2028 (3 regulations):**
14. Future Homes Standard -- Full Compliance Required (Upcoming, Energy, 1 January 2028)
15. Part Z -- Mandatory Embodied Carbon Limits (Future, Carbon, 1 January 2028)
16. EPC Rating C -- Domestic Rented Properties (Future, Energy, 1 December 2028)

Each regulation card shows: status badge, category tag, heading, date, description, impact statement, and relevant role tags.

### REGULATIONS ISSUES vs FEEDBACK:
1. **Filtering works well conceptually** -- Role and category filters are present and functional. This is the closest thing to audience segmentation on the site.
2. **Purely text-based** -- No visual timeline (e.g. Gantt chart, horizontal timeline, or visual roadmap). It's a long scrolling list of cards. Could be much more visual.
3. **No interactivity beyond filters** -- Can't set reminders, can't bookmark specific regulations, can't subscribe to updates for specific items.
4. **No data capture** -- Opportunity: "Get alerts for regulations that affect your role" with email + role selection.
5. **16 regulations total** -- Good coverage. Content appears accurate and up-to-date (includes March 2026 FHS/FBS publication).
6. **Impact statements are strong** -- Each regulation has a practical "Impact:" section explaining what it means for specific roles.

---

## PAGE 5: KNOWLEDGE HUB (/knowledge)

**Title tag:** Knowledge Hub | Fabrick Sustainability Hub

### Section 1 -- Hero
- Eyebrow: "Learn"
- Heading: "Knowledge Hub"
- Description about plain-English guides
- Four audience cards:
  - Business Leaders -- strategic decisions without jargon
  - Technical Teams -- deep-dive EPDs, BREEAM, Part Z
  - Marketing & Comms -- get facts right for sustainability comms
  - CPD & Training -- team upskilling resource

### Section 2 -- Featured Articles (3 large cards)
1. **What Is Embodied Carbon? A Plain-English Guide for Construction** (Fundamentals, 8 min read)
2. **Part Z Explained: What Whole-Life Carbon Regulation Means for You** (Regulations, 10 min read)
3. **Future Homes Standard 2026: The Complete Guide** (Regulations, 12 min read)

### Section 3 -- Category Filters
- Buttons: All, Fundamentals, Regulations, Materials, Guides, Case Studies

### Section 4 -- Article Grid (8 articles total, including the 3 featured)
4. **What Is an EPD and Why Does It Matter?** (Fundamentals, 6 min)
5. **How to Conduct a Whole-Life Carbon Assessment** (Guides, 15 min)
6. **The Carbon Footprint of Concrete: Alternatives and Reduction Strategies** (Materials, 9 min)
7. **Timber vs Steel Frame: A Carbon Comparison** (Materials, 7 min)
8. **UK CBAM: What It Means for Construction Material Imports** (Regulations, 8 min)
9. **UK Net Zero Carbon Building Standard: Requirements Explained** (Regulations, 11 min)
10. **5 UK Construction Projects That Slashed Embodied Carbon** (Case Studies, 10 min)

### Section 5 -- Email Signup
- Heading: "Stay ahead of the regulations"
- Description: monthly sustainability insights and regulatory alerts
- Email input + Subscribe button

### KNOWLEDGE HUB ISSUES vs FEEDBACK:
1. **Good content breadth** -- 10 articles covering fundamentals, regulations, materials, guides, and case studies. Categories are sensible.
2. **No gated content** -- All articles are freely accessible. No "download the full guide as PDF" or "get the compliance checklist" lead gen.
3. **No audience routing** -- The hero mentions Business Leaders, Technical Teams, Marketing & Comms, CPD & Training but articles aren't tagged or filterable by audience. Only filterable by topic category.
4. **Email signup is good** -- This is the most prominent email capture on the site (besides the footer).
5. **No reading progress, bookmarks, or personalisation** -- Purely static article pages.
6. **Articles are text-heavy** -- From the sample article (Embodied Carbon), it's well-written and structured with clear sections, but no diagrams, infographics, or interactive elements within articles.

---

## PAGE 6: ARTICLE TEMPLATE (sample: /knowledge/what-is-embodied-carbon)

**Title tag:** What Is Embodied Carbon? A Plain-English Guide for Construction | Fabrick Sustainability Hub

### Structure:
- Back link to Knowledge Hub
- Category tag + read time
- Article heading
- Author: "Fabrick Sustainability Team"
- Publication date
- Article body with multiple sections (each in its own region):
  - The basics: operational vs embodied carbon
  - Why it matters now
  - The lifecycle stages (Modules A to D)
  - How to measure it
  - Practical steps to reduce it
- Key Takeaways (bulleted list)
- CTA: "Ready to calculate your project's carbon impact?" with link to Carbon Calculator
- Related Articles (3 linked cards)

### ARTICLE TEMPLATE ISSUES:
1. **Well-structured content** -- Clear sections, key takeaways, internal cross-links to calculator.
2. **No visuals** -- No diagrams of lifecycle stages, no infographics, no charts. Pure text.
3. **No data capture within article** -- No mid-article CTAs, no "download this as a guide" option.
4. **No social sharing** -- No share buttons for LinkedIn, Twitter, email.
5. **No comments or engagement** -- No way for readers to ask questions or engage.
6. **Author is generic** -- "Fabrick Sustainability Team" rather than a named expert, which reduces trust/authority.

---

## SUMMARY OF ALL ISSUES MAPPED TO FEEDBACK POINTS

### 1. "Homepage doesn't say what the platform does"
- **Current state:** Hero h1 is "Construction sustainability, decoded" -- a tagline, not a description. The subheading below explains it but you have to read it.
- **Recommendation:** Replace h1 with a clear value proposition. Something like "Free carbon tools and regulatory intelligence for UK construction" or lead with the live data number itself as the headline.

### 2. "Construction Sustainability Decoded title needs changing"
- **Current state:** "Construction sustainability, decoded." is the hero h1.
- **Recommendation:** Replace with action-oriented, descriptive heading. Consider making it dynamic -- e.g. showing the live carbon intensity number as the hero headline.

### 3. "Live data should be hero/front and centre, not buried"
- **Current state:** Live data is entirely on /dashboard. The homepage has ZERO live data -- just static stat labels ("Live - Carbon intensity data" is a label, not actual data). To see any real-time information, you have to navigate to a separate page.
- **Recommendation:** Pull the live carbon intensity number, fuel mix donut, and regional highlight directly into the homepage hero. Make it the first thing people see. The number itself (e.g. "UK Grid: 38 gCO2/kWh right now") is the hook.

### 4. "Needs to be more visual and interactive"
- **Current state across entire site:**
  - Homepage: 100% text, stat boxes, and link cards. No charts, no animations.
  - Dashboard: Forecast data is a TEXT LIST of half-hourly readings. Regional data is text. Fuel mix is text percentages. No charts, no graphs, no map visualisation.
  - Calculator: Has form inputs (good) but no visual output on first load. No sample calculation.
  - Regulations: Text timeline. No visual timeline/roadmap/Gantt.
  - Knowledge Hub: Text article cards. Articles are pure text with no diagrams.
- **Recommendation:** Add: interactive line chart for carbon forecast, donut chart for fuel mix, colour-coded UK map for regions, visual timeline for regulations, infographics in articles, animated counters for stats, sample/demo output in calculator.

### 5. "Needs data capture / lead generation"
- **Current state:** Only two email capture points:
  1. Footer "Stay Updated" form (every page)
  2. Knowledge Hub "Stay ahead of the regulations" form
  - Both are simple email-only inputs with no segmentation, no context about what you'll receive, and no incentive.
- **Recommendation:** Add multiple lead gen mechanisms:
  - Gate calculator PDF export behind email
  - "Get personalised regulation alerts" with email + role selection
  - Downloadable guides/checklists behind email capture
  - "Book a sustainability audit" CTA
  - "Get your project's carbon score emailed to you"
  - Mid-article content upgrades
  - Exit-intent popup with value offer

### 6. "Needs audience segmentation (architect, specifier, manufacturer)"
- **Current state:** Audience labels appear on multiple pages as decorative pills/cards:
  - Homepage: Developers, Architects, Manufacturers, Contractors (non-interactive labels)
  - Dashboard: Architects & Specifiers, Site Managers & Contractors, Manufacturers, Sustainability Leads (non-interactive)
  - Calculator: Architects, Contractors, Manufacturers, Sustainability Leads (non-interactive)
  - Regulations: Has role filter buttons (Developer, Architect, Manufacturer, Contractor) -- this is the ONLY functional segmentation
  - Knowledge Hub: Business Leaders, Technical Teams, Marketing & Comms, CPD & Training (non-interactive)
- **Recommendation:** Add a persistent "I am a..." selector (either on first visit or in nav) that:
  - Customises homepage content/CTAs for each role
  - Pre-filters regulations
  - Shows role-relevant articles first
  - Tailors calculator guidance
  - Captures role data for lead scoring
  - Could be a full onboarding flow: role + company size + key concern = personalised hub experience

---

## ADDITIONAL OBSERVATIONS

### Content Quality
- Article content is well-written, accurate, and genuinely useful
- Regulation data is current (includes March 2026 FHS/FBS publications)
- ICE database integration with 100+ materials and 20 categories is substantial
- Live carbon data from National Grid API is genuinely real-time

### Technical
- Page titles are well-optimised for SEO
- Site loads on Vercel (fast)
- Data sources properly attributed
- Mobile responsive (hamburger menu present)

### Branding/Positioning
- Heavy "About Fabrick" agency promotion block appears on most pages -- could feel salesy
- The "Built by Fabrick / Want a platform like this?" CTA block is a good lead gen concept for Fabrick's own services but is separate from the hub's user-facing lead gen
- Two different lead gen goals seem to coexist: (a) capturing hub users as sustainability leads, and (b) selling Fabrick's digital services to companies wanting similar platforms. These should be more clearly separated.

### What's Working Well
- The regulations tracker with role/category filters is the strongest feature
- Carbon calculator with 20 material categories and ICE database integration is solid functionality
- Live carbon data from the National Grid API is a genuine differentiator
- Knowledge Hub articles are well-written and cover the right topics
- Cross-linking between sections (e.g. articles link to calculator) is good
- The concept and scope is strong -- it just needs better presentation, interactivity, and lead capture
