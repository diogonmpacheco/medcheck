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
];
