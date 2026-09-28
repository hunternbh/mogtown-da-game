// A local presentation aid. No code validation, persistence, or network requests.
'use strict';
const byId = id => document.getElementById(id);
const stages = {
  '1': {title: 'What happened?', minutes: 10, prompt: 'Record three observations, two calculations, one strange pattern, and one unanswered question. Describe the evidence before proposing causes.', tip: "Round 1 opens with the team's private role code. Distribute those privately."},
  '2': {title: 'Why might it be happening?', minutes: 15, prompt: 'Build one hypothesis, cite supporting evidence, offer an alternative explanation, and name missing causal evidence. Give each team a 60-second briefing and one cross-question.', tip: 'Release the shared Round 2 code when all teams have completed their descriptive work.'},
  '3': {title: 'What is likely to happen next?', minutes: 12, prompt: 'Calculate the numerical scenario. State a key assumption, identify the main driver, and explain what could make the forecast wrong.', tip: 'Release the shared Round 3 code. Teams should show their working and label units.'},
  '4': {title: 'What should MogTown do?', minutes: 13, prompt: 'Propose an action, evidence, expected result, trade-off, and two or three KPIs. A justified custom proposal is welcome.', tip: 'Release the shared Round 4 code. Ask which stakeholders bear the costs of each proposal.'},
  'final': {title: 'Hear every side. Then update.', minutes: 20, prompt: 'Hear recommendations before the reveal. After the new evidence arrives, ask whether each recommendation changes and why.', tip: 'Display the final reveal code only after initial recommendations have been stated.'},
  'briefing': {title: 'Your team has the floor.', minutes: 1, prompt: 'State one hypothesis, one supporting fact, and one uncertainty. Name the source of your evidence. Invite one focused cross-question.', tip: 'A briefing is a discussion activity; it does not need a release code.'}
};
let durationSeconds = 600;
let remainingSeconds = durationSeconds;
let running = false;
let endAt = 0;

function drawTimer() {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  byId('timer').textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  byId('timer').classList.toggle('finished', remainingSeconds === 0);
}

function resetTimer(message = 'Timer reset. Ready when you are.') {
  running = false;
  remainingSeconds = durationSeconds;
  byId('toggleTimer').textContent = 'Start timer';
  byId('timerStatus').textContent = message;
  drawTimer();
}

function tick() {
  if (!running) return;
  // Recompute from the deadline so background tabs do not accumulate timer drift.
  remainingSeconds = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
  drawTimer();
  if (remainingSeconds === 0) {
    running = false;
    byId('toggleTimer').textContent = 'Restart timer';
    byId('timerStatus').textContent = 'Time is up. Wrap up your current thought.';
  }
}

function clearCode(message = '') {
  byId('manualCode').value = '';
  byId('presentedCode').textContent = '';
  byId('codeDisplay').hidden = true;
  byId('codeStatus').textContent = message;
}

byId('stage').addEventListener('change', () => {
  const stage = stages[byId('stage').value];
  byId('stageHeading').textContent = stage.title;
  byId('stagePrompt').textContent = stage.prompt;
  byId('stageTip').textContent = stage.tip;
  byId('minutes').value = stage.minutes;
  durationSeconds = stage.minutes * 60;
  clearCode();
  resetTimer('Activity changed. Timer reset.');
});

byId('toggleTimer').addEventListener('click', () => {
  if (running) {
    tick();
    running = false;
    byId('toggleTimer').textContent = remainingSeconds === 0 ? 'Restart timer' : 'Resume timer';
    byId('timerStatus').textContent = remainingSeconds === 0 ? 'Time is up.' : 'Timer paused.';
  } else {
    if (remainingSeconds === 0) remainingSeconds = durationSeconds;
    endAt = Date.now() + remainingSeconds * 1000;
    running = true;
    byId('toggleTimer').textContent = 'Pause timer';
    byId('timerStatus').textContent = 'Timer running.';
    drawTimer();
  }
});
byId('resetTimer').addEventListener('click', () => resetTimer());
byId('durationForm').addEventListener('submit', event => {
  event.preventDefault();
  const minutes = Number(byId('minutes').value);
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > 120) {
    byId('timerStatus').textContent = 'Choose a whole number from 1 to 120 minutes.';
    return;
  }
  durationSeconds = minutes * 60;
  resetTimer(`Duration set to ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}.`);
});
byId('codeForm').addEventListener('submit', event => {
  event.preventDefault();
  const code = byId('manualCode').value.trim();
  if (!code) {
    byId('codeStatus').textContent = 'Enter the shared release code first.';
    byId('manualCode').focus();
    return;
  }
  byId('presentedCode').textContent = code;
  byId('manualCode').value = '';
  byId('codeLabel').textContent = `${byId('stage').selectedOptions[0].textContent} / Release code`;
  byId('codeDisplay').hidden = false;
  byId('codeStatus').textContent = 'The entered code is now visible. This console does not check whether it is valid.';
  byId('hideCode').focus();
});
byId('hideCode').addEventListener('click', () => { clearCode('Code cleared from this page.'); byId('manualCode').focus(); });
// Also clear when navigating away so the back-forward cache cannot restore a code.
window.addEventListener('pagehide', () => { clearCode(); running = false; });
window.addEventListener('pageshow', event => { if (event.persisted) resetTimer(); });
document.addEventListener('visibilitychange', tick);
setInterval(tick, 250);
