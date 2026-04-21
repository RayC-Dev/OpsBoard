/* ============================================================
   GRADE & SCORE - calcul multifacteur
   ============================================================ */
const GM = {
  S:{label:'TOURNE TRES BIEN',   cls:'gi-great',  vp:'vp-great',  st:'st-great'},
  A:{label:'TOURNE BIEN',        cls:'gi-well',   vp:'vp-well',   st:'st-well'},
  B:{label:'DECENT',             cls:'gi-decent', vp:'vp-decent', st:'st-decent'},
  C:{label:'LENT',               cls:'gi-tight',  vp:'vp-tight',  st:'st-tight'},
  D:{label:'FONCTIONNE A PEINE', cls:'gi-barely', vp:'vp-barely', st:'st-barely'},
  F:{label:'TROP LOURD',         cls:'gi-heavy',  vp:'vp-heavy',  st:'st-heavy'},
};

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function getModelMeta(input) {
  if (typeof input === 'object' && input) return input;
  return { vram: Number(input) || 0, arch: 'Dense' };
}

function normalizeGpuName(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\b(tm|graphics|series|laptop gpu|notebook|direct3d\d+|vs_\d+_\d+|ps_\d+_\d+)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function findGPUByRenderer(renderer) {
  const key = normalizeGpuName(renderer);
  if (!key) return null;
  const detectedVram = Number((String(renderer).match(/(\d+)\s*gb/i) || [])[1] || 0);
  const matches = GPU_LIST.filter(g => key.includes(normalizeGpuName(g.label)));
  if (!matches.length) return null;
  return matches.sort((a, b) => {
    const keyDiff = normalizeGpuName(b.label).length - normalizeGpuName(a.label).length;
    if (keyDiff !== 0) return keyDiff;
    if (detectedVram) {
      const aDelta = Math.abs(a.vram - detectedVram);
      const bDelta = Math.abs(b.vram - detectedVram);
      if (aDelta !== bDelta) return aDelta - bDelta;
    }
    return a.vram - b.vram;
  })[0];
}

function estimateTierFromHardware() {
  const bw = Number(hw.bw) || 0;
  const vram = Number(hw.vram) || 0;

  const bwTier =
    bw >= 3000 ? 10 :
    bw >= 1800 ? 9  :
    bw >= 1000 ? 8  :
    bw >= 700  ? 7  :
    bw >= 450  ? 6  :
    bw >= 320  ? 5  :
    bw >= 220  ? 4  :
    bw >= 120  ? 3  :
    bw >= 60   ? 2  : 1;

  const vramTier =
    vram >= 48 ? 10 :
    vram >= 24 ? 8  :
    vram >= 16 ? 7  :
    vram >= 12 ? 6  :
    vram >= 8  ? 5  :
    vram >= 6  ? 4  :
    vram >= 4  ? 3  :
    vram >= 2  ? 2  : 1;

  return clamp(Math.round(bwTier * 0.7 + vramTier * 0.3), 1, 10);
}

function getGpuTier() {
  return clamp(Number(hw.tier) || estimateTierFromHardware(), 1, 10);
}

function getGpuProfile() {
  const idx = Number.isInteger(hw.profileIndex) ? hw.profileIndex : Number(hw.profileIndex);
  if (!Number.isInteger(idx) || idx < 0 || idx >= GPU_LIST.length) return null;
  return GPU_LIST[idx];
}

function isCustomGPUSelected() {
  return hw.profileIndex === 'custom' || hw.profileIndex === null || typeof hw.profileIndex === 'undefined';
}

function syncTierFromProfile() {
  const profile = getGpuProfile();
  if (profile) {
    hw.tier = profile.tier || estimateTierFromHardware();
    return;
  }
  hw.tier = estimateTierFromHardware();
}

function getRamOffloadBandwidth() {
  const ram = Number(hw.ram) || 0;
  const cores = Number(hw.cores) || 4;

  const ramFactor =
    ram >= 128 ? 1.25 :
    ram >= 64  ? 1.12 :
    ram >= 32  ? 1.0  :
    ram >= 16  ? 0.86 :
    ram >= 8   ? 0.72 : 0.58;

  const coreFactor =
    cores >= 24 ? 1.18 :
    cores >= 16 ? 1.04 :
    cores >= 12 ? 0.92 :
    cores >= 8  ? 0.8  :
    cores >= 6  ? 0.68 :
    cores >= 4  ? 0.58 : 0.45;

  return Math.min(64, 28 * ramFactor * coreFactor);
}

/* Vitesse tok/s */
function getSpeed(input) {
  const m = getModelMeta(input);
  const v = m.vram;
  if (hw.bw <= 0 || hw.vram <= 0 || v <= 0) return 0;

  const archFactor = m.arch === 'MoE' ? 1.08 : 1;
  const tierFactor = 0.78 + getGpuTier() * 0.045;

  if (v <= hw.vram) {
    return (hw.bw / v) * 0.72 * tierFactor * archFactor;
  }

  const ramBw = getRamOffloadBandwidth();
  const timeVram = hw.vram / hw.bw;
  const timeRam = (v - hw.vram) / ramBw;
  const overflowPenalty = clamp((v - hw.vram) / Math.max(v, 0.01), 0, 1);
  return (v / (timeVram + timeRam)) * 0.72 * archFactor * (1 - overflowPenalty * 0.18);
}

/* Score /100 - multifacteur
   VRAM fit + vitesse GPU + RAM offload + cœurs CPU + tier GPU + archi */
function getScore(input) {
  const model = getModelMeta(input);
  const v = model.vram;
  const fitRatio = v / Math.max(hw.vram, 0.1);
  const totalMem = hw.vram + hw.ram;
  const totalFitRatio = v / Math.max(totalMem, 0.1);
  const overflow = Math.max(0, v - hw.vram);
  const overflowShare = overflow / Math.max(v, 0.1);
  const tier = getGpuTier();
  const speed = getSpeed(model);

  let vramPts;
  if      (fitRatio <= 0.40) vramPts = 38;
  else if (fitRatio <= 0.65) vramPts = Math.round(38 - (fitRatio - 0.40) / 0.25 * 6);
  else if (fitRatio <= 0.90) vramPts = Math.round(32 - (fitRatio - 0.65) / 0.25 * 10);
  else if (fitRatio <= 1.00) vramPts = Math.round(22 - (fitRatio - 0.90) / 0.10 * 10);
  else if (fitRatio <= 1.35) vramPts = Math.round(12 - (fitRatio - 1.00) / 0.35 * 8);
  else if (fitRatio <= 1.80) vramPts = Math.round(4  - (fitRatio - 1.35) / 0.45 * 4);
  else                       vramPts = 0;

  let speedPts;
  if      (speed >= 140) speedPts = 22;
  else if (speed >= 90)  speedPts = Math.round(18 + (speed - 90) / 50 * 4);
  else if (speed >= 45)  speedPts = Math.round(12 + (speed - 45) / 45 * 6);
  else if (speed >= 20)  speedPts = Math.round(7  + (speed - 20) / 25 * 5);
  else if (speed >= 6)   speedPts = Math.round(2  + (speed - 6)  / 14 * 5);
  else if (speed >= 2)   speedPts = 1;
  else                   speedPts = 0;

  let ramPts;
  if      (totalFitRatio <= 0.35) ramPts = 16;
  else if (totalFitRatio <= 0.60) ramPts = Math.round(16 - (totalFitRatio - 0.35) / 0.25 * 5);
  else if (totalFitRatio <= 0.90) ramPts = Math.round(11 - (totalFitRatio - 0.60) / 0.30 * 7);
  else if (totalFitRatio <= 1.00) ramPts = Math.round(4  - (totalFitRatio - 0.90) / 0.10 * 4);
  else                            ramPts = 0;

  let cpuPts;
  if (overflow <= 0) {
    cpuPts = clamp(Math.round((hw.cores - 4) / 4), 0, 4);
  } else if (overflowShare <= 0.15) {
    cpuPts = hw.cores >= 16 ? 8 : hw.cores >= 12 ? 7 : hw.cores >= 8 ? 6 : hw.cores >= 6 ? 4 : 2;
  } else if (overflowShare <= 0.35) {
    cpuPts = hw.cores >= 16 ? 7 : hw.cores >= 12 ? 6 : hw.cores >= 8 ? 5 : hw.cores >= 6 ? 3 : 1;
  } else if (overflowShare <= 0.60) {
    cpuPts = hw.cores >= 16 ? 5 : hw.cores >= 12 ? 4 : hw.cores >= 8 ? 3 : hw.cores >= 6 ? 2 : 0;
  } else {
    cpuPts = hw.cores >= 16 ? 2 : hw.cores >= 12 ? 1 : 0;
  }

  const tierPts = tier >= 10 ? 11 : tier >= 9 ? 10 : tier >= 8 ? 8 : tier >= 7 ? 7 : tier >= 6 ? 6 : tier >= 5 ? 4 : tier >= 3 ? 2 : 0;
  const archPts = model.arch === 'MoE' ? 5 : 2;
  const overflowPenalty = overflowShare > 0.65 ? Math.round((overflowShare - 0.65) / 0.35 * 8) : 0;

  return clamp(vramPts + speedPts + ramPts + cpuPts + tierPts + archPts - overflowPenalty, 0, 100);
}

function getGrade(input) {
  const score = getScore(input);
  if (score >= 85) return 'S';
  if (score >= 72) return 'A';
  if (score >= 58) return 'B';
  if (score >= 42) return 'C';
  if (score >= 26) return 'D';
  return 'F';
}

function speedStr(s) {
  if (s <= 0.05) return {t:'0 tok/s', c:'spd-zero'};
  if (s < 1)     return {t:'~' + s.toFixed(1) + ' tok/s', c:'spd-crawl'};
  const n = Math.round(s);
  if (n >= 80) return {t:'~' + n + ' tok/s', c:'spd-great'};
  if (n >= 30) return {t:'~' + n + ' tok/s', c:'spd-well'};
  if (n >= 10) return {t:'~' + n + ' tok/s', c:'spd-decent'};
  if (n >= 3)  return {t:'~' + n + ' tok/s', c:'spd-slow'};
  return          {t:'~' + n + ' tok/s', c:'spd-crawl'};
}

function buildGradeBar() {
  const c = {S:0, A:0, B:0, C:0, D:0, F:0};
  MODELS.forEach(m => c[getGrade(m)]++);
  const bar = document.getElementById('grade-bar');
  if (!bar) return;
  bar.innerHTML = Object.entries(c).map(([g, n]) => {
    const meta = GM[g];
    return `<div class="grade-item ${meta.cls}" onclick="qGrade('${g}')">
      <span class="grade-cnt">${n}</span>${meta.label}</div>`;
  }).join('');
}

function ensureCoresControl() {
  const disp = document.getElementById('disp-cores');
  const item = disp ? disp.closest('.hw-item') : null;
  if (!disp || !item || item.dataset.coresReady === '1') return;

  item.dataset.coresReady = '1';
  item.style.cursor = 'pointer';
  item.addEventListener('click', e => togglePopup('popup-cores', e));

  const row = item.querySelector('.hw-val-row');
  if (row && !row.querySelector('.hw-caret')) {
    const caret = document.createElement('span');
    caret.className = 'hw-caret';
    caret.textContent = '▾';
    row.appendChild(caret);
  }

  if (!document.getElementById('popup-cores')) {
    const popup = document.createElement('div');
    popup.className = 'hw-popup';
    popup.id = 'popup-cores';
    popup.innerHTML = `
      <div class="hw-popup-title">Cores CPU / threads</div>
      <input type="number" id="cores-input" value="${hw.cores || 8}" min="2" max="128" step="1" placeholder="Ex: 16">
      <button class="hw-popup-apply" onclick="applyCores()">Appliquer</button>
    `;
    popup.addEventListener('click', e => e.stopPropagation());
    item.appendChild(popup);
  }
}

function updateGpuInputState() {
  const custom = isCustomGPUSelected();
  const vramInput = document.getElementById('vram-input');
  const bwInput = document.getElementById('bw-input');
  const vramBtn = document.querySelector('#popup-vram .hw-popup-apply');
  const bwBtn = document.querySelector('#popup-bw .hw-popup-apply');
  const gpuSelect = document.getElementById('gpu-select');

  if (gpuSelect) gpuSelect.value = custom ? 'custom' : String(hw.profileIndex);
  if (vramInput) {
    vramInput.disabled = !custom;
    vramInput.title = custom ? '' : 'Verrouille par le GPU selectionne';
  }
  if (bwInput) {
    bwInput.disabled = !custom;
    bwInput.title = custom ? '' : 'Verrouille par le GPU selectionne';
  }
  if (vramBtn) {
    vramBtn.disabled = !custom;
    vramBtn.textContent = custom ? 'Appliquer' : 'Verrouille';
  }
  if (bwBtn) {
    bwBtn.disabled = !custom;
    bwBtn.textContent = custom ? 'Appliquer' : 'Verrouille';
  }
}

/* ============================================================
   HARDWARE - detection + popups
   ============================================================ */
function fillGPUSelect() {
  const sel = document.getElementById('gpu-select');
  if (!sel) return;
  const customOpt = document.createElement('option');
  customOpt.value = 'custom';
  customOpt.textContent = 'GPU personnalise';
  sel.appendChild(customOpt);
  let currentGroup = '';
  GPU_LIST.forEach((g, i) => {
    if (g.g !== currentGroup) {
      const og = document.createElement('optgroup');
      og.label = '-- ' + g.g + ' --';
      sel.appendChild(og);
      currentGroup = g.g;
    }
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = g.label;
    if (g.label.includes('RTX 5060 (8 GB)')) opt.selected = true;
    sel.lastChild.appendChild(opt);
  });
}

function applyGPU() {
  const sel = document.getElementById('gpu-select');
  if (sel.value === 'custom') {
    hw.profileIndex = 'custom';
    hw.gpu = 'GPU personnalise';
    syncTierFromProfile();
    const dg = document.getElementById('disp-gpu');
    if (dg) dg.textContent = 'GPU personnalise';
    updateGpuInputState();
    closePopups();
    renderIA();
    return;
  }

  const idx = parseInt(sel.value, 10);
  const g = GPU_LIST[idx];
  if (!g || g.vram === 0) return;
  hw.profileIndex = idx;
  hw.gpu = g.label;
  hw.vram = g.vram;
  hw.bw = g.bw;
  hw.tier = g.tier || estimateTierFromHardware();
  document.getElementById('disp-gpu').textContent = g.label.length > 20 ? g.label.substring(0, 20) + '...' : g.label;
  document.getElementById('disp-vram').textContent = g.vram + ' GB';
  document.getElementById('disp-bw').textContent = '~' + g.bw + ' GB/s';
  document.getElementById('vram-input').value = g.vram;
  document.getElementById('bw-input').value = g.bw;
  updateGpuInputState();
  closePopups();
  renderIA();
}

function applyVRAM() {
  const v = parseFloat(document.getElementById('vram-input').value);
  if (v > 0 && isCustomGPUSelected()) {
    hw.vram = v;
    document.getElementById('disp-vram').textContent = v + ' GB';
    syncTierFromProfile();
  }
  closePopups();
  renderIA();
}

function applyBW() {
  const v = parseFloat(document.getElementById('bw-input').value);
  if (v > 0 && isCustomGPUSelected()) {
    hw.bw = v;
    syncTierFromProfile();
    document.getElementById('disp-bw').textContent = '~' + v + ' GB/s';
  }
  closePopups();
  renderIA();
}

function applyRAM() {
  const v = parseFloat(document.getElementById('ram-select').value);
  hw.ram = v;
  document.getElementById('disp-ram').textContent = '>=' + v + ' GB';
  closePopups();
  renderIA();
}

function applyCores() {
  const v = parseInt(document.getElementById('cores-input').value, 10);
  if (v > 0) {
    hw.cores = v;
    document.getElementById('disp-cores').textContent = v;
  }
  closePopups();
  renderIA();
}

function qGrade(g) {
  if (typeof iaF === 'undefined') return;
  iaF.grade = g;
  const sel = document.getElementById('f-grade');
  if (sel) sel.value = g;
  renderIA();
}

function togglePopup(id, e) {
  e.stopPropagation();
  const p = document.getElementById(id);
  const was = p.classList.contains('open');
  closePopups();
  if (!was) p.classList.add('open');
}

function closePopups() {
  document.querySelectorAll('.hw-popup.open').forEach(p => p.classList.remove('open'));
}

function detectHW() {
  ensureCoresControl();
  hw.cores = navigator.hardwareConcurrency || 4;
  const dc = document.getElementById('disp-cores');
  if (dc) dc.textContent = hw.cores;
  const ci = document.getElementById('cores-input');
  if (ci) ci.value = hw.cores;

  if (navigator.deviceMemory) {
    hw.ram = navigator.deviceMemory;
    const dr = document.getElementById('disp-ram');
    if (dr) dr.textContent = '>=' + hw.ram + ' GB';
  }

  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return;

  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  if (!ext) return;

  const renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
  const gpuMatch = findGPUByRenderer(renderer);

  if (gpuMatch) {
    const profileIndex = GPU_LIST.findIndex(g => g.label === gpuMatch.label);
    hw.profileIndex = profileIndex >= 0 ? profileIndex : null;
    hw.gpu = gpuMatch.label;
    hw.vram = gpuMatch.vram;
    hw.bw = gpuMatch.bw;
    hw.tier = gpuMatch.tier || estimateTierFromHardware();

    const sel = document.getElementById('gpu-select');
    if (sel && profileIndex >= 0) sel.value = String(profileIndex);

    const dg = document.getElementById('disp-gpu');
    if (dg) dg.textContent = gpuMatch.label.length > 20 ? gpuMatch.label.substring(0, 20) + '...' : gpuMatch.label;

    const dv = document.getElementById('disp-vram');
    if (dv) dv.textContent = hw.vram + ' GB';

    const db = document.getElementById('disp-bw');
    if (db) db.textContent = '~' + hw.bw + ' GB/s';

    const vi = document.getElementById('vram-input');
    if (vi) vi.value = hw.vram;

    const bi = document.getElementById('bw-input');
    if (bi) bi.value = hw.bw;
    updateGpuInputState();
    return;
  }

  hw.gpu = renderer;
  hw.profileIndex = 'custom';
  hw.tier = estimateTierFromHardware();

  const m = renderer.match(/(\d+)\s*GB/i);
  if (m) {
    hw.vram = parseInt(m[1], 10);
    const dv = document.getElementById('disp-vram');
    if (dv) dv.textContent = hw.vram + ' GB';
    const vi = document.getElementById('vram-input');
    if (vi) vi.value = hw.vram;
  }

  const bi = document.getElementById('bw-input');
  if (bi) bi.value = hw.bw;

  const dg = document.getElementById('disp-gpu');
  if (dg) dg.textContent = renderer.length > 20 ? renderer.substring(0, 20) + '...' : renderer;
  updateGpuInputState();
}
