(() => {
  // Rotation-specific layouts (serve/receive) for a 5-1 with S1, OPP, M1, OH1, OH2, M2.
  // Coordinates are percentage-based for the court container.
  // Lineup rotates; rotationIndex selects the matching rotation pattern.
  const layouts = {
    serve: [
      // Rotation 1: front OPP-M1-OH1, back OH2-M2-S1
      [
        { label: 'RB', x: 84, y: 92 }, // S1 (server)
        { label: 'LF', x: 22, y: 24 }, // OPP
        { label: 'MF', x: 50, y: 20 }, // M1
        { label: 'RF', x: 76, y: 24 }, // OH1
        { label: 'LB', x: 26, y: 60 }, // OH2 (up to attack line)
        { label: 'MB', x: 52, y: 60 }  // M2 (up to attack line)
      ],
      // Rotation 2: front OH2-OPP-M1, back M2-S1-OH1
      [
        { label: 'MF', x: 50, y: 24 }, // OPP
        { label: 'RF', x: 76, y: 24 }, // M1
        { label: 'RB', x: 84, y: 92 }, // OH1 (server)
        { label: 'LF', x: 22, y: 24 }, // OH2
        { label: 'LB', x: 26, y: 70 }, // M2
        { label: 'MB', x: 52, y: 70 }  // S1
      ],
      // Rotation 3: front M2-OH2-OPP, back S1-OH1-M1
      [
        { label: 'RB', x: 84, y: 92 }, // M1 (server)
        { label: 'MB', x: 58, y: 70 }, // OH1
        { label: 'MF', x: 56, y: 22 }, // OH2
        { label: 'LF', x: 30, y: 24 }, // M2
        { label: 'LB', x: 40, y: 70 }, // S1
        { label: 'RF', x: 82, y: 26 }  // OPP
      ],
      // Rotation 4: front S1-M2-OH2, back OH1-M1-OPP
      [
        { label: 'LB', x: 26, y: 70 }, // OH1
        { label: 'RF', x: 76, y: 24 }, // OH2
        { label: 'MF', x: 50, y: 20 }, // M2
        { label: 'LF', x: 22, y: 24 }, // S1
        { label: 'RB', x: 84, y: 92 }, // OPP (server)
        { label: 'MB', x: 52, y: 70 }  // M1
      ],
      // Rotation 5: front OH1-S1-M2, back M1-OPP-OH2
      [
        { label: 'RB', x: 84, y: 92 }, // OH2 (server)
        { label: 'RF', x: 76, y: 24 }, // M2
        { label: 'MF', x: 50, y: 20 }, // S1
        { label: 'MB', x: 52, y: 70 }, // OPP
        { label: 'LB', x: 26, y: 70 }, // M1
        { label: 'LF', x: 22, y: 24 }  // OH1
      ],
      // Rotation 6: front M1-OH1-S1, back OPP-OH2-M2
      [
        { label: 'RB', x: 84, y: 92 }, // M2 (server)
        { label: 'RF', x: 76, y: 24 }, // S1
        { label: 'LB', x: 26, y: 70 }, // OPP
        { label: 'LF', x: 22, y: 24 }, // M1
        { label: 'MF', x: 50, y: 20 }, // OH1
        { label: 'MB', x: 52, y: 70 }  // OH2
      ]
    ],
    receive: [
      // Rotation 1 receive: front OPP-M1-OH1, back OH2-M2-S1 (setter deep)
      [
        { label: 'RB', x: 88, y: 78 }, // S1
        { label: 'LF', x: 22, y: 28 }, // OPP
        { label: 'MF', x: 50, y: 24 }, // M1
        { label: 'RF', x: 76, y: 48 }, // OH1
        { label: 'LB', x: 26, y: 60 }, // OH2
        { label: 'MB', x: 52, y: 60 }  // M2
      ],
      // Rotation 2 receive: S1 up over OPP, passers M2-OH1-OH2
      [
        { label: 'MF', x: 50, y: 30 }, // OPP
        { label: 'RF', x: 76, y: 24 }, // M1
        { label: 'RB', x: 82, y: 62 }, // OH1
        { label: 'LF', x: 24, y: 46 }, // OH2
        { label: 'LB', x: 26, y: 62 }, // M2
        { label: 'SR', x: 66, y: 40 }  // S1
      ],
      // Rotation 3 receive: S1 left, OH2 back-middle switch, M2 tight left
      [
        { label: 'RB', x: 88, y: 86 }, // M1
        { label: 'BR', x: 72, y: 66 }, // OH1
        { label: 'MB', x: 52, y: 62 }, // OH2
        { label: 'LF', x: 18, y: 24 }, // M2
        { label: 'LB', x: 26, y: 70 }, // S1
        { label: 'RF', x: 78, y: 28 }  // OPP
      ],
      // Rotation 4 receive: S1 far left, passers OH1-M1-OH2
      [
        { label: 'LB', x: 30, y: 72 }, // OH1
        { label: 'RF', x: 68, y: 46 }, // OH2
        { label: 'MF', x: 50, y: 24 }, // M2
        { label: 'LF', x: 8, y: 34 },  // S1
        { label: 'RB', x: 86, y: 86 }, // OPP
        { label: 'MB', x: 52, y: 62 }  // M1
      ],
      // Rotation 5 receive: front OH1-S1-M2, back M1-OPP-OH2 pass
      [
        { label: 'RB', x: 82, y: 62 }, // OH2
        { label: 'RF', x: 76, y: 24 }, // M2
        { label: 'MF', x: 50, y: 20 }, // S1
        { label: 'MB', x: 52, y: 62 }, // OPP
        { label: 'LB', x: 26, y: 62 }, // M1
        { label: 'LF', x: 22, y: 24 }  // OH1
      ],
      // Rotation 6 receive: S1 front-right, M1 drops to pass with OPP/OH2
      [
        { label: 'RB', x: 84, y: 80 }, // M2
        { label: 'RF', x: 76, y: 24 }, // S1
        { label: 'LB', x: 22, y: 68 }, // OPP
        { label: 'LM', x: 34, y: 52 }, // M1
        { label: 'MF', x: 50, y: 22 }, // OH1
        { label: 'MB', x: 52, y: 62 }  // OH2
      ]
    ]
  };

  // Front/back row slots for each rotation index (lineup order).
  const rowMap = [
    ['back', 'front', 'front', 'front', 'back', 'back'],
    ['front', 'front', 'back', 'front', 'back', 'back'],
    ['back', 'back', 'front', 'front', 'back', 'front'],
    ['back', 'front', 'front', 'front', 'back', 'back'],
    ['back', 'front', 'front', 'back', 'back', 'front'],
    ['back', 'front', 'back', 'front', 'front', 'back']
  ];

  // 5-1: one setter, two outsides, one opposite, two middles.
  const defaultLineup = [
    { id: 'p1', role: 'S1', name: 'Nasrul' },
    { id: 'p2', role: 'OPP', name: 'Akip' },
    { id: 'p3', role: 'M1', name: 'Bazli' },
    { id: 'p4', role: 'OH1', name: 'Luqman' },
    { id: 'p5', role: 'OH2', name: 'Rahman' },
    { id: 'p6', role: 'M2', name: 'Zahirah' }
  ];

  const defaultBench = [
    { id: 'p7', role: 'OPP', name: 'Atiq' },
    { id: 'p8', role: 'OH1', name: 'Sulaiman' },
    { id: 'p9', role: 'M1', name: 'Aimi' },
    { id: 'p10', role: 'M2', name: 'Aiman' },
    { id: 'p11', role: 'OH2', name: 'Akip' }
  ];

  // Official serving order starting from rotation 1 (setter in 1).
  const serveOrder = ['S1', 'OH1', 'M1', 'OPP', 'OH2', 'M2'];

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
      const rowClass = rowMap[rotationIndex][index] === 'front' ? 'front-row' : 'back-row';
      const classes = ['player', rowClass];
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
