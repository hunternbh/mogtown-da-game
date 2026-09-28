'use strict';
// Only neutral role prompts are public here. Answer boxes are always empty.
const worksheetRoot = document.getElementById('worksheets');
const worksheetSelect = document.getElementById('worksheetRole');
const worksheetStatus = document.getElementById('worksheetStatus');
const printSelected = document.getElementById('printSelected');
const printAll = document.getElementById('printAll');
let worksheetRoles = [];
const escapeText = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function field(label, note = '', wide = false) {
  return `<div class="answer-field${wide ? ' wide' : ''}"><div class="answer-label">${escapeText(label)}${note ? ` <small>(${escapeText(note)})</small>` : ''}</div><div class="answer-box" aria-label="Blank handwriting space for ${escapeText(label)}"></div></div>`;
}
function pageHeader(role, group, page) {
  return `<header class="page-header"><div class="page-heading-row"><p class="page-kicker">MogTown · Group ${group} worksheet</p><span class="page-count">Page ${page} of 2</span></div><h2 id="${role.id}-page-${page}">${escapeText(role.name)}</h2><div class="member-line"><span>Members: <i class="write-line" aria-hidden="true"></i></span><span>Date: <i class="write-line" aria-hidden="true"></i></span></div></header>`;
}
function roundBlock(className, heading, prompt, fields) {
  return `<section class="round ${className}"><h3>${escapeText(heading)}</h3><p class="round-prompt">${escapeText(prompt)}</p><div class="writing-grid">${fields}</div></section>`;
}
function groupPages(role) {
  const group = worksheetRoles.indexOf(role) + 1;
  const pageOne = `<article class="print-page worksheet-page" aria-labelledby="${role.id}-page-1">
    ${pageHeader(role, group, 1)}
    <p class="mission"><strong>Your role:</strong> ${escapeText(role.mission)}</p>
    <p class="truth-rule"><strong>Truth Rule:</strong> Use unlocked evidence. Never invent data or contradict an unlocked metric. Answer direct questions about unlocked metrics truthfully.</p>
    ${roundBlock('round-one', 'Round 1 · Descriptive — What happened?', role.round1 + ' Describe facts; do not claim causes yet.',
      field('Three observations', 'include sources and units') + field('Two calculations', 'show working and units') + field('One strange pattern') + field('One unanswered question'))}
    ${roundBlock('round-two', 'Round 2 · Diagnostic — Why might it happen?', role.round2,
      field('Our hypothesis') + field('Supporting evidence', 'source and metric') + field('An alternative explanation') + field('Missing causal evidence') + field('60-second briefing', 'hypothesis, fact, uncertainty') + field('One cross-question', 'which team and what evidence?'))}
    <footer class="page-footer"><span>Group ${group} · ${escapeText(role.name)}</span><span>Continue to forecasts and decisions on page 2.</span></footer>
  </article>`;
  const pageTwo = `<article class="print-page worksheet-page" aria-labelledby="${role.id}-page-2">
    ${pageHeader(role, group, 2)}
    ${roundBlock('round-three', 'Round 3 · Predictive — What is likely next?', role.round3,
      field('Forecast working and result', 'include units') + field('Key assumption') + field('Most important driver') + field('What could make the forecast wrong?'))}
    ${roundBlock('round-four', 'Round 4 · Prescriptive — What should we do?', role.round4,
      field('Recommended action') + field('Evidence for our action') + field('Expected result') + field('Trade-off or risk') + field('Two or three KPIs', 'define each measure and when to review it', true))}
    ${roundBlock('round-final', 'Final reveal · Update your recommendation', role.final,
      field('Does our recommendation change? What new evidence caused the change?', 'explain if it stays the same', true))}
    <footer class="page-footer"><span>Group ${group} · ${escapeText(role.name)}</span><span>Use evidence. State assumptions. Explain trade-offs.</span></footer>
  </article>`;
  return pageOne + pageTwo;
}
function showWorksheets(value) {
  const selectedRoles = value === 'all' ? worksheetRoles : worksheetRoles.filter(role => role.id === value);
  worksheetRoot.innerHTML = selectedRoles.map(groupPages).join('');
  worksheetSelect.value = value;
  printSelected.textContent = value === 'all' ? 'Print all shown (14 pages)' : 'Print this group (2 pages)';
  worksheetStatus.textContent = value === 'all' ? 'All seven groups shown: 14 printable pages.' : `${selectedRoles[0].name}: 2 printable pages. Print on Letter paper at 100% scale with browser headers and footers off.`;
  const url = new URL(window.location.href);
  url.searchParams.set('role', value);
  history.replaceState(null, '', url);
  document.title = value === 'all' ? 'MogTown · Seven group worksheets' : `MogTown · ${selectedRoles[0].name} worksheet`;
}
async function initWorksheets() {
  const response = await fetch('worksheet-prompts.json');
  if (!response.ok) throw new Error('Worksheet prompts could not be loaded.');
  worksheetRoles = await response.json();
  if (!Array.isArray(worksheetRoles) || worksheetRoles.length !== 7) throw new Error('Worksheet groups are unavailable.');
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
