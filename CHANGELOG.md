# MedCheck Changelog

## v3.0.0 — 2026-05-23

### Phase 5: Engine Improvements — 10 new analytical systems

**New UI Panels**
- **PK Simulation** — one-compartment oral absorption model (C(t) = F×D/Vd × ka/(ka−ke) × (e^−ke·t − e^−ka·t)) with SVG concentration-time curves for 15 drugs; genotype-adjusted AUC display; sex-specific reference range bands for paroxetine
- **Genotype-Stratified Evidence** — PM/IM/NM/UM selector buttons per enzyme (CYP2D6, CYP2C19, CYP2C9); fold-change multipliers and population frequency sourced from CPIC guidelines; persistent East Asian CYP2D6*10 population warning when CYP2D6 is relevant
- **Phenotype Risk Accumulation** — serotonin load, QTc accumulation, anticholinergic burden, sedation, and fall risk scored individually per drug and summed across the stack, with color-coded risk cards and syndrome-specific clinical warnings (serotonin syndrome, TdP criteria)
- **Interaction Network Graph** — D3.js force-directed graph (v7.8.5) with drag, zoom, hover highlight, and node/edge coloring by ACTOR_TYPE and EDGE_TYPE; adaptive depth-limited subgraph centered on active drug stack
- **Washout Calendar** — computes safe-to-switch dates from WASHOUT_DAYS constants; proportional timeline bars; covers norfluoxetine (35d), amiodarone (90d), paroxetine (18d), rifampin (14d), bergamottin (3d), and more
- **Adverse Effect Burden** — Anticholinergic Cognitive Burden (ACB) scale, Beers Criteria 2023 flags for patients ≥65, sedation accumulation count, fall risk scoring; all rendered as a dedicated panel

**New Engine Functions**
- `computePhenotypeAccumulation()` — per-drug scoring against PHENOTYPE_SCORES lookup (serotonin/QTc/anticholinergic/sedation/fall_risk axes)
- `computeAdverseBurden()` — ACB_SCORES + BEERS_FLAGS lookup with summary interpretation
- `computeWashoutCalendar()` — integrates WASHOUT_DAYS and TEMPORAL_PROFILES; returns `{days, mechanism, note, safeDateStr}` per actor
- `pkCurve()` / `pkConcentration()` — one-compartment PK model with 15 drugs in PK_PARAMS; ke derived from halfLife
- `foldChangeBands()` — inter-individual CV% (from CV_ESTIMATES per enzyme) → log-normal ±1 SD bands
- `computeGutExtraction()` — two-step gut extraction: Fg = (1 − Emetab) × (1 − Etransporter)
- `setGenotype()` — runtime PM/IM/NM/UM state update per enzyme; triggers full re-render

**Data Constants Added**
- `GENOTYPE_PHENOTYPE` / `GENOTYPE_EFFECTS` — fold-change multipliers and population frequencies for CYP2D6, CYP2C19, CYP2C9 with full CPIC-sourced clinical notes
- `PK_PARAMS` — oral PK parameters (F, ka, halfLife, Vd, dose_mg) for 15 drugs
- `PHENOTYPE_SCORES` — serotonin/QTc/anticholinergic/sedation/fall_risk scores for ~30 drugs
- `ACB_SCORES` — Anticholinergic Cognitive Burden scale values for ~40 drugs
- `BEERS_FLAGS` — Beers Criteria 2023 flags for ~15 drug classes
- `WASHOUT_DAYS` — evidence-based enzyme recovery times for 8 persistent inhibitors/inducers
- `CV_ESTIMATES` — inter-individual coefficient of variation per CYP enzyme for variability bands

**STUDY_DB: 8 new real-world evidence entries (PubMed-sourced)**
- `ev_paroxetine_cyp2d6_rct` — Laine 2004, RCT, paroxetine 4.8× desipramine AUC (n=15, PMID 14730412)
- `ev_paroxetine_cyp2d6_invitro` — von Moltke 1995, in vitro Ki=2.0µM for CYP2D6 (PMID 7782485)
- `ev_ssri_cyp2d6_review` — Baumann 1996, SSRI CYP2D6 rank order (PMID 8968657)
- `ev_qtc_polypharmacy_ckd` — Sommer 2020, 29.5% QTc risk with ≥2 agents in CKD patients (PMID 32056163)
- `ev_methadone_qtc_polypharmacy` — Chowdhury 2015, methadone+QTc drugs observational (PMID 25825202)
- `ev_qtc_older_adults_review` — Zarowitz 2019, QTc polypharmacy in nursing facility residents (PMID 30747995)
- `ev_cyp2d6_codeine_genotype` — Zahari 2013, CYP2D6 genotype effects on codeine/tramadol (PMID 23759977)
- `ev_linezolid_ssri_serotonin` — Sola 2006, linezolid-SSRI serotonin syndrome case series (PMID 16529136)

**STUDY_DB: 2 ScienceDirect studies — pharmacogenomics not captured elsewhere**
- `ev_paroxetine_cyp2d6_japanese` — Ueda et al. 2006, *Progress in Neuro-Psychopharmacology*, n=55 Japanese patients. ~500× interindividual variation in steady-state paroxetine levels; CYP2D6*10 at 41.8% allele frequency makes most East Asian patients functional IMs. Concentration by functional allele count at 30mg quantified (76.7 / 150.9 / 243.6 ng/mL·mg⁻¹·kg⁻¹). DOI: 10.1016/j.pnpbp.2005.11.007
- `ev_paroxetine_ppk_sex_chinese` — Huang et al. 2025, *Journal of Pharmaceutical Sciences*, n=360 Chinese patients, 645 TDM observations. Sex-specific reference ranges: males 15–125 ng/mL, females 30–210 ng/mL. Nonlinear auto-inhibition kinetics confirmed at high doses. High-dose tapering strategy: 5mg/2-4 weeks (not standard 10mg/week). DOI: 10.1016/j.xphs.2025.103893

**Wiring and Cross-references**
- `endoxifen` METABOLITE_ACTOR: added `ev_paroxetine_cyp2d6_japanese` to evidenceRefs; updated note to warn that CYP2D6*10 prevalence in East Asians reduces endoxifen production even in non-PM patients — standard CPIC thresholds will miss this
- CYP2D6 IM phenotype description updated with Ueda 2006 data and Asian-specific note
- Paroxetine PK_PARAMS: added `sexSpecificRange`, `nonlinear`, `asianNote`, `taperNote` fields
- Washout calendar entry for paroxetine updated with high-dose tapering warning
- DXM+Paroxetine KNOWN_DDI: added `evidenceRefs` pointing to paroxetine/CYP2D6 studies

---

## v2.0.0 — 2026-05-22

### Phase 4: First-Class Evidence Entity System

- `EVIDENCE_TIER` enum (9 levels: IN_VITRO → FDA_LABEL)
- `EVIDENCE_WEIGHT` map (0.30–0.95) used by `computeEdgeConfidence()` and `traverseEffects()` decay
- `STUDY_DB` — 22 curated evidence entries with real PMIDs (where available), DOIs, quantified PK effects, phenotype stratification, temporal data, and explicit contradicts[] links
- Contradictory evidence modeled (Province 2014 meta-analysis vs CPIC tamoxifen guideline)
- `computeEdgeConfidence()` — tier-weighted evidence resolver replacing flat confidence strings
- `evidenceRefs[]` wired into 13 KNOWN_DDI entries and key METABOLITE_ACTORS
- `resolveInteractionEvidence()` — fuzzy match against STUDY_DB for any drug pair
- Evidence ingestion pipeline: `INGESTION_QUEUE`, `createStudyDraft()`, `reviewStudyDraft()` — human review required before publishing (safety constraint preserved)
- Evidence Explorer UI section with per-study cards and tier filtering
- Expandable per-interaction evidence panels in interaction cards

---

## v1.5.0 — 2026-05-20

### Phase 3: Graph-First Biochemical Engine

- Generalized actor model: `ACTOR_TYPE` enum (DRUG, METABOLITE, ENZYME, TRANSPORTER, FOOD, ENVIRONMENTAL, ENDOGENOUS, RECEPTOR, PHENOTYPE)
- `EDGE_TYPE` enum (SUBSTRATE_OF, INHIBITS, INDUCES, METABOLIZED_TO, TRANSPORTED_BY, COMPETES_WITH, ACTIVATES, BLOCKS, ACCUMULATES_IN, PRODUCES, SUPPRESSES)
- `TISSUE_COMPARTMENT` constants (PLASMA, LIVER, BRAIN, GUT, KIDNEY, ADIPOSE, PLATELET)
- `traverseEffects(startNodeId, maxDepth)` — DFS graph traversal with cycle protection (visitedKey set keyed actorId|depth), confidence decay, direction inference, temporal accumulation, 5% confidence pruning
- Metabolites as first-class entities in `METABOLITE_ACTORS{}` with own halfLife, inh[], potencyRatio, evidenceRefs
- 6 RECEPTOR_ACTORS (mu-opioid, 5-HT2A, D2, alpha1-adrenergic, MAO-A, PXR)
- 13 PHENOTYPE_ACTORS (analgesia, serotonin syndrome, respiratory depression, prodrug failure, etc.)
- `TEMPORAL_PROFILES` with onset/washout data for 9 key actors (norfluoxetine 5-week MBI, bergamottin 24-72h gut resynthesis, solanidine adipose depot release, etc.)
- `getEffectiveFraction()` — dynamic fractionModel replacing static fraction field
- Effect Cascade UI section — visual multi-hop pathway display

---

## v1.0.0 — 2026-05-05

- Initial release
- 247 drugs: Rx, OTC, supplements, herbs, recreational substances
- 104 metabolite cascades with full cross-referencing engine
- 188 known drug-drug interaction pairs
- 27 clinical fold-change entries from published PK studies
- Search and category browse modes
- Optional pharmacogenomics (CYP enzyme phenotype selection)
- Risk gauge, interaction cards, fold bars, interaction matrix
- Timing guidance and alternative suggestions
- Metabolite cascade visualization with cross-reference alerts
- PWA support (Add to Home Screen on iOS/Android)
- 100% client-side — no data collected, no server calls
