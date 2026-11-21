'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { loadApp, fakeStorage } = require('./harness');

const KEY = 'volleyro:state';
const ROOT = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');

// Play a few rallies, a sub and a rotation so there is real state to save.
function playSome(app) {
  app.click('log-win'); // side-out: rotate, now serving
  app.click('log-win');
  app.click('log-loss');
  app.sub('Setter', 'Opposite 2');
  app.click('toggle-log');
}

test('state is saved after a change and resumed on reload', () => {
  const storage = fakeStorage();
  const first = loadApp({ storage });
  playSome(first);
  const expected = {
    score: first.score(), mode: first.mode(), label: first.courtLabel(),
    court: first.court(), bench: first.bench(), log: first.log(), set: first.setLabel()
  };

  const second = loadApp({ storage });
  assert.equal(second.score(), expected.score);
  assert.equal(second.mode(), expected.mode);
  assert.equal(second.courtLabel(), expected.label);
  assert.deepEqual(second.court(), expected.court);
  assert.deepEqual(second.bench(), expected.bench);
  assert.deepEqual(second.log(), expected.log);
  assert.equal(second.setLabel(), expected.set);
  assert.equal(second.bannerShown(), true);
  assert.match(second.bannerText(), /Set 1, 2-1/);
});

test('log visibility and the selected player survive a reload', () => {
  const storage = fakeStorage();
  const first = loadApp({ storage });
  first.click('toggle-log');
  first.tapPlayer('Middle 1');
  const second = loadApp({ storage });
  assert.equal(second.el('toggle-log').textContent, 'Show log');
  assert.equal(second.court().find((c) => c.selected).name, 'Middle 1');
});

test('undo history survives a reload', () => {
  const storage = fakeStorage();
  const first = loadApp({ storage });
  first.click('log-win');
  first.click('log-win');
  const second = loadApp({ storage });
  assert.equal(second.score(), '2-0');
  second.click('undo-rally');
  assert.equal(second.score(), '1-0');
  second.click('undo-rally');
  assert.equal(second.score(), '0-0');
  assert.equal(second.mode(), 'Receive');
  assert.equal(second.rotation(), 1);
  assert.equal(second.el('undo-rally').disabled, true);
});

test('a finished set resumes as finished, and the next set number persists', () => {
  const storage = fakeStorage();
  const first = loadApp({ storage });
  first.click('log-win');
  for (let i = 0; i < 24; i += 1) first.click('log-win');
  assert.equal(first.setOver(), true);
  const second = loadApp({ storage });
  assert.equal(second.setOver(), true);
  assert.equal(second.score(), '25-0');
  second.click('next-set');
  const third = loadApp({ storage });
  assert.equal(third.setLabel(), 'Set 2');
  assert.equal(third.score(), '0-0');
});

test('a fresh visit starts clean with no resume banner', () => {
  const app = loadApp({ storage: fakeStorage() });
  assert.equal(app.bannerShown(), false);
  assert.equal(app.score(), '0-0');
});

test('"Keep going" dismisses the resume banner and keeps the match', () => {
  const storage = fakeStorage();
  playSome(loadApp({ storage }));
  const app = loadApp({ storage });
  app.click('keep-going');
  assert.equal(app.bannerShown(), false);
  assert.equal(app.score(), '2-1');
});

test('"Start over" clears the match and the saved copy once confirmed', () => {
  const storage = fakeStorage();
  playSome(loadApp({ storage }));
  const app = loadApp({ storage });
  app.click('start-over');
  assert.equal(app.confirms.length, 1);
  assert.equal(app.score(), '0-0');
  assert.equal(app.bannerShown(), false);
  const again = loadApp({ storage });
  assert.equal(again.score(), '0-0');
  assert.equal(again.bannerShown(), false);
  assert.equal(again.court()[0].name, 'Setter');
});

test('declining "Start over" keeps the match and the saved copy', () => {
  const storage = fakeStorage();
  playSome(loadApp({ storage }));
  const app = loadApp({ storage, confirmAnswer: false });
  app.click('start-over');
  assert.equal(app.score(), '2-1');
  assert.equal(app.bannerShown(), true);
  assert.equal(loadApp({ storage }).score(), '2-1');
});

test('a save from another version is discarded and the app starts clean', () => {
  const storage = fakeStorage();
  playSome(loadApp({ storage }));
  const saved = JSON.parse(storage.getItem(KEY));
  storage.setItem(KEY, JSON.stringify({ ...saved, version: saved.version + 1 }));
  const app = loadApp({ storage });
  assert.equal(app.score(), '0-0');
  assert.equal(app.bannerShown(), false);
  assert.equal(storage.getItem(KEY), null);
});

test('unreadable or damaged saves are discarded, never crash', () => {
  const good = (() => {
    const storage = fakeStorage();
    playSome(loadApp({ storage }));
    return JSON.parse(storage.getItem(KEY));
  })();
  const bad = [
    'not json{',
    'null',
    '42',
    JSON.stringify({}),
    JSON.stringify({ ...good, state: { ...good.state, setNumber: 9 } }),
    JSON.stringify({ ...good, state: { ...good.state, scores: { us: -1, opp: 0 } } }),
    JSON.stringify({ ...good, state: { ...good.state, currentMode: 'sideways' } }),
    JSON.stringify({ ...good, state: { ...good.state, lineup: good.state.lineup.slice(1) } }),
    JSON.stringify({ ...good, state: { ...good.state, lineup: ['p1', 'p1', 'p1', 'p1', 'p1', 'p1'] } }),
    JSON.stringify({ ...good, state: { ...good.state, bench: ['zz', 'p8', 'p9', 'p10', 'p11'] } }),
    JSON.stringify({ ...good, undoStack: [{ nonsense: true }] }),
    JSON.stringify({ ...good, undoStack: 'nope' }),
    JSON.stringify({ ...good, state: { ...good.state, rallyHistory: [{ won: true, copy: '<img onerror=x>', score: '1-0' }] } })
  ];
  for (const text of bad) {
    const storage = fakeStorage({ [KEY]: text });
    const app = loadApp({ storage });
    assert.equal(app.score(), '0-0', text);
    assert.equal(app.mode(), 'Receive', text);
    assert.equal(app.bannerShown(), false, text);
    assert.equal(storage.getItem(KEY), null, text);
    app.click('log-win');
    assert.equal(app.score(), '1-0', text);
  }
});

test('storage that throws never breaks the app', () => {
  const boom = () => { throw new Error('storage blocked'); };
  const storage = { getItem: boom, setItem: boom, removeItem: boom };
  const app = loadApp({ storage });
  app.click('log-win');
  app.click('rotate-lineup');
  assert.equal(app.score(), '1-0');
});

test('the app works when localStorage does not exist at all', () => {
  const app = loadApp();
  app.click('log-win');
  assert.equal(app.score(), '1-0');
});

test('the saved record holds players by id plus a version', () => {
  const storage = fakeStorage();
  loadApp({ storage }).click('log-win');
  const saved = JSON.parse(storage.getItem(KEY));
  assert.equal(typeof saved.version, 'number');
  assert.deepEqual(saved.state.lineup, ['p4', 'p3', 'p2', 'p5', 'p6', 'p1']);
  assert.equal(saved.undoStack.length, 1);
});

// --- offline shell -------------------------------------------------------

test('the manifest is relative and its icons exist', () => {
  const manifest = JSON.parse(read('manifest.webmanifest'));
  assert.ok(manifest.name && manifest.short_name);
  assert.ok(!manifest.start_url.startsWith('/'));
  assert.equal(manifest.display, 'standalone');
  assert.ok(manifest.icons.some((i) => i.sizes === '512x512'));
  for (const icon of manifest.icons) assert.ok(fs.existsSync(path.join(ROOT, icon.src)), icon.src);
  assert.ok(fs.existsSync(path.join(ROOT, manifest.start_url)));
});

test('index.html links the manifest and uses only relative asset URLs', () => {
  const html = read('index.html');
  assert.match(html, /<link rel="manifest" href="manifest\.webmanifest">/);
  for (const [, url] of html.matchAll(/(?:href|src)="([^"]+)"/g)) assert.ok(!/^(\/|https?:)/.test(url), url);
  assert.match(read('app.js'), /register\('sw\.js', \{ scope: '\.\/' \}\)/);
});

// Run sw.js against a fake service-worker scope.
function loadWorker(cacheNames) {
  const listeners = {};
  const store = new Map(cacheNames.map((n) => [n, new Map()]));
  const caches = {
    keys: async () => [...store.keys()],
    delete: async (n) => store.delete(n),
    open: async (n) => {
      if (!store.has(n)) store.set(n, new Map());
      const c = store.get(n);
      return { addAll: async (urls) => urls.forEach((u) => c.set(u, true)), match: async (r) => c.get(typeof r === 'string' ? r : r.url), put: async () => {} };
    }
  };
  const self = { addEventListener: (t, fn) => { listeners[t] = fn; }, skipWaiting: async () => {}, clients: { claim: async () => { self.claimed = true; } }, location: { origin: 'http://x' } };
  vm.runInNewContext(read('sw.js'), { self, caches, URL, fetch: async () => { throw new Error('offline'); }, Response: { error: () => 'error' } });
  const run = async (type) => {
    let p;
    listeners[type]({ waitUntil: (x) => { p = x; } });
    await p;
  };
  return { store, run, self };
}

test('service worker caches the whole shell on install, and every shell file exists', async () => {
  const w = loadWorker([]);
  await w.run('install');
  const [name] = [...w.store.keys()];
  assert.match(name, /^volleyro-/);
  const cached = [...w.store.get(name).keys()];
  assert.ok(cached.includes('index.html') && cached.includes('app.js') && cached.includes('styles.css'));
  for (const file of cached) {
    if (file !== './') assert.ok(fs.existsSync(path.join(ROOT, file)), file);
  }
});

test('service worker removes only older volleyro caches on activate', async () => {
  const w = loadWorker([]);
  await w.run('install');
  const [current] = [...w.store.keys()];
  w.store.set('volleyro-old', new Map());
  w.store.set('other-app', new Map());
  await w.run('activate');
  assert.deepEqual([...w.store.keys()].sort(), [current, 'other-app'].sort());
  assert.equal(w.self.claimed, true);
});
