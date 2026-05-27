// MedCheck — Interaction cards, fold bars, timing, matrix
// Phase A: modular source — concatenated by build.js

function renderInteractions(interactions) {
  const el = document.getElementById("interBody");
  const countEl = document.getElementById("interCount");
  if (!interactions.length) {
    el.innerHTML = '<div style="text-align:center;color:var(--green);padding:12px;font-weight:600">No significant interactions detected</div>';
    countEl.textContent = "";
    return;
  }
  countEl.textContent = `${interactions.length} found`;
  el.innerHTML = interactions.map((i, idx) => {
    const mechText = simplifyMechanism(i);
    const studies = resolveInteractionEvidence(i);
    const hasContradiction = studies.some(s => s.contradicts && s.contradicts.length);
    const maxWeight = studies.length
      ? Math.max(...studies.map(s => EVIDENCE_WEIGHT[s.type] || 0.5))
      : null;
    const tierLabel = maxWeight
      ? studies.find(s => (EVIDENCE_WEIGHT[s.type] || 0) === maxWeight)?.type?.replace(/_/g,' ') || ''
      : '';

    const evSummary = studies.length
      ? `<div class="ev-study-count">${studies.length} supporting stud${studies.length===1?'y':'ies'} · Highest: ${tierLabel.toUpperCase()}${hasContradiction ? ' · <span style="color:var(--amber)">⚠ contradictory evidence exists</span>' : ''}</div>`
      : '';

    const evCards = studies.map(s => studyCardHTML(s)).join('');
    const evContradiction = hasContradiction
      ? `<div class="ev-contradictory"><strong>⚠ Contradictory Evidence</strong>${studies.filter(s=>s.contradicts?.length).map(s=>s.contradictoryNote||`Contradicted by: ${s.contradicts.join(', ')}`).join(' ')}</div>`
      : '';

    const evId = `ev-panel-${idx}`;
    const evToggleId = `ev-toggle-${idx}`;
    const hasEv = studies.length > 0;

    return `<div class="inter-card ${i.severity}">
      <div class="inter-head">
        <span class="inter-drugs">${i.drug1} ↔ ${i.drug2}</span>
        <span class="inter-sev ${i.severity}">${i.severity}</span>
      </div>
      <div class="inter-effect">${i.effect}</div>
      <div class="inter-mech">${mechText}</div>
      ${hasEv ? `
      ${evSummary}
      <span class="ev-toggle" id="${evToggleId}" onclick="toggleEvPanel('${evId}','${evToggleId}')">
        <span class="chevron">▾</span> Show ${studies.length} stud${studies.length===1?'y':'ies'}
      </span>
      <div class="ev-panel" id="${evId}">
        ${evCards}${evContradiction}
      </div>` : ''}
    </div>`;
  }).join("");
}

function toggleEvPanel(panelId, toggleId) {
  const panel = document.getElementById(panelId);
  const toggle = document.getElementById(toggleId);
  if (!panel || !toggle) return;
  const isOpen = panel.classList.contains('open');
  panel.classList.toggle('open', !isOpen);
  toggle.classList.toggle('open', !isOpen);
  toggle.innerHTML = `<span class="chevron">▾</span> ${isOpen ? 'Show' : 'Hide'} ${panel.querySelectorAll('.ev-card').length} stud${panel.querySelectorAll('.ev-card').length===1?'y':'ies'}`;
}

function simplifyMechanism(i) {
  if (i.mechanism) return i.mechanism;
  if (i.type === "inhibition") return `${i.drug1} slows the breakdown of ${i.drug2} by blocking ${i.enzyme}`;
  if (i.type === "induction") return `${i.drug1} speeds up the breakdown of ${i.drug2} by activating ${i.enzyme}`;
  if (i.type === "pharmacodynamic") return `Both medications have similar effects that add up`;
  if (i.type === "combination") return `Drug combination creates new substance or amplified effect`;
  if (i.type === "transporter") return `${i.drug1} blocks ${i.enzyme} transporter, increasing ${i.drug2} levels`;
  if (i.type === "metabolite-chain") return `${i.drug1}'s metabolite inhibits ${i.enzyme}, affecting ${i.drug2} metabolism`;
  return "";
}

function renderFoldBars() {
  const el = document.getElementById("foldBody");
  el.innerHTML = activeStack.map(name => {
    const result = calcFold(name);
    const fold = result.fold;
    const drug = getDrug(name);
    const isProdrug = drug && drug.prodrug;

    let color, tagText, tagColor;
    if (fold >= 4) { color = "var(--red)"; tagText = "DANGER"; tagColor = "background:var(--redBg);color:var(--red)"; }
    else if (fold >= 2) { color = "var(--amber)"; tagText = "HIGH"; tagColor = "background:var(--amberBg);color:var(--amber)"; }
    else if (fold >= 1.5) { color = "var(--amber)"; tagText = "ELEVATED"; tagColor = "background:var(--amberBg);color:var(--amber)"; }
    else if (fold <= 0.5) { color = isProdrug ? "var(--red)" : "var(--blue)"; tagText = isProdrug ? "REDUCED" : "LOW"; tagColor = isProdrug ? "background:var(--redBg);color:var(--red)" : "background:var(--blueBg);color:var(--blue)"; }
    else { color = "var(--green)"; tagText = "NORMAL"; tagColor = "background:var(--greenBg);color:var(--green)"; }

    // Normalize bar width: 1× = 50%, scale proportionally
    const barPct = Math.min(100, Math.max(5, (fold / 5) * 100));
    const normalPct = 20; // where 1× sits

    // Show details
    const detailText = result.details.length
      ? result.details.map(d => `${d.perpetrator}: ${d.enzyme} ${d.type} (${d.strength})`).join(", ")
      : "No interactions affecting levels";

    const metaboliteRows = (typeof getGenotypeMetaboliteEffectCards === 'function'
      ? getGenotypeMetaboliteEffectCards(name)
      : []
    ).map(card => renderFoldMetaboliteRow(card)).join("");

    return `<div class="fold-row">
      <div class="fold-name">${name}</div>
      <div class="fold-bar-wrap">
        <div class="fold-bar" style="width:${barPct}%;background:${color}">${fold.toFixed(1)}×</div>
      </div>
      <div class="fold-val" style="color:${color}">${fold.toFixed(1)}×<span class="fold-tag" style="${tagColor}">${tagText}</span></div>
    </div>${metaboliteRows}`;
  }).join("");
}

function renderFoldMetaboliteRow(card) {
  const { effect, phenotypeEffect } = card;
  const fold = phenotypeEffect.fold || null;
  const isIncrease = phenotypeEffect.direction === "increase";
  const isDecrease = phenotypeEffect.direction === "decrease";
  const color = isIncrease && fold && fold >= 10 ? "var(--red)" :
    isIncrease ? "var(--amber)" :
    isDecrease ? "var(--green)" :
    "var(--text2)";
  const summary = fold && fold !== 1
    ? `${fold.toFixed(fold >= 10 ? 1 : 2)}x / ${phenotypeEffect.label}`
    : phenotypeEffect.label;

  return `<div class="fold-row fold-metabolite-row">
    <div class="fold-name fold-metabolite-name">${effect.metaboliteName} <span>from ${effect.parent}</span></div>
    <div class="fold-metabolite-note" style="color:${color}">${summary}</div>
    <div class="fold-val fold-metabolite-val"></div>
  </div>`;
}

function renderMatrix(interactions) {
  const el = document.getElementById("matrixBody");
  if (activeStack.length < 2) { el.innerHTML = ""; return; }
  const drugs = activeStack;
  // Build lookup
  const lookup = {};
  interactions.forEach(i => {
    const k1 = `${i.drug1}|${i.drug2}`, k2 = `${i.drug2}|${i.drug1}`;
    if (!lookup[k1] || severityRank(i.severity) > severityRank(lookup[k1].severity)) lookup[k1] = i;
    if (!lookup[k2] || severityRank(i.severity) > severityRank(lookup[k2].severity)) lookup[k2] = i;
  });

  const shortName = n => n.length > 12 ? n.slice(0,11) + "…" : n;

  let html = '<div class="matrix-wrap"><table class="matrix"><tr><th></th>';
  drugs.forEach(d => html += `<th>${shortName(d)}</th>`);
  html += "</tr>";
  drugs.forEach((row,ri) => {
    html += `<tr><th>${shortName(row)}</th>`;
    drugs.forEach((col,ci) => {
      if (ri === ci) { html += '<td class="m-self">—</td>'; return; }
      const key = `${row}|${col}`;
      const inter = lookup[key];
      if (inter) {
        html += `<td><span class="m-sev ${inter.severity}">${inter.severity.charAt(0).toUpperCase()}</span></td>`;
      } else {
        html += '<td style="color:#cbd5e1">✓</td>';
      }
    });
    html += "</tr>";
  });
  html += "</table></div>";
  el.innerHTML = html;
}

function severityRank(s) { return s === "severe" ? 3 : s === "moderate" ? 2 : 1; }

function renderTiming() {
  const el = document.getElementById("timingBody");
  const timingLabels = { AM: "Morning", PM: "Evening", BID: "Twice Daily", ANY: "Any Time" };
  el.innerHTML = activeStack.map(name => {
    const drug = getDrug(name);
    const t = drug ? drug.timing : "ANY";
    const hl = drug ? drug.hl : 0;
    return `<div class="timing-row">
      <div class="timing-name">${name}</div>
      <span class="timing-badge ${t}">${timingLabels[t] || t}</span>
      ${hl ? `<span class="timing-hl">Half-life: ${hl}h</span>` : ""}
    </div>`;
  }).join("");
}

// ── renderEvidenceExplorer — full study browser ──
// Shows all STUDY_DB entries that are relevant to the current drug stack,
// filterable by evidence tier. Each card shows full provenance.
