// MedCheck — Study database and evidence ingestion pipeline
// Phase A: modular source — concatenated by build.js

const STUDY_DB = {

  // ═══ PAROXETINE / CYP2D6 ═══
  "ev_paroxetine_cyp2d6_fda": {
    id:"ev_paroxetine_cyp2d6_fda",
    type:EVIDENCE_TIER.FDA_LABEL,
    title:"Paxil (paroxetine) Prescribing Information — Drug Interactions",
    year:2023, source:"FDA / GSK",
    pmid:null, doi:null, url:"https://www.accessdata.fda.gov/scripts/cder/daf/",
    studyDesign:"regulatory_label", n:null,
    phenotypes:["normal_metabolizer"],
    quantifiedEffects:{
      note:"Paroxetine is a potent mechanism-based inhibitor of CYP2D6; co-administration with desipramine increases desipramine AUC ~5×",
      aucFold:5.0, clearanceReductionPct:80
    },
    temporal:{onset:"days", washout:"2-3_weeks", mechanism:"MBI_irreversible"},
    supports:["paroxetine_inhibits_CYP2D6"],
    contradicts:[],
    limitations:["Label does not distinguish NM vs IM phenotype magnitude","Dose used in study may not reflect all clinical doses"],
    verified:true
  },

  "ev_paroxetine_cyp2d6_bloomer1992": {
    id:"ev_paroxetine_cyp2d6_bloomer1992",
    type:EVIDENCE_TIER.CLINICAL_PK,
    title:"Paroxetine: mechanism of action and pharmacokinetics",
    year:1992, source:"Bloomer et al.", journal:"J Clin Psychiatry",
    pmid:"1531823", doi:null,
    studyDesign:"healthy_volunteer_crossover", n:10,
    phenotypes:["normal_metabolizer"],
    quantifiedEffects:{aucFold:null, note:"Demonstrated time-dependent (MBI) CYP2D6 inhibition distinct from competitive inhibition"},
    temporal:{mechanism:"mechanism_based_inhibition", washout:"2_weeks"},
    supports:["paroxetine_inhibits_CYP2D6"],
    contradicts:[],
    limitations:["Small n","Single dose design"],
    verified:false, verifyNote:"PMID may need verification"
  },

  // ═══ FLUOXETINE / NORFLUOXETINE / CYP2D6 ═══
  "ev_fluoxetine_cyp2d6_fda": {
    id:"ev_fluoxetine_cyp2d6_fda",
    type:EVIDENCE_TIER.FDA_LABEL,
    title:"Prozac (fluoxetine) Prescribing Information — Drug Interactions",
    year:2023, source:"FDA / Lilly",
    pmid:null, doi:null,
    studyDesign:"regulatory_label", n:null,
    phenotypes:["normal_metabolizer"],
    quantifiedEffects:{
      aucFold:null, note:"Strong CYP2D6 inhibitor; active metabolite norfluoxetine (t½ 4-16 days) responsible for prolonged inhibition; CYP2D6 inhibition persists weeks after drug discontinuation"
    },
    temporal:{onset:"1-2_weeks", washout:"5_weeks", mechanism:"MBI_via_norfluoxetine"},
    supports:["fluoxetine_inhibits_CYP2D6","norfluoxetine_inhibits_CYP2D6"],
    contradicts:[],
    limitations:["Washout duration variable by dose and duration of treatment"],
    verified:true
  },

  "ev_fluoxetine_desipramine_preskorn1994": {
    id:"ev_fluoxetine_desipramine_preskorn1994",
    type:EVIDENCE_TIER.CLINICAL_PK,
    title:"Plasma levels of antidepressant drug and adverse effects following coadministration of fluoxetine",
    year:1994, source:"Preskorn et al.", journal:"J Clin Psychopharmacol",
    pmid:"7962675", doi:null,
    studyDesign:"healthy_volunteer_single_dose", n:18,
    phenotypes:["normal_metabolizer"],
    quantifiedEffects:{aucFold:4.6, cmaxFold:3.2, note:"Fluoxetine + desipramine: desipramine AUC ↑4.6× in NM"},
    temporal:{onset:"steady_state_2_weeks"},
    supports:["fluoxetine_inhibits_CYP2D6","norfluoxetine_inhibits_CYP2D6"],
    contradicts:[],
    limitations:["Single dose paradigm","Normal metabolizers only"],
    verified:false, verifyNote:"PMID should be confirmed"
  },

  // ═══ BUPROPION / HYDROXYBUPROPION / CYP2D6 ═══
  "ev_bupropion_cyp2d6_fda": {
    id:"ev_bupropion_cyp2d6_fda",
    type:EVIDENCE_TIER.FDA_LABEL,
    title:"Wellbutrin (bupropion) Prescribing Information — Drug Interactions",
    year:2023, source:"FDA / GSK",
    pmid:null, doi:null,
    studyDesign:"regulatory_label", n:null,
    phenotypes:["normal_metabolizer"],
    quantifiedEffects:{
      aucFold:5.0, note:"Bupropion + desipramine: desipramine AUC ↑5× (active metabolite hydroxybupropion is primary CYP2D6 inhibitor)",
      clearanceReductionPct:78
    },
    temporal:{onset:"days", washout:"4-5_days", mechanism:"competitive_via_hydroxybupropion"},
    supports:["hydroxybupropion_inhibits_CYP2D6","bupropion_cyp2d6_ddi"],
    contradicts:[],
    limitations:["Hydroxybupropion t½ 20h drives washout, not bupropion t½ 12h"],
    verified:true
  },

  "ev_bupropion_cyp2d6_kotlyar2005": {
    id:"ev_bupropion_cyp2d6_kotlyar2005",
    type:EVIDENCE_TIER.CLINICAL_PK,
    title:"Effect of CYP2D6 genotype on the pharmacokinetics of desipramine during bupropion treatment",
    year:2005, source:"Kotlyar et al.", journal:"J Clin Psychopharmacol",
    pmid:"15829908", doi:null,
    studyDesign:"parallel_group_genotyped", n:27,
    phenotypes:["normal_metabolizer","intermediate_metabolizer","poor_metabolizer"],
    quantifiedEffects:{aucFold:5.0, note:"Desipramine AUC ↑5× in NM; PM showed less relative change (already high baseline)"},
    temporal:{onset:"days_to_steady_state"},
    supports:["hydroxybupropion_inhibits_CYP2D6"],
    contradicts:[],
    limitations:["Specific to desipramine as probe; clinical magnitude may differ for other CYP2D6 substrates"],
    verified:false, verifyNote:"PMID approximate — verify before citing"
  },

  // ═══ CODEINE / MORPHINE / CYP2D6 ═══
  "ev_codeine_cyp2d6_cpic": {
    id:"ev_codeine_cyp2d6_cpic",
    type:EVIDENCE_TIER.GUIDELINE,
    title:"CPIC Guideline for Codeine and CYP2D6",
    year:2014, source:"CPIC / PharmGKB",
    pmid:"24458010", doi:"10.1038/clpt.2013.254",
    studyDesign:"systematic_review_guideline", n:null,
    phenotypes:["poor_metabolizer","ultrarapid_metabolizer","normal_metabolizer"],
    quantifiedEffects:{
      note:"PM: near-zero morphine formation → therapeutic failure. UM: toxic morphine accumulation → fatalities reported.",
      morphineAUC_PM:"near_zero", morphineAUC_UM:"3-5×_normal"
    },
    temporal:{},
    supports:["codeine_METABOLIZED_TO_morphine","codeine_cyp2d6_dependence"],
    contradicts:[],
    limitations:["Recommendation strength varies by phenotype; intermediate metabolizers show intermediate response"],
    verified:true
  },

  "ev_codeine_ultrarapid_deaths": {
    id:"ev_codeine_ultrarapid_deaths",
    type:EVIDENCE_TIER.CASE_REPORT,
    title:"Fatal respiratory depression in neonates — mother CYP2D6 ultrarapid metabolizer on codeine",
    year:2006, source:"Koren et al.", journal:"Lancet",
    pmid:"16950362", doi:"10.1016/S0140-6736(06)69255-6",
    studyDesign:"case_report", n:1,
    phenotypes:["ultrarapid_metabolizer"],
    quantifiedEffects:{note:"Infant death; mother genotyped as CYP2D6*1/*2 ×N (gene duplication)"},
    temporal:{},
    supports:["codeine_cyp2d6_dependence"],
    contradicts:[],
    limitations:["Single case; neonatal exposure via breast milk is unique route","Subsequent WHO guidance updated (2015)"],
    verified:true
  },

  // ═══ TAMOXIFEN / ENDOXIFEN / CYP2D6 ═══
  "ev_tamoxifen_cyp2d6_cpic": {
    id:"ev_tamoxifen_cyp2d6_cpic",
    type:EVIDENCE_TIER.GUIDELINE,
    title:"CPIC Guideline for CYP2D6 and Tamoxifen",
    year:2018, source:"CPIC / PharmGKB",
    pmid:"29385237", doi:"10.1002/cpt.1007",
    studyDesign:"systematic_review_guideline", n:null,
    phenotypes:["poor_metabolizer","intermediate_metabolizer","normal_metabolizer"],
    quantifiedEffects:{
      note:"CYP2D6 PM: endoxifen levels ↓75%; breast cancer recurrence risk significantly increased vs NM",
      endoxifenReductionPct_PM:75
    },
    temporal:{},
    supports:["tamoxifen_METABOLIZED_TO_endoxifen","CYP2D6_inhibition_tamoxifen_failure"],
    contradicts:["ev_tamoxifen_cyp2d6_controversy"],
    limitations:["Observational data inconsistency across studies","Guideline notes ongoing debate about clinical outcomes"],
    verified:true
  },

  "ev_tamoxifen_cyp2d6_controversy": {
    id:"ev_tamoxifen_cyp2d6_controversy",
    type:EVIDENCE_TIER.META_ANALYSIS,
    title:"Association between CYP2D6 phenotype and tamoxifen efficacy: meta-analysis of clinical outcome studies",
    year:2014, source:"Province et al.", journal:"Clin Pharmacol Ther",
    pmid:"24598971", doi:"10.1038/clpt.2014.9",
    studyDesign:"meta_analysis", n:null,
    phenotypes:["poor_metabolizer","normal_metabolizer"],
    quantifiedEffects:{note:"Did not find statistically significant difference in recurrence by CYP2D6 genotype across all studies"},
    temporal:{},
    supports:[],
    contradicts:["ev_tamoxifen_cyp2d6_cpic"],
    limitations:["Heterogeneous endpoint definitions","Concomitant CYP2D6 inhibitor use not always controlled","Post-hoc analyses dominant"],
    verified:true,
    note:"This contradictory evidence is scientifically valid — the clinical debate is unresolved. Both studies are represented."
  },

  // ═══ GRAPEFRUIT / BERGAMOTTIN / CYP3A4 ═══
  "ev_grapefruit_cyp3a4_bailey2013": {
    id:"ev_grapefruit_cyp3a4_bailey2013",
    type:EVIDENCE_TIER.CLINICAL_PK,
    title:"Grapefruit-drug interactions: forbidden fruit or avoidable consequences?",
    year:2013, source:"Bailey et al.", journal:"CMAJ",
    pmid:"23184849", doi:"10.1503/cmaj.120951",
    studyDesign:"systematic_review", n:null,
    phenotypes:["normal_metabolizer"],
    quantifiedEffects:{aucFold:null, note:"List of 85 drugs with potential interaction; some AUC increases up to 15× for high-extraction CYP3A4 substrates"},
    temporal:{onset:"within_hours", washout:"24-72h", mechanism:"bergamottin_MBI_gut_CYP3A4"},
    supports:["bergamottin_inhibits_CYP3A4","grapefruit_cyp3a4_interaction"],
    contradicts:[],
    limitations:["Clinical significance varies widely by drug; not all CYP3A4 substrates equally affected"],
    verified:true
  },

  "ev_grapefruit_bailey1991": {
    id:"ev_grapefruit_bailey1991",
    type:EVIDENCE_TIER.CLINICAL_PK,
    title:"Interaction of citrus juices with felodipine and nifedipine",
    year:1991, source:"Bailey et al.", journal:"Lancet",
    pmid:"1671423", doi:"10.1016/0140-6736(91)91687-T",
    studyDesign:"crossover", n:6,
    phenotypes:["normal_metabolizer"],
    quantifiedEffects:{aucFold:2.8, cmaxFold:3.4, note:"Original grapefruit-felodipine interaction discovery; AUC ↑2.8×, Cmax ↑3.4×"},
    temporal:{onset:"within_4h", washout:"24h"},
    supports:["bergamottin_inhibits_CYP3A4"],
    contradicts:[],
    limitations:["Single dose","Small n","Accidental discovery — study initially designed for alcohol interaction"],
    verified:true
  },

  // ═══ CLOPIDOGREL / CYP2C19 ═══
  "ev_clopidogrel_cyp2c19_cpic": {
    id:"ev_clopidogrel_cyp2c19_cpic",
    type:EVIDENCE_TIER.GUIDELINE,
    title:"CPIC Guideline for Clopidogrel and CYP2C19",
    year:2022, source:"CPIC / PharmGKB",
    pmid:"32189324", doi:"10.1002/cpt.1750",
    studyDesign:"systematic_review_guideline", n:null,
    phenotypes:["poor_metabolizer","intermediate_metabolizer"],
    quantifiedEffects:{
      note:"CYP2C19 PM: active thiol metabolite AUC ↓40%; cardiovascular event risk ↑1.4× vs NM in stented patients",
      activeMetabReductionPct_PM:40
    },
    temporal:{},
    supports:["clopidogrel_CYP2C19_prodrug","omeprazole_clopidogrel_interaction"],
    contradicts:[],
    limitations:["Evidence strongest for PCI/stenting populations; less clear for other indications"],
    verified:true
  },

  // ═══ SOLANIDINE / CYP2D6 ═══
  "ev_solanidine_cyp2d6_mock2001": {
    id:"ev_solanidine_cyp2d6_mock2001",
    type:EVIDENCE_TIER.IN_VITRO,
    title:"Metabolism of solanidine by human liver microsomes with cytochrome P450 isoform selectivity",
    year:2001, source:"Mock et al.", journal:"Xenobiotica",
    pmid:"11678145", doi:null,
    studyDesign:"in_vitro_microsomal", n:null,
    phenotypes:["normal_metabolizer"],
    quantifiedEffects:{note:"CYP2D6 and CYP3A4 are primary metabolizing enzymes for solanidine in human liver microsomes"},
    temporal:{},
    supports:["solanidine_SUBSTRATE_OF_CYP2D6"],
    contradicts:[],
    limitations:["In vitro only — clinical relevance at dietary exposure levels unestablished","No clinical PK data in humans"],
    verified:true,
    note:"Important caveat: in vitro CYP2D6 substrate finding does NOT establish clinical DDI — burden hypothesis is theoretical"
  },

  "ev_solanidine_ache_griffin1995": {
    id:"ev_solanidine_ache_griffin1995",
    type:EVIDENCE_TIER.IN_VITRO,
    title:"Inhibition of cholinesterase by potato glycoalkaloids",
    year:1995, source:"Griffin et al.", journal:"Phytother Res",
    pmid:"7544290", doi:null,
    studyDesign:"in_vitro_enzyme_assay", n:null,
    phenotypes:[],
    quantifiedEffects:{note:"α-Chaconine and α-solanine inhibit AChE and BChE with IC50 in µM range"},
    temporal:{},
    supports:["solanidine_inhibits_BChE","solanidine_inhibits_AChE"],
    contradicts:[],
    limitations:["IC50 values likely unachievable at normal dietary intake","No CNS penetration data"],
    verified:true
  },

  // ═══ WARFARIN / NSAIDs / BLEEDING ═══
  "ev_warfarin_nsaid_bleed": {
    id:"ev_warfarin_nsaid_bleed",
    type:EVIDENCE_TIER.OBSERVATIONAL,
    title:"Risk of upper gastrointestinal bleeding with warfarin and NSAIDs: a case-control study",
    year:2001, source:"Shorr et al.", journal:"Arch Intern Med",
    pmid:"11176762", doi:"10.1001/archinte.161.2.189",
    studyDesign:"case_control", n:1443,
    phenotypes:[],
    quantifiedEffects:{oddsRatio:15.6, note:"OR 15.6 for upper GI bleed with warfarin + NSAID vs warfarin alone"},
    temporal:{},
    supports:["warfarin_nsaid_bleeding_risk"],
    contradicts:[],
    limitations:["Observational; cannot exclude confounding","OTC NSAID use likely underreported"],
    verified:true
  },

  // ═══ MAOI / SEROTONIN SYNDROME ═══
  "ev_maoi_ssri_serotonin": {
    id:"ev_maoi_ssri_serotonin",
    type:EVIDENCE_TIER.GUIDELINE,
    title:"The serotonin syndrome — clinical review and diagnostic criteria",
    year:2003, source:"Boyer & Shannon", journal:"NEJM",
    pmid:"12867116", doi:"10.1056/NEJMra032867",
    studyDesign:"clinical_review", n:null,
    phenotypes:[],
    quantifiedEffects:{note:"MAOi + serotonergic drug: serotonin syndrome risk. Triad: mental status change, autonomic instability, neuromuscular abnormality"},
    temporal:{onset:"within_hours_of_combination"},
    supports:["maoi_ssri_serotonin_syndrome"],
    contradicts:[],
    limitations:["Incidence underreported","Severity spectrum from mild to fatal"],
    verified:true
  },

  // ═══ RIFAMPIN / CYP3A4 INDUCTION ═══
  "ev_rifampin_cyp3a4_induction": {
    id:"ev_rifampin_cyp3a4_induction",
    type:EVIDENCE_TIER.CLINICAL_PK,
    title:"Rifampin induction of CYP3A4: clinical pharmacokinetic studies",
    year:1999, source:"Niemi et al.", journal:"Clin Pharmacol Ther",
    pmid:"10068034", doi:null,
    studyDesign:"healthy_volunteer_crossover", n:12,
    phenotypes:["normal_metabolizer"],
    quantifiedEffects:{aucFold:0.1, note:"Simvastatin AUC reduced 87% after 5 days of rifampin; maximal induction at ~7 days"},
    temporal:{onset:"3-7_days", washout:"1-2_weeks", mechanism:"PXR_NR1I2_nuclear_receptor"},
    supports:["rifampin_induces_CYP3A4","rifampin_induces_P-gp"],
    contradicts:[],
    limitations:["Studies use different substrate drugs — fold changes vary by extraction ratio"],
    verified:false, verifyNote:"PMID approximate; exact Niemi et al. 1999 citation needs verification"
  },

  // ═══ DIGOXIN / P-gp / AMIODARONE ═══
  "ev_digoxin_pgp_amiodarone_fda": {
    id:"ev_digoxin_pgp_amiodarone_fda",
    type:EVIDENCE_TIER.FDA_LABEL,
    title:"Cordarone (amiodarone) Prescribing Information — Drug Interactions",
    year:2023, source:"FDA / Pfizer",
    pmid:null, doi:null,
    studyDesign:"regulatory_label", n:null,
    phenotypes:[],
    quantifiedEffects:{aucFold:2.0, note:"Amiodarone inhibits P-gp; digoxin AUC ↑~2×; digoxin dose reduction ~50% recommended"},
    temporal:{onset:"2-7_days", washout:"months", mechanism:"P-gp_inhibition_plus_renal_clearance_reduction"},
    supports:["amiodarone_inhibits_P-gp","digoxin_amiodarone_interaction"],
    contradicts:[],
    limitations:["Amiodarone t½ 40-55 days; inhibition persists months after discontinuation"],
    verified:true
  },

  // ═══ LITHIUM / NSAID NEPHRO ═══
  "ev_lithium_nsaid_clearance": {
    id:"ev_lithium_nsaid_clearance",
    type:EVIDENCE_TIER.CLINICAL_PK,
    title:"Nonsteroidal anti-inflammatory drugs and lithium: a case report and review of the literature",
    year:1990, source:"Ragheb", journal:"J Clin Psychiatry",
    pmid:"2211565", doi:null,
    studyDesign:"case_series_review", n:null,
    phenotypes:[],
    quantifiedEffects:{note:"NSAIDs reduce lithium renal clearance 15-25%; lithium levels rise proportionally"},
    temporal:{onset:"days"},
    supports:["lithium_nsaid_toxicity_risk"],
    contradicts:[],
    limitations:["Review rather than controlled study","Magnitude varies by NSAID and renal function"],
    verified:false, verifyNote:"PMID approximate"
  },

  // ═══ PIPERINE / BLACK PEPPER / CYP ═══
  "ev_piperine_pgp_annaert2010": {
    id:"ev_piperine_pgp_annaert2010",
    type:EVIDENCE_TIER.IN_VITRO,
    title:"Piperine inhibits P-glycoprotein-mediated efflux in Caco-2 cells",
    year:2010, source:"Annaert et al.", journal:"Xenobiotica",
    pmid:"14757178", doi:null,
    studyDesign:"in_vitro_caco2", n:null,
    phenotypes:[],
    quantifiedEffects:{note:"IC50 50 µM for P-gp inhibition; enhances absorption of P-gp substrates"},
    temporal:{},
    supports:["piperine_inhibits_P-gp"],
    contradicts:[],
    limitations:["In vitro; dietary piperine concentrations likely insufficient for clinical effect alone","Often used in supplement formulations to boost bioavailability"],
    verified:true
  },

  // ═══ CURCUMIN / CYP2C9 ═══
  "ev_curcumin_cyp2c9_zhang2007": {
    id:"ev_curcumin_cyp2c9_zhang2007",
    type:EVIDENCE_TIER.IN_VITRO,
    title:"Curcumin inhibits cytochrome P450 enzymes in human liver microsomes",
    year:2007, source:"Zhang et al.", journal:"Phytomedicine",
    pmid:"17692679", doi:null,
    studyDesign:"in_vitro_microsomal", n:null,
    phenotypes:[],
    quantifiedEffects:{IC50_CYP2C9:"0.58µM", note:"Potent CYP2C9 inhibition in vitro; clinical relevance at supplement doses uncertain"},
    temporal:{},
    supports:["curcumin_inhibits_CYP2C9"],
    contradicts:[],
    limitations:["Low oral bioavailability of curcumin limits clinical significance","Supplement doses vary enormously"],
    verified:true
  },

  // ═══ PAROXETINE / CYP2D6 — RCT (PubMed 14730412) ═══
  "ev_paroxetine_cyp2d6_rct": {
    id:"ev_paroxetine_cyp2d6_rct",
    type:EVIDENCE_TIER.RCT,
    title:"Effect of deramciclane on CYP2D6 activity — paroxetine as positive control",
    year:2004, source:"European Journal of Clinical Pharmacology",
    pmid:"14730412", doi:"10.1007/s00228-003-0714-z",
    url:"https://doi.org/10.1007/s00228-003-0714-z",
    studyDesign:"double-blind randomized crossover (n=15 healthy subjects)",
    n:15, phenotypes:["normal_metabolizer"],
    quantifiedEffects:{
      aucFold:4.8, clearanceReductionPct:79,
      note:"Paroxetine 20mg×8d → desipramine AUC 4.8× (p<0.001); 2-OH-desipramine/desipramine ratio −74%"
    },
    temporal:{onset:"days", washout:"2-3_weeks", mechanism:"MBI_irreversible"},
    supports:["paroxetine_inhibits_CYP2D6"],
    contradicts:[], limitations:["Paroxetine was positive control, not primary subject","Single-dose desipramine probe"], verified:true
  },

  // ═══ PAROXETINE / CYP2D6 — IN VITRO Ki (PubMed 7782485) ═══
  "ev_paroxetine_cyp2d6_invitro": {
    id:"ev_paroxetine_cyp2d6_invitro",
    type:EVIDENCE_TIER.IN_VITRO,
    title:"Inhibition of alprazolam and desipramine hydroxylation by paroxetine — human liver microsomes",
    year:1995, source:"Journal of Clinical Psychopharmacology",
    pmid:"7782485", doi:"10.1097/00004714-199504000-00008",
    url:"https://doi.org/10.1097/00004714-199504000-00008",
    studyDesign:"Human liver microsome inhibition kinetics",
    n:null, phenotypes:[],
    quantifiedEffects:{
      note:"Ki = 2.0 µM for CYP2D6. More potent than fluoxetine or norfluoxetine. In vitro prediction matched clinical desipramine interaction magnitude."
    },
    temporal:{mechanism:"competitive_and_MBI"},
    supports:["paroxetine_inhibits_CYP2D6"],
    contradicts:[], limitations:["In vitro system","Does not capture MBI time-dependency"], verified:true
  },

  // ═══ SSRI CYP2D6 INHIBITION — PK REVIEW (PubMed 8968657) ═══
  "ev_ssri_cyp2d6_review": {
    id:"ev_ssri_cyp2d6_review",
    type:EVIDENCE_TIER.META_ANALYSIS,
    title:"Pharmacokinetic-pharmacodynamic relationships of SSRIs — CYP inhibition rank order",
    year:1996, source:"Clinical Pharmacokinetics",
    pmid:"8968657", doi:"10.2165/00003088-199631060-00004",
    url:"https://doi.org/10.2165/00003088-199631060-00004",
    studyDesign:"Systematic review of SSRI clinical PK and DDI literature",
    n:null, phenotypes:["normal_metabolizer","poor_metabolizer"],
    quantifiedEffects:{
      note:"CYP2D6 inhibition rank: paroxetine > norfluoxetine > fluoxetine > sertraline > citalopram > fluvoxamine"
    },
    temporal:{},
    supports:["paroxetine_inhibits_CYP2D6","fluoxetine_inhibits_CYP2D6"],
    contradicts:[], limitations:["Review article — secondary source","1996 literature; predates modern CYP phenotyping for all SSRIs"], verified:true
  },

  // ═══ QTc POLYPHARMACY — CKD OBSERVATIONAL (PubMed 32056163) ═══
  "ev_qtc_polypharmacy_ckd": {
    id:"ev_qtc_polypharmacy_ckd",
    type:EVIDENCE_TIER.OBSERVATIONAL,
    title:"Adverse drug events in CKD patients: multiple drug interactions and QTc prolongation",
    year:2020, source:"Drugs & Aging",
    pmid:"32056163", doi:"10.1007/s40266-020-00747-0",
    url:"https://doi.org/10.1007/s40266-020-00747-0",
    studyDesign:"Retrospective observational (n=200 elderly CKD patients)",
    n:200, phenotypes:[],
    quantifiedEffects:{
      note:"29.5% at risk of QTc prolongation from drug combinations. 100% of patients on ≥2 'known-risk' TdP drugs had QTc prolongation. Amiodarone+citalopram most hazardous pair."
    },
    temporal:{},
    supports:["qtc_polypharmacy_risk","amiodarone_qtc","citalopram_qtc"],
    contradicts:[], limitations:["Single-center retrospective","CKD population; may not generalize","Confounding by comorbidities"], verified:true
  },

  // ═══ METHADONE QTc — OBSERVATIONAL (PubMed 25825202) ═══
  "ev_methadone_qtc_polypharmacy": {
    id:"ev_methadone_qtc_polypharmacy",
    type:EVIDENCE_TIER.OBSERVATIONAL,
    title:"Methadone therapy: QTc prolongation and concurrent QTc-prolonging drugs",
    year:2015, source:"Cardiovascular Therapeutics",
    pmid:"25825202", doi:"10.1111/1755-5922.12120",
    url:"https://doi.org/10.1111/1755-5922.12120",
    studyDesign:"Retrospective observational (n=291 patients, 856 encounters)",
    n:291, phenotypes:[],
    quantifiedEffects:{
      note:"25.6% encounters had prolonged QTc; 14.1% had QTc >500ms. Patients on ≥2 additional QTc drugs had 29% prevalence. Methadone dose-QTc correlation was weak (rho=0.09)."
    },
    temporal:{},
    supports:["methadone_qtc","qtc_polypharmacy_risk"],
    contradicts:[], limitations:["Retrospective","Hodges correction formula — may differ from Fridericia","No genotype data"], verified:true
  },

  // ═══ QTc — OLDER ADULTS REVIEW (PubMed 30747995) ═══
  "ev_qtc_older_adults_review": {
    id:"ev_qtc_older_adults_review",
    type:EVIDENCE_TIER.META_ANALYSIS,
    title:"QTc interval-prolonging therapy in nursing facility residents — navigating the minefield",
    year:2019, source:"Journal of the American Geriatrics Society",
    pmid:"30747995", doi:"10.1111/jgs.15810",
    url:"https://doi.org/10.1111/jgs.15810",
    studyDesign:"Narrative review with clinical recommendations",
    n:null, phenotypes:[],
    quantifiedEffects:{
      note:">95% of QTc drug interaction alerts are overridden in EHR systems. QTc-prolonging drug classes: anti-infectives, antidepressants, urinary anticholinergics, antipsychotics, donepezil."
    },
    temporal:{},
    supports:["qtc_polypharmacy_risk","alert_fatigue_qtc"],
    contradicts:[], limitations:["Narrative review","Nursing facility-specific population"], verified:true
  },

  // ═══ CYP2D6 GENOTYPE — CODEINE/TRAMADOL (PubMed 23759977) ═══
  "ev_cyp2d6_codeine_genotype": {
    id:"ev_cyp2d6_codeine_genotype",
    type:EVIDENCE_TIER.META_ANALYSIS,
    title:"CYP2D6 polymorphisms and pain sensitivity — codeine and tramadol response",
    year:2013, source:"Drug Metabolism and Pharmacokinetics",
    pmid:"23759977", doi:"10.2133/dmpk.dmpk-13-rv-032",
    url:"https://doi.org/10.2133/dmpk.dmpk-13-rv-032",
    studyDesign:"Systematic review of CYP2D6 genotype-phenotype studies",
    n:null, phenotypes:["poor_metabolizer","intermediate_metabolizer","normal_metabolizer","ultrarapid_metabolizer"],
    quantifiedEffects:{
      note:"PM: no morphine from codeine → inadequate analgesia. UM: excess morphine → opioid toxicity. Tramadol activation similarly CYP2D6-dependent."
    },
    temporal:{},
    supports:["codeine_cyp2d6_activation","cyp2d6_genotype_opioid"],
    contradicts:[], limitations:["Review article","CYP2D6 genotype-phenotype correlation imperfect","Conflicting results for some endpoints"], verified:true
  },

  // ═══ SEROTONIN SYNDROME — SSRI+MAOI (PubMed 16529136) ═══
  "ev_linezolid_ssri_serotonin": {
    id:"ev_linezolid_ssri_serotonin",
    type:EVIDENCE_TIER.CASE_REPORT,
    title:"Linezolid-SSRI interactions: an MAOI in disguise — anticipating serotonin syndrome",
    year:2006, source:"Mayo Clinic Proceedings",
    pmid:"16529136", doi:"10.4065/81.3.330",
    url:"https://doi.org/10.4065/81.3.330",
    studyDesign:"Case series + pharmacology review (3 clinical cases)",
    n:3, phenotypes:[],
    quantifiedEffects:{
      note:"Linezolid is a reversible non-selective MAOI. Co-administration with SSRIs causes serotonin syndrome: clonus, myoclonus, hyperthermia, agitation. Potentially fatal."
    },
    temporal:{onset:"hours_to_days", mechanism:"MAO_A_inhibition_plus_SERT_inhibition"},
    supports:["ssri_maoi_serotonin_syndrome"],
    contradicts:[], limitations:["Case series (n=3)","Severity unpredictable","Linezolid is only antibiotic in this class"], verified:true
  },

  // ═══ PAROXETINE — ASIAN CYP2D6*10 POPULATION PHARMACOGENOMICS ═══
  // Ueda et al. 2006 · Progress in Neuro-Psychopharmacology and Biological Psychiatry
  // DOI: 10.1016/j.pnpbp.2005.11.007 · 37 citations
  //
  // CRITICAL CLINICAL FINDING: The standard Caucasian PM/EM binary does NOT apply
  // to East Asian populations. CYP2D6*10 (reduced-function, not null) is at 41.8%
  // allele frequency in Japanese — meaning most Japanese patients are functional IMs,
  // not true NMs. The usual 7% PM prevalence in Caucasians is near-zero in Japanese.
  // This makes paroxetine at higher doses substantially more unpredictable in Asian patients.
  "ev_paroxetine_cyp2d6_japanese": {
    id:"ev_paroxetine_cyp2d6_japanese",
    public:false,
    type:EVIDENCE_TIER.OBSERVATIONAL,
    title:"The impact of CYP2D6 genotypes on the plasma concentration of paroxetine in Japanese psychiatric patients",
    year:2006, source:"Progress in Neuro-Psychopharmacology and Biological Psychiatry",
    pmid:null, doi:"10.1016/j.pnpbp.2005.11.007",
    url:"https://doi.org/10.1016/j.pnpbp.2005.11.007",
    studyDesign:"Observational clinical study — 55 Japanese inpatients and outpatients (31M/24F) at steady-state PAX doses 10-40mg/day",
    n:55,
    phenotypes:["poor_metabolizer","intermediate_metabolizer","normal_metabolizer"],
    quantifiedEffects:{
      note:"~500-fold interindividual variation in steady-state PAX concentration (range 1.4–524.0 ng/mL). ~70-fold variation even after dose/weight correction. Dose-concentration: 15.8, 47.4, 101.2, 177.5 ng/mL at 10, 20, 30, 40 mg/day respectively — nonlinear kinetics confirmed.",
      populationNote:"CYP2D6*10 allele frequency 41.8% in Japanese (vs ~2.8% Caucasian). CYP2D6*5: 1.8%. CYP2D6*3/*4 (Caucasian-dominant defect alleles) near-zero in Japanese.",
      genotypePK:{
        twoFunctional_ngPerMgKg:   76.7,
        oneFunctional_ngPerMgKg:   150.9,  // significantly higher (p<0.05 vs two-functional)
        zeroFunctional_ngPerMgKg:  243.6,  // at 30mg/day dose
        note:"At 30mg/day: one-non-functional-allele patients (CYP2D6*10 heterozygotes) showed 2× higher PAX concentration than two-functional-allele patients"
      }
    },
    temporal:{onset:"weeks_to_steady_state", mechanism:"CYP2D6_substrate_with_autoinhibition"},
    supports:["paroxetine_inhibits_CYP2D6","cyp2d6_genotype_paroxetine","asian_cyp2d6_variability"],
    contradicts:[],
    limitations:[
      "Single-center Japanese population — findings may not generalize to other East Asian groups without recalibration",
      "Does not distinguish CYP2D6*10 homozygotes from heterozygotes in all dose groups",
      "Small n=55; wide SD at each dose group",
      "No therapeutic outcome data — concentrations only"
    ],
    verified:true,
    clinicalImplication:"In East Asian patients, the standard Caucasian PM/NM framework underestimates metabolic variability. CYP2D6*10 (reduced-function, not null) at 41.8% allele frequency makes most Japanese patients functional intermediate metabolizers. Paroxetine TDM is especially important in this population at doses ≥30mg."
  },

  // ═══ PAROXETINE — POPULATION PK, SEX-STRATIFIED REFERENCE RANGES, HIGH-DOSE TAPER ═══
  // Huang et al. 2025 · Journal of Pharmaceutical Sciences · Vol 114, Issue 10, Article 103893
  // DOI: 10.1016/j.xphs.2025.103893 · RECENT: 3 citations as of 2026
  //
  // KEY FINDINGS NOT ELSEWHERE IN SYSTEM:
  // 1. Sex is a significant covariate of paroxetine CL/F — females have lower clearance
  // 2. Sex-specific therapeutic reference ranges (AGNP-complementary):
  //    Males: 15–125 ng/mL | Females: 30–210 ng/mL
  // 3. Nonlinear auto-inhibition kinetics: paroxetine inhibits its own CYP2D6-mediated clearance
  //    → concentration increases disproportionately with dose (especially above 30mg)
  // 4. High-dose tapering (60mg/day) must be more gradual than standard guidelines suggest
  "ev_paroxetine_ppk_sex_chinese": {
    id:"ev_paroxetine_ppk_sex_chinese",
    public:false,
    type:EVIDENCE_TIER.CLINICAL_PK,
    title:"Defining the therapeutic reference range and optimizing a high-dose discontinuation strategy for Paroxetine based on TDM and population pharmacokinetics",
    year:2025, source:"Journal of Pharmaceutical Sciences",
    pmid:null, doi:"10.1016/j.xphs.2025.103893",
    url:"https://doi.org/10.1016/j.xphs.2025.103893",
    studyDesign:"Retrospective PPK study — 360 Chinese psychiatric inpatients, 645 TDM trough concentrations, 1-compartment model (FOCE-I). Doses 10–60 mg/day. IRB-approved (retrospective waiver).",
    n:360,
    phenotypes:["normal_metabolizer"],
    quantifiedEffects:{
      note:"One-compartment PPK model. Key covariates: daily dose and sex on CL/F; formulation on V/F. Nonlinear kinetics confirmed at higher doses — auto-CYP2D6 inhibition causes disproportionate concentration increase.",
      sexSpecificRanges:{
        males_ngPerMl:   [15, 125],
        females_ngPerMl: [30, 210],
        note:"Females have approximately 2× higher serum concentrations vs males at equivalent doses, attributed to lower CL/F. Reference ranges derived from PPK simulations across commonly prescribed doses."
      },
      highDoseTaper:{
        standardGuideline:"Reduce 10mg/week to 20mg, then 1 week at 20mg, then stop",
        studyRecommendation:"More gradual reduction required for high-dose (60mg/day) patients due to nonlinear PK — abrupt reductions cause disproportionate concentration drops and Antidepressant Discontinuation Syndrome (ADDS)",
        addsSeverity:"Paroxetine causes higher proportion of ADDS than other SSRIs in FAERS database",
        tapperSuggestion:"5mg reduction every 2–4 weeks recommended for high-dose patients"
      },
      highDoseObservation:"At 60mg/day, serum concentrations frequently exceed 65 ng/mL (AGNP upper limit), confirming high-dose patients are systematically supratherapeutic by conventional reference ranges"
    },
    temporal:{onset:"weeks_to_steady_state", washout:"2-3_weeks_plus_gradual_taper_for_high_dose", mechanism:"CYP2D6_autoinhibition_nonlinear"},
    supports:["paroxetine_inhibits_CYP2D6","paroxetine_nonlinear_pk","paroxetine_sex_pk_difference"],
    contradicts:[],
    limitations:[
      "Single-center retrospective — Affiliated Brain Hospital, Guangzhou; Chinese cohort only",
      "Sparse TDM sampling (trough only) — not full PK profiles",
      "No CYP2D6 genotyping in this study (model adjusts for dose/sex/formulation but not genotype)",
      "Discontinued patients underrepresented",
      "Reference ranges are simulation-derived, not from clinical outcomes"
    ],
    verified:true,
    clinicalImplication:"Sex must be considered when interpreting paroxetine serum levels. Females at any given dose will have ~2× higher concentrations than males. Current AGNP guidelines (65–125 ng/mL) are male-centric. High-dose patients (≥40mg/day) should be tapered at 5mg/2-4 weeks, not the standard 10mg/week schedule."
  },

};

// ── Evidence Ingestion Pipeline (Phase 1 Infrastructure) ──
//
// Architecture for AI-assisted + human-reviewed study ingestion.
//
// CRITICAL WARNING: AI hallucinations in pharmacology are dangerous.
// DO NOT auto-publish extracted evidence without pharmacist/physician review.
//
// Pipeline flow:
//   PubMed / FDA / CPIC search
//   → AI extraction → normalized draft (createStudyDraft)
//   → INGESTION_QUEUE (awaiting review)
//   → human review & approval
//   → merge into STUDY_DB
//
// In a future version, this queue will be backed by a server-side review UI.
// For now it persists in memory for within-session use.

const INGESTION_QUEUE = [];   // drafts awaiting review

// createStudyDraft — create a structured evidence draft from raw inputs
// Called by future AI extraction pipeline or manual entry
function createStudyDraft({pmid, doi, title, year, source, journal, type, studyDesign, n,
                           phenotypes, quantifiedEffects, temporal, supports, contradicts, limitations}) {
  const id = `draft_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
  const draft = {
    id, _status:'pending_review',
    type: type || EVIDENCE_TIER.CLINICAL_PK,
    title: title || '',
    year: year || null,
    source: source || '',
    journal: journal || '',
    pmid: pmid || null,
    doi: doi || null,
    studyDesign: studyDesign || '',
    n: n || null,
    phenotypes: phenotypes || [],
    quantifiedEffects: quantifiedEffects || {},
    temporal: temporal || {},
    supports: supports || [],
    contradicts: contradicts || [],
    limitations: limitations || [],
    verified: false,
    verifyNote:'Auto-extracted draft — requires human pharmacist/physician review before use',
    _createdAt: new Date().toISOString(),
  };
  INGESTION_QUEUE.push(draft);
  return draft;
}

// reviewStudyDraft — approve a draft and merge into runtime STUDY_DB
// In production this would be a server-side operation with audit logging.
// For now it merges into the session-level STUDY_DB and marks as verified.
function reviewStudyDraft(draftId, reviewerNotes, approve) {
  const idx = INGESTION_QUEUE.findIndex(d => d.id === draftId);
  if (idx === -1) return { error: 'Draft not found' };
  const draft = INGESTION_QUEUE[idx];
  if (!approve) {
    draft._status = 'rejected';
    draft._reviewerNotes = reviewerNotes;
    return { status: 'rejected' };
  }
  const published = { ...draft, _status:'approved', verified:true,
    verifyNote: reviewerNotes || 'Human reviewed', _approvedAt: new Date().toISOString() };
  delete published._createdAt;
  STUDY_DB[published.id] = published;
  INGESTION_QUEUE.splice(idx, 1);
  invalidateGraph();  // graph must rebuild to pick up new evidence
  return { status:'published', id:published.id };
}

// getIngestionQueueStatus — returns summary for display
function getIngestionQueueStatus() {
  return {
    pending: INGESTION_QUEUE.filter(d => d._status === 'pending_review').length,
    rejected: INGESTION_QUEUE.filter(d => d._status === 'rejected').length,
    total: INGESTION_QUEUE.length,
  };
}

// Usage: getTemporalProfile(actorId) → { onset, offset, mechanism, reversible }
