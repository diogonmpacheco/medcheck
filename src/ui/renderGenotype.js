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

  // Asian CYP2D6*10 population note — show if CYP2D6 is relevant
  if (showEnzymes.includes('CYP2D6')) {
    const asianNote = GENOTYPE_EFFECTS.CYP2D6._asianNote;
    html += `<div style="padding:8px 10px;border-radius:6px;background:var(--amberBg);border:1px solid var(--amber);font-size:11px;margin-bottom:10px">
      <strong>🌏 East Asian CYP2D6 Note:</strong> ${asianNote}
      <span style="display:block;margin-top:4px;color:var(--text2)">Source: Ueda et al. 2006 (n=55 Japanese patients) · <a href="https://doi.org/10.1016/j.pnpbp.2005.11.007" target="_blank" style="color:var(--accent)">doi:10.1016/j.pnpbp.2005.11.007</a></span>
    </div>`;
  }

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
  }
  // CPIC evidence for current genotype
  const genoStudies = Object.values(STUDY_DB).filter(s =>
    (s.phenotypes||[]).some(p => Object.values(activeGenotype).includes(p))
  );
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

function setGenotype(enzyme, phenotype) {
  activeGenotype[enzyme] = phenotype;
  renderAll();
}

// ── renderPhenotypeAccumulation (#6) ────────────────────────────────
