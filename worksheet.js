'use strict';
// Each round has exactly two empty handwriting boxes; final evidence revises Round 4.
const worksheetRoot = document.getElementById('worksheets');
const worksheetSelect = document.getElementById('worksheetRole');
const worksheetStatus = document.getElementById('worksheetStatus');
const printSelected = document.getElementById('printSelected');
const printAll = document.getElementById('printAll');
let worksheetRoles = [];
const escapeText = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function field(label) {
  return `<div class="answer-field"><div class="answer-label">${escapeText(label)}</div><div class="answer-box" aria-label="Blank handwriting space: ${escapeText(label)}"></div></div>`;
}
function pageHeader(role, group, page) {
  return `<header class="page-header"><div class="page-heading-row"><p class="page-kicker">MogTown · Group ${group} worksheet</p><span class="page-count">Page ${page} of 2</span></div><h2 id="${role.id}-page-${page}">${escapeText(role.name)}</h2></header>`;
}
function roundBlock(number, heading, prompt) {
  return `<section class="round round-${number}"><h3>${escapeText(heading)}</h3><p class="round-prompt">${escapeText(prompt)}</p><div class="writing-grid">${field('What we tell the whole class')}${field('Our answer for this round')}</div></section>`;
}
function groupPages(role) {
  const group = worksheetRoles.indexOf(role) + 1;
  return `<article class="print-page worksheet-page" aria-labelledby="${role.id}-page-1">
    ${pageHeader(role, group, 1)}
    <div class="case-summary"><p><strong>The case:</strong> ${escapeText(role.case)}</p><p><strong>Your character and role:</strong> ${escapeText(role.character)}</p><p><strong>Your end goal:</strong> ${escapeText(role.goal)}</p></div>
    <p class="truth-rule"><strong>Every round:</strong> Read the released evidence, discuss, write your answer, then prepare a 30-second statement for the whole class. Use evidence; never invent data.</p>
    ${roundBlock(1, 'Round 1 · Descriptive — What happened?', role.round1)}
    ${roundBlock(2, 'Round 2 · Diagnostic — Why might it happen?', role.round2)}
    <footer class="page-footer"><span>Group ${group} · Page 1 of 2</span><span>Continue with Rounds 3 and 4.</span></footer>
  </article>
  <article class="print-page worksheet-page" aria-labelledby="${role.id}-page-2">
    ${pageHeader(role, group, 2)}
    ${roundBlock(3, 'Round 3 · Predictive — What is likely next?', role.round3)}
    ${roundBlock(4, 'Round 4 · Prescriptive — What should we do?', role.round4)}
    <p class="revision-note"><strong>After the final reveal:</strong> ${escapeText(role.final)}</p>
    <footer class="page-footer"><span>Group ${group} · Page 2 of 2</span><span>Support your final recommendation with evidence.</span></footer>
  </article>`;
}
function showWorksheets(value) {
  const selectedRoles = value === 'all' ? worksheetRoles : worksheetRoles.filter(role => role.id === value);
  worksheetRoot.innerHTML = selectedRoles.map(groupPages).join('');
  worksheetSelect.value = value;
  printSelected.textContent = value === 'all' ? 'Print all shown (14 pages)' : 'Print this group (2 pages)';
  worksheetStatus.textContent = value === 'all' ? 'All seven groups shown: 14 pages, with 8 blank boxes per group.' : `${selectedRoles[0].name}: 2 pages, with 2 blank boxes for each round. Print on Letter paper at 100% scale with browser headers and footers off.`;
  const url = new URL(window.location.href);
  url.searchParams.set('role', value);
  history.replaceState(null, '', url);
  document.title = value === 'all' ? 'MogTown · Seven group worksheets' : `MogTown · ${selectedRoles[0].name} worksheet`;
}
async function initWorksheets() {
  const response = await fetch('worksheet-prompts.json');
  if (!response.ok) throw new Error('Worksheet prompts could not be loaded.');
  worksheetRoles = await response.json();
  if (!Array.isArray(worksheetRoles) || worksheetRoles.length !== 7 || worksheetRoles.some(role => ['id','name','character','case','goal','round1','round2','round3','round4','final'].some(key => typeof role[key] !== 'string'))) throw new Error('Worksheet groups are unavailable.');
  worksheetSelect.innerHTML = worksheetRoles.map((role, index) => `<option value="${escapeText(role.id)}">Group ${index + 1} · ${escapeText(role.name)}</option>`).join('') + '<option value="all">All seven groups (14 pages)</option>';
  const requestedRole = new URLSearchParams(location.search).get('role');
  const selectedRole = requestedRole === 'all' || worksheetRoles.some(role => role.id === requestedRole) ? requestedRole : worksheetRoles[0].id;
  showWorksheets(selectedRole);
  worksheetSelect.disabled = false;
  printSelected.disabled = false;
  printAll.disabled = false;
  worksheetSelect.addEventListener('change', () => showWorksheets(worksheetSelect.value));
  printSelected.addEventListener('click', () => window.print());
  printAll.addEventListener('click', () => { showWorksheets('all'); requestAnimationFrame(() => window.print()); });
}
initWorksheets().catch(error => { worksheetStatus.textContent = `${error.message} Open through the game website, or download the PDF above.`; });
