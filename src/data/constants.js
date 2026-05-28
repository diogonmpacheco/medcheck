// MedCheck — Shared constants and enums
// Phase A: modular source — concatenated by build.js

const INH_MULT = { strong: 5.0, moderate: 2.0, weak: 1.25 };
const IND_MULT = { strong: 0.15, moderate: 0.4, weak: 0.7 };

// ── DOSE TIERS: clinical dose ranges for dose-dependent inhibition modeling ──
// inhMod: multiplier applied to inhibition strength at each dose tier
// low=subtherapeutic inhibition, standard=published Ki data, high=near-saturation, max=supratherapeutic
const ACTOR_TYPE = Object.freeze({
  DRUG:          'drug',
  METABOLITE:    'metabolite',
  ENZYME:        'enzyme',
  TRANSPORTER:   'transporter',
  FOOD:          'food_compound',
  ENVIRONMENTAL: 'environmental_compound',  // toxins, pollutants, xenobiotics
  ENDOGENOUS:    'endogenous_compound',      // neurotransmitters, hormones, trace amines
  RECEPTOR:      'receptor',                // pharmacological targets (mu-opioid, 5-HT2A, D2...)
  PHENOTYPE:     'phenotype',               // observable outcomes (analgesia, serotonin_syndrome...)
});

// ── Edge Types ── (all relationship types between actors)
const EDGE_TYPE = Object.freeze({
  SUBSTRATE_OF:    'substrate_of',     // actor is metabolized by enzyme/transporter
  INHIBITS:        'inhibits',         // actor inhibits enzyme/transporter/receptor
  INDUCES:         'induces',          // actor induces enzyme/transporter expression
  METABOLIZED_TO:  'metabolized_to',   // parent → metabolite (inactive/active)
  TRANSPORTED_BY:  'transported_by',   // actor is a substrate of a transporter
  COMPETES_WITH:   'competes_with',    // two actors compete for same enzymatic/receptor site
  ACTIVATES:       'activates',        // prodrug → active metabolite; agonist → receptor
  BLOCKS:          'blocks',           // antagonist blocks receptor; efflux pump blocks CNS entry
  ACCUMULATES_IN:  'accumulates_in',   // lipophilic actor accumulates in compartment
  PRODUCES:        'produces',         // metabolic step or receptor activation → downstream effect
  SUPPRESSES:      'suppresses',       // actor suppresses phenotype/function (e.g. CYP2D6 inhibition → ↓ analgesia)
});

// ── Tissue Compartments ──
// Conceptual compartments that distinguish where a drug/metabolite acts.
// Key insight: brain CYP2D6 ≠ hepatic CYP2D6; lipophilic compounds in
// adipose behave fundamentally differently from plasma compartment.
const TISSUE_COMPARTMENT = Object.freeze({
  PLASMA:   'plasma',    // systemic circulation (PK measurements)
  LIVER:    'liver',     // primary metabolic organ; hepatic CYPs
  BRAIN:    'brain',     // CNS; brain CYP2D6, BBB gating by P-gp/BCRP
  GUT:      'gut',       // intestinal CYP3A4/P-gp first-pass extraction
  KIDNEY:   'kidney',    // renal clearance; OCT2/MATE1 transporters
  ADIPOSE:  'adipose',   // lipophilic compound depot; slow release
  PLATELET: 'platelet',  // MAO-B location; serotonin storage
});

// ── Evidence Schema ──
// Canonical evidence object used by all edges.
// Older edges may have only {confidence, sources}; new/upgraded edges
// carry full provenance. Both forms are valid — consumers should use
// evidenceConfidence() helper to extract a normalized confidence value.
const EVIDENCE_SCHEMA_VERSION = 2;

const EVIDENCE_TIER = Object.freeze({
  IN_VITRO:     'in_vitro',       // cell/microsome assay only
  ANIMAL:       'animal',         // rodent/primate PK
  CASE_REPORT:  'case_report',    // individual patient observation
  OBSERVATIONAL:'observational',  // retrospective cohort/database
  CLINICAL_PK:  'clinical_pk',    // prospective clinical PK study (gold standard for DDI)
  RCT:          'rct',            // randomized controlled trial
  META_ANALYSIS:'meta_analysis',  // quantitative synthesis of multiple studies
  GUIDELINE:    'guideline',      // evidence-based clinical guideline (CPIC, EMA, etc.)
  FDA_LABEL:    'fda_label',      // FDA-approved prescribing information (regulatory)
});

// ── Evidence Tier Weights ──
// Used by computeEdgeConfidence() and traverseEffects() decay.
// FDA label is high but not 1.0 — it reflects regulatory consensus, not always RCT quality.
// Meta-analysis can exceed FDA label for quantified pharmacokinetics.
const EVIDENCE_WEIGHT = {
  [EVIDENCE_TIER.FDA_LABEL]:    0.95,
  [EVIDENCE_TIER.META_ANALYSIS]:0.92,
  [EVIDENCE_TIER.RCT]:          0.90,
  [EVIDENCE_TIER.GUIDELINE]:    0.88,
  [EVIDENCE_TIER.CLINICAL_PK]:  0.85,
  [EVIDENCE_TIER.OBSERVATIONAL]:0.70,
  [EVIDENCE_TIER.CASE_REPORT]:  0.45,
  [EVIDENCE_TIER.ANIMAL]:       0.35,
  [EVIDENCE_TIER.IN_VITRO]:     0.30,
};

// ── GENOTYPE_PHENOTYPE — CYP metabolizer phenotype definitions ──
const GENOTYPE_PHENOTYPE = Object.freeze({
  PM: 'poor_metabolizer',
  IM: 'intermediate_metabolizer',
  NM: 'normal_metabolizer',
  UM: 'ultrarapid_metabolizer',
});

// GENOTYPE_EFFECTS — fold-change multipliers vs NM baseline for key enzymes
// Source: CPIC guidelines, FDA labels, clinical PK studies
const GENOTYPE_EFFECTS = {
  CYP2D6: {
    [GENOTYPE_PHENOTYPE.PM]:  { auc_fold:4.5, freq_pct:7,  note:"Enzyme absent. Codeine → no morphine (analgesia failure). Tamoxifen → reduced endoxifen (<30% of NM). TCAs may accumulate dangerously." },
    [GENOTYPE_PHENOTYPE.IM]:  { auc_fold:2.0, freq_pct:11, note:"Reduced activity (~2× AUC vs NM). Allele frequencies vary substantially by ancestry; population-specific interpretation should use genotype report context." },
    [GENOTYPE_PHENOTYPE.NM]:  { auc_fold:1.0, freq_pct:75, note:"Normal metabolism (reference)." },
    [GENOTYPE_PHENOTYPE.UM]:  { auc_fold:0.3, freq_pct:7,  note:"Ultra-rapid metabolism. Reduced AUC. Codeine → excess morphine → respiratory depression. Frequency varies substantially by ancestry." },
  },
  CYP2C19: {
    [GENOTYPE_PHENOTYPE.PM]:  { auc_fold:3.0, freq_pct:3, note:"Clopidogrel prodrug not activated → stent thrombosis risk. PPIs highly elevated. Frequency varies substantially by ancestry." },
    [GENOTYPE_PHENOTYPE.IM]:  { auc_fold:1.6, freq_pct:26,note:"Partial clopidogrel activation; intermediate platelet inhibition." },
    [GENOTYPE_PHENOTYPE.NM]:  { auc_fold:1.0, freq_pct:65,note:"Normal activation of prodrugs (clopidogrel, voriconazole)." },
    [GENOTYPE_PHENOTYPE.UM]:  { auc_fold:0.5, freq_pct:6, note:"Ultra-rapid; reduced PPI efficacy; possible increased clopidogrel bleeding risk." },
  },
  CYP2C9: {
    [GENOTYPE_PHENOTYPE.PM]:  { auc_fold:3.5, freq_pct:2, note:"Warfarin/phenytoin accumulation — markedly reduced maintenance dose. Highest bleeding risk." },
    [GENOTYPE_PHENOTYPE.IM]:  { auc_fold:1.8, freq_pct:12,note:"Reduced warfarin clearance; dose reduction ~25-50% vs NM." },
    [GENOTYPE_PHENOTYPE.NM]:  { auc_fold:1.0, freq_pct:82,note:"Standard warfarin dosing." },
    [GENOTYPE_PHENOTYPE.UM]:  { auc_fold:0.7, freq_pct:4, note:"Rare. Standard or slightly increased dose." },
  },
  CYP2B6: {
    [GENOTYPE_PHENOTYPE.PM]:  { auc_fold:3.5, freq_pct:null, note:"Reduced CYP2B6 activity; efavirenz parent exposure rises and inactive 8-hydroxyefavirenz formation falls." },
    [GENOTYPE_PHENOTYPE.IM]:  { auc_fold:2.0, freq_pct:null, note:"Intermediate CYP2B6 activity." },
    [GENOTYPE_PHENOTYPE.NM]:  { auc_fold:1.0, freq_pct:null, note:"Normal CYP2B6 activity." },
    [GENOTYPE_PHENOTYPE.UM]:  { auc_fold:0.5, freq_pct:null, note:"Higher CYP2B6 activity; lower parent exposure for sensitive substrates." },
  },
  DPYD: {
    [GENOTYPE_PHENOTYPE.PM]:  { auc_fold:20.0, freq_pct:null, note:"Very low/absent DPYD activity; fluoropyrimidine toxicity risk can be life-threatening." },
    [GENOTYPE_PHENOTYPE.IM]:  { auc_fold:2.0, freq_pct:null, note:"Reduced DPYD activity; fluoropyrimidine starting dose usually requires major reduction." },
    [GENOTYPE_PHENOTYPE.NM]:  { auc_fold:1.0, freq_pct:null, note:"Normal DPYD activity." },
  },
  TPMT: {
    [GENOTYPE_PHENOTYPE.PM]:  { auc_fold:20.0, freq_pct:null, note:"Very low/absent TPMT activity; thiopurine myelosuppression risk at standard doses." },
    [GENOTYPE_PHENOTYPE.IM]:  { auc_fold:2.0, freq_pct:null, note:"Reduced TPMT activity; thiopurine dose reduction needed." },
    [GENOTYPE_PHENOTYPE.NM]:  { auc_fold:1.0, freq_pct:null, note:"Normal TPMT activity." },
    [GENOTYPE_PHENOTYPE.UM]:  { auc_fold:0.5, freq_pct:null, note:"Higher methylation tendency; lower 6-TGN and possible 6-MMP shunting." },
  },
  UGT1A1: {
    [GENOTYPE_PHENOTYPE.PM]:  { auc_fold:1.7, freq_pct:null, note:"Reduced UGT1A1 glucuronidation; SN-38 or bilirubin exposure can rise depending on substrate." },
    [GENOTYPE_PHENOTYPE.IM]:  { auc_fold:1.2, freq_pct:null, note:"Intermediate UGT1A1 activity." },
    [GENOTYPE_PHENOTYPE.NM]:  { auc_fold:1.0, freq_pct:null, note:"Normal UGT1A1 activity." },
  },
};

// activeGenotype — user-selected metabolizer phenotype per enzyme (runtime state)
// Format: { CYP2D6: 'normal_metabolizer', CYP2C19: 'normal_metabolizer', CYP2C9: 'normal_metabolizer' }
let activeGenotype = {
  CYP2D6:  GENOTYPE_PHENOTYPE.NM,
  CYP2C19: GENOTYPE_PHENOTYPE.NM,
  CYP2C9:  GENOTYPE_PHENOTYPE.NM,
};

// ── STUDY_DB ──
// First-class evidence entities. One study can support multiple graph edges.
// Contradictory evidence is explicitly tracked — real pharmacology disagrees.
//
// IMPORTANT: Every entry here has been curated from primary literature or
// regulatory documents. PMIDs marked verify:true should be independently
// confirmed before clinical use. AI hallucination risk applies — human
// pharmacist/physician review required before any clinical application.
//
