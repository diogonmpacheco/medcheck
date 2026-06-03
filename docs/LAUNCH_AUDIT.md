# MedCheck Launch Audit

Date: 2026-06-03

This audit covers engineering consistency, release metadata, automated validation, and data-integrity checks for the public static app. It does not replace pharmacist, physician, or domain-expert review of individual clinical claims.

## Scope

- README, changelog, version metadata, generated stats, and public bundle consistency
- Data graph references across drugs, evidence entries, DDI pairs, route fractions, metabolites, and trust flags
- Severe interaction provenance coverage
- Runtime smoke and regression behavior for representative medication and genotype stacks
- Review quarantine behavior for unreviewed enrichment drafts

Browser link behavior was excluded from this pass because it was manually tested before the audit.

## Automated Gates

The release gate rebuilds the app and runs:

- Metadata verification
- Database audit
- Regression checks
- Smoke checks
- Strict validation
- Whitespace checks

Current release stats:

- 316 drugs
- 258 evidence entries
- 235 curated DDI pairs
- 25 genotype genes
- 27 metabolite actors
- 52 receptor score profiles
- 118 quarantined enrichment drafts awaiting human review

## Additional Audit Checks

The launch audit also checked for:

- Duplicate drug names
- Duplicate DDI pairs
- Missing DDI drug references
- Missing evidence references
- Conflicting trust flags, such as entries marked both verified and review-required
- Draft evidence entries not marked review-required
- Severe DDI pairs without evidence references
- Invalid route fractions
- Orphan metabolite parent links
- Runtime errors across curated and mixed medication/genotype stacks

No blocking issues were found in those checks.

## Fixes Applied

- Updated release date metadata from 2026-05-29 to 2026-06-03.
- Added a v3.5.5 changelog entry covering the PharmGx importer, evidence quarantine, severe-pair provenance batch, and latest validation pass.
- Rebuilt generated stats and the single-file app bundle.

## Residual Risks

- The 118 quarantined enrichment drafts are visible for review workflows but remain unverified until human review.
- MedCheck is an explanatory and educational tool, not a clinical decision system.
- The PharmGx importer accepts normalized phenotype and risk-marker rows; it is not a raw DNA or star-allele caller.
- D3.js is loaded from a CDN for graph visualization, so the graph panel depends on that external asset being reachable.
- A public 1.0 release still needs a product decision on tagging: either tag the current engine as the first public 1.0 release, or rename the app/package version to `1.0.0`.
