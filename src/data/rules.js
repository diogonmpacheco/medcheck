// MedCheck — Clinical rule configuration
// Centralized numeric rule tables used by engines and renderers.

// Structural/mechanistic reliability, independent of study evidence.
// Evidence-tier weighting is handled separately by computeEdgeConfidence().
var EDGE_TYPE_BASE_WEIGHT = {};
EDGE_TYPE_BASE_WEIGHT[EDGE_TYPE.SUBSTRATE_OF]   = 0.92;
EDGE_TYPE_BASE_WEIGHT[EDGE_TYPE.INHIBITS]       = 0.85;
EDGE_TYPE_BASE_WEIGHT[EDGE_TYPE.INDUCES]        = 0.75;
EDGE_TYPE_BASE_WEIGHT[EDGE_TYPE.METABOLIZED_TO] = 0.88;
EDGE_TYPE_BASE_WEIGHT[EDGE_TYPE.ACTIVATES]      = 0.80;
EDGE_TYPE_BASE_WEIGHT[EDGE_TYPE.BLOCKS]         = 0.80;
EDGE_TYPE_BASE_WEIGHT[EDGE_TYPE.PRODUCES]       = 0.68;
EDGE_TYPE_BASE_WEIGHT[EDGE_TYPE.TRANSPORTED_BY] = 0.80;
EDGE_TYPE_BASE_WEIGHT[EDGE_TYPE.COMPETES_WITH]  = 0.65;
EDGE_TYPE_BASE_WEIGHT[EDGE_TYPE.SUPPRESSES]     = 0.75;
EDGE_TYPE_BASE_WEIGHT[EDGE_TYPE.ACCUMULATES_IN] = 0.70;

// Clinical urgency multiplier per phenotype node ID.
const PHENOTYPE_SEVERITY_WEIGHT = {
  'serotonin-syndrome-risk':     1.6,
  'qt-prolongation-risk':        1.5,
  'respiratory-depression-risk': 1.5,
  'seizure-risk':                1.4,
  'hepatotoxicity-risk':         1.3,
  'bleeding-risk':               1.3,
  'anticholinergic-syndrome':    1.2,
  'hypotension-risk':            1.1,
  'cns-depression-risk':         1.1,
  'cyp2d6_burden_phenotype':     1.0,
  'cyp3a4_induction_phenotype':  1.0,
  'sedation-phenotype':          1.0,
  'analgesia_phenotype':         0.85,
};

// Standard dosing intervals in hours for repeated-dose PK display.
const PK_DOSE_INTERVALS = {
  paroxetine:20,  fluoxetine:24,  sertraline:24, citalopram:24, escitalopram:24,
  venlafaxine:12, duloxetine:24,  mirtazapine:24,
  warfarin:24,    clopidogrel:24, codeine:6,     simvastatin:24, atorvastatin:24,
  digoxin:24,     amiodarone:24,  methadone:8,   rifampin:24, omeprazole:24,
  tamoxifen:24,   metoprolol:12,
};

// Phenotype burden panel labels and thresholds.
const PHENOTYPE_RISK_RULES = {
  serotonin:      { name:"Serotonin Load", thresholds:[2,4], unit:"agents" },
  qtc:            { name:"QTc Risk",       thresholds:[2,5], unit:"pts" },
  anticholinergic:{ name:"Anticholinergic",thresholds:[2,4], unit:"ACB pts" },
  sedation:       { name:"Sedation Load",  thresholds:[2,4], unit:"pts" },
  fall_risk:      { name:"Fall Risk",      thresholds:[3,6], unit:"pts" },
};

const PHENOTYPE_NARRATIVE_THRESHOLDS = {
  serotonin: 2,
  qtc: 4,
  sedation: 4,
};

// Source products whose clinically relevant persistence belongs to a named
// active constituent actor rather than the product label itself.
const WASHOUT_SOURCE_ALIASES = {
  'grapefruit-juice': ['bergamottin'],
};

const HIGH_IMPACT_METABOLITE_RELATIONS = [
  { parent:"Codeine", metaboliteId:"morphine", requiredEvidenceRefs:["ev_codeine_cyp2d6_cpic"] },
  { parent:"Tramadol", metaboliteId:"o-desmethyltramadol", requiredEvidenceRefs:["ev_cyp2d6_codeine_genotype"] },
  { parent:"Clopidogrel", metaboliteId:"active-thiol-clopidogrel", requiredEvidenceRefs:["ev_clopidogrel_cyp2c19_cpic"] },
  { parent:"Tamoxifen", metaboliteId:"endoxifen", requiredEvidenceRefs:["ev_tamoxifen_cyp2d6_cpic"] },
  { parent:"Bupropion", metaboliteId:"hydroxybupropion", requiredEvidenceRefs:["ev_bupropion_cyp2d6_fda"] },
  { parent:"Fluoxetine", metaboliteId:"norfluoxetine", requiredEvidenceRefs:["ev_fluoxetine_cyp2d6_fda"] },
  { parent:"Potatoes (Solanine/Solanidine)", metaboliteId:"solanidine", requiredEvidenceRefs:["ev_solanidine_cyp2d6_hellden2024"] },
  { parent:"DXM (Dextromethorphan)", metaboliteId:"dextrorphan-dxo", requiredEvidenceRefs:["ev_dxm_dextrorphan_cyp2d6"] },
  { parent:"Atomoxetine", metaboliteId:"4-hydroxyatomoxetine", requiredEvidenceRefs:["ev_atomoxetine_cyp2d6_cpic"] },
  { parent:"Amphetamine", metaboliteId:"4-hydroxyamphetamine", requiredEvidenceRefs:["ev_amphetamine_cyp2d6_fda"] },
  { parent:"Methamphetamine", metaboliteId:"amphetamine", requiredEvidenceRefs:["ev_mdma_meth_cyp2d6_review"] },
  { parent:"Methamphetamine", metaboliteId:"4-hydroxymethamphetamine", requiredEvidenceRefs:["ev_mdma_meth_cyp2d6_review"] },
  { parent:"MDMA (Ecstasy)", metaboliteId:"hhma-3-4-dihydroxymethamphetamine", requiredEvidenceRefs:["ev_mdma_meth_cyp2d6_review"] },
  { parent:"Citalopram", metaboliteId:"didesmethylcitalopram-ddcit", requiredEvidenceRefs:["ev_citalopram_cyp2d6_oestad2003"] },
  { parent:"Escitalopram", metaboliteId:"s-didesmethylcitalopram-s-ddcit", requiredEvidenceRefs:["ev_citalopram_cyp2d6_oestad2003"] },
];

// Metabolite-specific genotype effects override parent-drug generic CYP effects.
// These prevent false simplifications such as "parent via CYP2D6 = 1.8x" when
// the clinically relevant signal is the metabolite concentration or active form.
const GENOTYPE_METABOLITE_EFFECTS = [
  {
    parent:"Potatoes (Solanine/Solanidine)",
    metaboliteId:"solanidine",
    metaboliteName:"Solanidine",
    enzyme:"CYP2D6",
    note:"Diet-derived biomarker: solanidine concentration rises sharply when CYP2D6 activity is absent. This is exposure/phenotyping context, not a dietary toxicity threshold.",
    evidenceRefs:["ev_solanidine_cyp2d6_hellden2024"],
    effects:{
      [GENOTYPE_PHENOTYPE.PM]: { fold:18.9, direction:"increase", label:"+1887% plasma solanidine vs NM" },
      [GENOTYPE_PHENOTYPE.IM]: { fold:1.74, direction:"increase", label:"+74% plasma solanidine vs NM" },
      [GENOTYPE_PHENOTYPE.NM]: { fold:1.0, direction:"baseline", label:"baseline" },
      [GENOTYPE_PHENOTYPE.UM]: { fold:0.65, direction:"decrease", label:"-35% plasma solanidine vs NM" },
    }
  },
  {
    parent:"Bupropion",
    metaboliteId:"hydroxybupropion",
    metaboliteName:"Hydroxybupropion",
    enzyme:"CYP2D6",
    note:"Hydroxybupropion is the main CYP2D6-inhibiting actor. CYP2D6 PM status has been associated with higher hydroxybupropion level/dose ratios, so DDIs should be traced through the metabolite rather than parent bupropion alone.",
    evidenceRefs:["ev_bupropion_cyp2d6_hesse1996","ev_bupropion_cyp2d6_fda"],
    effects:{
      [GENOTYPE_PHENOTYPE.PM]: { direction:"increase", label:"higher hydroxybupropion level/dose ratio reported" },
      [GENOTYPE_PHENOTYPE.IM]: { direction:"uncertain", label:"possible intermediate shift; not fold-calibrated" },
      [GENOTYPE_PHENOTYPE.NM]: { fold:1.0, direction:"baseline", label:"baseline" },
    }
  },
];
