/* ============================================================
   ROUTEUR - Navigation entre les pages
   ============================================================ */
const PAGES = ['accueil','outils','systeme','monde','ia','avenir'];

function navigate(id) {
  PAGES.forEach(p => {
    const el = document.getElementById('page-' + p);
    if (el) el.classList.remove('active');
  });
  const target = document.getElementById('page-' + id);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const link = document.querySelector('[data-page="' + id + '"]');
  if (link) link.classList.add('active');

  history.pushState(null, '', '#' + id);

  if (id === 'ia')      renderIA();
  if (id === 'outils')  renderOutils();
  if (id === 'accueil') updateAccueilStats();
  if (id === 'systeme') updateSysteme();

  window.scrollTo(0, 0);
}

function initRouter() {
  const hash = window.location.hash.replace('#','') || 'accueil';
  navigate(PAGES.includes(hash) ? hash : 'accueil');
}

window.addEventListener('popstate', () => {
  const hash = window.location.hash.replace('#','') || 'accueil';
  navigate(PAGES.includes(hash) ? hash : 'accueil');
});

/* ============================================================
   FILTRES PAGE IA
   ============================================================ */
const iaF = {grade:'all', task:'all', provider:'all', sort:'score', search:'', abliterated:'all'};

/* ============================================================
   RENDU PAGE IA
   ============================================================ */
function renderIA() {
  let ms = [...MODELS];

  if (iaF.search) {
    const q = iaF.search;
    ms = ms.filter(m => m.name.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q));
  }
  if (iaF.grade !== 'all')    ms = ms.filter(m => getGrade(m) === iaF.grade);
  if (iaF.task !== 'all')     ms = ms.filter(m => m.tasks.includes(iaF.task));
  if (iaF.provider !== 'all') ms = ms.filter(m => m.provider === iaF.provider);
  if (iaF.abliterated === 'abliterated') ms = ms.filter(m => m.abliterated);
  if (iaF.abliterated === 'standard')    ms = ms.filter(m => !m.abliterated);

  switch (iaF.sort) {
    case 'score':
      ms.sort((a, b) => getScore(b) - getScore(a) || getSpeed(b) - getSpeed(a) || a.vram - b.vram);
      break;
    case 'params_asc':
      ms.sort((a, b) => a.params - b.params);
      break;
    case 'params_desc':
      ms.sort((a, b) => b.params - a.params);
      break;
    case 'vram':
      ms.sort((a, b) => a.vram - b.vram);
      break;
    case 'newest':
      ms.sort((a, b) => b.released.localeCompare(a.released));
      break;
    case 'speed':
      ms.sort((a, b) => getSpeed(b) - getSpeed(a) || getScore(b) - getScore(a));
      break;
    default:
      ms.sort((a, b) => getScore(b) - getScore(a) || a.vram - b.vram);
  }

  buildGradeBar();
  const meta = document.getElementById('ia-meta');
  if (meta) meta.textContent = ms.length + ' modele' + (ms.length !== 1 ? 's' : '') + ' affiche' + (ms.length !== 1 ? 's' : '');

  const list = document.getElementById('ia-list');
  if (!list) return;

  if (!ms.length) {
    list.innerHTML = `<div class="model-empty">Aucun modele trouve.<br><button onclick="resetIAF()">Reinitialiser les filtres</button></div>`;
    return;
  }

  list.innerHTML = ms.map((m, i) => {
    const g = getGrade(m);
    const gm = GM[g];
    const sc = getScore(m);
    const sp = speedStr(getSpeed(m));
    const pct = Math.round(m.vram / hw.vram * 100);
    const pctLabel = pct > 100 ? pct + '% -> RAM' : pct + '%';
    const capHtml = m.caps.map(capBadge).join('');
    const ablHtml = abliteratedBadge(m.abliterated);
    const licHtml = licBadge(m.lic, m.licLabel);
    return `<div class="model-row" style="animation-delay:${Math.min(i,40)*12}ms">
      <div class="model-left">
        <span class="model-name">${m.name}</span>
        <div class="model-badges">${capHtml}${ablHtml}${licHtml}</div>
      </div>
      <div class="model-age">${m.age}</div>
      <div class="model-vram"><span class="model-vram-gb">${m.vram} GB</span><span class="vram-pct ${gm.vp}">${pctLabel}</span></div>
      <div class="model-ctx">${m.ctx} ctx</div>
      <div class="model-speed ${sp.c}">${sp.t}</div>
      <div class="model-status"><span class="status-label ${gm.st}">${gm.label}</span><span class="status-score">${sc}/100</span></div>
    </div>`;
  }).join('');
}

function resetIAF() {
  Object.assign(iaF,{grade:'all',task:'all',provider:'all',sort:'score',search:'',abliterated:'all'});
  ['f-grade','f-task','f-provider','f-sort','f-abliterated'].forEach(id => {
    const e = document.getElementById(id);
    if (e) e.value = 'all';
  });
  const fSort = document.getElementById('f-sort');
  if (fSort) fSort.value = 'score';
  const si = document.getElementById('ia-search');
  if (si) si.value = '';
  renderIA();
}

/* ============================================================
   PAGE ACCUEIL
   ============================================================ */
function updateAccueilStats() {
  const c = {S:0, A:0, B:0, C:0, D:0, F:0};
  MODELS.forEach(m => c[getGrade(m)]++);
  const e = id => document.getElementById(id);
  if (e('s-total')) e('s-total').textContent = MODELS.length;
  if (e('s-run'))   e('s-run').textContent = c.S + c.A + c.B + c.C;
  if (e('s-gpu'))   e('s-gpu').textContent = GPU_LIST.length;
  if (e('s-heavy')) e('s-heavy').textContent = c.F;
}

/* ============================================================
   PAGE SYSTEME
   ============================================================ */
function updateSysteme() {
  const e = id => document.getElementById(id);
  if (e('sv-ram'))   e('sv-ram').textContent = hw.ram ? hw.ram + ' GB' : '-';
  if (e('sv-vram'))  e('sv-vram').textContent = hw.vram + ' GB';
  if (e('sv-cores')) e('sv-cores').textContent = hw.cores;
}

/* ============================================================
   PAGE OUTILS - localStorage
   ============================================================ */
const BADGE_COLORS = ['green','blue','purple','yellow','red','pink','orange','teal'];
let selBadges = [];

function loadTools() { try { return JSON.parse(localStorage.getItem('outils') || '[]'); } catch { return []; } }
function saveTools(t) { localStorage.setItem('outils', JSON.stringify(t)); }

function addTool() {
  const name = document.getElementById('tool-name').value.trim();
  const url = document.getElementById('tool-url').value.trim();
  if (!name || !url) { alert('Nom et URL obligatoires.'); return; }
  const full = url.startsWith('http') ? url : 'https://' + url;
  const tools = loadTools();
  tools.unshift({id:Date.now(), name, url:full, badges:[...selBadges], addedAt:new Date().toLocaleDateString('fr-FR')});
  saveTools(tools);
  document.getElementById('tool-name').value = '';
  document.getElementById('tool-url').value = '';
  selBadges = [];
  document.querySelectorAll('.badge-option').forEach(b => b.className = 'badge-option');
  renderOutils();
}

function deleteTool(id, e) {
  e.stopPropagation();
  saveTools(loadTools().filter(t => t.id !== id));
  renderOutils();
}

function toggleBadge(c, el) {
  const cls = 'sel-' + c;
  if (el.classList.contains(cls)) {
    el.classList.remove(cls, 'selected');
    selBadges = selBadges.filter(b => b !== c);
  } else {
    el.classList.add(cls, 'selected');
    selBadges.push(c);
  }
}

function openTool(url) {
  window.open(url, '_blank', 'noopener,noreferrer');
}

function renderOutils() {
  const tools = loadTools();
  const q = (document.getElementById('tools-search')?.value || '').toLowerCase();
  const filtered = q ? tools.filter(t => t.name.toLowerCase().includes(q) || t.url.toLowerCase().includes(q)) : tools;
  const cnt = document.getElementById('tools-count');
  if (cnt) cnt.textContent = filtered.length + ' outil' + (filtered.length !== 1 ? 's' : '');
  const list = document.getElementById('tools-list');
  if (!list) return;
  if (!filtered.length) {
    list.innerHTML = `<div class="tools-empty">${tools.length ? 'Aucun resultat.' : 'Aucun outil enregistre. Ajoutez-en un ci-dessus !'}</div>`;
    return;
  }
  list.innerHTML = filtered.map(t => {
    const bHtml = t.badges.map(b => `<span class="tool-badge tb-${b}">${b}</span>`).join('');
    let disp = t.url;
    try { disp = new URL(t.url).hostname; } catch {}
    return `<div class="tool-row" onclick="openTool('${t.url}')">
      <div class="tool-left"><span class="tool-name">${t.name}</span><div class="tool-badges">${bHtml}</div></div>
      <div class="tool-url">${disp}</div>
      <div class="tool-date">Ajoute le ${t.addedAt}</div>
      <button class="tool-del" onclick="deleteTool(${t.id},event)">Suppr.</button>
    </div>`;
  }).join('');
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', function(){
  document.addEventListener('click', e => { if (!e.target.closest('.hw-popup')) closePopups(); });
  document.querySelectorAll('.hw-popup').forEach(p => p.addEventListener('click', e => e.stopPropagation()));

  fillGPUSelect();
  detectHW();

  const si = document.getElementById('ia-search');
  if (si) {
    si.addEventListener('input', e => { iaF.search = e.target.value.toLowerCase().trim(); renderIA(); });
    si.addEventListener('keydown', e => { if (e.key === 'Escape') { e.target.value = ''; iaF.search = ''; renderIA(); } });
  }

  document.addEventListener('keydown', e => {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.getElementById('page-ia').classList.contains('active')) {
      e.preventDefault();
      document.getElementById('ia-search')?.focus();
    }
  });

  [['f-grade','grade'],['f-task','task'],['f-provider','provider'],['f-sort','sort'],['f-abliterated','abliterated']].forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', e => { iaF[key] = e.target.value; renderIA(); });
  });

  document.getElementById('tools-search')?.addEventListener('input', () => renderOutils());

  initRouter();
});
