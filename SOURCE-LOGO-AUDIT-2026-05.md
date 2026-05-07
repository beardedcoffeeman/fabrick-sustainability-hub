# Source Logo & Attribution Audit

**Date:** 2026-05-06
**Question:** Can we use the logos of our data sources on the homepage / dashboards?

## TL;DR

**Short answer: no, not safely.** The data is free to use under OGL v3, but the **logos are not covered by the same licence**. UK government and regulator logos almost universally prohibit third-party reuse without written permission, primarily to prevent any implied endorsement.

**Recommended path:** keep text-only attribution (current footer pattern is correct). If you want visual richness on the homepage, use generic icons (chart, building, document) rather than partner logos.

If you specifically want source logos as social proof, the only safe route is to email each source's comms/press team requesting written permission with a defined use case ("attribution badge on homepage of consumer-facing data hub, no implied endorsement").

---

## Source-by-source review

### 1. National Grid ESO — Carbon Intensity API

- **Data licence:** CC-BY-4.0 / Open Government Licence v3.0
- **Logo policy:** National Grid trademarks are protected. The carbonintensity.org.uk T&Cs note the API and dataset are open, but "the National Grid ESO logo and trademarks are owned by National Grid plc and may not be used without written permission."
- **Verdict:** Logo NO. Text attribution YES (already in footer).

### 2. Office for National Statistics (ONS)

- **Data licence:** OGL v3
- **Logo policy:** ONS branding guidance is explicit — the ONS logo is not available for third-party use. Crown copyright applies to the logo separately from the data.
- **Verdict:** Logo NO. Text attribution YES.

### 3. MHCLG (EPC Open Data)

- **Data licence:** OGL v3
- **Logo policy:** Cabinet Office guidance on departmental logos: third parties must not use HM Government, departmental or Royal Coat of Arms imagery without explicit permission, to avoid implied endorsement.
- **Verdict:** Logo NO. Text attribution YES (with required attribution string: "Contains EPC data © Crown copyright 2026").

### 4. planning.data.gov.uk (Department for Levelling Up, Housing and Communities)

- **Data licence:** OGL v3
- **Logo policy:** Same as MHCLG above. The gov.uk crown logo is restricted; departmental logos require permission.
- **Verdict:** Logo NO. Text attribution YES.

### 5. ICE Database (Circular Ecology)

- **Data licence:** Free for non-commercial use; commercial use requires a licence agreement with Circular Ecology. **ACTION NEEDED:** check whether Fabrick's use here counts as "commercial" — a free tool that markets the agency probably does. Email Craig Jones at Circular Ecology to confirm.
- **Logo policy:** Circular Ecology is a private company. Logo use would need direct written permission.
- **Verdict:** Logo NO without permission. **Also flag: data licence may need to be paid for, given commercial context.** Confirm urgently before we extend the materials/calculator features.

### 6. Department for Business and Trade

- **Data licence:** OGL v3
- **Logo policy:** Same restrictions as other government departments.
- **Verdict:** Logo NO. Text attribution YES.

---

## What the OGL v3 actually requires

Whenever we use OGL data, the licence requires:

1. An attribution statement (current footer link satisfies this)
2. A link to the licence text (current footer link satisfies this)
3. The wording the source asks for, where specified (e.g. EPC requires "Contains EPC data © Crown copyright")

We are currently compliant on (1) and (2). We should add the EPC-specific attribution string on the EPC dashboard page itself, not just in the footer.

---

## Recommendations

1. **Do not add source logos to the homepage.** Reword that part of the brief — use icons, screenshots of data visualisations, or coloured "data card" treatments instead.
2. **Add the EPC-specific Crown copyright string** on the EPC dashboard page.
3. **Resolve the ICE Database commercial-use question** with Circular Ecology this week before further materials work. This is the only real legal exposure I can see.
4. If logos are critical for the homepage's credibility signal, draft a short permission request template and send to: National Grid ESO press, ONS comms, MHCLG comms, DBT comms, Circular Ecology. Expect 50% response rate, 3-6 week turnaround.
