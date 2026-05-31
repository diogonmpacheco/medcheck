# MedCheck Enrichment Tooling

Dev-time literature discovery lives here. It writes review drafts only; it never edits `STUDY_DB` or the shipped bundle.

First slice: PubMed search/fetch.

```bash
node scripts/enrich/pubmed-enrich.js \
  --query "fluoxetine desipramine pharmacokinetics CYP2D6" \
  --relation fluoxetine:CYP2D6 \
  --supports fluoxetine_inhibits_CYP2D6 \
  --limit 10 \
  --email you@example.com
```

Outputs:

- `scripts/enrich/drafts.json`
- `scripts/enrich/review-report.md`
- cached NCBI responses under `scripts/enrich/cache/`

Guardrails:

- fetches only from `eutils.ncbi.nlm.nih.gov`
- writes only identifiers, citation metadata, paraphrased findings, and extracted numbers
- never stores full text or verbatim abstracts
- dedupes by DOI, PMID, and normalized title against live `STUDY_DB` and existing drafts
- drafts default to `needsFullText:true` and `confidence:"low"` when no abstract-level number is extractable

Offline self-test:

```bash
node scripts/enrich/pubmed-enrich.js --self-test
```
