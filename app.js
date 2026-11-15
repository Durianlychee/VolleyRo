(() => {
  // The lineup is stored in rotational-position order: lineup[i] is the player
  // in position i + 1 (1 = right back, the server; 2 = right front; ... 6 = middle back).
  // Rotating clockwise moves everyone down one position, so position 2 becomes the
  // next server and position 1 moves to position 6.
  const POSITIONS = [
    { num: 1, code: 'RB' },
    { num: 2, code: 'RF' },
    { num: 3, code: 'MF' },
    { num: 4, code: 'LF' },
    { num: 5, code: 'LB' },
    { num: 6, code: 'MB' }
  ];

  // Positions 2, 3 and 4 are the front row; 1, 5 and 6 the back row.
  const FRONT_ROW = new Set([2, 3, 4]);

  // Where each rotational position stands, per rotation, for serve and receive.
  // layouts[mode][rotationIndex][i] is the spot for position i + 1.
  // Coordinates are percentages of the playing area: x left -> right, y net -> end line.
  // The comments name who stands there with the default 5-1 lineup.
  const layouts = {
    serve: [
      // Rotation 1: front OPP-M1-OH1, back OH2-M2-S1
      [
        { x: 84, y: 92 }, // 1 RB: S1 (server)
        { x: 76, y: 24 }, // 2 RF: OH1
        { x: 50, y: 20 }, // 3 MF: M1
        { x: 22, y: 24 }, // 4 LF: OPP
        { x: 26, y: 60 }, // 5 LB: OH2 (up to attack line)
        { x: 52, y: 60 } // 6 MB: M2 (up to attack line)
      ],
      // Rotation 2: front OH2-OPP-M1, back M2-S1-OH1
      [
        { x: 84, y: 92 }, // 1 RB: OH1 (server)
        { x: 76, y: 24 }, // 2 RF: M1
        { x: 50, y: 24 }, // 3 MF: OPP
        { x: 22, y: 24 }, // 4 LF: OH2
        { x: 26, y: 70 }, // 5 LB: M2
        { x: 52, y: 70 } // 6 MB: S1
      ],
      // Rotation 3: front M2-OH2-OPP, back S1-OH1-M1
      [
        { x: 84, y: 92 }, // 1 RB: M1 (server)
        { x: 82, y: 26 }, // 2 RF: OPP
        { x: 56, y: 22 }, // 3 MF: OH2
        { x: 30, y: 24 }, // 4 LF: M2
        { x: 40, y: 70 }, // 5 LB: S1
        { x: 58, y: 70 } // 6 MB: OH1
      ],
      // Rotation 4: front S1-M2-OH2, back OH1-M1-OPP
      [
        { x: 84, y: 92 }, // 1 RB: OPP (server)
        { x: 76, y: 24 }, // 2 RF: OH2
        { x: 50, y: 20 }, // 3 MF: M2
        { x: 22, y: 24 }, // 4 LF: S1
        { x: 26, y: 70 }, // 5 LB: OH1
        { x: 52, y: 70 } // 6 MB: M1
      ],
      // Rotation 5: front OH1-S1-M2, back M1-OPP-OH2
      [
        { x: 84, y: 92 }, // 1 RB: OH2 (server)
        { x: 76, y: 24 }, // 2 RF: M2
        { x: 50, y: 20 }, // 3 MF: S1
        { x: 22, y: 24 }, // 4 LF: OH1
        { x: 26, y: 70 }, // 5 LB: M1
        { x: 52, y: 70 } // 6 MB: OPP
      ],
      // Rotation 6: front M1-OH1-S1, back OPP-OH2-M2
      [
        { x: 84, y: 92 }, // 1 RB: M2 (server)
        { x: 76, y: 24 }, // 2 RF: S1
        { x: 50, y: 20 }, // 3 MF: OH1
        { x: 22, y: 24 }, // 4 LF: M1
        { x: 26, y: 70 }, // 5 LB: OPP
        { x: 52, y: 70 } // 6 MB: OH2
      ]
    ],
    receive: [
      // Rotation 1 receive: front OPP-M1-OH1, back OH2-M2-S1 (setter deep)
      [
        { x: 88, y: 78 }, // 1 RB: S1
        { x: 76, y: 48 }, // 2 RF: OH1
        { x: 50, y: 24 }, // 3 MF: M1
        { x: 22, y: 28 }, // 4 LF: OPP
        { x: 26, y: 60 }, // 5 LB: OH2
        { x: 52, y: 60 } // 6 MB: M2
      ],
      // Rotation 2 receive: S1 up over OPP, passers M2-OH1-OH2
      [
        { x: 82, y: 62 }, // 1 RB: OH1
        { x: 76, y: 24 }, // 2 RF: M1
        { x: 50, y: 30 }, // 3 MF: OPP
        { x: 24, y: 46 }, // 4 LF: OH2
        { x: 26, y: 62 }, // 5 LB: M2
        { x: 66, y: 40 } // 6 MB: S1
      ],
      // Rotation 3 receive: S1 left, OH2 back-middle switch, M2 tight left
      [
        { x: 88, y: 86 }, // 1 RB: M1
        { x: 78, y: 28 }, // 2 RF: OPP
        { x: 52, y: 62 }, // 3 MF: OH2
        { x: 18, y: 24 }, // 4 LF: M2
        { x: 26, y: 70 }, // 5 LB: S1
        { x: 72, y: 66 } // 6 MB: OH1
      ],
      // Rotation 4 receive: S1 far left, passers OH1-M1-OH2
      [
        { x: 86, y: 86 }, // 1 RB: OPP
        { x: 68, y: 46 }, // 2 RF: OH2
        { x: 50, y: 24 }, // 3 MF: M2
        { x: 8, y: 34 }, //  4 LF: S1
        { x: 30, y: 72 }, // 5 LB: OH1
        { x: 52, y: 62 } // 6 MB: M1
      ],
      // Rotation 5 receive: front OH1-S1-M2, back M1-OPP-OH2 pass
      [
        { x: 82, y: 62 }, // 1 RB: OH2
        { x: 76, y: 24 }, // 2 RF: M2
        { x: 50, y: 20 }, // 3 MF: S1
        { x: 22, y: 24 }, // 4 LF: OH1
        { x: 26, y: 62 }, // 5 LB: M1
        { x: 52, y: 62 } // 6 MB: OPP
      ],
      // Rotation 6 receive: S1 front-right, M1 drops to pass with OPP/OH2
      [
        { x: 84, y: 80 }, // 1 RB: M2
        { x: 76, y: 24 }, // 2 RF: S1
        { x: 50, y: 22 }, // 3 MF: OH1
        { x: 34, y: 52 }, // 4 LF: M1
        { x: 22, y: 68 }, // 5 LB: OPP
        { x: 52, y: 62 } // 6 MB: OH2
      ]
    ]
  };

  // 5-1 in rotation 1, listed by position: setter serving in 1, outside hitter in 2,
  // middle in 3, opposite in 4, outside hitter in 5, middle in 6.
  const defaultLineup = [
    { id: 'p1', role: 'S1', name: 'Nasrul' },
    { id: 'p4', role: 'OH1', name: 'Luqman' },
    { id: 'p3', role: 'M1', name: 'Bazli' },
    { id: 'p2', role: 'OPP', name: 'Akip' },
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

  const scores = { us: 0, opp: 0 };
  const rallyHistory = [];
  // Snapshots of the full match state taken before each logged rally, newest last.
  const undoStack = [];
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
    undo: document.getElementById('undo-rally'),
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

  // The player in position 1 serves (FIVB 12.2.2.2), whatever their role.
  function getServerId() {
    return currentMode === 'serve' ? lineup[0].id : null;
  }

  function renderCourt() {
    els.court.innerHTML = '';
    const layout = layouts[currentMode][rotationIndex];
    const serverId = getServerId();
    lineup.forEach((player, index) => {
      const spot = layout[index];
      const pos = POSITIONS[index];
      const btn = document.createElement('button');
      const rowClass = FRONT_ROW.has(pos.num) ? 'front-row' : 'back-row';
      const classes = ['player', rowClass];
      const selected = selectedOnCourt === player.id;
      if (selected) classes.push('selected');
      if (serverId === player.id) classes.push('serving');
      btn.className = classes.join(' ');
      btn.style.setProperty('--x', String(spot.x));
      btn.style.setProperty('--y', String(spot.y));
      const serverBadge = serverId === player.id ? '<span class="server-badge">Serving</span>' : '';
      btn.innerHTML = `<span class="role">${player.role}</span>
        <span class="name">${player.name}</span>
        ${serverBadge}
        <span class="pos-label">${pos.code}<span class="pos-rot"> · Rot ${rotationIndex + 1}</span></span>`;
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
    const previousChoice = selectedOnCourt;
    els.onCourtSelect.innerHTML = '';
    lineup.forEach((player, index) => {
      const option = document.createElement('option');
      const pos = POSITIONS[index];
      option.value = player.id;
      option.textContent = `${pos.num} (${pos.code}) - ${player.role} ${player.name}`;
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

  function updateUndo() {
    els.undo.disabled = undoStack.length === 0;
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

  function snapshot() {
    return {
      scores: { ...scores },
      lineup: [...lineup],
      bench: [...bench],
      rotationIndex,
      currentMode,
      selectedOnCourt,
      rallyHistory: rallyHistory.map((item) => ({ ...item }))
    };
  }

  function logRally(won) {
    undoStack.push(snapshot());
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
    updateUndo();
  }

  // Restore the score, lineup, bench, rotation and serve/receive phase from
  // just before the most recent logged rally.
  function undoRally() {
    const prior = undoStack.pop();
    if (!prior) {
      setStatus('Nothing to undo yet.', 'muted');
      updateUndo();
      return;
    }
    scores.us = prior.scores.us;
    scores.opp = prior.scores.opp;
    lineup = prior.lineup;
    bench = prior.bench;
    rotationIndex = prior.rotationIndex;
    selectedOnCourt = prior.selectedOnCourt;
    rallyHistory.length = 0;
    rallyHistory.push(...prior.rallyHistory);
    setMode(prior.currentMode);
    renderScores();
    renderSelects();
    renderBench();
    renderCourt();
    renderLog();
    updateUndo();
    const phase = prior.currentMode === 'serve' ? 'serving' : 'receiving';
    setStatus(`Undid last rally: ${scores.us}-${scores.opp}, Rotation ${rotationIndex + 1}, ${phase}.`, 'info');
  }

  function resetMatch() {
    const confirmed = confirm('Reset the session? This clears the score, the rally log and all substitutions.');
    if (!confirmed) {
      setStatus('Reset cancelled. Nothing was cleared.', 'muted');
      return;
    }
    scores.us = 0;
    scores.opp = 0;
    rallyHistory.length = 0;
    undoStack.length = 0;
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
    updateUndo();
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
    els.undo.addEventListener('click', undoRally);
    els.reset.addEventListener('click', resetMatch);
    els.toggleLog.addEventListener('click', toggleLogList);
    els.onCourtSelect.addEventListener('change', (evt) => {
      selectedOnCourt = evt.target.value;
      renderCourt();
    });
  }

  function renderAll() {
    setMode(currentMode);
    renderScores();
    renderSelects();
    renderBench();
    renderCourt();
    renderLog();
    updateContext();
    updateUndo();
    setStatus('Tap a player on court to target them for a sub.', 'info');
  }

  initEvents();
  renderAll();
})();
