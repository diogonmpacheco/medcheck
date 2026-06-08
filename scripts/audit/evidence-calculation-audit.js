#!/usr/bin/env node
import { readFileSync } from 'fs';
import { JSDOM, VirtualConsole } from 'jsdom';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const html = readFileSync('index.html', 'utf8');
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

const report = dom.window.eval(`(() => {
  const graph = getInteractionGraph();
  const graphPendingEvidence = new Set();
  const ddiPendingEvidence = new Set();
  const pendingOnlySevereCalibrated = [];

  for (const edge of graph.edges || []) {
    const studies = resolveEvidenceRefs(edge.props?.evidenceRefs || [], getEdgeEvidenceSupportKeys(edge));
    for (const study of studies) {
      if (study.reviewRequired === true) graphPendingEvidence.add(study.id);
    }
  }

  for (const ddi of KNOWN_DDI || []) {
    const profile = getDdiEvidenceProfile(ddi);
    for (const study of profile.studies || []) {
      if (study.reviewRequired === true) ddiPendingEvidence.add(study.id);
    }
    const onlyPending = ["severe", "critical"].includes(ddi.severity) &&
      (ddi.evidenceRefs || []).length &&
      (ddi.evidenceRefs || []).every(ref => STUDY_DB[ref]?.reviewRequired === true);
    if (onlyPending && calibrateDdiSeverity(ddi) === "severe") {
      pendingOnlySevereCalibrated.push({ pair: ddi.drug1 + " + " + ddi.drug2, refs: ddi.evidenceRefs });
    }
  }

  const fluoxetineEdge = graph.edges.find(edge =>
    edge.from === "fluoxetine" &&
    edge.to === "CYP2D6" &&
    edge.type === EDGE_TYPE.INHIBITS
  );
  const fluoxetineStudies = fluoxetineEdge
    ? resolveEvidenceRefs(fluoxetineEdge.props?.evidenceRefs || [], getEdgeEvidenceSupportKeys(fluoxetineEdge))
    : [];

  return {
    graphPendingEvidenceCount: graphPendingEvidence.size,
    ddiPendingEvidenceCount: ddiPendingEvidence.size,
    pendingOnlySevereCalibratedCount: pendingOnlySevereCalibrated.length,
    fluoxetineEdgeFound: Boolean(fluoxetineEdge),
    fluoxetineEdgeConfidence: fluoxetineEdge ? computeEdgeConfidence(fluoxetineEdge) : null,
    fluoxetinePendingEvidenceCount: fluoxetineStudies.filter(study => study.reviewRequired === true).length,
    fluoxetineEvidenceCount: fluoxetineStudies.length,
  };
})()`);

assert(browserErrors.length === 0, `Evidence calculation audit emitted browser errors: ${browserErrors.join('; ')}`);
assert(report.graphPendingEvidenceCount > 0, 'Expected pending-review evidence to feed graph edge confidence calculations');
assert(report.ddiPendingEvidenceCount > 0, 'Expected pending-review evidence to feed DDI evidence profile calculations');
assert(report.pendingOnlySevereCalibratedCount > 0, 'Expected at least one severe DDI supported only by pending-review refs to remain calculation-bearing');
assert(report.fluoxetineEdgeFound, 'Expected Fluoxetine -> CYP2D6 inhibition edge to exist');
assert(report.fluoxetinePendingEvidenceCount > 0, 'Expected Fluoxetine/CYP2D6 support-key evidence to include pending-review studies');
assert(report.fluoxetineEdgeConfidence > 0.5, `Expected Fluoxetine/CYP2D6 edge confidence to reflect linked support evidence, got ${report.fluoxetineEdgeConfidence}`);

console.log(`Evidence calculation audit passed: ${report.graphPendingEvidenceCount} pending studies feed graph confidence; ${report.ddiPendingEvidenceCount} feed DDI profiles.`);
