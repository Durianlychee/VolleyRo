'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp } = require('./harness');

const CODES = ['RB', 'RF', 'MF', 'LF', 'LB', 'MB'];
const FRONT = new Set(['RF', 'MF', 'LF']);

// Rotation 1 of the default 5-1: who starts in which rotational position.
const START = { Nasrul: 1, Luqman: 2, Bazli: 3, Akip: 4, Rahman: 5, Zahirah: 6 };

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

for (const [outName, inName] of [['Luqman', 'Atiq'], ['Nasrul', 'Atiq'], ['Akip', 'Sulaiman'], ['Bazli', 'Sulaiman']]) {
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
    assert.ok(app.subTarget().endsWith(` ${highlighted[0].name}`), `rot ${k + 2}: court ${highlighted[0].name}, dropdown ${app.subTarget()}`);
  }
  // And Sub in really replaces the highlighted player.
  const target = app.court().find((c) => c.selected).name;
  app.click('make-sub');
  assert.ok(!app.court().some((c) => c.name === target), `${target} should have left the court`);
});

test('after a substitution the incoming player is highlighted and targeted', () => {
  const app = loadApp();
  app.sub('Luqman', 'Sulaiman');
  assert.equal(app.court().find((c) => c.selected).name, 'Sulaiman');
  assert.ok(app.subTarget().endsWith(' Sulaiman'), app.subTarget());
});

// --- Bug 7: undo -------------------------------------------------------------

test('BUG 7: undo restores score, lineup, rotation and phase after each kind of rally', () => {
  for (const [startMode, button] of [['receive', 'log-win'], ['receive', 'log-loss'], ['serve', 'log-win'], ['serve', 'log-loss']]) {
    const app = loadApp();
    // Get to a non-trivial state first: a sub, two rotations and a few rallies.
    app.sub('Akip', 'Sulaiman');
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
  app.sub('Luqman', 'Sulaiman');
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
  app.sub('Luqman', 'Sulaiman');
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
      assert.equal(m.where.Nasrul, setter, `model agrees: rot ${k + 1}`);
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
  app.click('rotate-lineup'); // Rot 3, setter Nasrul in 5
  assert.equal(app.contextLabel(), 'Rotation 3 · Setter in 5');
  app.sub('Nasrul', 'Atiq'); // OPP replaces the only setter
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
  app.sub('Luqman', 'Sulaiman');
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
  assert.equal(court.find((c) => c.pos === 'RB').name, 'Nasrul', 'Rotation 1 server back in position 1');
  assert.equal(court.find((c) => c.pos === 'RF').name, 'Sulaiman', 'the substitute keeps the replaced slot');
  assert.ok(!court.some((c) => c.name === 'Luqman'));
});

test('SET: first serve alternates between sets (FIVB 12.1)', () => {
  const app = loadApp();
  assert.equal(app.mode(), 'Receive');
  winSet(app);
  assert.equal(app.mode(), 'Serve', 'received first in set 1, so serve first in set 2');
  assert.equal(app.court().find((c) => c.serving).name, 'Nasrul');
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
