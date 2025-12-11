(() => {
  // Rotation-specific layouts (serve/receive) for a 5-1 with S, OPP, MB, OH1, L, OH2.
  // Index order: 0 RB, 1 RF, 2 MF, 3 LF, 4 LB, 5 MB (back middle).
  const layouts = {
    serve: [
      [
        { label: 'RB', x: 82, y: 90 },
        { label: 'RF', x: 22, y: 22 },
        { label: 'MF', x: 50, y: 20 },
        { label: 'LF', x: 75, y: 22 },
        { label: 'LB', x: 52, y: 68 },
        { label: 'MB', x: 25, y: 65 }
      ],
      [
        { label: 'RB', x: 70, y: 78 },
        { label: 'RF', x: 72, y: 24 },
        { label: 'MF', x: 50, y: 22 },
        { label: 'LF', x: 25, y: 24 },
        { label: 'LB', x: 50, y: 70 },
        { label: 'MB', x: 18, y: 88 }
      ],
      [
        { label: 'RB', x: 64, y: 70 },
        { label: 'RF', x: 78, y: 26 },
        { label: 'MF', x: 60, y: 26 },
        { label: 'LF', x: 36, y: 40 },
        { label: 'LB', x: 20, y: 72 },
        { label: 'MB', x: 78, y: 92 }
      ],
      [
        { label: 'RB', x: 80, y: 32 },
        { label: 'RF', x: 70, y: 24 },
        { label: 'MF', x: 50, y: 24 },
        { label: 'LF', x: 24, y: 24 },
        { label: 'LB', x: 42, y: 70 },
        { label: 'MB', x: 76, y: 70 }
      ],
      [
        { label: 'RB', x: 78, y: 68 },
        { label: 'RF', x: 22, y: 22 },
        { label: 'MF', x: 50, y: 20 },
        { label: 'LF', x: 70, y: 22 },
        { label: 'LB', x: 55, y: 68 },
        { label: 'MB', x: 20, y: 88 }
      ],
      [
        { label: 'RB', x: 76, y: 24 },
        { label: 'RF', x: 70, y: 22 },
        { label: 'MF', x: 50, y: 22 },
        { label: 'LF', x: 22, y: 22 },
        { label: 'LB', x: 38, y: 60 },
        { label: 'MB', x: 70, y: 92 }
      ]
    ],
    receive: [
      [
        { label: 'RB', x: 84, y: 78 },
        { label: 'RF', x: 28, y: 36 },
        { label: 'MF', x: 52, y: 34 },
        { label: 'LF', x: 75, y: 34 },
        { label: 'LB', x: 52, y: 66 },
        { label: 'MB', x: 18, y: 66 }
      ],
      [
        { label: 'RB', x: 70, y: 60 },
        { label: 'RF', x: 78, y: 32 },
        { label: 'MF', x: 52, y: 32 },
        { label: 'LF', x: 26, y: 40 },
        { label: 'LB', x: 46, y: 70 },
        { label: 'MB', x: 22, y: 72 }
      ],
      [
        { label: 'RB', x: 70, y: 52 },
        { label: 'RF', x: 70, y: 24 },
        { label: 'MF', x: 50, y: 30 },
        { label: 'LF', x: 30, y: 46 },
        { label: 'LB', x: 55, y: 70 },
        { label: 'MB', x: 80, y: 80 }
      ],
      [
        { label: 'RB', x: 88, y: 32 },
        { label: 'RF', x: 70, y: 28 },
        { label: 'MF', x: 52, y: 32 },
        { label: 'LF', x: 26, y: 32 },
        { label: 'LB', x: 42, y: 70 },
        { label: 'MB', x: 78, y: 70 }
      ],
      [
        { label: 'RB', x: 80, y: 24 },
        { label: 'RF', x: 68, y: 32 },
        { label: 'MF', x: 52, y: 32 },
        { label: 'LF', x: 24, y: 34 },
        { label: 'LB', x: 50, y: 70 },
        { label: 'MB', x: 70, y: 70 }
      ],
      [
        { label: 'RB', x: 80, y: 70 },
        { label: 'RF', x: 24, y: 24 },
        { label: 'MF', x: 50, y: 28 },
        { label: 'LF', x: 70, y: 32 },
        { label: 'LB', x: 32, y: 60 },
        { label: 'MB', x: 70, y: 84 }
      ]
    ]
  };

  // 5-1: one setter, two outsides, one opposite, one middle, one libero.
  const defaultLineup = [
    { id: 'p1', role: 'S', name: 'Devin' },
    { id: 'p2', role: 'OPP', name: 'Alex' },
    { id: 'p3', role: 'MB', name: 'Quinn' },
    { id: 'p4', role: 'OH1', name: 'Riley' },
    { id: 'p5', role: 'L', name: 'Sam' },
    { id: 'p6', role: 'OH2', name: 'Casey' }
  ];

  const defaultBench = [
    { id: 'p7', role: 'S', name: 'Taylor' },
    { id: 'p8', role: 'OH', name: 'Jamie' },
    { id: 'p9', role: 'MB', name: 'Robin' },
    { id: 'p10', role: 'OPP', name: 'Kai' },
    { id: 'p11', role: 'L', name: 'Morgan' }
  ];

  const positions = ['1 (RB)', '2 (RF)', '3 (MF)', '4 (LF)', '5 (LB)', '6 (MB)'];
  const scores = { us: 0, opp: 0 };
  const rallyHistory = [];
  let lineup = [...defaultLineup];
  let bench = [...defaultBench];
  let currentMode = 'receive';
  let rotationIndex = 0;
  let selectedOnCourt = lineup[0].id;
  let logExpanded = true;

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
    logSummary: document.getElementById('log-summary'),
    toggleLog: document.getElementById('toggle-log'),
    contextLine: document.getElementById('context-line'),
    serverNote: document.getElementById('server-note'),
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
    updateServerInfo();
  }

  function toggleMode() {
    setMode(currentMode === 'serve' ? 'receive' : 'serve');
  }

  function renderCourt() {
    els.court.innerHTML = '';
    const layout = layouts[currentMode][rotationIndex];
    lineup.forEach((player, index) => {
      const spot = layout[index];
      const btn = document.createElement('button');
      const classes = ['player', index >= 1 && index <= 3 ? 'front-row' : 'back-row'];
      if (selectedOnCourt === player.id) classes.push('selected');
      btn.className = classes.join(' ');
      btn.style.left = `${spot.x}%`;
      btn.style.top = `${spot.y}%`;
      btn.innerHTML = `<span class="role">${player.role}</span>
        <span class="name">${player.name}</span>
        <span class="pos-label">${spot.label} · Rot ${rotationIndex + 1}</span>`;
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

  function updateServerInfo() {
    if (!els.serverNote) return;
    if (currentMode === 'serve') {
      const server = lineup[0];
      els.serverNote.textContent = `Server: ${server.name} (${server.role})`;
      els.serverNote.dataset.state = 'serve';
    } else {
      els.serverNote.textContent = 'Receiving - no server';
      els.serverNote.dataset.state = 'receive';
    }
  }

  function renderSelects() {
    const previousChoice = els.onCourtSelect.value || selectedOnCourt;
    els.onCourtSelect.innerHTML = '';
    lineup.forEach((player, index) => {
      const option = document.createElement('option');
      option.value = player.id;
      option.textContent = `${positions[index]} - ${player.role} ${player.name}`;
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

  function applyLogVisibility() {
    els.logList.classList.toggle('is-hidden', !logExpanded);
    els.toggleLog.textContent = logExpanded ? 'Hide log' : 'Show log';
  }

  function updateLogSummary() {
    if (!rallyHistory.length) {
      els.logSummary.textContent = 'No rallies logged yet.';
      return;
    }
    const latest = rallyHistory[0];
    const outcome = latest.won ? 'Won' : 'Lost';
    els.logSummary.textContent = `Latest: ${outcome} (${latest.score}) - ${latest.copy}`;
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
    updateLogSummary();
    applyLogVisibility();
  }

  function updateContext() {
    const modeCopy = currentMode === 'serve'
      ? 'Serving: follow the rotation lane, then move to perimeter defense.'
      : 'Receiving: honor overlaps, then flow to attack after first contact.';
    els.contextLine.textContent = `${modeCopy} Rotation ${rotationIndex + 1}.`;
  }

  function setStatus(message, tone = 'muted') {
    els.subStatus.textContent = message;
    els.subStatus.dataset.tone = tone;
  }

  function rotateLineup() {
    const moved = lineup.shift();
    lineup.push(moved);
    rotationIndex = (rotationIndex + 1) % 6;
    selectedOnCourt = lineup[0].id;
    setStatus('Rotation advanced clockwise after a side-out.', 'info');
    renderCourt();
    renderSelects();
    updateContext();
    updateServerInfo();
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
    updateServerInfo();
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
    const copy = `${note} Rot ${rotationIndex + 1}, Mode: ${after}.`;
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
    updateServerInfo();
  }

  function resetMatch() {
    scores.us = 0;
    scores.opp = 0;
    rallyHistory.length = 0;
    lineup = [...defaultLineup];
    bench = [...defaultBench];
    rotationIndex = 0;
    selectedOnCourt = lineup[0].id;
    setMode('receive');
    renderScores();
    renderSelects();
    renderBench();
    renderCourt();
    renderLog();
    setStatus('Session reset. Back in receive to start.', 'info');
    updateServerInfo();
  }

  function toggleLogList() {
    logExpanded = !logExpanded;
    applyLogVisibility();
  }

  function initEvents() {
    els.toggleMode.addEventListener('click', toggleMode);
    els.swapPhase.addEventListener('click', toggleMode);
    els.rotate.addEventListener('click', rotateLineup);
    els.makeSub.addEventListener('click', makeSubstitution);
    els.logWin.addEventListener('click', () => logRally(true));
    els.logLoss.addEventListener('click', () => logRally(false));
    els.reset.addEventListener('click', resetMatch);
    els.toggleLog.addEventListener('click', toggleLogList);
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
    updateServerInfo();
  }

  initEvents();
  renderAll();
})();
