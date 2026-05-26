#!/usr/bin/env node
import { execFileSync } from 'child_process';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { JSDOM, VirtualConsole } from 'jsdom';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT = resolve(ROOT, '.tmp', 'regression-index.html');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function loadCase(win, drugs) {
  win.eval('activeStack = []; drugDoses && Object.keys(drugDoses).forEach(k => delete drugDoses[k]);');
  for (const drug of drugs) win.addDrug(drug);
}

function risk(win) {
  return win.eval('calcRisk()');
}

function interactions(win) {
  return risk(win).interactions || [];
}

function hasInteraction(win, expected) {
  return interactions(win).some((i) => {
    const pairMatches =
      (i.drug1 === expected.drug1 && i.drug2 === expected.drug2) ||
      (i.drug1 === expected.drug2 && i.drug2 === expected.drug1);
    return pairMatches &&
      (!expected.severity || i.severity === expected.severity) &&
      (!expected.text || `${i.mechanism} ${i.effect}`.toLowerCase().includes(expected.text.toLowerCase()));
  });
}

console.log('Building regression-test HTML...');
execFileSync(process.execPath, ['build.js', '--out', OUT], { cwd: ROOT, stdio: 'pipe' });

const html = readFileSync(OUT, 'utf8');
const browserErrors = [];
const virtualConsole = new VirtualConsole();
virtualConsole.on('jsdomError', (err) => {
  const msg = err && err.message ? err.message : String(err);
  if (!msg.includes('Could not load script: "https://cdnjs.cloudflare.com/ajax/libs/d3/')) {
    browserErrors.push(msg);
  }
});
virtualConsole.on('error', (msg) => browserErrors.push(String(msg)));

const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  resources: 'usable',
  pretendToBeVisual: true,
  virtualConsole,
  url: 'http://localhost/',
});

await new Promise((resolveReady) => setTimeout(resolveReady, 400));
const { window } = dom;

assert(window.eval('MEDCHECK_VERSION.engine') === '3.4.0', 'Regression build loaded wrong engine version');
assert(window.eval('PK_DOSE_INTERVALS.codeine') === 6, 'PK dose interval rules did not load');
assert(window.eval('PHENOTYPE_RISK_RULES.qtc.thresholds[1]') === 5, 'Phenotype risk rules did not load');
assert(window.eval('EDGE_TYPE_BASE_WEIGHT[EDGE_TYPE.SUBSTRATE_OF]') === 0.92, 'Edge base weight rules did not load');

const graphIntegrity = window.eval(`(() => {
  const graph = getInteractionGraph();
  const metaboliteEdges = graph.edges.filter(e => e.type === EDGE_TYPE.METABOLIZED_TO || e.type === EDGE_TYPE.ACTIVATES);
  const missingFrom = metaboliteEdges.filter(e => !graph.actors[e.from]).map(e => e.from + '->' + e.to);
  const missingTo = metaboliteEdges.filter(e => !graph.actors[e.to]).map(e => e.from + '->' + e.to);
  const richMetabolites = Object.keys(METABOLITE_ACTORS);
  const richWithoutFormation = richMetabolites.filter(id => !metaboliteEdges.some(e => e.to === id));
  const parentMismatch = Object.entries(METAB).filter(([drugName]) => !graph.actors[getDrugGraphId(drugName)]).map(([drugName]) => drugName);
  return { missingFrom, missingTo, richWithoutFormation, parentMismatch };
})()`);
assert(graphIntegrity.missingFrom.length === 0, `Metabolite edges with missing parent actors: ${graphIntegrity.missingFrom.slice(0, 10).join(', ')}`);
assert(graphIntegrity.missingTo.length === 0, `Metabolite edges with missing metabolite actors: ${graphIntegrity.missingTo.slice(0, 10).join(', ')}`);
assert(graphIntegrity.richWithoutFormation.length === 0, `Detailed metabolite actors without formation edges: ${graphIntegrity.richWithoutFormation.join(', ')}`);
assert(graphIntegrity.parentMismatch.length === 0, `METAB parents without drug actors: ${graphIntegrity.parentMismatch.join(', ')}`);

const metaboliteProvenance = window.eval(`(() => {
  const graph = getInteractionGraph();
  const missing = [];
  const unknownRefs = [];
  for (const rel of HIGH_IMPACT_METABOLITE_RELATIONS) {
    const from = getDrugGraphId(rel.parent);
    const edge = graph.edges.find(e =>
      e.from === from &&
      e.to === rel.metaboliteId &&
      (e.type === EDGE_TYPE.METABOLIZED_TO || e.type === EDGE_TYPE.ACTIVATES)
    );
    if (!edge) {
      missing.push(rel.parent + '->' + rel.metaboliteId + ' missing edge');
      continue;
    }
    const actorRefs = graph.actors[rel.metaboliteId]?.evidenceRefs || [];
    const edgeRefs = edge.props?.evidenceRefs || [];
    const refs = [...new Set(edgeRefs.concat(actorRefs))];
    for (const ref of rel.requiredEvidenceRefs) {
      if (!refs.includes(ref)) missing.push(rel.parent + '->' + rel.metaboliteId + ' missing ' + ref);
      if (!STUDY_DB[ref]) unknownRefs.push(ref);
    }
  }
  return { missing, unknownRefs:[...new Set(unknownRefs)] };
})()`);
assert(metaboliteProvenance.missing.length === 0, `High-impact metabolite provenance gaps: ${metaboliteProvenance.missing.join('; ')}`);
assert(metaboliteProvenance.unknownRefs.length === 0, `Unknown metabolite evidence refs: ${metaboliteProvenance.unknownRefs.join(', ')}`);

loadCase(window, ['Paroxetine', 'Codeine']);
assert(
  window.document.getElementById('genotypeBody').textContent.includes('East Asian CYP2D6 Note'),
  'CYP2D6 population note should appear when CYP2D6 is relevant'
);
assert(hasInteraction(window, {
  drug1: 'Paroxetine',
  drug2: 'Codeine',
  severity: 'severe',
  text: 'activation blocked',
}), 'Paroxetine + Codeine should flag severe CYP2D6 prodrug activation loss');
const cyp2d6Cap = window.eval('computeEnzymeCapacity("CYP2D6", activeStack)');
assert(cyp2d6Cap.capacity_pct <= 25, `Paroxetine should severely impair CYP2D6, got ${cyp2d6Cap.capacity_pct}%`);

loadCase(window, ['Grapefruit Juice']);
assert(
  !window.document.getElementById('genotypeBody').textContent.includes('East Asian CYP2D6 Note'),
  'CYP2D6 population note should not appear for CYP2D6-unrelated stacks'
);

loadCase(window, ['Warfarin', 'Ibuprofen']);
assert(hasInteraction(window, {
  drug1: 'Warfarin',
  drug2: 'Ibuprofen',
  severity: 'severe',
  text: 'bleeding',
}), 'Warfarin + Ibuprofen should flag severe bleeding risk');

loadCase(window, ['Grapefruit Juice', 'Simvastatin']);
assert(hasInteraction(window, {
  drug1: 'Grapefruit Juice',
  drug2: 'Simvastatin',
  severity: 'severe',
  text: 'rhabdomyolysis',
}), 'Grapefruit Juice + Simvastatin should flag severe rhabdomyolysis risk');
const grapefruitWashout = window.eval('computeWashoutCalendar(["Grapefruit Juice"]).find(e => e.actorId === "bergamottin")');
assert(grapefruitWashout && grapefruitWashout.days === 3, 'Grapefruit/bergamottin washout should remain 3 days');

loadCase(window, ['Rifampin', 'Simvastatin']);
const cyp3a4Cap = window.eval('computeEnzymeCapacity("CYP3A4", activeStack)');
assert(cyp3a4Cap.capacity_pct >= 130, `Rifampin should induce CYP3A4 capacity, got ${cyp3a4Cap.capacity_pct}%`);
assert(cyp3a4Cap.inducers.some((i) => i.drug === 'Rifampin'), 'CYP3A4 capacity should identify Rifampin as inducer');

loadCase(window, ['Omeprazole', 'Clopidogrel']);
assert(hasInteraction(window, {
  drug1: 'Omeprazole',
  drug2: 'Clopidogrel',
  severity: 'severe',
  text: 'active metabolite',
}), 'Omeprazole + Clopidogrel should flag severe active-metabolite loss');

loadCase(window, ['Fluoxetine']);
const fluoxetineWashout = window.eval('computeWashoutCalendar(["Fluoxetine"]).find(e => e.actorId === "norfluoxetine")');
assert(fluoxetineWashout && fluoxetineWashout.days === 35, 'Norfluoxetine washout should remain 35 days');

loadCase(window, ['Sertraline', 'Linezolid']);
const receptorRisk = window.eval('computeReceptorOccupancy(activeStack)');
assert(
  receptorRisk.active_syndromes.some((s) => s.id === 'serotonin_syndrome'),
  'Sertraline + Linezolid should cross serotonin syndrome receptor threshold'
);

loadCase(window, ['Diazepam', 'Morphine']);
const cnsRisk = window.eval('computeReceptorOccupancy(activeStack)');
assert(
  cnsRisk.active_syndromes.some((s) => s.id === 'cns_depression' && s.severity === 'critical'),
  'Diazepam + Morphine should cross respiratory depression receptor threshold'
);

assert(browserErrors.length === 0, `Browser errors:\n${browserErrors.join('\n')}`);

dom.window.close();
console.log('Regression check passed.');
