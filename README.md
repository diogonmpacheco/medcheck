# MedCheck — Drug Interaction Checker

Free, private drug interaction checker. Enter your medications and see how they interact — no accounts, no data collection, everything runs in your browser.

**Live:** [diogonmpacheco.github.io/medcheck](https://diogonmpacheco.github.io/medcheck/)

---

## What It Is

MedCheck started as a drug interaction calculator. It's now a systems pharmacology graph engine — a single HTML file containing a directed biochemical interaction graph with drugs, metabolites, enzymes, transporters, food compounds, receptors, and clinical phenotypes as equal actors. All reasoning is done client-side, with no server calls, no accounts, and no data collection.

---

## Features

### Drug Database
- **247 drugs** — prescription, OTC, supplements, herbs, recreational, and environmental substances
- Dose tiers, timing guidance, and alternative suggestions for each entry

### Biochemical Graph Engine
- **Unified actor model** — 9 node types: DRUG, METABOLITE, ENZYME, TRANSPORTER, FOOD, ENVIRONMENTAL, ENDOGENOUS, RECEPTOR, PHENOTYPE
- **11 edge types** — SUBSTRATE_OF, INHIBITS, INDUCES, METABOLIZED_TO, TRANSPORTED_BY, COMPETES_WITH, ACTIVATES, BLOCKS, ACCUMULATES_IN, PRODUCES, SUPPRESSES
- **Multi-hop traversal** — `traverseEffects()` performs depth-limited DFS across the graph with cycle protection, confidence decay per edge, and temporal modifier accumulation
- **Metabolites as first-class entities** — each metabolite has its own halfLife, potencyRatio, enzyme interactions, and evidenceRefs independent of its parent drug
- **Transporter modeling** — P-gp, OATP1B1, OCT2, BCRP, OAT1, OAT3, MATE1 at parity with CYP enzymes
- **Nonlinear PK** — auto-inhibition kinetics for paroxetine, fluoxetine, and other saturable substrates
- **Dynamic route fractions** — enzyme burden redistributed across residual pathways when one route is inhibited

### Evidence System
- **STUDY_DB** — 40+ curated evidence entries with real PMIDs, DOIs, quantified PK effects (AUC fold, clearance reduction %), phenotype stratification, temporal onset/washout data, and explicit contradicts[] links
- **9-tier evidence hierarchy** — IN_VITRO → ANIMAL → CASE_REPORT → OBSERVATIONAL → CLINICAL_PK → RCT → META_ANALYSIS → GUIDELINE → FDA_LABEL
- **Evidence weights** — each tier carries a calibrated confidence weight (0.30–0.95) used by `computeEdgeConfidence()` to decay traversal confidence
- **Contradictory evidence** — explicitly modeled; Province 2014 meta-analysis vs CPIC tamoxifen guideline are both shown without suppression
- **Evidence Explorer** — browsable panel showing all STUDY_DB entries relevant to the current drug stack with tier filtering
- **Ingestion pipeline** — `createStudyDraft()` / `reviewStudyDraft()` with `INGESTION_QUEUE`; AI-extracted evidence cannot be auto-published without human pharmacist/physician review

### Genotype-Stratified Evidence
- **PM / IM / NM / UM selectors** per enzyme (CYP2D6, CYP2C19, CYP2C9)
- AUC fold-change multipliers and population frequencies from CPIC guidelines
- **East Asian CYP2D6\*10 awareness** — CYP2D6\*10 is at 41.8% allele frequency in Japanese patients (Ueda 2006), making most East Asian patients functional intermediate metabolizers even without a PM genotype; a persistent warning surfaces whenever CYP2D6 is in the active stack
- Genotype-adjusted concentration curves in the PK Simulation panel

### PK Simulation
- One-compartment oral absorption model for 15 drugs (paroxetine, fluoxetine, warfarin, clopidogrel, digoxin, amiodarone, methadone, and more)
- SVG concentration-time curves with Cmax markers and genotype-adjusted AUC scaling
- **Sex-specific reference ranges for paroxetine** — males 15–125 ng/mL, females 30–210 ng/mL (Huang et al. 2025, n=360 Chinese patients, PPK model)
- Nonlinear kinetics warning and high-dose tapering recommendation for paroxetine (5mg/2-4 weeks vs standard 10mg/week)

### Phenotype Risk Accumulation
- Per-drug scoring across 5 clinical risk axes: serotonin load, QTc accumulation, anticholinergic burden, sedation, fall risk
- Color-coded risk cards with contributing drug lists
- Syndrome-specific clinical warnings: serotonin syndrome criteria (clonus, hyperthermia), TdP risk factors (hypokalemia, female sex, bradycardia), CNS depression

### Adverse Effect Burden
- **Anticholinergic Cognitive Burden (ACB) scale** — scored for ~40 drugs; clinical interpretation (delirium risk, urinary retention) at ACB ≥ 3
- **Beers Criteria 2023** — flags for 15+ drug classes in patients ≥65 years
- Sedation accumulation count and fall risk scoring

### Washout Calendar
- Safe-to-switch dates computed from `WASHOUT_DAYS` constants and `TEMPORAL_PROFILES`
- Covers: norfluoxetine (35 days, MBI), amiodarone (90 days, tissue accumulation), paroxetine (18 days, MBI), rifampin (14 days, induction reversal), bergamottin (3 days, gut resynthesis), and more
- Proportional timeline bars; conservative clinical footnotes

### Interaction Network Graph
- D3.js v7 force-directed visualization of the active subgraph
- Nodes colored by ACTOR_TYPE; edges colored by EDGE_TYPE
- Drag, zoom, and hover-to-highlight neighborhood; adaptive depth expansion around active drugs

### Effect Cascade
- Visual multi-hop pathway display from `traverseEffects()` output
- Each chain shows: Source → edge → Node → ... → Phenotype with confidence percentage and temporal notes

---

## Architecture

MedCheck is a single self-contained HTML file (~10,000 lines). All computation runs in the browser with no dependencies except D3.js (loaded from CDN for graph visualization). There is no backend, no API, and no persistent storage.

The core data structures are:

| Constant | Purpose |
|---|---|
| `DRUG_DB` | Drug definitions with routes, inhibitions, inductions, props |
| `METABOLITE_ACTORS` | First-class metabolite entities |
| `RECEPTOR_ACTORS` | 6 receptor nodes (mu-opioid, 5-HT2A, D2, etc.) |
| `PHENOTYPE_ACTORS` | 13 clinical outcome nodes |
| `KNOWN_DDI` | Curated pairwise interaction entries with evidenceRefs |
| `STUDY_DB` | 40+ primary evidence entities |
| `GENOTYPE_EFFECTS` | PM/IM/NM/UM fold-change multipliers per enzyme |
| `PK_PARAMS` | One-compartment PK parameters for 15 drugs |
| `TEMPORAL_PROFILES` | Onset/washout profiles for persistent inhibitors |
| `WASHOUT_DAYS` | Evidence-based enzyme recovery timelines |
| `ACB_SCORES` / `BEERS_FLAGS` | Adverse burden lookup tables |

---

## How to Use

1. Open `index.html` in any modern browser (or visit the live link)
2. Search or browse to add your medications to the active stack
3. Review: interaction warnings, AUC fold predictions, risk gauge, metabolite cascades, effect pathway chains
4. Set your genotype (PM/IM/NM/UM) in the Genotype panel for personalized predictions
5. Check the Washout Calendar before switching medications
6. Use the Adverse Burden panel when prescribing for elderly patients

---

## Disclaimer

This tool is for **educational purposes only**. It does not replace professional medical advice, clinical pharmacist review, or therapeutic drug monitoring. AI hallucinations in pharmacology are dangerous — every STUDY_DB entry is flagged for independent verification before clinical application. Always consult your doctor or pharmacist before making changes to your medications.
