// Classroom obfuscation, not secure authentication. Keep private source data and codes out of Git.
'use strict';
const $ = (selector) => document.querySelector(selector);
const SESSION_KEY = 'mogtown.session.v1';
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const state = {
  manifest: null, role: null, roleCode: '', common: {}, private: {},
  unlocked: new Set([1]), roundCodes: {}, activeRound: 1, busy: false
};
const roundNames = {1: 'Descriptive', 2: 'Diagnostic', 3: 'Predictive', 4: 'Prescriptive', 5: 'Final reveal'};
const roundQuestions = {1: 'What happened?', 2: 'Why might it have happened?', 3: 'What is likely to happen next?', 4: 'What should we do?', 5: 'Does your recommendation change?'};
const roleArt = {
  glowlab: ['glowlab.png', 'Skincare & supplements'],
  jawmax: ['jawmax.png', 'Facial-training devices'],
  mirrorai: ['mirror-ai.png', 'GlowScores & recommendations'],
  primeera: ['primeera-ai.png', 'Healthy aging & professional presentation'],
  clouthouse: ['clouthouse.png', 'Creators & influencer campaigns'],
  consumer: ['consumer-protection.png', 'Consumer protection & investigations'],
  mayor: ['mayor.png', 'Jobs, growth & the city economy']
};
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char]));
function setMessage(element, message, type = '') {
  element.textContent = message;
  element.className = `message ${type}`;
}
function bytes(base64) { return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0)); }
async function decryptPayload(payload, passphrase) {
  const base = await crypto.subtle.importKey('raw', encoder.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey({name: 'PBKDF2', salt: bytes(payload.salt), iterations: 120000, hash: 'SHA-256'}, base, {name: 'AES-GCM', length: 256}, false, ['decrypt']);
  const plaintext = await crypto.subtle.decrypt({name: 'AES-GCM', iv: bytes(payload.iv)}, key, bytes(payload.ciphertext));
  return JSON.parse(decoder.decode(plaintext));
}
async function fetchJson(path) {
  const response = await fetch(path, {cache: 'no-store'});
  if (!response.ok) throw new Error(`Could not load game file: ${path}`);
  return response.json();
}
function busy(value) {
  state.busy = value;
  $('#loginBtn').disabled = value;
  $('#unlockBtn').disabled = value || state.unlocked.has(5);
  $('#logoutBtn').disabled = value;
  $('#loginForm').setAttribute('aria-busy', String(value));
  $('#unlockForm').setAttribute('aria-busy', String(value));
}
function saveSession() {
  if (!state.role) return;
  try {
    // Store keys only for this tab's session; decrypted clues stay in memory.
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({role: state.role.id, code: state.roleCode, rounds: state.roundCodes, active: state.activeRound}));
  } catch {
    setMessage($('#sessionMessage'), 'Session storage is unavailable. Keep this tab open; refreshing will require your codes again.', 'error');
  }
}
function readSession() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
    if (!saved || typeof saved.role !== 'string' || typeof saved.code !== 'string') return null;
    return saved;
  } catch { return null; }
}
function previewRole() {
  const role = state.manifest.roles.find((item) => item.id === $('#roleSelect').value);
  $('#rolePreview').classList.toggle('hidden', !role);
  if (!role) return;
  const art = roleArt[role.id];
  $('#rolePreviewImage').src = `assets/${art[0]}`;
  $('#rolePreviewImage').alt = `${role.name} representative`;
  $('#rolePreviewName').textContent = role.name;
  $('#rolePreviewDescription').textContent = art[1];
}
function showGame() {
  const role = state.role;
  const briefing = state.private[1];
  $('#loginPanel').classList.add('hidden');
  $('#game').classList.remove('hidden');
  $('#logoutBtn').classList.remove('hidden');
  document.body.classList.add('in-session');
  document.body.dataset.role = role.id;
  $('#sessionStatus').textContent = role.name;
  $('#roleName').textContent = role.name;
  $('#roleBrief').textContent = briefing.briefing || '';
  $('#roleMission').innerHTML = `<strong>Your mission:</strong> ${escapeHtml(briefing.mission)}`;
  $('#roleAvatar').src = `assets/${roleArt[role.id][0]}`;
  $('#roleAvatar').alt = `${role.name} representative`;
  $('#roleCode').value = '';
  updateNavigation();
}
function updateNavigation() {
  document.querySelectorAll('.round-tab').forEach((button) => {
    const round = Number(button.dataset.round);
    const unlocked = state.unlocked.has(round);
    button.disabled = !unlocked;
    button.classList.toggle('locked', !unlocked);
    button.classList.toggle('active', round === state.activeRound);
    button.setAttribute('aria-label', `${round === 5 ? '' : `Round ${round}: `}${roundNames[round]}${unlocked ? '' : ' (locked)'}`);
    if (round === state.activeRound) button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
  });
  const next = Math.max(...state.unlocked) + 1;
  $('#unlockHint').textContent = next > 5 ? 'All evidence is open. Revisit any round, then update your recommendation.' : `Wait for your instructor’s ${next === 5 ? 'final reveal' : `Round ${next}`} code.`;
  $('#roundCode').disabled = next > 5;
  $('#unlockBtn').disabled = state.busy || next > 5;
}
async function loadRound(round, code) {
  const key = round === 5 ? 'final' : `round${round}`;
  const common = await decryptPayload(await fetchJson(state.manifest.common[key]), code);
  let privateData = {};
  if (round <= 4) privateData = await decryptPayload(await fetchJson(`${state.role.file}.r${round}.enc.json`), `${state.roleCode}|${code}`);
  // Commit an unlock only after BOTH payloads decrypt successfully.
  state.common[round] = common;
  state.private[round] = privateData;
  state.roundCodes[round] = code;
  state.unlocked.add(round);
}
function errorMessage(error, invalidCode) {
  return error.name === 'OperationError' ? invalidCode : 'A game file could not be loaded. Check your connection and try again.';
}
async function login(event) {
  event?.preventDefault();
  if (state.busy) return;
  const role = state.manifest.roles.find((item) => item.id === $('#roleSelect').value);
  const code = $('#roleCode').value.trim().toLowerCase();
  if (!role || !code) return setMessage($('#loginMessage'), 'Choose an organization and enter its private access code.', 'error');
  busy(true);
  setMessage($('#loginMessage'), 'Opening your confidential briefing…');
  try {
    const briefing = await decryptPayload(await fetchJson(`${role.file}.brief.enc.json`), code);
    state.role = role;
    state.roleCode = code;
    state.private[1] = briefing;
    showGame();
    switchRound(1, false);
    saveSession();
    setMessage($('#loginMessage'), '');
    $('#roleName').focus();
  } catch (error) {
    setMessage($('#loginMessage'), errorMessage(error, 'Access denied. Check your organization and code.'), 'error');
  } finally { busy(false); }
}
function renderFeed(round) {
  const data = state.common[round] || {};
  const cards = (data.feed || []).map((item, index) => `<article class="feed-card"><div class="feed-meta"><span>TRENDTOK / ${String(index + 1).padStart(2, '0')}</span><span>PUBLIC</span></div><strong>${escapeHtml(item.headline)}</strong><p>${escapeHtml(item.body)}</p></article>`).join('');
  const caption = round === 5 ? 'Share of surveyed returns • one primary reason' : round === 3 ? '2027 baseline → conditional 2028 forecast' : '2026 → 2027 • industry dashboard';
  const metrics = data.metrics ? `<p class="metric-caption">${caption}</p><div class="metric-grid">${data.metrics.map((metric) => `<div class="metric"><div class="k">${escapeHtml(metric.label)}</div><div class="v">${round === 5 ? '' : `${escapeHtml(metric.from)} <span aria-label="to">→</span> `}${escapeHtml(metric.to)}</div></div>`).join('')}</div>` : '';
  $('#trendFeed').innerHTML = cards + metrics;
}
function dataTable(rows, caption) {
  if (!Array.isArray(rows) || !rows.length) return '';
  const headers = Object.keys(rows[0]);
  return `<div class="table-scroll" role="region" aria-label="${escapeHtml(caption)}" tabindex="0"><table class="data-table"><caption>${escapeHtml(caption)}</caption><thead><tr>${headers.map((header) => `<th scope="col">${escapeHtml(header)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${headers.map((header, index) => `<${index ? 'td' : 'th scope="row"'}>${escapeHtml(row[header])}</${index ? 'td' : 'th'}>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function renderRound(round) {
  const common = state.common[round] || {};
  const privateData = state.private[round] || {};
  let html = `<div class="round-title"><div class="round-badge" aria-hidden="true">${round === 5 ? '★' : round}</div><div><p class="eyebrow">${escapeHtml(roundNames[round])}</p><h2 id="activeRoundHeading" tabindex="-1">${escapeHtml(roundQuestions[round])}</h2></div></div>`;
  if (common.subtitle) html += `<p class="round-subtitle">${escapeHtml(common.subtitle)}</p>`;
  if (common.callout) html += `<div class="callout"><strong>PUBLIC UPDATE</strong><p>${escapeHtml(common.callout)}</p></div>`;
  html += dataTable(common.table, 'Public evidence');
  if (privateData.clueTitle || privateData.clue || privateData.table) html += `<div class="callout confidential-callout"><p class="tag">CONFIDENTIAL • YOUR TEAM</p><h3>${escapeHtml(privateData.clueTitle || 'Your evidence')}</h3><p>${escapeHtml(privateData.clue || '')}</p>${dataTable(privateData.table, `${state.role.name} evidence`)}</div>`;
  if (privateData.scenario) html += `<div class="callout scenario"><strong>YOUR NUMERICAL SCENARIO</strong><p>${escapeHtml(privateData.scenario)}</p></div>`;
  if (round === 2) html += '<div class="callout truth-rule"><strong>MOGTOWN TRUTH RULE</strong><p>You may selectively disclose and strategically frame evidence. You may not invent data or contradict an unlocked metric. If directly asked about an unlocked metric, answer truthfully.</p></div>';
  const tasks = [...(common.tasks || []), ...(privateData.tasks || [])];
  if (tasks.length) html += `<section class="team-task"><p class="eyebrow">DISCUSS → CALCULATE → RECORD</p><h3>Your team task</h3><ol class="task-list">${tasks.map((task) => `<li>${escapeHtml(task)}</li>`).join('')}</ol></section>`;
  $('#roundContent').innerHTML = html;
  renderFeed(round);
}
function switchRound(round, focus = true) {
  if (!state.unlocked.has(round)) return;
  state.activeRound = round;
  renderRound(round);
  updateNavigation();
  saveSession();
  if (focus) $('#activeRoundHeading').focus();
}
async function unlockNext(event) {
  event?.preventDefault();
  if (state.busy || !state.role || state.unlocked.has(5)) return;
  const code = $('#roundCode').value.trim().toLowerCase();
  if (!code) return setMessage($('#unlockMessage'), 'Enter the code released by your instructor.', 'error');
  const next = Math.max(...state.unlocked) + 1;
  busy(true);
  setMessage($('#unlockMessage'), 'Decrypting the next evidence release…');
  try {
    await loadRound(next, code);
    $('#roundCode').value = '';
    switchRound(next);
    saveSession();
    setMessage($('#unlockMessage'), `${next === 5 ? 'Final reveal' : `Round ${next}`} unlocked.`, 'ok');
  } catch (error) {
    setMessage($('#unlockMessage'), errorMessage(error, 'That code does not unlock the next round. Check the instructor’s code and try again.'), 'error');
  } finally { busy(false); }
}
function logout() {
  if (state.busy) return;
  try {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem('mogtown_role');
    sessionStorage.removeItem('mogtown_code');
  } catch { /* Storage may be disabled in the browser. */ }
  state.role = null;
  state.roleCode = '';
  state.private = {};
  state.common = {1: state.common[1]};
  state.roundCodes = {};
  state.unlocked = new Set([1]);
  state.activeRound = 1;
  document.body.classList.remove('in-session');
  delete document.body.dataset.role;
  $('#game').classList.add('hidden');
  $('#logoutBtn').classList.add('hidden');
  $('#loginPanel').classList.remove('hidden');
  $('#sessionStatus').textContent = 'AWAITING YOUR TEAM';
  for (const id of ['roleName', 'roleBrief', 'roleMission', 'roundContent', 'trendFeed']) $(`#${id}`).replaceChildren();
  $('#roleAvatar').removeAttribute('src');
  $('#roleCode').value = '';
  $('#roundCode').value = '';
  for (const id of ['sessionMessage', 'unlockMessage', 'loginMessage']) setMessage($(`#${id}`), '');
  updateNavigation();
  $('#roleSelect').focus();
}
async function restoreSession(saved) {
  const role = state.manifest.roles.find((item) => item.id === saved.role);
  if (!role) return;
  busy(true);
  setMessage($('#loginMessage'), 'Restoring your team’s evidence…');
  try {
    const briefing = await decryptPayload(await fetchJson(`${role.file}.brief.enc.json`), saved.code);
    state.role = role;
    state.roleCode = saved.code;
    state.private[1] = briefing;
    // Preserve known session keys through a temporary fetch failure. Only the
    // successfully decrypted rounds below are marked unlocked in this page.
    for (let round = 2; round <= 5; round++) {
      if (typeof saved.rounds?.[round] === 'string') state.roundCodes[round] = saved.rounds[round];
    }
    let incomplete = false;
    for (let round = 2; round <= 5; round++) {
      if (typeof saved.rounds?.[round] !== 'string') break;
      try { await loadRound(round, saved.rounds[round]); }
      catch { incomplete = true; break; }
    }
    $('#roleSelect').value = role.id;
    previewRole();
    showGame();
    switchRound(state.unlocked.has(Number(saved.active)) ? Number(saved.active) : Math.max(...state.unlocked), false);
    if (incomplete) setMessage($('#unlockMessage'), 'Some saved evidence could not be restored. Reload to retry, or re-enter the next instructor code.', 'error');
    setMessage($('#loginMessage'), '');
  } catch (error) {
    setMessage($('#loginMessage'), errorMessage(error, 'Your saved access code has changed. Enter your team’s current code to continue.'), 'error');
  } finally { busy(false); }
}
async function init() {
  if (!globalThis.crypto?.subtle) throw new Error('Web Crypto needs localhost or HTTPS.');
  state.manifest = await fetchJson('data/manifest.json');
  state.common[1] = await fetchJson(state.manifest.common.round1);
  $('#roleSelect').innerHTML = '<option value="">Choose your organization</option>' + state.manifest.roles.map((role) => `<option value="${escapeHtml(role.id)}">${escapeHtml(role.name)}</option>`).join('');
  $('#loginForm').addEventListener('submit', login);
  $('#unlockForm').addEventListener('submit', unlockNext);
  $('#roleSelect').addEventListener('change', previewRole);
  $('#logoutBtn').addEventListener('click', logout);
  document.querySelectorAll('.round-tab').forEach((button) => button.addEventListener('click', () => switchRound(Number(button.dataset.round))));
  const saved = readSession();
  if (saved) await restoreSession(saved);
  busy(false);
}
init().catch(() => {
  setMessage($('#loginMessage'), 'Game files could not be loaded. Open this page through GitHub Pages or a localhost web server, then reload.', 'error');
  $('#loginBtn').disabled = true;
});
