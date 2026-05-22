# MedCheck — Drug Interaction Checker

Free, private drug interaction checker. Enter your medications and see how they interact — no accounts, no data collection, everything runs in your browser.

**Live:** [diogonmpacheco.github.io/medcheck](https://diogonmpacheco.github.io/medcheck/)

## Features

- **234 drugs** — prescription, OTC, supplements, herbs, and recreational substances
- **Graph-based interaction engine** — 976 actors and 1,941 edges modeling drugs, metabolites, enzymes, transporters, food compounds, and endogenous substrates as a unified biochemical interaction graph
- **Metabolite cascades** — 719 metabolites as first-class entities with multi-hop chain traversal for indirect interactions
- **Dynamic route fractions** — when one enzyme pathway is inhibited, the engine redistributes metabolic load across remaining pathways based on residual capacity
- **Transporter modeling** — 7 transporters (P-gp, OATP1B1, OCT2, BCRP, OAT1, OAT3, MATE1) modeled with substrates, inhibitors, inducers, and pharmacogenetic variants at parity with CYP enzymes
- **Nonlinear PK** — variable-gamma amplification for saturable metabolism and mechanism-based auto-inhibition (paroxetine, fluoxetine)
- **Structured evidence** — every interaction edge carries confidence level, literature sources, PMIDs, and clinical fold-change data where available
- **Optional genetics** — set your CYP/transporter phenotypes for personalized AUC fold predictions grounded in published clinical studies
- **Dose-dependent modeling** — 22 drugs with dose tiers that dynamically adjust interaction severity
- **Pharmacodynamic flags** — QTc prolongation, serotonin syndrome, bleeding risk, CNS depression, anticholinergic burden, and more
- **100% private** — single HTML file, no server, no tracking, no cookies

## How to Use

1. Visit the site or open `MedCheck.html` locally
2. Search or browse to add your medications
3. View interaction warnings, AUC fold predictions, risk scores, and metabolite details
4. Optionally set your genetics and dose tiers for more accurate predictions

## Disclaimer

This tool is for educational purposes only. It does not replace professional medical advice. Always consult your doctor or pharmacist before making changes to your medications.
