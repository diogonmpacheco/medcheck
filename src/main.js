// MedCheck — App initialization
// Phase A: modular source — concatenated by build.js

document.addEventListener("click", function(e) {
  if (!e.target.closest(".search-wrap")) {
    document.getElementById("searchResults").classList.remove("show");
  }
});

// Initialize
renderGenetics();
renderAll();

// ── Populate version display ──
(function() {
  const v = MEDCHECK_VERSION;
  const el = (id) => document.getElementById(id);
  if (el("ver-engine")) {
    el("ver-engine").textContent = v.engine;
    el("ver-db").textContent = v.drugDb;
    el("ver-count").textContent = v.drugCount;
    el("ver-schema").textContent = v.schema;
    el("ver-date").textContent = v.released;
  }
})();

