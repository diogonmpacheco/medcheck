// MedCheck — Evidence explorer panel
// Phase A: modular source — concatenated by build.js

function renderEvidenceExplorer() {
  const el = document.getElementById("evidenceBody");
  const section = document.getElementById("evidenceSection");
  const countEl = document.getElementById("evidenceCount");
  if (!el) return;

  if (activeStack.length < 1) {
    if (section) section.style.display = "none";
    return;
  }

  // Collect all relevant studies for current stack
  const relevantStudies = new Map();
  const drugNames = activeStack.map(n => n.toLowerCase());

  for (const [sid, study] of Object.entries(STUDY_DB)) {
    if (study.public === false) continue;
    const title = (study.title || '').toLowerCase();
    const source = (study.source || '').toLowerCase();
    const supports = (study.supports || []).join(' ').toLowerCase();
    const relevantToStack = drugNames.some(name =>
      title.includes(name) || source.includes(name) || supports.includes(name));
    if (relevantToStack) relevantStudies.set(sid, study);
  }

  if (relevantStudies.size === 0) {
    if (section) section.style.display = "none";
    return;
  }

  if (section) section.style.display = "";
  if (countEl) countEl.textContent = `${relevantStudies.size} studies`;

  // Tier filter buttons
  const tiers = [...new Set([...relevantStudies.values()].map(s => s.type))].sort();
  const tierFilterHTML = `<div class="ev-explorer-filter" id="evFilterWrap">
    <span class="ev-filter-btn active" onclick="filterEvidenceTier(null,this)">All (${relevantStudies.size})</span>
    ${tiers.map(t => {
      const count = [...relevantStudies.values()].filter(s => s.type === t).length;
      return `<span class="ev-filter-btn" onclick="filterEvidenceTier('${t}',this)">${t.replace(/_/g,' ')} (${count})</span>`;
    }).join('')}
  </div>`;

  const cardsHTML = [...relevantStudies.values()]
    .sort((a,b) => (EVIDENCE_WEIGHT[b.type]||0) - (EVIDENCE_WEIGHT[a.type]||0))
    .map(s => `<div class="ev-explorer-card" data-tier="${s.type}">${studyCardHTML(s)}</div>`)
    .join('');

  el.innerHTML = tierFilterHTML + `<div id="evCardsContainer">${cardsHTML}</div>`;
}

function filterEvidenceTier(tier, btn) {
  // Update active button
  const wrap = document.getElementById('evFilterWrap');
  if (wrap) wrap.querySelectorAll('.ev-filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  // Show/hide cards
  const container = document.getElementById('evCardsContainer');
  if (!container) return;
  container.querySelectorAll('.ev-explorer-card').forEach(card => {
    card.style.display = (!tier || card.dataset.tier === tier) ? '' : 'none';
  });
}

// ── renderCascade — Explainable Graph Output ──
// Renders the traverseEffects() results as a visual pathway chain.
// Each chain shows: Source → edge → Node → edge → ... → Phenotype
// Color-coded by phenotype severity; confidence shown as percentage.
