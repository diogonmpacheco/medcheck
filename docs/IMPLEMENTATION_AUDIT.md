# MedCheck 3.5 Implementation Audit

Date: 2026-05-29

This note records the source audit before the provenance/reverse-traversal release work. The implementation brief is directionally correct, but the codebase has several important realities that shape the implementation.

## Confirmed Source Shapes

- `traverseEffects(startNodeId, maxDepth)` lives in `src/engine/pathwayEngine.js`. It starts from an actor id, walks outgoing graph edges, applies confidence decay through `computeEdgeConfidence(edge)`, tracks direction, temporal modifiers, and cycle protection.
- `computeEnzymeCapacity(enzyme, stack)` and `computeAllEnzymeCapacities(stack)` live in `src/engine/enzymeEngine.js`. Capacity is genotype factor multiplied by inhibitor/inducer effects and substrate burden. Mechanism-based/time-dependent inhibition uses an amplification factor of `1.3`.
- `findInteractions()` lives in `src/engine/interactionEngine.js`. It prioritizes `KNOWN_DDI`, then computes enzyme-based interactions and attaches current enzyme capacity context.
- `normalizeEvidence(interaction, studies)`, `getEvidenceSummary(drug1, drug2, enzyme)`, and `assertEvidencedSeverity(severity, drug1, drug2, enzyme)` live in `src/engine/evidenceEngine.js`. Current provenance is mostly resolved from `evidenceRefs` plus inline evidence.
- `METABOLITE_ACTORS` lives in `src/data/metabolites.js`. Metabolites may define `routes`, `inh`, `active`, `halfLife`, `potencyRatio`, and parent/forming enzyme fields.
- `GENOTYPE_EFFECTS` lives in `src/data/constants.js`. Current enzymes include CYP2D6, CYP2C19, CYP2C9, CYP2B6, DPYD, TPMT, and UGT1A1.
- `PK_PARAMS` lives in `src/data/pharmacology.js` and covers a focused set of parent drugs for PK curves.
- Main UI render flow is in `src/ui/renderCore.js`; interaction cards and fold bars are in `src/ui/renderInteractions.js`.

## Deltas From The Brief

- The app already has the tabbed UI, summary bar, Database Quality panel, Dose + Genotype Scenarios panel, metabolite fold rows, and hydroxybupropion regression coverage.
- `METABOLITE_ACTORS.hydroxybupropion.routes` already includes a CYP2D6 route, but that route is not annotated as low-confidence/provenance-bearing yet. The release should tighten this rather than add a second competing concept.
- The graph builder currently adds metabolite `SUBSTRATE_OF` edges from the compact `METAB` forming enzyme and may add inhibitor edges from `METAB.inh` or `METABOLITE_ACTORS.inh`. Detailed metabolite `routes` are not yet emitted as clearance edges into the graph.
- The brief's example saying CYP2B6 inhibition makes bupropion drop while hydroxybupropion rises is reversed. CYP2B6 forms hydroxybupropion; lower CYP2B6 activity should raise parent bupropion context and reduce hydroxybupropion formation.
- The proposed README references `docs/ARCHITECTURE.md`, but the current repo did not have a `docs/` directory before this release work.
- Existing PMIDs predate a retrieval ledger. This release bootstraps a local ledger from current curated identifiers and makes validation report unmatched future identifiers.

## Release Decision

This work is treated as MedCheck `3.5.0`: a trust/provenance and genotype-traversal release. The previous stable state is saved locally as branch `backup/pre-provenance-release-2026-05-29` and tag `v3.4.0-stable`.

## Validation Status

- `scripts/validate-db.js` treats missing or broken local evidence as warnings/errors.
- The optional external PharmGKB/CPIC comparison snapshot is informational when absent; this keeps routine validation clean without pretending an external snapshot has been downloaded.
- To enable genotype-reference diffing, add a real `scripts/reference-snapshots/pharmgx-reference.json` file with curated `GENOTYPE_EFFECTS` anchors and source metadata.
