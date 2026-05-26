// MedCheck — Food, endogenous, receptor, and phenotype actor definitions
// Phase A: modular source — concatenated by build.js

const FOOD_ACTORS = {
  "solanidine": {
    id:"solanidine", type:ACTOR_TYPE.FOOD,
    name:"Solanidine (α-solanine aglycone)",
    sources:["potato","tomato","eggplant"],
    routes:[{enzyme:"CYP2D6",fraction:0.4,evidence:{confidence:"low",sources:["literature"],pmid:["11678145"]}},{enzyme:"CYP3A4",fraction:0.3,evidence:{confidence:"low",sources:["literature"]}}],
    inh:[{target:"BChE",strength:"moderate",evidence:{confidence:"moderate",sources:["literature"],pmid:["7544290"]}},{target:"AChE",strength:"weak",evidence:{confidence:"moderate",sources:["literature"]}}],
    persistence:{adiposeAccumulation:true, halfLife:48, note:"Lipophilic; accumulates with chronic exposure"},
    note:"Glycoalkaloid aglycone; CYP2D6 substrate with long t½ → chronic exposure burden in PM/null"
  },
  "bergamottin": {
    id:"bergamottin", type:ACTOR_TYPE.FOOD,
    name:"Bergamottin (6,7-dihydroxybergamottin)",
    sources:["grapefruit","seville_orange","pomelo"],
    routes:[],
    inh:[{target:"CYP3A4",strength:"strong",mechanism:"mechanism_based",evidence:{confidence:"high",sources:["FDA label","literature"],pmid:["12811365"]}},{target:"P-gp",strength:"moderate",evidence:{confidence:"high",sources:["literature"],pmid:["11687634"]}}],
    persistence:{gutWall:true, halfLife:24, note:"Destroys intestinal CYP3A4; recovery requires enzyme resynthesis (24-72h)"},
    note:"MBI of intestinal CYP3A4; single glass → 2-3 day inhibition; affects first-pass metabolism"
  },
  "indole-3-carbinol": {
    id:"indole-3-carbinol", type:ACTOR_TYPE.FOOD,
    name:"Indole-3-carbinol / DIM",
    sources:["broccoli","cabbage","brussels_sprouts","kale"],
    routes:[{enzyme:"CYP1A1",fraction:0.5}],
    inh:[],
    ind:[{target:"CYP1A2",strength:"moderate",evidence:{confidence:"moderate",sources:["literature"],pmid:["11010930"]}},{target:"CYP1A1",strength:"moderate",evidence:{confidence:"moderate",sources:["literature"]}}],
    persistence:{halfLife:4},
    note:"AhR agonist → induces CYP1A2; chronic high cruciferous intake ↓ CYP1A2 substrate exposure"
  },
  "allicin": {
    id:"allicin", type:ACTOR_TYPE.FOOD,
    name:"Allicin / Diallyl sulfide",
    sources:["garlic","onion"],
    routes:[{enzyme:"CYP2E1",fraction:0.6}],
    inh:[{target:"CYP2E1",strength:"moderate",evidence:{confidence:"moderate",sources:["literature"],pmid:["12424753"]}}],
    persistence:{halfLife:6},
    note:"CYP2E1 inhibitor → may reduce NAPQI formation from acetaminophen; protective effect"
  },
  "curcumin": {
    id:"curcumin", type:ACTOR_TYPE.FOOD,
    name:"Curcumin",
    sources:["turmeric"],
    routes:[{enzyme:"UGT",fraction:0.5},{enzyme:"SULT",fraction:0.3}],
    inh:[{target:"CYP2C9",strength:"moderate",evidence:{confidence:"moderate",sources:["literature"],pmid:["17692679"]}},{target:"CYP3A4",strength:"weak",evidence:{confidence:"low",sources:["literature"]}},{target:"UGT",strength:"weak",evidence:{confidence:"low",sources:["literature"]}}],
    persistence:{halfLife:2, note:"Very low oral bioavailability; gut effects predominate"},
    note:"Clinically relevant at supplement doses; ↑ warfarin/NSAID exposure via CYP2C9"
  },
  "piperine": {
    id:"piperine", type:ACTOR_TYPE.FOOD,
    name:"Piperine",
    sources:["black_pepper"],
    routes:[{enzyme:"CYP3A4",fraction:0.4},{enzyme:"CYP2D6",fraction:0.2}],
    inh:[{target:"CYP3A4",strength:"moderate",evidence:{confidence:"moderate",sources:["literature"],pmid:["9869591"]}},{target:"P-gp",strength:"moderate",evidence:{confidence:"moderate",sources:["literature"],pmid:["14757178"]}},{target:"UGT",strength:"weak",evidence:{confidence:"low",sources:["literature"]}}],
    persistence:{halfLife:6},
    note:"Often combined with curcumin to increase bioavailability; inhibits first-pass metabolism"
  },
};

// ── Endogenous Substrate Actors ──
// Endogenous compounds that compete for the same enzymes as drugs
const ENDOGENOUS_ACTORS = {
  "endogenous-morphine": {
    id:"endogenous-morphine", type:ACTOR_TYPE.ENDOGENOUS,
    name:"Endogenous morphine",
    routes:[{enzyme:"CYP2D6",fraction:0.6}],
    function:"Endogenous pain modulation via mu-opioid receptor",
    note:"Brain CYP2D6 converts codeine analogs; PM have altered endogenous opioid tone"
  },
  "tyramine": {
    id:"tyramine", type:ACTOR_TYPE.ENDOGENOUS,
    name:"Tyramine",
    sources:["aged_cheese","fermented_foods","wine"],
    routes:[{enzyme:"MAO-A",fraction:0.7},{enzyme:"MAO-B",fraction:0.2}],
    function:"Sympathomimetic amine; normally degraded by gut MAO",
    note:"MAO inhibitor + tyramine-rich food → hypertensive crisis"
  },
  "serotonin": {
    id:"serotonin", type:ACTOR_TYPE.ENDOGENOUS,
    name:"Serotonin (5-HT)",
    routes:[{enzyme:"MAO-A",fraction:0.8}],
    function:"Neurotransmitter; mood, sleep, GI motility",
    note:"SSRI + MAOi → serotonin accumulation → serotonin syndrome"
  },
  "dopamine": {
    id:"dopamine", type:ACTOR_TYPE.ENDOGENOUS,
    name:"Dopamine",
    routes:[{enzyme:"MAO-B",fraction:0.5},{enzyme:"COMT",fraction:0.4}],
    function:"Neurotransmitter; reward, motivation, motor control",
    note:"CYP2D6 involved in brain dopamine metabolism; PM may have altered dopaminergic tone"
  },
};

// ── Receptor Actors ──
// Pharmacological receptors as first-class graph nodes.
// Drugs and metabolites can ACTIVATE, BLOCK, or INHIBIT these receptors.
// Receptors connect to Phenotype nodes via PRODUCES edges.
const RECEPTOR_ACTORS = {
  "mu-opioid-receptor": {
    id:"mu-opioid-receptor", type:ACTOR_TYPE.RECEPTOR, name:"μ-Opioid Receptor (MOR)",
    gene:"OPRM1", tissue:[TISSUE_COMPARTMENT.BRAIN, TISSUE_COMPARTMENT.LIVER, TISSUE_COMPARTMENT.GUT],
    function:"Pain suppression, reward, respiratory drive",
    note:"Activated by morphine, O-desmethyltramadol, oxymorphone, endorphins; blocked by naloxone/naltrexone",
    produces:["analgesia_phenotype","respiratory_depression_phenotype","reward_phenotype"],
  },
  "5-ht2a-receptor": {
    id:"5-ht2a-receptor", type:ACTOR_TYPE.RECEPTOR, name:"5-HT2A Receptor",
    gene:"HTR2A", tissue:[TISSUE_COMPARTMENT.BRAIN],
    function:"Serotonin receptor; mood, cognition, psychedelic effects",
    note:"Excess serotonin activation → serotonin syndrome when combined with serotonergic drugs",
    produces:["serotonin_syndrome_phenotype","mood_effect_phenotype"],
  },
  "d2-dopamine-receptor": {
    id:"d2-dopamine-receptor", type:ACTOR_TYPE.RECEPTOR, name:"D2 Dopamine Receptor",
    gene:"DRD2", tissue:[TISSUE_COMPARTMENT.BRAIN],
    function:"Dopaminergic signaling; reward, motor control, prolactin inhibition",
    note:"Blocked by antipsychotics; altered by CYP2D6 status via endogenous dopamine metabolism",
    produces:["antipsychotic_effect_phenotype","extrapyramidal_phenotype"],
  },
  "alpha1-adrenergic": {
    id:"alpha1-adrenergic", type:ACTOR_TYPE.RECEPTOR, name:"α1-Adrenergic Receptor",
    gene:"ADRA1A", tissue:[TISSUE_COMPARTMENT.BRAIN, TISSUE_COMPARTMENT.LIVER],
    function:"Vasoconstriction, sympathetic tone",
    note:"Blocked by TCAs/antipsychotics → orthostatic hypotension",
    produces:["hypotension_phenotype"],
  },
  "mao-a-enzyme": {
    id:"mao-a-enzyme", type:ACTOR_TYPE.RECEPTOR, name:"MAO-A (Monoamine Oxidase A)",
    gene:"MAOA", tissue:[TISSUE_COMPARTMENT.GUT, TISSUE_COMPARTMENT.BRAIN, TISSUE_COMPARTMENT.LIVER],
    function:"Degrades serotonin, noradrenaline, tyramine",
    note:"Inhibited by MAOIs; serotonin/tyramine accumulate → serotonin syndrome / hypertensive crisis",
    produces:["serotonin_syndrome_phenotype","tyramine_crisis_phenotype"],
  },
  "nr1i2-pregnane-x": {
    id:"nr1i2-pregnane-x", type:ACTOR_TYPE.RECEPTOR, name:"Pregnane X Receptor (PXR/NR1I2)",
    gene:"NR1I2", tissue:[TISSUE_COMPARTMENT.LIVER, TISSUE_COMPARTMENT.GUT],
    function:"Nuclear receptor; master regulator of CYP3A4/P-gp induction",
    note:"Activated by rifampin, St. John's Wort, carbamazepine → CYP3A4 ↑↑",
    produces:["cyp3a4_induction_phenotype"],
  },
};

// ── Phenotype Actors ──
// Observable outcomes that result from drug-receptor-enzyme interactions.
// These are terminal nodes in traversal — no further downstream edges.
// Severity: 'info' < 'monitor' < 'warn' < 'critical'
const PHENOTYPE_ACTORS = {
  "analgesia_phenotype": {
    id:"analgesia_phenotype", type:ACTOR_TYPE.PHENOTYPE, name:"Analgesic Effect",
    severity:"info", direction:"beneficial",
    note:"Produced by activation of mu-opioid receptor; reduced in CYP2D6 PM with prodrug opioids",
    requires:["mu-opioid-receptor"],
  },
  "respiratory_depression_phenotype": {
    id:"respiratory_depression_phenotype", type:ACTOR_TYPE.PHENOTYPE, name:"Respiratory Depression",
    severity:"critical", direction:"adverse",
    note:"Dose-dependent mu-opioid effect; amplified by CNS depressants, benzodiazepines, alcohol",
  },
  "serotonin_syndrome_phenotype": {
    id:"serotonin_syndrome_phenotype", type:ACTOR_TYPE.PHENOTYPE, name:"Serotonin Syndrome Risk",
    severity:"critical", direction:"adverse",
    note:"Triad: mental status change, autonomic instability, neuromuscular abnormalities; caused by excess 5-HT",
  },
  "tyramine_crisis_phenotype": {
    id:"tyramine_crisis_phenotype", type:ACTOR_TYPE.PHENOTYPE, name:"Hypertensive Crisis (Tyramine)",
    severity:"critical", direction:"adverse",
    note:"MAOi + tyramine-rich food → sympathomimetic surge → BP ↑↑↑; risk of stroke",
  },
  "cyp3a4_induction_phenotype": {
    id:"cyp3a4_induction_phenotype", type:ACTOR_TYPE.PHENOTYPE, name:"CYP3A4 Induction (↓ drug levels)",
    severity:"warn", direction:"adverse",
    note:"Downstream effect of PXR activation; reduces plasma levels of CYP3A4 substrates",
  },
  "cyp2d6_burden_phenotype": {
    id:"cyp2d6_burden_phenotype", type:ACTOR_TYPE.PHENOTYPE, name:"CYP2D6 Chronic Burden",
    severity:"monitor", direction:"adverse",
    note:"Persistent competitive occupancy of CYP2D6 by chronic substrates (solanidine, etc.) reduces xenobiotic metabolism capacity, amplified in PM/null genotypes",
  },
  "qtc_prolongation_phenotype": {
    id:"qtc_prolongation_phenotype", type:ACTOR_TYPE.PHENOTYPE, name:"QTc Prolongation Risk",
    severity:"warn", direction:"adverse",
    note:"Cardiac arrhythmia risk; additive with multiple QTc-prolonging drugs",
  },
  "hypotension_phenotype": {
    id:"hypotension_phenotype", type:ACTOR_TYPE.PHENOTYPE, name:"Orthostatic Hypotension",
    severity:"monitor", direction:"adverse",
    note:"Alpha1 blockade → loss of vascular tone → falls, dizziness",
  },
  "reward_phenotype": {
    id:"reward_phenotype", type:ACTOR_TYPE.PHENOTYPE, name:"Reward / Addiction Pathway",
    severity:"monitor", direction:"contextual",
    note:"Mu-opioid + dopaminergic activation; relevant for substance use risk assessment",
  },
  "antipsychotic_effect_phenotype": {
    id:"antipsychotic_effect_phenotype", type:ACTOR_TYPE.PHENOTYPE, name:"Antipsychotic Effect",
    severity:"info", direction:"beneficial",
    note:"D2 blockade reduces positive psychotic symptoms; CYP2D6 PM → higher D2 occupancy at same dose",
  },
  "extrapyramidal_phenotype": {
    id:"extrapyramidal_phenotype", type:ACTOR_TYPE.PHENOTYPE, name:"Extrapyramidal Side Effects",
    severity:"warn", direction:"adverse",
    note:"Excess D2 blockade → akathisia, parkinsonism, tardive dyskinesia; CYP2D6 PM at higher risk",
  },
  "mood_effect_phenotype": {
    id:"mood_effect_phenotype", type:ACTOR_TYPE.PHENOTYPE, name:"Mood / Antidepressant Effect",
    severity:"info", direction:"beneficial",
    note:"5-HT2A + other serotonin receptor modulation underpins SSRI antidepressant activity",
  },
  "prodrug_failure_phenotype": {
    id:"prodrug_failure_phenotype", type:ACTOR_TYPE.PHENOTYPE, name:"Prodrug Activation Failure",
    severity:"critical", direction:"adverse",
    note:"CYP2D6 or CYP2C19 inhibition → failure to form active metabolite → therapeutic failure (codeine, tamoxifen, clopidogrel)",
  },
};

// ── Enzyme Actors ──
// Enzymes as first-class actors in the graph with capacity and expression data
