(() => {
  // Rotation-specific layouts (serve/receive) for a 5-1 with S, OPP, MB, OH1, L, OH2.
  // Coordinates are percentage-based for the court container.
  // lineup rotates; rotationIndex selects pattern matching diagrams (M2 replaced by L).
  const layouts = {
    serve: [
      // Rotation 1: front OPP-MB-OH1, back OH2-L-S
      [
        { label: 'RB', x: 84, y: 92 }, // S
        { label: 'LF', x: 22, y: 24 }, // OPP
        { label: 'MF', x: 50, y: 20 }, // MB
        { label: 'RF', x: 76, y: 24 }, // OH1
        { label: 'MB', x: 52, y: 70 }, // L
        { label: 'LB', x: 26, y: 70 }  // OH2
      ],
      // Rotation 2: front OH2-OPP-MB, back OH1-L-S
      [
        { label: 'MF', x: 50, y: 24 }, // OPP
        { label: 'RF', x: 74, y: 24 }, // MB
        { label: 'RB', x: 84, y: 92 }, // OH1 (server)
        { label: 'MB', x: 52, y: 70 }, // L
        { label: 'LF', x: 22, y: 26 }, // OH2
        { label: 'BR', x: 78, y: 60 }  // S
      ],
      // Rotation 3: front L-OH2-OPP, back S-OH1-MB
      [
        { label: 'RB', x: 72, y: 88 }, // MB
        { label: 'MB', x: 50, y: 60 }, // OH1
        { label: 'LF', x: 26, y: 26 }, // L
        { label: 'MF', x: 56, y: 24 }, // OH2
        { label: 'RF', x: 72, y: 42 }, // S
        { label: 'FR', x: 84, y: 24 }  // OPP
      ],
      // Rotation 4: front S-L-OH2, back OH1-MB-OPP
      [
        { label: 'LB', x: 26, y: 52 }, // OH1
        { label: 'MF', x: 40, y: 24 }, // L
        { label: 'RF', x: 70, y: 24 }, // OH2
        { label: 'LF', x: 10, y: 24 }, // S
        { label: 'RB', x: 86, y: 72 }, // OPP
        { label: 'MB', x: 52, y: 68 }  // MB
      ],
      // Rotation 5: front OH1-S-L, back MB-OPP-OH2
      [
        { label: 'RF', x: 74, y: 24 }, // L
        { label: 'LB', x: 84, y: 88 }, // OH2
        { label: 'MF', x: 50, y: 22 }, // S
        { label: 'RB', x: 60, y: 56 }, // OPP
        { label: 'MB', x: 44, y: 70 }, // MB
        { label: 'LF', x: 26, y: 24 }  // OH1
      ],
      // Rotation 6: front MB-OH1-S, back OH2-OPP-L
      [
        { label: 'LB', x: 32, y: 60 }, // OH2
        { label: 'RF', x: 74, y: 22 }, // S
        { label: 'MF', x: 60, y: 44 }, // OPP
        { label: 'LF', x: 26, y: 22 }, // MB
        { label: 'MB', x: 48, y: 22 }, // OH1
        { label: 'RB', x: 84, y: 88 }  // L
      ]
    ],
    receive: [
      // Rotation 1 receive: front OPP-MB-OH1, back OH2-L-S up
      [
        { label: 'RB', x: 86, y: 60 }, // S
        { label: 'LF', x: 26, y: 34 }, // OPP
        { label: 'MF', x: 50, y: 30 }, // MB
        { label: 'RF', x: 78, y: 34 }, // OH1
        { label: 'MB', x: 52, y: 70 }, // L
        { label: 'LB', x: 32, y: 68 }  // OH2
      ],
      // Rotation 2 receive: OH2 left, OPP front right stack with S, MB right back, OH1 mid, L middle
      [
        { label: 'RF', x: 70, y: 38 }, // OPP
        { label: 'RB', x: 86, y: 64 }, // MB
        { label: 'MB', x: 44, y: 72 }, // OH1
        { label: 'MB2', x: 52, y: 64 }, // L
        { label: 'LF', x: 28, y: 44 }, // OH2
        { label: 'RS', x: 76, y: 50 }  // S
      ],
      // Rotation 3 receive: L left, OH2 right, S mid, OPP right, OH1 mid, MB right
      [
        { label: 'RB', x: 82, y: 70 }, // MB
        { label: 'MB', x: 52, y: 50 }, // OH1
        { label: 'LF', x: 24, y: 26 }, // L
        { label: 'RF', x: 70, y: 26 }, // OH2
        { label: 'RS', x: 46, y: 44 }, // S
        { label: 'FR', x: 86, y: 44 }  // OPP
      ],
      // Rotation 4 receive: S far left, L left-mid, OH2 mid; back OH1, MB, OPP right
      [
        { label: 'LB', x: 52, y: 48 }, // OH1
        { label: 'MF', x: 32, y: 34 }, // L
        { label: 'RF', x: 28, y: 44 }, // OH2
        { label: 'LF', x: 10, y: 34 }, // S
        { label: 'RB', x: 86, y: 54 }, // OPP
        { label: 'MB', x: 66, y: 46 }  // MB
      ],
      // Rotation 5 receive: front OH1-OPP-OH2, back S-L-MB
      [
        { label: 'LB', x: 68, y: 64 }, // L
        { label: 'RB', x: 82, y: 60 }, // OH2
        { label: 'MB', x: 72, y: 28 }, // S
        { label: 'FR', x: 64, y: 44 }, // OPP
        { label: 'MB2', x: 44, y: 54 }, // MB
        { label: 'LF', x: 28, y: 34 }  // OH1
      ],
      // Rotation 6 receive: front OH2-OPP-MB, back OH1-S-L
      [
        { label: 'LF', x: 32, y: 32 }, // OH2
        { label: 'RF', x: 72, y: 60 }, // S
        { label: 'MF', x: 64, y: 36 }, // OPP
        { label: 'MB', x: 24, y: 36 }, // MB
        { label: 'LB', x: 48, y: 60 }, // OH1
        { label: 'RB', x: 82, y: 70 }  // L
      ]
    ]
  };

  // 5-1: one setter, two outsides, one opposite, one middle, one libero.
  const defaultLineup = [
    { id: 'p1', role: 'S', name: 'Nasrul' },
    { id: 'p2', role: 'OPP', name: 'Akip' },
    { id: 'p3', role: 'MB', name: 'Bazli' },
    { id: 'p4', role: 'OH1', name: 'Luqman' },
    { id: 'p5', role: 'L', name: 'Zahirah' },
    { id: 'p6', role: 'OH2', name: 'Rahman' }
  ];

  const defaultBench = [
    { id: 'p7', role: 'OPP', name: 'Atiq' },
    { id: 'p8', role: 'OH1', name: 'Sulaiman' },
    { id: 'p9', role: 'L', name: 'Aimi' },
    { id: 'p10', role: 'L', name: 'Aiman' },
    { id: 'p11', role: 'OH2', name: 'Akip' }
  ];

  // Official serving order starting from rotation 1 (setter in 1).
  const serveOrder = ['S', 'OH1', 'MB', 'OPP', 'OH2', 'L'];

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

  // Determine who should be serving based on the fixed clockwise order.
  function getServerId() {
    if (currentMode !== 'serve') return null;
    const role = serveOrder[rotationIndex % serveOrder.length];
    const match = lineup.find((player) => player.role === role);
    return match ? match.id : lineup[0]?.id;
  }

  function renderCourt() {
    els.court.innerHTML = '';
    const layout = layouts[currentMode][rotationIndex];
    const serverId = getServerId();
    lineup.forEach((player, index) => {
      const spot = layout[index];
      const btn = document.createElement('button');
      const classes = ['player', index >= 1 && index <= 3 ? 'front-row' : 'back-row'];
      if (selectedOnCourt === player.id) classes.push('selected');
      btn.className = classes.join(' ');
      btn.style.left = `${spot.x}%`;
      btn.style.top = `${spot.y}%`;
      const serverBadge = serverId === player.id ? '<span class="server-badge">Serving</span>' : '';
      btn.innerHTML = `<span class="role">${player.role}</span>
        <span class="name">${player.name}</span>
        ${serverBadge}
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
  }

  initEvents();
  renderAll();
})();
