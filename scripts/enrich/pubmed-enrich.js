#!/usr/bin/env node
// PubMed-only enrichment draft generator.
// Stores citations + paraphrased extracted findings only; never article text.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { createHash } from 'crypto';
import { resolve } from 'path';
import vm from 'vm';

const root = resolve(new URL('../..', import.meta.url).pathname);
const OUT_DIR = resolve(root, 'scripts/enrich');
const CACHE_DIR = resolve(OUT_DIR, 'cache');
const DRAFTS_PATH = resolve(OUT_DIR, 'drafts.json');
const REPORT_PATH = resolve(OUT_DIR, 'review-report.md');

const ALLOWED_FETCH_HOSTS = new Set([
  'eutils.ncbi.nlm.nih.gov',
]);
const ALLOWED_OUTPUT_HOSTS = new Set([
  'pubmed.ncbi.nlm.nih.gov',
  'doi.org',
  'pmc.ncbi.nlm.nih.gov',
  'www.ncbi.nlm.nih.gov',
]);

const TYPE = {
  IN_VITRO: 'in_vitro',
  ANIMAL: 'animal',
  CASE_REPORT: 'case_report',
  OBSERVATIONAL: 'observational',
  CLINICAL_PK: 'clinical_pk',
  RCT: 'rct',
  META_ANALYSIS: 'meta_analysis',
  GUIDELINE: 'guideline',
  FDA_LABEL: 'fda_label',
};

function usage() {
  return `Usage:
  node scripts/enrich/pubmed-enrich.js --query "fluoxetine desipramine pharmacokinetics" --relation fluoxetine:CYP2D6 --supports fluoxetine_inhibits_CYP2D6 [--limit 10]

Options:
  --query       PubMed query string. Required unless --self-test.
  --relation    Human label for grouping report output.
  --supports    Comma-separated mechanism keys to put in draft.supports.
  --limit       Max PubMed IDs to fetch. Default: 10.
  --email       Optional NCBI tool email.
  --api-key     Optional NCBI API key.
  --self-test   Run offline guardrail tests; no network.
`;
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    if (key === 'self-test' || key === 'help') args[key] = true;
    else args[key] = argv[++i];
  }
  return args;
}

function ensureAllowedFetch(url) {
  const host = new URL(url).hostname;
  if (!ALLOWED_FETCH_HOSTS.has(host)) {
    throw new Error(`Refusing non-allowlisted fetch host: ${host}`);
  }
}

function ensureAllowedOutputUrl(url) {
  if (!url) return null;
  const host = new URL(url).hostname;
  if (!ALLOWED_OUTPUT_HOSTS.has(host)) {
    throw new Error(`Refusing non-allowlisted output URL: ${host}`);
  }
  return url;
}

function cachePath(url) {
  const key = createHash('sha256').update(url).digest('hex');
  return resolve(CACHE_DIR, `${key}.json`);
}

async function fetchJson(url) {
  ensureAllowedFetch(url);
  mkdirSync(CACHE_DIR, { recursive: true });
  const path = cachePath(url);
  if (existsSync(path)) return JSON.parse(readFileSync(path, 'utf8'));
  const res = await fetch(url, { headers: { 'user-agent': 'MedCheck enrichment tool; citation metadata only' } });
  if (!res.ok) throw new Error(`Fetch failed ${res.status} ${res.statusText}: ${url}`);
  const text = await res.text();
  writeFileSync(path, text, 'utf8');
  return JSON.parse(text);
}

async function fetchText(url) {
  ensureAllowedFetch(url);
  mkdirSync(CACHE_DIR, { recursive: true });
  const path = resolve(CACHE_DIR, `${createHash('sha256').update(url).digest('hex')}.xml`);
  if (existsSync(path)) return readFileSync(path, 'utf8');
  const res = await fetch(url, { headers: { 'user-agent': 'MedCheck enrichment tool; citation metadata only' } });
  if (!res.ok) throw new Error(`Fetch failed ${res.status} ${res.statusText}: ${url}`);
  const text = await res.text();
  writeFileSync(path, text, 'utf8');
  return text;
}

function xmlText(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
  return match ? cleanXml(match[1]) : null;
}

function xmlTexts(xml, tag) {
  return [...xml.matchAll(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'gi'))].map(m => cleanXml(m[1]));
}

function cleanXml(value) {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/\s+/g, ' ')
    .trim();
}

function loadLiveData() {
  const files = ['src/data/constants.js', 'src/data/evidence.js'];
  const code = `${files.map(f => readFileSync(resolve(root, f), 'utf8')).join('\n')}
JSON.stringify({
  studyIds: Object.keys(STUDY_DB),
  identifiers: Object.values(STUDY_DB).map(s => ({ id:s.id, pmid:s.pmid || null, doi:s.doi || null, title:s.title || '' })),
  tiers: EVIDENCE_TIER
})`;
  return JSON.parse(vm.runInNewContext(code, { console }));
}

function loadExistingDrafts() {
  if (!existsSync(DRAFTS_PATH)) return [];
  return JSON.parse(readFileSync(DRAFTS_PATH, 'utf8'));
}

function saveDrafts(drafts) {
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(DRAFTS_PATH, `${JSON.stringify(drafts, null, 2)}\n`, 'utf8');
}

function normalizeTitle(title) {
  return String(title || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function relationQuery(args) {
  const query = args.query?.trim();
  if (!query) throw new Error('--query is required');
  return query;
}

function ncbiParams(args) {
  const params = new URLSearchParams({
    db: 'pubmed',
    retmode: 'json',
    tool: 'medcheck-enrichment',
  });
  if (args.email) params.set('email', args.email);
  if (args['api-key']) params.set('api_key', args['api-key']);
  return params;
}

async function searchPubMed(query, args) {
  const params = ncbiParams(args);
  params.set('term', query);
  params.set('retmax', String(Number(args.limit || 10)));
  const data = await fetchJson(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?${params}`);
  return data.esearchresult?.idlist || [];
}

async function fetchPubMedArticles(pmids, args) {
  if (!pmids.length) return [];
  const params = ncbiParams(args);
  params.set('id', pmids.join(','));
  params.set('rettype', 'abstract');
  params.set('retmode', 'xml');
  const xml = await fetchText(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?${params}`);
  return [...xml.matchAll(/<PubmedArticle>([\s\S]*?)<\/PubmedArticle>/g)].map(m => parseArticle(m[1]));
}

function parseArticle(xml) {
  const pmid = xmlText(xml, 'PMID');
  const title = xmlText(xml, 'ArticleTitle') || '';
  const journal = xmlText(xml, 'Title') || xmlText(xml, 'ISOAbbreviation') || '';
  const year = Number(xmlText(xml, 'Year')) || null;
  const abstract = xmlTexts(xml, 'AbstractText').join(' ');
  const pubTypes = xmlTexts(xml, 'PublicationType').map(t => t.toLowerCase());
  const doiMatch = xml.match(/<ArticleId[^>]+IdType="doi"[^>]*>([\s\S]*?)<\/ArticleId>/i);
  const doi = doiMatch ? cleanXml(doiMatch[1]) : null;
  const lastNames = xmlTexts(xml, 'LastName');
  return {
    pmid,
    doi,
    title,
    year,
    source: journal,
    journal,
    firstAuthor: lastNames[0] || 'unknown',
    pubTypes,
    abstract,
    url: ensureAllowedOutputUrl(`https://pubmed.ncbi.nlm.nih.gov/${pmid}/`),
  };
}

function tierFromArticle(article) {
  const haystack = `${article.pubTypes.join(' ')} ${article.title} ${article.abstract}`.toLowerCase();
  if (haystack.includes('guideline')) return TYPE.GUIDELINE;
  if (haystack.includes('meta-analysis') || haystack.includes('systematic review')) return TYPE.META_ANALYSIS;
  if (haystack.includes('randomized controlled trial')) return TYPE.RCT;
  if (haystack.includes('case reports')) return TYPE.CASE_REPORT;
  if (haystack.includes('observational') || haystack.includes('cohort') || haystack.includes('case-control')) return TYPE.OBSERVATIONAL;
  if (haystack.includes('in vitro') || haystack.includes('microsome') || haystack.includes('recombinant')) return TYPE.IN_VITRO;
  if (haystack.includes('pharmacokinetic') || haystack.includes('auc') || haystack.includes('cmax') || haystack.includes('clearance')) return TYPE.CLINICAL_PK;
  return TYPE.OBSERVATIONAL;
}

function extractQuantifiedEffects(abstract, relation) {
  const text = abstract || '';
  const effects = {};
  const foldMatch = text.match(/(?:AUC|area under the curve|Cmax|exposure)[^.;]{0,80}?(?:increased|decreased|higher|lower|raised|reduced)?[^.;]{0,40}?(\d+(?:\.\d+)?)\s*(?:-| )?fold/i);
  const pctMatch = text.match(/(?:clearance|AUC|Cmax|exposure)[^.;]{0,80}?(\d+(?:\.\d+)?)\s*%/i);
  const nMatch = text.match(/\b(?:n\s*=\s*|in\s+)(\d{1,5})\s+(?:subjects|patients|volunteers|participants)\b/i);
  if (foldMatch) effects.aucFold = Number(foldMatch[1]);
  if (pctMatch && /clearance/i.test(pctMatch[0])) effects.clearanceReductionPct = Number(pctMatch[1]);
  const hasExtractedMetric = Number.isFinite(effects.aucFold) || Number.isFinite(effects.clearanceReductionPct);
  if (foldMatch || pctMatch) {
    const bits = [];
    if (effects.aucFold) bits.push(`approximately ${effects.aucFold}-fold exposure change`);
    if (effects.clearanceReductionPct) bits.push(`about ${effects.clearanceReductionPct}% clearance change`);
    effects.note = hasExtractedMetric
      ? `Abstract-level extraction for ${relation || 'target relation'} reports ${bits.join(' and ')}.`
      : `Citation appears relevant to ${relation || 'target relation'}, but no supported quantitative value was extractable from the abstract.`;
  } else {
    effects.note = `Citation appears relevant to ${relation || 'target relation'}, but no quantitative value was extractable from the abstract.`;
  }
  return { effects, n: nMatch ? Number(nMatch[1]) : null, hasNumber: hasExtractedMetric };
}

function studyDesign(article, tier) {
  if (tier === TYPE.RCT) return 'randomized_controlled_trial';
  if (tier === TYPE.META_ANALYSIS) return 'meta_analysis_or_systematic_review';
  if (tier === TYPE.IN_VITRO) return 'in_vitro_mechanistic_study';
  if (tier === TYPE.CASE_REPORT) return 'case_report';
  if (/pharmacokinetic|auc|cmax|clearance/i.test(`${article.title} ${article.abstract}`)) return 'clinical_pk';
  return 'observational_or_screened_pubmed_record';
}

function draftId(article, relation) {
  const rel = String(relation || 'relation').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  const author = String(article.firstAuthor || 'unknown').toLowerCase().replace(/[^a-z0-9]+/g, '');
  return `draft_${rel}_${author}${article.year || 'nd'}_${article.pmid}`;
}

function makeDraft(article, args) {
  const tier = tierFromArticle(article);
  const extraction = extractQuantifiedEffects(article.abstract, args.relation);
  const doiUrl = article.doi ? ensureAllowedOutputUrl(`https://doi.org/${article.doi}`) : null;
  return {
    id: draftId(article, args.relation),
    _status: 'pending_review',
    type: tier,
    title: article.title,
    year: article.year,
    source: article.source,
    journal: article.journal,
    pmid: article.pmid || null,
    doi: article.doi || null,
    url: doiUrl || article.url,
    studyDesign: studyDesign(article, tier),
    n: extraction.n,
    phenotypes: [],
    quantifiedEffects: extraction.effects,
    temporal: {},
    supports: (args.supports || '').split(',').map(s => s.trim()).filter(Boolean),
    contradicts: [],
    limitations: extraction.hasNumber ? ['Abstract-level extraction only; requires human review before promotion'] : ['No abstract-extractable quantitative value'],
    confidence: extraction.hasNumber ? 'moderate' : 'low',
    needsFullText: !extraction.hasNumber,
    provenance: 'search:pubmed',
    verified: false,
    verifyNote: 'Enrichment draft; requires human pharmacist/physician review before STUDY_DB promotion',
    _createdAt: new Date().toISOString(),
  };
}

function dedupeDrafts(candidates, liveData, existingDrafts) {
  const livePmids = new Set(liveData.identifiers.map(x => x.pmid).filter(Boolean).map(String));
  const liveDois = new Set(liveData.identifiers.map(x => x.doi).filter(Boolean).map(String));
  const liveTitles = new Set(liveData.identifiers.map(x => normalizeTitle(x.title)).filter(Boolean));
  const draftKeys = new Set(existingDrafts.map(d => d.doi || d.pmid || normalizeTitle(d.title)).filter(Boolean));
  const kept = [];
  const skipped = [];
  for (const draft of candidates) {
    const key = draft.doi || draft.pmid || normalizeTitle(draft.title);
    const liveHit = (draft.pmid && livePmids.has(String(draft.pmid))) ||
      (draft.doi && liveDois.has(String(draft.doi))) ||
      liveTitles.has(normalizeTitle(draft.title));
    if (liveHit) skipped.push({ id: draft.id, reason: 'already_in_STUDY_DB', title: draft.title });
    else if (draftKeys.has(key)) skipped.push({ id: draft.id, reason: 'already_in_drafts', title: draft.title });
    else {
      draftKeys.add(key);
      kept.push(draft);
    }
  }
  return { kept, skipped };
}

function writeReport({ relation, query, added, skipped }) {
  const previous = existsSync(REPORT_PATH) ? readFileSync(REPORT_PATH, 'utf8') : '# MedCheck Enrichment Review Report\n';
  const lines = [
    '',
    `## ${relation || query}`,
    '',
    `Run: ${new Date().toISOString()}`,
    `Query: \`${query}\``,
    `Added drafts: ${added.length}`,
    `Skipped duplicates: ${skipped.length}`,
    '',
    '| Draft | Tier | PMID/DOI | Finding | Confidence | Needs full text |',
    '|---|---|---|---|---|---|',
  ];
  for (const draft of added) {
    const id = draft.pmid ? `PMID:${draft.pmid}` : draft.doi ? `DOI:${draft.doi}` : 'identifier missing';
    lines.push(`| ${draft.id} | ${draft.type} | ${id} | ${draft.quantifiedEffects.note} | ${draft.confidence} | ${draft.needsFullText ? 'yes' : 'no'} |`);
  }
  if (skipped.length) {
    lines.push('', 'Skipped:', ...skipped.map(s => `- ${s.reason}: ${s.title}`));
  }
  writeFileSync(REPORT_PATH, `${previous.trimEnd()}\n${lines.join('\n')}\n`, 'utf8');
}

function selfTest() {
  let refused = false;
  try {
    ensureAllowedFetch('https://sci-hub.se/example');
  } catch {
    refused = true;
  }
  if (!refused) throw new Error('Allowlist self-test failed');
  const extraction = extractQuantifiedEffects('Drug exposure AUC increased 2.4-fold and clearance decreased 40% in 12 subjects.', 'test');
  if (extraction.effects.aucFold !== 2.4 || extraction.effects.clearanceReductionPct !== 40 || extraction.n !== 12) {
    throw new Error('Extraction self-test failed');
  }
  console.log('Enrichment self-test passed.');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }
  if (args['self-test']) {
    selfTest();
    return;
  }
  const query = relationQuery(args);
  const relation = args.relation || query;
  const liveData = loadLiveData();
  const existingDrafts = loadExistingDrafts();
  const ids = await searchPubMed(query, args);
  const articles = await fetchPubMedArticles(ids, args);
  const candidates = articles.map(article => makeDraft(article, { ...args, relation }));
  const { kept, skipped } = dedupeDrafts(candidates, liveData, existingDrafts);
  saveDrafts([...existingDrafts, ...kept]);
  writeReport({ relation, query, added: kept, skipped });
  console.log(`PubMed enrichment complete: ${kept.length} draft(s), ${skipped.length} duplicate(s).`);
  console.log(`Drafts: ${DRAFTS_PATH}`);
  console.log(`Report: ${REPORT_PATH}`);
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
