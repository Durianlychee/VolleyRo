(() => {
  const layouts = {
    serve: [
      { label: 1, x: 75, y: 82 },
      { label: 2, x: 75, y: 58 },
      { label: 3, x: 50, y: 58 },
      { label: 4, x: 25, y: 58 },
      { label: 5, x: 25, y: 82 },
      { label: 6, x: 50, y: 82 }
    ],
    receive: [
      { label: 1, x: 68, y: 84 },
      { label: 2, x: 72, y: 58 },
      { label: 3, x: 50, y: 55 },
      { label: 4, x: 28, y: 60 },
      { label: 5, x: 32, y: 84 },
      { label: 6, x: 50, y: 70 }
    ]
  };

  const defaultLineup = [
    { id: 'p1', role: 'S', name: 'Nasrul' },
    { id: 'p2', role: 'OPP', name: 'Akip' },
    { id: 'p3', role: 'MB', name: 'Bazli' },
    { id: 'p4', role: 'OH1', name: 'Luqman' },
    { id: 'p5', role: 'L', name: 'Aiman' },
    { id: 'p6', role: 'OH2', name: 'Rahman' }
  ];

  const defaultBench = [
    { id: 'p7', role: 'L', name: 'Aimi' },
    { id: 'p8', role: 'OH2', name: 'Sulaiman' },
    { id: 'p9', role: 'OPP', name: 'Atiq' },
    { id: 'p10', role: 'L', name: 'Zah' },
    { id: 'p11', role: 'OPP', name: 'Kai' }
  ];

  const positions = ['1 (RB)', '2 (RF)', '3 (MF)', '4 (LF)', '5 (LB)', '6 (MB)'];
  const scores = { us: 0, opp: 0 };
  const rallyHistory = [];
  let lineup = [...defaultLineup];
  let bench = [...defaultBench];
  let currentMode = 'receive';
  let selectedOnCourt = lineup[0].id;

  const els = {
    court: document.getElementById('court'),
    modeLabel: document.getElementById('mode-label'),
    toggleMode: document.getElementById('toggle-mode'),
    swapPhase: document.getElementById('swap-phase'),
    rotate: document.getElementById('rotate-lineup'),
    scoreUs: document.getElementById('score-us'),
    scoreOpp: document.getElementById('score-opp'),
    logWin: document.getElementById('log-win'),
    logLoss: document.getElementById('log-loss'),
    logList: document.getElementById('rally-log'),
    contextLine: document.getElementById('context-line'),
    onCourtSelect: document.getElementById('on-court-select'),
    benchSelect: document.getElementById('bench-select'),
    makeSub: document.getElementById('make-sub'),
    subStatus: document.getElementById('sub-status'),
    benchList: document.getElementById('bench-list'),
    reset: document.getElementById('reset-match')
  };

  function setMode(mode) {
    currentMode = mode;
    els.modeLabel.textContent = mode === 'serve' ? 'Serve' : 'Receive';
    els.modeLabel.dataset.state = mode;
    const nextToggle = mode === 'serve' ? 'Switch to receive' : 'Switch to serve';
    els.toggleMode.textContent = nextToggle;
    els.swapPhase.textContent = nextToggle;
    renderCourt();
    updateContext();
  }

  function toggleMode() {
    setMode(currentMode === 'serve' ? 'receive' : 'serve');
  }

  function renderCourt() {
    els.court.innerHTML = '';
    const layout = layouts[currentMode];
    lineup.forEach((player, index) => {
      const spot = layout[index];
      const btn = document.createElement('button');
      btn.className = `player${selectedOnCourt === player.id ? ' selected' : ''}`;
      btn.style.left = `${spot.x}%`;
      btn.style.top = `${spot.y}%`;
      btn.innerHTML = `<span class="role">${player.role}</span>
        <span class="name">${player.name}</span>
        <span class="pos-label">Pos ${spot.label}</span>`;
      btn.addEventListener('click', () => {
        selectedOnCourt = player.id;
        els.onCourtSelect.value = player.id;
        renderCourt();
      });
      els.court.appendChild(btn);
    });
  }

  function renderScores() {
    els.scoreUs.textContent = scores.us;
    els.scoreOpp.textContent = scores.opp;
  }

  function renderSelects() {
    const previousChoice = els.onCourtSelect.value || selectedOnCourt;
    els.onCourtSelect.innerHTML = '';
    lineup.forEach((player, index) => {
      const option = document.createElement('option');
      option.value = player.id;
      option.textContent = `${positions[index]} — ${player.role} ${player.name}`;
      els.onCourtSelect.appendChild(option);
    });
    const chosen = lineup.find((p) => p.id === previousChoice);
    selectedOnCourt = chosen ? chosen.id : lineup[0].id;
    els.onCourtSelect.value = selectedOnCourt;

    const priorBench = els.benchSelect.value;
    els.benchSelect.innerHTML = '';
    bench.forEach((player) => {
      const option = document.createElement('option');
      option.value = player.id;
      option.textContent = `${player.role} ${player.name}`;
      els.benchSelect.appendChild(option);
    });
    if (bench.length > 0) {
      const match = bench.find((p) => p.id === priorBench) || bench[0];
      els.benchSelect.value = match.id;
    }
  }

  function renderBench() {
    els.benchList.innerHTML = '';
    bench.forEach((player) => {
      const card = document.createElement('div');
      card.className = 'bench-card';
      card.innerHTML = `<div class="pill">${player.role}</div>
        <div class="bench-name">${player.name}</div>
        <button class="ghost tiny" data-id="${player.id}">Select</button>`;
      card.querySelector('button').addEventListener('click', () => {
        els.benchSelect.value = player.id;
        setStatus(`${player.name} ready to sub`, 'info');
      });
      els.benchList.appendChild(card);
    });
  }

  function renderLog() {
    els.logList.innerHTML = '';
    rallyHistory.slice(0, 15).forEach((item) => {
      const li = document.createElement('li');
      const result = item.won ? 'Won' : 'Lost';
      const tag = item.won ? 'pill win' : 'pill loss';
      li.innerHTML = `<span class="${tag}">${result}</span>
        <span class="log-copy">${item.copy}</span>
        <span class="log-score">${item.score}</span>`;
      els.logList.appendChild(li);
    });
  }

  function updateContext() {
    const modeCopy = currentMode === 'serve'
      ? 'Serving: keep position unless we lose the rally.'
      : 'Receiving: win the rally to rotate and gain serve.';
    els.contextLine.textContent = modeCopy;
  }

  function setStatus(message, tone = 'muted') {
    els.subStatus.textContent = message;
    els.subStatus.dataset.tone = tone;
  }

  function rotateLineup() {
    const moved = lineup.shift();
    lineup.push(moved);
    selectedOnCourt = lineup[0].id;
    setStatus('Rotation advanced clockwise after a side-out.', 'info');
    renderCourt();
    renderSelects();
  }

  function makeSubstitution() {
    if (!els.onCourtSelect.value || !els.benchSelect.value) {
      setStatus('Pick both an on-court slot and a bench player.', 'alert');
      return;
    }
    const courtIndex = lineup.findIndex((p) => p.id === els.onCourtSelect.value);
    const benchIndex = bench.findIndex((p) => p.id === els.benchSelect.value);
    if (courtIndex < 0 || benchIndex < 0) {
      setStatus('Cannot find selection; refresh and try again.', 'alert');
      return;
    }
    const incoming = bench.splice(benchIndex, 1)[0];
    const outgoing = lineup[courtIndex];
    lineup[courtIndex] = incoming;
    bench.push(outgoing);
    selectedOnCourt = incoming.id;
    setStatus(`${incoming.name} (${incoming.role}) in for ${outgoing.name}.`, 'info');
    renderSelects();
    renderBench();
    renderCourt();
  }

  function logRally(won) {
    const before = currentMode;
    if (won) {
      scores.us += 1;
      if (before === 'receive') {
        rotateLineup();
        setMode('serve');
      }
    } else {
      scores.opp += 1;
      if (before === 'serve') {
        setMode('receive');
      }
    }
    renderScores();

    const after = currentMode;
    const note = won
      ? before === 'receive'
        ? 'Side-out win -> rotated and serving.'
        : 'Held serve.'
      : before === 'serve'
        ? 'Lost serve -> back to receive.'
        : 'Stayed in receive.';
    const copy = `${note} Mode: ${after}.`;
    rallyHistory.unshift({
      won,
      copy,
      score: `${scores.us}-${scores.opp}`
    });
    if (rallyHistory.length > 20) {
      rallyHistory.pop();
    }
    renderLog();
    updateContext();
  }

  function resetMatch() {
    scores.us = 0;
    scores.opp = 0;
    rallyHistory.length = 0;
    lineup = [...defaultLineup];
    bench = [...defaultBench];
    selectedOnCourt = lineup[0].id;
    setMode('receive');
    renderScores();
    renderSelects();
    renderBench();
    renderCourt();
    renderLog();
    setStatus('Session reset. Back in receive to start.', 'info');
  }

  function initEvents() {
    els.toggleMode.addEventListener('click', toggleMode);
    els.swapPhase.addEventListener('click', toggleMode);
    els.rotate.addEventListener('click', rotateLineup);
    els.makeSub.addEventListener('click', makeSubstitution);
    els.logWin.addEventListener('click', () => logRally(true));
    els.logLoss.addEventListener('click', () => logRally(false));
    els.reset.addEventListener('click', resetMatch);
    els.onCourtSelect.addEventListener('change', (evt) => {
      selectedOnCourt = evt.target.value;
      renderCourt();
    });
  }

  function renderAll() {
    renderScores();
    renderSelects();
    renderBench();
    renderCourt();
    renderLog();
    updateContext();
    setStatus('Tap a player on court to target them for a sub.', 'info');
  }

  initEvents();
  renderAll();
})();
