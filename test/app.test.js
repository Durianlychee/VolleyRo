'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp, fakeWakeLock, fakeSession } = require('./harness');

const CODES = ['RB', 'RF', 'MF', 'LF', 'LB', 'MB'];
const FRONT = new Set(['RF', 'MF', 'LF']);

// Rotation 1 of the default 5-1: who starts in which rotational position (players are named by role).
const START = { Setter: 1, 'Outside 1': 2, 'Middle 1': 3, Opposite: 4, 'Outside 2': 5, 'Middle 2': 6 };

// Position after k clockwise rotations (FIVB 7.6.2: 2 -> 1, 1 -> 6, 6 -> 5, ...).
const posAfter = (p, k) => ((((p - 1 - k) % 6) + 6) % 6) + 1;

// Independent model of the lineup: name -> position, updated by rotations and subs.
function model() {
  const where = { ...START };
  return {
    where,
    rotate() {
      for (const name of Object.keys(where)) where[name] = posAfter(where[name], 1);
    },
    sub(outName, inName) {
      where[inName] = where[outName];
      delete where[outName];
    },
    at(pos) {
      return Object.keys(where).find((name) => where[name] === pos);
    }
  };
}

// Every reviewed (legal) formation, by rotational position 1-6 as [x, y].
// Receive follows the conventional 5-1: outside hitters and the back-row middle pass.
const FORMATIONS = {
  serve: [
    [[84, 92], [76, 24], [50, 20], [22, 24], [26, 60], [52, 60]],
    [[84, 92], [76, 24], [50, 24], [22, 24], [26, 70], [52, 70]],
    [[84, 92], [82, 26], [56, 22], [30, 24], [40, 70], [58, 70]],
    [[84, 92], [76, 24], [50, 20], [22, 24], [26, 70], [52, 70]],
    [[84, 92], [76, 24], [50, 20], [22, 24], [26, 70], [52, 70]],
    [[84, 92], [76, 24], [50, 20], [22, 24], [26, 70], [52, 70]]
  ],
  receive: [
    [[92, 54], [76, 48], [50, 24], [22, 28], [26, 60], [52, 60]],
    [[78, 62], [76, 24], [40, 24], [18, 54], [46, 62], [62, 40]],
    [[82, 64], [78, 28], [28, 60], [10, 20], [12, 38], [55, 64]],
    [[86, 86], [68, 46], [50, 24], [8, 34], [30, 72], [52, 62]],
    [[80, 64], [76, 24], [50, 20], [20, 58], [45, 64], [60, 88]],
    [[82, 64], [76, 24], [22, 58], [8, 22], [14, 86], [52, 64]]
  ]
};

function setMode(app, mode) {
  if (app.mode().toLowerCase() !== mode) app.click('toggle-mode');
  assert.equal(app.mode().toLowerCase(), mode);
}

// Visit all 6 rotations in one phase via the Rotate clockwise button.
function eachRotation(app, mode, fn, m = model()) {
  setMode(app, mode);
  for (let k = 0; k < 6; k += 1) {
    fn(k, m);
    app.click('rotate-lineup');
    m.rotate();
  }
}

function state(app) {
  return {
    score: app.score(),
    mode: app.mode(),
    rotation: app.rotation(),
    rotationLabel: app.courtLabel(),
    court: app.court(),
    options: app.options(),
    subTarget: app.subTarget(),
    bench: app.bench(),
    log: app.log()
  };
}

// --- Role labels ---------------------------------------------------------------

const STARTER_LABELS = ['Setter', 'Outside 1', 'Middle 1', 'Opposite', 'Outside 2', 'Middle 2'];
const BENCH_LABELS = ['Opposite 2', 'Outside 3', 'Middle 3', 'Middle 4', 'Outside 4'];
// Each label must agree with the role code shown above it on the token.
const LABEL_ROLE = {
  Setter: 'S1', 'Outside 1': 'OH1', 'Middle 1': 'M1', Opposite: 'OPP', 'Outside 2': 'OH2', 'Middle 2': 'M2',
  'Opposite 2': 'OPP', 'Outside 3': 'OH1', 'Middle 3': 'M1', 'Middle 4': 'M2', 'Outside 4': 'OH2'
};

test('court tokens show role labels in rotational-position order', () => {
  const app = loadApp();
  assert.deepEqual(app.court().map((c) => c.name), STARTER_LABELS);
  for (const c of app.court()) assert.equal(c.role, LABEL_ROLE[c.name], c.name);
});

test('bench players carry role-style labels that match their role codes', () => {
  const app = loadApp();
  assert.deepEqual(app.bench(), BENCH_LABELS.map((label) => `${LABEL_ROLE[label]} ${label}`));
});

test('every player label is unique, so no two players can be confused', () => {
  const app = loadApp();
  const shown = [...app.court().map((c) => c.name), ...app.bench().map((o) => o.slice(o.indexOf(' ') + 1))];
  assert.equal(shown.length, 11, 'six starters and five bench players');
  assert.equal(new Set(shown).size, shown.length, `duplicate label in ${shown.join(', ')}`);
});

// Oracle: the captain's list of role labels. A real name anywhere in the UI would not be in it.
test('every name shown in the UI is a role label, through rotations and subs', () => {
  const app = loadApp();
  const known = new Set([...STARTER_LABELS, ...BENCH_LABELS]);
  const shown = () => [
    ...app.court().map((c) => c.name),
    ...app.options().map((o) => o.slice(o.indexOf(' - ') + 3).split(' ').slice(1).join(' ')),
    ...app.bench().map((o) => o.slice(o.indexOf(' ') + 1))
  ];
  const check = (msg) => {
    for (const label of shown()) assert.ok(known.has(label), `${msg}: "${label}" is not a role label`);
  };
  check('start');
  for (const [outName, inName] of [['Setter', 'Opposite 2'], ['Middle 2', 'Middle 4'], ['Outside 2', 'Outside 4']]) {
    app.sub(outName, inName);
    check(`after ${inName} in for ${outName}`);
    app.click('rotate-lineup');
    check(`rotated after ${inName}`);
  }
});

test('substitution swaps role labels between court and bench', () => {
  const app = loadApp();
  app.sub('Outside 1', 'Outside 3');
  const court = app.court();
  assert.equal(court[1].name, 'Outside 3');
  assert.equal(court[1].role, 'OH1');
  assert.equal(court[1].pos, 'RF');
  assert.ok(!court.some((c) => c.name === 'Outside 1'));
  assert.ok(app.bench().includes('OH1 Outside 1'), app.bench().join(', '));
  assert.ok(!app.bench().includes('OH1 Outside 3'));
  assert.equal(app.el('sub-status').textContent, 'Outside 3 (OH1) in for Outside 1.');
});

// --- Rally and rotation rules (characterization) ---------------------------

test('side-out win scores, rotates and gives serve', () => {
  const app = loadApp();
  app.click('log-win');
  assert.equal(app.score(), '1-0');
  assert.equal(app.mode(), 'Serve');
  assert.equal(app.rotation(), 2);
});

test('winning on serve scores without rotating', () => {
  const app = loadApp();
  setMode(app, 'serve');
  app.click('log-win');
  assert.equal(app.score(), '1-0');
  assert.equal(app.mode(), 'Serve');
  assert.equal(app.rotation(), 1);
});

test('losing serve returns to receive without rotating', () => {
  const app = loadApp();
  setMode(app, 'serve');
  app.click('log-loss');
  assert.equal(app.score(), '0-1');
  assert.equal(app.mode(), 'Receive');
  assert.equal(app.rotation(), 1);
});

test('six side-outs give the FIVB serving order OH1, M1, OPP, OH2, M2, S1', () => {
  const app = loadApp();
  const servers = [];
  for (let i = 0; i < 6; i += 1) {
    app.click('log-win'); // side-out: rotate and serve
    servers.push(app.court().find((c) => c.serving).role);
    app.click('log-loss'); // lose serve: back to receive
  }
  assert.deepEqual(servers, ['OH1', 'M1', 'OPP', 'OH2', 'M2', 'S1']);
});

test('front-row colouring matches positions 2, 3 and 4 in all 12 layouts', () => {
  const app = loadApp();
  for (const mode of ['receive', 'serve']) {
    eachRotation(app, mode, (k, m) => {
      for (const c of app.court()) {
        const pos = m.where[c.name];
        assert.equal(c.front, FRONT.has(CODES[pos - 1]), `${mode} rot ${k + 1} ${c.name} in position ${pos}`);
      }
    });
  }
});

// --- Formations and card geometry ------------------------------------------

test('every formation keeps its reviewed coordinates', () => {
  const app = loadApp();
  for (const mode of ['receive', 'serve']) {
    eachRotation(app, mode, (k, m) => {
      for (const c of app.court()) {
        const pos = m.where[c.name];
        assert.deepEqual([c.x, c.y], FORMATIONS[mode][k][pos - 1], `${mode} rot ${k + 1} position ${pos} (${c.name})`);
      }
    });
  }
});

test('receive formations are legal: no overlap fault (FIVB 7.4.3, level is legal)', () => {
  const app = loadApp();
  eachRotation(app, 'receive', (k, m) => {
    const spot = {};
    for (const c of app.court()) spot[m.where[c.name]] = c;
    const msg = `receive rot ${k + 1}`;
    // Front player closer to the net than the back player in the same column.
    for (const [front, back] of [[2, 1], [3, 6], [4, 5]]) {
      assert.ok(spot[front].y <= spot[back].y, `${msg}: position ${front} behind ${back}`);
    }
    // Left to right inside each row: 4-3-2 and 5-6-1.
    for (const [left, right] of [[4, 3], [3, 2], [5, 6], [6, 1]]) {
      assert.ok(spot[left].x <= spot[right].x, `${msg}: position ${left} right of ${right}`);
    }
  });
});

test('receive is a conventional 5-1: both outside hitters and the back-row middle pass, setter and opposite do not', () => {
  const app = loadApp();
  const CARD = 15; // a card is 15% of court width wide
  eachRotation(app, 'receive', (k, m) => {
    const cards = app.court();
    const msg = `receive rot ${k + 1}`;
    const backRowMiddle = cards.filter((c) => c.role.startsWith('M') && !FRONT.has(CODES[m.where[c.name] - 1]));
    assert.equal(backRowMiddle.length, 1, `${msg}: one back-row middle`);
    const passers = cards.filter((c) => c.role.startsWith('OH')).concat(backRowMiddle);
    assert.equal(passers.length, 3, `${msg}: three passers`);
    // Passers stand in the back half, past the attack line, ready to take serve.
    for (const p of passers) assert.ok(p.y >= 45, `${msg}: passer ${p.role} at y${p.y} is too close to the net`);
    const ys = passers.map((p) => p.y);
    const xs = passers.map((p) => p.x);
    const [front, back, left, right] = [Math.min(...ys), Math.max(...ys), Math.min(...xs), Math.max(...xs)];
    // Each passer has their own lane, and together they cover the left and right of the court.
    const lanes = [...xs].sort((a, b) => a - b);
    for (let i = 1; i < lanes.length; i += 1) {
      assert.ok(lanes[i] - lanes[i - 1] >= CARD, `${msg}: passers bunched in one lane at x${lanes[i - 1]} and x${lanes[i]}`);
    }
    assert.ok(left <= 30 && right >= 65, `${msg}: passers span only x${left}-${right}`);
    // The setter stays in front of the deepest passer, for a short run to the target.
    const setter = cards.find((c) => c.role === 'S1');
    assert.ok(setter.y < back, `${msg}: setter at y${setter.y} is behind the passers`);
    // The setter and opposite are in front of, behind, or a card width outside the passing line.
    for (const role of ['S1', 'OPP']) {
      const c = cards.find((card) => card.role === role);
      const clear = c.y < front || c.y > back || c.x <= left - CARD || c.x >= right + CARD;
      assert.ok(clear, `${msg}: ${role} at (${c.x},${c.y}) stands in the passing line`);
    }
  });
});

test('cards (15% of court width x 15% of playing height) cannot overlap in any layout', () => {
  const app = loadApp();
  for (const mode of ['receive', 'serve']) {
    eachRotation(app, mode, (k) => {
      const cards = app.court();
      for (let i = 0; i < cards.length; i += 1) {
        for (let j = i + 1; j < cards.length; j += 1) {
          const dx = Math.abs(cards[i].x - cards[j].x);
          const dy = Math.abs(cards[i].y - cards[j].y);
          assert.ok(dx > 15 || dy > 15, `${mode} rot ${k + 1}: ${cards[i].name} and ${cards[j].name} only ${dx}/${dy} apart`);
        }
      }
    });
  }
});

// --- Bug 3: position labels -------------------------------------------------

test('BUG 3: every card is labelled with its true rotational position in all 12 layouts', () => {
  const app = loadApp();
  for (const mode of ['receive', 'serve']) {
    eachRotation(app, mode, (k, m) => {
      for (const c of app.court()) {
        assert.equal(c.pos, CODES[m.where[c.name] - 1], `${mode} rot ${k + 1}: ${c.role} ${c.name}`);
      }
    });
  }
});

// --- Bug 1: serving badge ----------------------------------------------------

function assertServerInPositionOne(app, m, msg) {
  const servers = app.court().filter((c) => c.serving);
  assert.equal(servers.length, 1, `${msg}: one serving badge`);
  assert.equal(servers[0].name, m.at(1), `${msg}: badge on ${servers[0].name} @${servers[0].pos}`);
  assert.equal(servers[0].pos, 'RB', msg);
}

test('serving badge is on the player in position 1 in every serve rotation', () => {
  const app = loadApp();
  eachRotation(app, 'serve', (k, m) => assertServerInPositionOne(app, m, `rot ${k + 1}`));
});

for (const [outName, inName] of [['Outside 1', 'Opposite 2'], ['Setter', 'Opposite 2'], ['Opposite', 'Outside 3'], ['Middle 1', 'Outside 3']]) {
  test(`BUG 1: serving badge follows position 1 after cross-role sub ${outName} -> ${inName}`, () => {
    const app = loadApp();
    const m = model();
    app.sub(outName, inName);
    m.sub(outName, inName);
    eachRotation(app, 'serve', (k) => assertServerInPositionOne(app, m, `rot ${k + 1}`), m);
  });
}

// --- Bug 2: substitution dropdown -------------------------------------------

test('BUG 2: substitution dropdown lists true positions after each rotation', () => {
  const app = loadApp();
  for (const mode of ['receive', 'serve']) {
    eachRotation(app, mode, (k, m) => {
      const expected = [1, 2, 3, 4, 5, 6].map((p) => {
        const card = app.court().find((c) => c.name === m.at(p));
        return `${p} (${CODES[p - 1]}) - ${card.role} ${card.name}`;
      });
      assert.deepEqual(app.options(), expected, `${mode} rot ${k + 1}`);
    });
  }
});

test('BUG 2: highlighted card and Sub in target agree after each Rotate clockwise', () => {
  const app = loadApp();
  for (let k = 0; k < 6; k += 1) {
    app.click('rotate-lineup');
    const highlighted = app.court().filter((c) => c.selected);
    assert.equal(highlighted.length, 1, `rot ${k + 2}: one highlighted card`);
    assert.ok(app.subTarget().endsWith(` - ${highlighted[0].role} ${highlighted[0].name}`), `rot ${k + 2}: court ${highlighted[0].name}, dropdown ${app.subTarget()}`);
  }
  // And Sub in really replaces the highlighted player.
  const target = app.court().find((c) => c.selected).name;
  app.click('make-sub');
  assert.ok(!app.court().some((c) => c.name === target), `${target} should have left the court`);
});

test('after a substitution the incoming player is highlighted and targeted', () => {
  const app = loadApp();
  app.sub('Outside 1', 'Outside 3');
  assert.equal(app.court().find((c) => c.selected).name, 'Outside 3');
  assert.ok(app.subTarget().endsWith(' Outside 3'), app.subTarget());
});

// --- Bug 7: undo -------------------------------------------------------------

test('BUG 7: undo restores score, lineup, rotation and phase after each kind of rally', () => {
  for (const [startMode, button] of [['receive', 'log-win'], ['receive', 'log-loss'], ['serve', 'log-win'], ['serve', 'log-loss']]) {
    const app = loadApp();
    // Get to a non-trivial state first: a sub, two rotations and a few rallies.
    app.sub('Opposite', 'Outside 3');
    app.click('log-win');
    app.click('log-loss');
    app.click('log-win');
    setMode(app, startMode);
    const before = state(app);
    app.click(button);
    assert.notDeepEqual(state(app), before, `${startMode} ${button} should change something`);
    app.click('undo-rally');
    assert.deepEqual(state(app), before, `${startMode} ${button} then undo`);
  }
});

test('BUG 7: undo steps back one rally at a time to the start, then disables', () => {
  const app = loadApp();
  assert.equal(app.el('undo-rally').disabled, true, 'nothing to undo at start');
  const states = [state(app)];
  for (const button of ['log-win', 'log-win', 'log-loss', 'log-loss', 'log-win']) {
    app.click(button);
    states.push(state(app));
  }
  assert.equal(app.el('undo-rally').disabled, false);
  for (let i = states.length - 2; i >= 0; i -= 1) {
    app.click('undo-rally');
    assert.deepEqual(state(app), states[i], `after undo back to step ${i}`);
  }
  assert.equal(app.el('undo-rally').disabled, true, 'all rallies undone');
});

// --- Bug 8: reset confirmation ----------------------------------------------

test('BUG 8: reset asks for confirmation and keeps everything when declined', () => {
  const app = loadApp({ confirmAnswer: false });
  app.sub('Outside 1', 'Outside 3');
  app.click('log-win');
  app.click('log-win');
  const before = state(app);
  app.click('reset-match');
  assert.equal(app.confirms.length, 1, 'confirm() was asked');
  assert.deepEqual(state(app), before);
});

test('BUG 8: confirmed reset restores the starting state and clears undo', () => {
  const fresh = state(loadApp());
  const app = loadApp({ confirmAnswer: true });
  app.sub('Outside 1', 'Outside 3');
  app.click('log-win');
  app.click('log-loss');
  app.click('reset-match');
  assert.equal(app.confirms.length, 1, 'confirm() was asked');
  const after = state(app);
  assert.deepEqual(after.score, '0-0');
  assert.deepEqual(after.court, fresh.court);
  assert.deepEqual(after.options, fresh.options);
  assert.deepEqual(after.bench, fresh.bench);
  assert.deepEqual(after.log, []);
  assert.equal(after.mode, 'Receive');
  assert.equal(after.rotation, 1);
  assert.equal(app.el('undo-rally').disabled, true);
});

// --- Rotation labels: play order and setter position ------------------------

// Play order 1-6 with the setter (S1) moving 1, 6, 5, 4, 3, 2 (FIVB 7.6.2).
const SETTER_BY_ROT = [1, 6, 5, 4, 3, 2];

test('rotation labels show play order and the setter position in every rotation', () => {
  const app = loadApp();
  for (const mode of ['receive', 'serve']) {
    eachRotation(app, mode, (k, m) => {
      const setter = SETTER_BY_ROT[k];
      assert.equal(m.where.Setter, setter, `model agrees: rot ${k + 1}`);
      assert.equal(app.contextLabel(), `Rotation ${k + 1} · Setter in ${setter}`, `${mode} context rot ${k + 1}`);
      assert.equal(app.courtLabel(), `Rot ${k + 1} · Setter in ${setter}`, `${mode} court rot ${k + 1}`);
    });
  }
});

test('rally log and undo status name the rotation and setter position', () => {
  const app = loadApp();
  app.click('log-win'); // side-out: Rot 2, setter rotates from 1 to 6
  assert.match(app.log()[0], /Rot 2 · Setter in 6, Mode: serve\./);
  app.click('log-loss');
  app.click('log-win'); // Rot 3, setter in 5
  assert.match(app.log()[0], /Rot 3 · Setter in 5, Mode: serve\./);
  app.click('undo-rally');
  assert.match(app.status(), /Rotation 2 · Setter in 6, receiving\./);
});

test('setter position is read from the lineup and drops out when no setter is on court', () => {
  const app = loadApp();
  app.click('rotate-lineup');
  app.click('rotate-lineup'); // Rot 3, Setter in 5
  assert.equal(app.contextLabel(), 'Rotation 3 · Setter in 5');
  app.sub('Setter', 'Opposite 2'); // OPP replaces the only setter
  assert.equal(app.contextLabel(), 'Rotation 3');
  assert.equal(app.courtLabel(), 'Rot 3');
  app.click('log-win');
  assert.match(app.log()[0], /Rot 4, Mode: serve\./);
});

// --- Set end (FIVB 6.2: 25 with a two-point lead, 15 in the fifth set) ------

// Log `us` won and `opp` lost rallies, alternating while both remain, so the
// set is not decided early by a long run for one side.
function points(app, us, opp) {
  for (let i = 0; i < Math.max(us, opp); i += 1) {
    if (i < us) app.click('log-win');
    if (i < opp) app.click('log-loss');
  }
}

// Play a whole set as a straight 25-0 (or 15-0) win and start the next one.
function winSet(app) {
  const target = app.setLabel() === 'Set 5' ? 15 : 25;
  points(app, target, 0);
  assert.equal(app.setOver(), true, `${app.setLabel()} over at ${app.score()}`);
  app.click('next-set');
}

test('SET: the set starts as Set 1 and is not over at 0-0 or 24-24', () => {
  const app = loadApp();
  assert.equal(app.setLabel(), 'Set 1');
  assert.equal(app.setOver(), false);
  points(app, 24, 24);
  assert.equal(app.score(), '24-24');
  assert.equal(app.setOver(), false);
  assert.equal(app.el('log-win').disabled, false);
});

test('SET: 25 points with a two-point lead wins the set and shows the prompt', () => {
  const app = loadApp();
  points(app, 24, 23);
  assert.equal(app.setOver(), false, '24-23 is not a set');
  app.click('log-win');
  assert.equal(app.score(), '25-23');
  assert.equal(app.setOver(), true);
  assert.equal(app.setEndText(), 'Set 1 won by Us, 25-23.');
  assert.equal(app.nextSetLabel(), 'Start set 2');
  assert.equal(app.el('log-win').disabled, true, 'no more rallies once the set is won');
  assert.equal(app.el('log-loss').disabled, true);
  assert.match(app.log()[0], /Set 1 won by Us\./);
});

test('SET: deuce goes on past 25 until someone leads by two', () => {
  const app = loadApp();
  points(app, 24, 24);
  app.click('log-loss'); // 24-25
  assert.equal(app.setOver(), false, '24-25 needs a two-point lead');
  app.click('log-win'); // 25-25
  app.click('log-win'); // 26-25
  assert.equal(app.setOver(), false, '26-25 needs a two-point lead');
  app.click('log-loss'); // 26-26
  app.click('log-loss'); // 26-27
  app.click('log-loss'); // 26-28
  assert.equal(app.score(), '26-28');
  assert.equal(app.setOver(), true);
  assert.equal(app.setEndText(), 'Set 1 won by Opp, 26-28.');
});

test('SET: undo of a mis-tapped winning point reopens the set', () => {
  const app = loadApp();
  points(app, 24, 20);
  const before = state(app);
  app.click('log-win');
  assert.equal(app.setOver(), true);
  app.click('undo-rally');
  assert.equal(app.setOver(), false);
  assert.equal(app.el('log-win').disabled, false);
  assert.equal(app.el('log-loss').disabled, false);
  assert.deepEqual(state(app), before);
  app.click('log-loss');
  assert.equal(app.score(), '24-21', 'rallies can be logged again');
});

test('SET: starting the next set resets the score and returns to Rotation 1, keeping subs', () => {
  const app = loadApp();
  app.sub('Outside 1', 'Outside 3');
  for (let i = 0; i < 3; i += 1) { // three side-outs: Rotation 4
    app.click('log-win');
    app.click('log-loss');
  }
  assert.equal(app.rotation(), 4);
  points(app, 22, 22);
  assert.equal(app.score(), '25-25');
  points(app, 0, 2);
  assert.equal(app.setOver(), true);
  app.click('next-set');
  assert.equal(app.setLabel(), 'Set 2');
  assert.equal(app.score(), '0-0');
  assert.equal(app.setOver(), false);
  assert.equal(app.rotation(), 1);
  assert.deepEqual(app.log(), []);
  const court = app.court();
  assert.equal(court.find((c) => c.pos === 'RB').name, 'Setter', 'Rotation 1 server back in position 1');
  assert.equal(court.find((c) => c.pos === 'RF').name, 'Outside 3', 'the substitute keeps the replaced slot');
  assert.ok(!court.some((c) => c.name === 'Outside 1'));
});

test('SET: first serve alternates between sets (FIVB 12.1)', () => {
  const app = loadApp();
  assert.equal(app.mode(), 'Receive');
  winSet(app);
  assert.equal(app.mode(), 'Serve', 'received first in set 1, so serve first in set 2');
  assert.equal(app.court().find((c) => c.serving).name, 'Setter');
  winSet(app);
  assert.equal(app.mode(), 'Receive', 'served first in set 2, so receive first in set 3');
  winSet(app);
  assert.equal(app.mode(), 'Serve', 'received first in set 3, so serve first in set 4');
});

test('SET: the deciding set and a new match keep the phase, as a coin toss decides (FIVB 7.1, 12.1)', () => {
  const app = loadApp();
  for (let i = 0; i < 3; i += 1) winSet(app);
  assert.equal(app.setLabel(), 'Set 4');
  assert.equal(app.mode(), 'Serve', 'received first in set 3, so serve first in set 4');
  points(app, 25, 0);
  app.click('next-set');
  assert.equal(app.setLabel(), 'Set 5');
  assert.equal(app.mode(), 'Serve', 'served first in set 4, but the deciding set does not alternate');
  assert.match(app.status(), /coin toss/i);
  app.click('log-loss'); // lose serve: now receiving
  points(app, 15, 0);
  assert.equal(app.mode(), 'Serve', 'won the fifth set while serving');
  app.click('next-set');
  assert.equal(app.setLabel(), 'Set 1');
  assert.equal(app.mode(), 'Serve', 'a new match keeps the current phase');
  assert.match(app.status(), /coin toss/i);
  points(app, 25, 0);
  app.click('next-set');
  assert.equal(app.setLabel(), 'Set 2');
  assert.equal(app.mode(), 'Receive', 'served first in set 1, so receive first in set 2');
  assert.doesNotMatch(app.status(), /coin toss/i);
});

test('SET: the fifth set is won at 15 with a two-point lead', () => {
  const app = loadApp();
  for (let i = 0; i < 4; i += 1) winSet(app);
  assert.equal(app.setLabel(), 'Set 5');
  points(app, 14, 14);
  assert.equal(app.setOver(), false, '14-14 in the fifth set');
  app.click('log-win');
  assert.equal(app.setOver(), false, '15-14 needs a two-point lead');
  app.click('log-win');
  assert.equal(app.score(), '16-14');
  assert.equal(app.setOver(), true);
  assert.equal(app.setEndText(), 'Set 5 won by Us, 16-14.');
  assert.equal(app.nextSetLabel(), 'Start new match');
  app.click('next-set');
  assert.equal(app.setLabel(), 'Set 1', 'after the fifth set a new match starts');
});

test('SET: a 15-point lead does not end sets 1 to 4', () => {
  const app = loadApp();
  points(app, 15, 0);
  assert.equal(app.setOver(), false);
});

test('SET: undo after starting the next set returns to the end of the previous set', () => {
  const app = loadApp();
  points(app, 25, 10);
  const ended = state(app);
  app.click('next-set');
  app.click('log-win');
  app.click('undo-rally');
  assert.equal(app.setLabel(), 'Set 2');
  assert.equal(app.score(), '0-0');
  app.click('undo-rally');
  assert.equal(app.setLabel(), 'Set 1');
  assert.equal(app.setOver(), true);
  assert.deepEqual(state(app), ended);
  assert.match(app.status(), /Back to the end of Set 1: 25-10/);
  app.click('undo-rally');
  assert.equal(app.score(), '24-10');
  assert.equal(app.setOver(), false);
});

test('SET: confirmed reset goes back to Set 1', () => {
  const app = loadApp({ confirmAnswer: true });
  winSet(app);
  winSet(app);
  assert.equal(app.setLabel(), 'Set 3');
  app.click('reset-match');
  assert.equal(app.setLabel(), 'Set 1');
  assert.equal(app.mode(), 'Receive');
  assert.equal(app.setOver(), false);
});

// --- Visual cues -------------------------------------------------------------

test('court and phase pill carry the current phase so CSS can colour it', () => {
  const app = loadApp();
  assert.equal(app.els.court.dataset.phase, 'receive');
  assert.equal(app.el('mode-label').dataset.state, 'receive');
  app.click('toggle-mode');
  assert.equal(app.els.court.dataset.phase, 'serve');
  assert.equal(app.el('mode-label').dataset.state, 'serve');
  app.click('swap-phase');
  assert.equal(app.els.court.dataset.phase, 'receive');
});

// --- Optional libero ("With libero" switch, off by default) ------------------

// Oracle for the back-row middle in each rotation of the default 5-1, worked out by hand:
// M1 starts in 3 and M2 in 6, and each rotation moves a player 2 -> 1 -> 6 -> 5 -> 4 -> 3 -> 2.
// [middle role, position] of the middle that is in the back row in Rot 1 to Rot 6.
const BACK_ROW_MIDDLE = [['M2', 6], ['M2', 5], ['M1', 1], ['M1', 6], ['M1', 5], ['M2', 1]];
const FRONT_MIDDLE = ['M1', 'M1', 'M2', 'M2', 'M2', 'M1'];
const SERVER_ROLES = ['S1', 'OH1', 'M1', 'OPP', 'OH2', 'M2'];

function liberoApp() {
  const app = loadApp();
  app.setLibero(true);
  return app;
}

// Overlap legality (FIVB 7.4.3) for the six cards, listed by position. The server
// (position 1 in the serve phase) stands behind the end line, so is skipped there.
function assertLegalOverlap(cards, mode, msg) {
  const spot = {};
  cards.forEach((c, i) => { spot[i + 1] = c; });
  const skipServer = (pair) => !(mode === 'serve' && pair.includes(1));
  for (const [front, back] of [[2, 1], [3, 6], [4, 5]].filter(skipServer)) {
    assert.ok(spot[front].y <= spot[back].y, `${msg}: position ${front} behind ${back}`);
  }
  for (const [left, right] of [[4, 3], [3, 2], [5, 6], [6, 1]].filter(skipServer)) {
    assert.ok(spot[left].x <= spot[right].x, `${msg}: position ${left} right of ${right}`);
  }
}

test('LIBERO: the switch is off by default, so a first lesson is the bare 5-1', () => {
  const app = loadApp();
  assert.equal(app.liberoOn(), false);
  assert.equal(app.liberoNote(), '');
  for (const mode of ['receive', 'serve']) {
    eachRotation(app, mode, (k) => {
      assert.ok(!app.court().some((c) => c.libero || c.role === 'L'), `${mode} rot ${k + 1}: no libero on court`);
      assert.ok(app.court().some((c) => c.role === 'M1') && app.court().some((c) => c.role === 'M2'), `${mode} rot ${k + 1}: both middles play`);
    });
  }
});

test('LIBERO: in every rotation and phase the libero takes the back-row middle\'s spot, except when that middle serves', () => {
  const app = liberoApp();
  for (const mode of ['receive', 'serve']) {
    eachRotation(app, mode, (k, m) => {
      const msg = `${mode} rot ${k + 1}`;
      const cards = app.court();
      const [middle, pos] = BACK_ROW_MIDDLE[k];
      const serveCase = mode === 'serve' && pos === 1;
      const liberos = cards.filter((c) => c.libero);
      // The six spots and who the model says stands in them.
      cards.forEach((c, i) => {
        assert.deepEqual([c.x, c.y], FORMATIONS[mode][k][i], `${msg}: position ${i + 1} coordinates`);
        assert.equal(c.pos, CODES[i], `${msg}: position label`);
      });
      if (serveCase) {
        // The libero never serves: the middle stays in position 1 to serve, the libero is off.
        assert.equal(liberos.length, 0, `${msg}: libero is off while ${middle} serves`);
        assert.equal(cards[0].role, middle, `${msg}: ${middle} serves`);
        assert.equal(cards[0].serving, true, `${msg}: ${middle} carries the serving badge`);
      } else {
        assert.equal(liberos.length, 1, `${msg}: exactly one libero`);
        const lib = cards[pos - 1];
        assert.equal(lib.libero, true, `${msg}: libero stands in position ${pos}`);
        assert.equal(lib.role, 'L');
        assert.equal(lib.name, 'Libero');
        assert.equal(lib.swap, `for ${middle}`, `${msg}: swap is marked on the libero`);
        assert.equal(lib.front, false, `${msg}: the libero never plays the front row`);
        assert.ok(!cards.some((c) => c.role === middle), `${msg}: ${middle} is off court while the libero is in`);
      }
      // The other middle is always in the front row, and everyone else is who the model says.
      const front = cards.find((c) => c.role === FRONT_MIDDLE[k]);
      assert.ok(front && front.front, `${msg}: ${FRONT_MIDDLE[k]} blocks at the net`);
      for (const c of cards.filter((card) => !card.libero && !card.role.startsWith('M'))) {
        assert.equal(m.where[c.name], CODES.indexOf(c.pos) + 1, `${msg}: ${c.name} in the modelled position`);
      }
      assert.equal(cards.filter((c) => c.serving && c.libero).length, 0, `${msg}: the libero never serves`);
    });
  }
});

test('LIBERO: FIVB overlap is legal in every rotation, both phases, with the libero on', () => {
  const app = liberoApp();
  for (const mode of ['receive', 'serve']) {
    eachRotation(app, mode, (k) => assertLegalOverlap(app.court(), mode, `${mode} rot ${k + 1}`));
  }
});

test('LIBERO: in receive the libero passes in the back-row middle\'s place, with both outside hitters', () => {
  const app = liberoApp();
  eachRotation(app, 'receive', (k) => {
    const cards = app.court();
    const passers = cards.filter((c) => c.role === 'OH1' || c.role === 'OH2' || c.libero);
    assert.equal(passers.length, 3, `rot ${k + 1}: libero and the two outside hitters pass`);
    for (const p of passers) assert.ok(p.y >= 45, `rot ${k + 1}: ${p.role} at y${p.y} is too close to the net`);
    for (const role of ['S1', 'OPP']) {
      const c = cards.find((card) => card.role === role);
      assert.ok(!passers.includes(c), `rot ${k + 1}: ${role} does not pass`);
    }
  });
});

test('LIBERO: serving order is unchanged: OH1, M1, OPP, OH2, M2, S1, and the middle serves, never the libero', () => {
  const app = liberoApp();
  const servers = [];
  for (let i = 0; i < 6; i += 1) {
    app.click('log-win'); // side-out: rotate and serve
    const cards = app.court();
    const server = cards.find((c) => c.serving);
    servers.push(server.role);
    assert.equal(server.libero, false, `serve ${i + 1}: the libero never serves`);
    assert.equal(server.pos, 'RB');
    const middleServes = server.role.startsWith('M');
    assert.equal(cards.filter((c) => c.libero).length, middleServes ? 0 : 1, `serve ${i + 1}: libero is off exactly when a middle serves`);
    app.click('log-loss'); // lose serve: back to receive
    assert.equal(app.court().filter((c) => c.libero).length, 1, `after serve ${i + 1}: libero back in for the back-row middle`);
    assert.equal(app.court()[0].libero, middleServes, `after serve ${i + 1}: libero comes in for the middle who served`);
  }
  assert.deepEqual(servers, ['OH1', 'M1', 'OPP', 'OH2', 'M2', 'S1']);
  assert.deepEqual(servers, [...SERVER_ROLES.slice(1), SERVER_ROLES[0]]);
});

test('LIBERO: rotation, rotation labels and the setter are the same with the switch on or off', () => {
  const off = loadApp();
  const on = liberoApp();
  for (const mode of ['receive', 'serve']) {
    setMode(off, mode);
    setMode(on, mode);
    for (let k = 0; k < 6; k += 1) {
      assert.equal(on.courtLabel(), off.courtLabel(), `${mode} rot ${k + 1}`);
      assert.equal(on.contextLabel(), off.contextLabel(), `${mode} rot ${k + 1}`);
      const swap = (cards) => cards.map((c) => (c.libero ? { ...c, role: BACK_ROW_MIDDLE[k][0] } : c).role);
      assert.deepEqual(swap(on.court()), off.court().map((c) => c.role), `${mode} rot ${k + 1}: same six roles bar the libero swap`);
      on.click('rotate-lineup');
      off.click('rotate-lineup');
    }
  }
});

test('LIBERO: the swap is called out in each rotation (middle out going to the front, libero in going to the back)', () => {
  const app = liberoApp();
  // Receive phase, Rot 1 to Rot 6 and round again.
  const receiveChanges = [
    '', // Rot 1 -> 2: M2 stays in the back row, libero stays in for M2
    'M2 rotates to the front row (position 4): libero out, M2 back in. Libero in for M1 at position 1.',
    '', // Rot 3 -> 4: M1 moves 1 -> 6, libero stays in for M1
    '', // Rot 4 -> 5
    'M1 rotates to the front row (position 4): libero out, M1 back in. Libero in for M2 at position 1.',
    '' // Rot 6 -> 1
  ];
  for (let k = 0; k < 6; k += 1) {
    app.click('rotate-lineup');
    const base = 'Rotation advanced clockwise after a side-out.';
    assert.equal(app.status(), receiveChanges[k] ? `${base} ${receiveChanges[k]}` : base, `receive Rot ${k + 1} -> ${(k + 1) % 6 + 1}`);
  }
  // Serve phase: the middle at position 1 serves, so the libero comes out for it and goes back in a rotation later.
  setMode(app, 'serve');
  const serveChanges = [
    '', // Rot 1 -> 2
    'M2 rotates to the front row (position 4): libero out, M2 back in.', // M1 reaches position 1 and serves
    'Libero in for M1 at position 6.', // M1 has served, moves to 6
    '', // Rot 4 -> 5
    'M1 rotates to the front row (position 4): libero out, M1 back in.', // M2 reaches position 1 and serves
    'Libero in for M2 at position 6.'
  ];
  for (let k = 0; k < 6; k += 1) {
    app.click('rotate-lineup');
    const base = 'Rotation advanced clockwise after a side-out.';
    assert.equal(app.status(), serveChanges[k] ? `${base} ${serveChanges[k]}` : base, `serve Rot ${k + 1} -> ${(k + 1) % 6 + 1}`);
  }
});

test('LIBERO: a side-out win rotates into serve using the serve-phase swap', () => {
  const app = liberoApp();
  app.click('log-win'); // Rot 2 serving: M2 still back row at 5, libero in for M2
  assert.equal(app.mode(), 'Serve');
  assert.equal(app.court()[4].libero, true);
  app.click('log-loss');
  app.click('log-win'); // Rot 3 serving: M1 reaches position 1 and serves, so no libero
  assert.equal(app.rotation(), 3);
  assert.equal(app.court().some((c) => c.libero), false);
  assert.equal(app.court()[0].role, 'M1');
  assert.equal(app.court()[0].serving, true);
  assert.match(app.status(), /M2 rotates to the front row \(position 4\): libero out, M2 back in\./);
  assert.doesNotMatch(app.status(), /Libero in for M1/);
});

test('LIBERO: the note under the court label says what the libero is doing', () => {
  const app = liberoApp();
  const notes = {};
  for (const mode of ['receive', 'serve']) {
    eachRotation(app, mode, (k) => { notes[`${mode}${k + 1}`] = app.liberoNote(); });
  }
  assert.equal(notes.receive1, 'Libero in for M2 at position 6 (MB). M1 in the front row.');
  assert.equal(notes.serve1, 'Libero in for M2 at position 6 (MB). M1 in the front row.');
  assert.equal(notes.receive3, 'Libero in for M1 at position 1 (RB). M2 in the front row.');
  assert.equal(notes.serve3, 'M1 serves from position 1 and stays in: the libero never serves, so the libero is off until the serve is over. M2 in the front row.');
  assert.equal(notes.serve6, 'M2 serves from position 1 and stays in: the libero never serves, so the libero is off until the serve is over. M1 in the front row.');
  assert.equal(notes.receive6, 'Libero in for M2 at position 1 (RB). M1 in the front row.');
  app.setLibero(false);
  assert.equal(app.liberoNote(), '', 'note is hidden when the switch is off');
});

test('LIBERO: the sub dropdown flags the slot the libero covers', () => {
  const app = liberoApp();
  const flagged = app.options().filter((o) => o.endsWith('(libero in)'));
  assert.deepEqual(flagged, ['6 (MB) - M2 Middle 2 (libero in)']);
  app.setLibero(false);
  assert.ok(!app.options().some((o) => o.includes('libero')));
  setMode(app, 'serve');
  app.setLibero(true);
  for (let k = 0; k < 2; k += 1) app.click('rotate-lineup'); // Rot 3, serve: M1 serves in position 1
  assert.ok(!app.options().some((o) => o.includes('libero')), 'no libero while a middle serves');
});

test('LIBERO: tapping the libero targets the middle they replaced; subbing keeps the libero in', () => {
  const app = liberoApp();
  app.tapPlayer('Libero');
  assert.equal(app.subTarget(), '6 (MB) - M2 Middle 2 (libero in)');
  assert.equal(app.court()[5].selected, true);
  app.sub('Libero', 'Middle 4'); // a fresh middle for the covered slot
  const court = app.court();
  assert.equal(court[5].libero, true, 'libero still covers the back-row middle');
  assert.equal(court[5].swap, 'for M2');
  assert.ok(app.bench().includes('M2 Middle 2'), 'the replaced middle went to the bench');
  assert.match(app.status(), /Middle 4 \(M2\) in for Middle 2\./);
});

test('LIBERO: with no middle in the back row the libero is off', () => {
  const app = liberoApp();
  app.sub('Libero', 'Opposite 2'); // an opposite takes the back-row middle's slot
  assert.equal(app.court().some((c) => c.libero), false);
  assert.equal(app.court()[5].role, 'OPP');
  assert.equal(app.liberoNote(), 'No middle in the back row, so the libero is off. M1 in the front row.');
  // Rot 2: the remaining middle is at the net in position 2, and the libero still does not replace a front-row player.
  app.click('rotate-lineup');
  assert.equal(app.court()[1].role, 'M1');
  assert.equal(app.court().some((c) => c.libero), false);
});

test('LIBERO: switching on or off mid-match changes only the swap, not score, rotation or phase', () => {
  const app = loadApp();
  for (let i = 0; i < 2; i += 1) { app.click('log-win'); app.click('log-loss'); }
  app.click('log-win'); // Rot 4, serving
  const bare = state(app);
  app.setLibero(true);
  const withLib = state(app);
  assert.equal(withLib.score, bare.score);
  assert.equal(withLib.mode, bare.mode);
  assert.equal(withLib.rotation, bare.rotation);
  assert.equal(withLib.rotationLabel, bare.rotationLabel);
  assert.deepEqual(withLib.log, bare.log);
  assert.equal(withLib.court.filter((c) => c.libero).length, 1);
  app.setLibero(false);
  assert.deepEqual(state(app), bare, 'switching off restores the bare 5-1');
  assert.match(app.status(), /Libero off/);
});

test('LIBERO: undo restores the libero swap along with lineup, rotation and phase', () => {
  const app = liberoApp();
  app.click('log-win'); // Rot 2 serve
  app.click('log-loss');
  const before = state(app);
  app.click('log-win'); // Rot 3 serve: libero off for the serving middle
  assert.equal(app.court().some((c) => c.libero), false);
  app.click('undo-rally');
  assert.deepEqual(state(app), before);
  assert.equal(app.court()[4].libero, true);
  assert.equal(app.liberoOn(), true, 'undo leaves the switch alone');
});

test('LIBERO: the switch survives reset and a new set, which restart from Rotation 1', () => {
  const app = loadApp({ confirmAnswer: true });
  app.setLibero(true);
  app.click('log-win');
  app.click('log-loss');
  app.click('log-win'); // Rot 3
  app.click('reset-match');
  assert.equal(app.liberoOn(), true);
  assert.equal(app.rotation(), 1);
  assert.equal(app.court()[5].libero, true, 'Rot 1 receive: libero in for M2');
  winSet(app);
  assert.equal(app.setLabel(), 'Set 2');
  assert.equal(app.liberoOn(), true);
  assert.equal(app.court().filter((c) => c.libero).length, 1);
});

test('LIBERO: switching phase or losing serve says when the libero comes in or out', () => {
  const app = liberoApp();
  app.click('rotate-lineup');
  app.click('rotate-lineup'); // Rot 3 receive: libero in for M1 at position 1
  setMode(app, 'serve');
  assert.equal(app.status(), 'M1 is in position 1 to serve: libero out, M1 stays in.');
  app.click('log-loss'); // lose serve: back to receive, libero covers M1 again
  assert.equal(app.mode(), 'Receive');
  assert.equal(app.status(), 'Libero in for M1 at position 1.');
  setMode(app, 'serve');
  assert.equal(app.status(), 'M1 is in position 1 to serve: libero out, M1 stays in.');
  app.click('rotate-lineup'); // Rot 4: M1 has served and moved to 6
  assert.equal(app.status(), 'Rotation advanced clockwise after a side-out. Libero in for M1 at position 6.');
  setMode(app, 'receive'); // same middle covered in both phases: nothing to announce
  assert.equal(app.status(), 'Rotation advanced clockwise after a side-out. Libero in for M1 at position 6.');

// Keep-screen-awake switch (Screen Wake Lock API).
const tick = () => new Promise((resolve) => setImmediate(resolve));
const flip = (app, on) => {
  const box = app.el('keep-awake');
  box.checked = on;
  box.fire('change');
};

test('wake lock: switch is hidden when the API is unsupported', () => {
  const app = loadApp();
  // The markup ships hidden; the app only reveals it when the API exists.
  const html = require('node:fs').readFileSync(require('node:path').join(__dirname, '..', 'index.html'), 'utf8');
  assert.match(html, /id="awake-wrap" hidden/);
  assert.notEqual(app.el('awake-wrap').hidden, false);
});

test('wake lock: switch shows and is off by default, with no lock requested', async () => {
  const wl = fakeWakeLock();
  const app = loadApp({ wakeLock: wl, session: fakeSession() });
  await tick();
  assert.equal(app.el('awake-wrap').hidden, false);
  assert.notEqual(app.el('keep-awake').checked, true);
  assert.equal(wl.requests, 0);
});

test('wake lock: turning it on holds a lock, turning it off releases it', async () => {
  const wl = fakeWakeLock();
  const app = loadApp({ wakeLock: wl, session: fakeSession() });
  flip(app, true);
  await tick();
  assert.equal(wl.held, 1);
  flip(app, false);
  await tick();
  assert.equal(wl.held, 0);
});

test('wake lock: hide and show with a lock still held does not stack locks', async () => {
  const wl = fakeWakeLock();
  const app = loadApp({ wakeLock: wl, session: fakeSession() });
  flip(app, true);
  await tick();
  // Browser releases the lock on hide; the app only learns via the release event.
  const dropped = wl.held;
  app.setVisibility('hidden');
  app.setVisibility('visible');
  await tick();
  assert.equal(dropped, 1);
  assert.equal(wl.held, 1, 'still exactly one lock when visible with one already held');
});

test('wake lock: lock dropped by the browser is requested again on return', async () => {
  const wl = fakeWakeLock();
  const locks = [];
  const origRequest = wl.request;
  wl.request = async (t) => { const s = await origRequest(t); locks.push(s); return s; };
  const app = loadApp({ wakeLock: wl, session: fakeSession() });
  flip(app, true);
  await tick();
  app.setVisibility('hidden');
  locks[0].drop();
  assert.equal(wl.held, 0);
  app.setVisibility('visible');
  await tick();
  assert.equal(wl.held, 1);
  assert.equal(wl.requests, 2);
});

test('wake lock: not re-acquired on return when the switch is off', async () => {
  const wl = fakeWakeLock();
  const app = loadApp({ wakeLock: wl, session: fakeSession() });
  flip(app, true);
  await tick();
  flip(app, false);
  await tick();
  app.setVisibility('visible');
  await tick();
  assert.equal(wl.requests, 1);
  assert.equal(wl.held, 0);
});

test('wake lock: the choice is remembered for the session only', async () => {
  const session = fakeSession();
  const first = loadApp({ wakeLock: fakeWakeLock(), session });
  flip(first, true);
  await tick();
  assert.equal(session.data['volleyro-keep-awake'], '1');

  const wl = fakeWakeLock();
  const reloaded = loadApp({ wakeLock: wl, session });
  await tick();
  assert.equal(reloaded.el('keep-awake').checked, true);
  assert.equal(wl.held, 1);

  const fresh = loadApp({ wakeLock: fakeWakeLock(), session: fakeSession() });
  assert.notEqual(fresh.el('keep-awake').checked, true);
});

test('wake lock: a refused request switches back off and says so', async () => {
  const wl = fakeWakeLock({ fail: true });
  const session = fakeSession();
  const app = loadApp({ wakeLock: wl, session });
  flip(app, true);
  await tick();
  assert.equal(app.el('keep-awake').checked, false);
  assert.equal(session.data['volleyro-keep-awake'], '0');
  assert.match(app.el('awake-status').textContent, /Could not keep the screen awake/);
});

test('wake lock: works when session storage is unavailable', async () => {
  const wl = fakeWakeLock();
  const session = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
  const app = loadApp({ wakeLock: wl, session });
  flip(app, true);
  await tick();
  assert.equal(wl.held, 1);
});

test('wake lock: reset session leaves the switch alone', async () => {
  const wl = fakeWakeLock();
  const app = loadApp({ wakeLock: wl, session: fakeSession() });
  flip(app, true);
  await tick();
  app.click('reset-match');
  await tick();
  assert.equal(wl.held, 1);
});
