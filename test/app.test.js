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
// These must not change: the fix only re-keys the data by position.
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
    [[88, 78], [76, 48], [50, 24], [22, 28], [26, 60], [52, 60]],
    [[82, 62], [76, 24], [50, 30], [24, 46], [26, 62], [66, 40]],
    [[88, 86], [78, 28], [52, 62], [18, 24], [26, 70], [72, 66]],
    [[86, 86], [68, 46], [50, 24], [8, 34], [30, 72], [52, 62]],
    [[82, 62], [76, 24], [50, 20], [22, 24], [26, 62], [52, 62]],
    [[84, 80], [76, 24], [50, 22], [34, 52], [22, 68], [52, 62]]
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
