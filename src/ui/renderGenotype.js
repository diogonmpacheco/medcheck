// MedCheck — Genotype panel and phenotype selector
// Phase A: modular source — concatenated by build.js

function renderGenotypePanel() {
  const sec = document.getElementById("genotypeSection");
  const el = document.getElementById("genotypeBody");
  if (!el) return;
  if (activeStack.length < 1) { if (sec) sec.style.display = "none"; return; }
  if (sec) sec.style.display = "";

  // Determine which enzymes are relevant for current stack
  const relevantEnzymes = new Set();
  for (const name of activeStack) {
    const drug = DRUG_DB.find(d => d.name === name);
    if (!drug) continue;
    for (const r of (drug.routes || [])) relevantEnzymes.add(r.enzyme);
    for (const i of (drug.inh || [])) relevantEnzymes.add(i.target);
    for (const i of (drug.ind || [])) relevantEnzymes.add(i.target);
    for (const i of (drug.metInh || [])) relevantEnzymes.add(i.target);
    const diversion = PATHWAY_DIVERSION[name];
    if (diversion?.primary?.enzyme) relevantEnzymes.add(diversion.primary.enzyme);
    for (const d of (diversion?.diverted || [])) {
      if (d.enzyme) relevantEnzymes.add(d.enzyme);
    }
  }
  const showEnzymes = ['CYP2D6','CYP2C19','CYP2C9'].filter(e => {
    return relevantEnzymes.has(e);
  });
  if (showEnzymes.length === 0) {
    el.innerHTML = '<div style="color:var(--text2);font-size:12px;padding:8px">No CYP2D6/2C19/2C9-dependent drugs in current stack.</div>';
    return;
  }

  // Selector rows
  let html = '<div style="margin-bottom:12px">';
  html += '<p style="font-size:12px;color:var(--text2);margin:0 0 8px">Set your metabolizer phenotype to see how genotype changes predicted drug exposure:</p>';
  for (const enz of showEnzymes) {
    const cur = activeGenotype[enz] || GENOTYPE_PHENOTYPE.NM;
    html += `<div class="geno-selector" style="margin-bottom:6px">
      <span class="geno-enz-label">${enz}</span>`;
    for (const [k, label] of [
      [GENOTYPE_PHENOTYPE.PM,'PM'],[GENOTYPE_PHENOTYPE.IM,'IM'],
      [GENOTYPE_PHENOTYPE.NM,'NM'],[GENOTYPE_PHENOTYPE.UM,'UM']
    ]) {
      const freq = GENOTYPE_EFFECTS[enz]?.[k]?.freq_pct || '?';
      html += `<button class="geno-btn ${cur===k?'active':''}"
        onclick="setGenotype('${enz}','${k}')"
        title="Frequency: ~${freq}% of population">${label} <span style="font-weight:400;font-size:9px">${freq}%</span></button>`;
    }
    html += '</div>';
  }
  html += '</div>';

  // Effect cards for current stack
  for (const drugName of activeStack) {
    const drug = DRUG_DB.find(d => d.name === drugName);
    if (!drug) continue;
    for (const r of (drug.routes || [])) {
      const enz = r.enzyme;
      if (!GENOTYPE_EFFECTS[enz]) continue;
      const geno = activeGenotype[enz] || GENOTYPE_PHENOTYPE.NM;
      const eff = GENOTYPE_EFFECTS[enz][geno];
      if (!eff) continue;
      const fold = eff.auc_fold;
      const foldStr = fold === 1.0 ? '1× (baseline)' : fold > 1 ? `${fold.toFixed(1)}× ↑ AUC` : `${fold.toFixed(1)}× ↓ AUC`;
      const foldColor = fold > 2 ? 'var(--red)' : fold > 1.3 ? 'var(--amber)' : fold < 0.5 ? 'var(--amber)' : 'var(--green)';
      html += `<div class="geno-effect-card">
        <div class="geno-effect-title">${drugName} <span style="color:var(--text2);font-size:11px;font-weight:400">via ${enz}</span>
          <span style="float:right;font-size:18px;font-weight:800;color:${foldColor}">${foldStr}</span>
        </div>
        <div class="geno-effect-note">${eff.note}</div>
        ${fold !== 1.0 ? `<div style="font-size:10px;color:var(--text2);margin-top:4px">Population frequency: ~${eff.freq_pct}% | Vs NM baseline fold-change: ${fold.toFixed(1)}×</div>` : ''}
      </div>`;
    }
    for (const card of getGenotypeMetaboliteEffectCards(drugName)) {
      html += renderGenotypeMetaboliteEffectCard(card);
    }
  }
  // CPIC evidence for current genotype, restricted to the active stack.
  const genoStudies = getStackRelevantGenotypeStudies();
  if (genoStudies.length) {
    html += `<div style="font-size:11px;font-weight:700;color:var(--text2);margin:10px 0 5px;text-transform:uppercase;letter-spacing:0.5px">Relevant Studies for Selected Genotypes</div>`;
    for (const s of genoStudies.slice(0,5)) {
      const pct = Math.round((EVIDENCE_WEIGHT[s.type]||0.5)*100);
      html += `<div style="font-size:11px;padding:5px 8px;border-radius:6px;background:var(--card2);margin-bottom:4px;display:flex;justify-content:space-between;align-items:center">
        <span>${s.title.substring(0,70)}${s.title.length>70?'…':''}</span>
        <span style="font-size:10px;color:var(--text2);margin-left:8px;white-space:nowrap">${s.type} · ${pct}%</span>
      </div>`;
    }
  }
  el.innerHTML = html;
}

function normalizeEvidenceToken(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function addEvidenceTokens(tokens, value) {
  const normalized = normalizeEvidenceToken(value);
  if (!normalized) return;
  tokens.add(normalized);
  for (const part of normalized.split(/\s+/)) {
    if (part.length >= 4 && !part.startsWith('cyp')) tokens.add(part);
  }
}

function getStackEvidenceContext() {
  const tokens = new Set();
  const evidenceRefs = new Set();
  const graph = getInteractionGraph();

  for (const drugName of activeStack) {
    const drug = getDrug(drugName);
    const parentId = getDrugGraphId(drugName);
    addEvidenceTokens(tokens, drugName);
    addEvidenceTokens(tokens, parentId);
    for (const brand of (drug?.brandNames || [])) addEvidenceTokens(tokens, brand);
    for (const ref of (drug?.evidenceRefs || [])) evidenceRefs.add(ref);

    for (const met of (METAB[drugName] || [])) {
      const metId = getMetaboliteGraphId(met.n);
      addEvidenceTokens(tokens, met.n);
      addEvidenceTokens(tokens, metId);
      for (const ref of (met.evidenceRefs || [])) evidenceRefs.add(ref);
    }

    for (const edge of graph.edges.filter(e => e.from === parentId)) {
      const target = graph.actors[edge.to];
      if (target?.type === ACTOR_TYPE.METABOLITE) {
        addEvidenceTokens(tokens, target.id);
        addEvidenceTokens(tokens, target.name);
        for (const ref of (target.evidenceRefs || [])) evidenceRefs.add(ref);
        for (const ref of (edge.props?.evidenceRefs || [])) evidenceRefs.add(ref);
      }
    }
  }

  return { tokens:[...tokens], evidenceRefs };
}

function studyMatchesStackContext(study, context) {
  if (context.evidenceRefs.has(study.id)) return true;
  const searchText = normalizeEvidenceToken([
    study.id,
    study.title,
    study.source,
    study.journal,
    study.studyDesign,
    (study.supports || []).join(' '),
    (study.quantifiedEffects && JSON.stringify(study.quantifiedEffects)) || ''
  ].join(' '));
  return context.tokens.some(token => searchText.includes(token));
}

function getStackRelevantGenotypeStudies() {
  const selectedPhenotypes = Object.values(activeGenotype);
  const context = getStackEvidenceContext();
  return Object.values(STUDY_DB)
    .filter(s =>
      s.public !== false &&
      (s.phenotypes || []).some(p => selectedPhenotypes.includes(p)) &&
      studyMatchesStackContext(s, context)
    )
    .sort((a,b) => (EVIDENCE_WEIGHT[b.type]||0) - (EVIDENCE_WEIGHT[a.type]||0));
}

function getGenotypeMetaboliteEffectCards(drugName) {
  if (typeof GENOTYPE_METABOLITE_EFFECTS === 'undefined') return [];
  return GENOTYPE_METABOLITE_EFFECTS
    .filter(effect => effect.parent === drugName && showGenotypeMetaboliteEffect(effect))
    .map(effect => {
      const geno = activeGenotype[effect.enzyme] || GENOTYPE_PHENOTYPE.NM;
      const phenotypeEffect = effect.effects?.[geno];
      if (!phenotypeEffect) return null;
      return { effect, geno, phenotypeEffect };
    })
    .filter(Boolean);
}

function showGenotypeMetaboliteEffect(effect) {
  if (!effect || !effect.enzyme || !GENOTYPE_EFFECTS[effect.enzyme]) return false;
  const metId = effect.metaboliteId;
  const listed = (METAB[effect.parent] || []).some(m => getMetaboliteGraphId(m.n) === metId);
  if (listed) return true;
  const graph = getInteractionGraph();
  const parentId = getDrugGraphId(effect.parent);
  return graph.edges.some(e => e.from === parentId && e.to === metId);
}

function renderGenotypeMetaboliteEffectCard(card) {
  const { effect, phenotypeEffect } = card;
  const fold = phenotypeEffect.fold || null;
  const isIncrease = phenotypeEffect.direction === "increase";
  const isDecrease = phenotypeEffect.direction === "decrease";
  const foldStr = fold
    ? (fold === 1.0 ? "1x (baseline)" : fold > 1 ? `${fold.toFixed(1)}x ↑ level` : `${fold.toFixed(2)}x ↓ level`)
    : phenotypeEffect.label;
  const foldColor = isIncrease && fold && fold >= 10 ? 'var(--red)' :
    isIncrease ? 'var(--amber)' :
    isDecrease ? 'var(--green)' :
    'var(--text2)';
  const refs = (effect.evidenceRefs || []).filter(ref => STUDY_DB[ref]);
  const evidenceText = refs.length
    ? refs.map(ref => {
      const study = STUDY_DB[ref];
      return study.pmid ? `PMID:${study.pmid}` : (study.doi ? `DOI:${study.doi}` : ref);
    }).join(' · ')
    : 'Evidence pending';
  return `<div class="geno-effect-card">
    <div class="geno-effect-title">${effect.metaboliteName} <span style="color:var(--text2);font-size:11px;font-weight:400">from ${effect.parent} via ${effect.enzyme}</span>
      <span style="float:right;font-size:18px;font-weight:800;color:${foldColor}">${foldStr}</span>
    </div>
    <div class="geno-effect-note">${effect.note}</div>
    <div style="font-size:10px;color:var(--text2);margin-top:4px">${phenotypeEffect.label} · ${evidenceText}</div>
  </div>`;
}

function setGenotype(enzyme, phenotype) {
  activeGenotype[enzyme] = phenotype;
  renderAll();
}

// ── renderPhenotypeAccumulation (#6) ────────────────────────────────
