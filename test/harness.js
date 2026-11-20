'use strict';
// Zero-dependency harness: runs the real, unmodified app.js inside node:vm
// against a tiny fake DOM, then drives it through its own buttons.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class El {
  constructor(tag) {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.listeners = {};
    this.dataset = {};
    this.attributes = {};
    this.className = '';
    this.textContent = '';
    this.disabled = false;
    this.classes = new Set();
    this.selectedIndex = -1;
    this.html = '';
    this.raw = '';
    const props = {};
    this.style = {
      setProperty: (name, value) => { props[name] = String(value); },
      getPropertyValue: (name) => props[name] ?? ''
    };
  }

  set innerHTML(v) {
    this.html = v;
    if (v === '') {
      this.children = [];
      this.selectedIndex = -1;
    }
  }

  get innerHTML() { return this.html; }

  appendChild(c) {
    this.children.push(c);
    if (this.tagName === 'SELECT' && this.selectedIndex < 0) this.selectedIndex = 0;
    return c;
  }

  setAttribute(name, value) { this.attributes[name] = String(value); }

  getAttribute(name) { return this.attributes[name] ?? null; }

  addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }

  fire(type) { (this.listeners[type] || []).forEach((fn) => fn({ target: this })); }

  click() {
    if (!this.disabled) this.fire('click');
  }

  get classList() {
    return {
      toggle: (c, on) => (on ? this.classes.add(c) : this.classes.delete(c)),
      contains: (c) => this.classes.has(c)
    };
  }

  get value() {
    return this.tagName === 'SELECT' ? (this.children[this.selectedIndex]?.value ?? '') : this.raw;
  }

  set value(v) {
    if (this.tagName === 'SELECT') this.selectedIndex = this.children.findIndex((o) => o.value === v);
    else this.raw = v;
  }

  querySelector() { return (this.inner ||= new El('button')); }
}

const SELECTS = new Set(['on-court-select', 'bench-select']);

// VOLLEYRO_APP points the harness at another copy of app.js (for example the
// pre-fix version, to confirm the bug tests fail there).
const APP_PATH = process.env.VOLLEYRO_APP || path.join(__dirname, '..', 'app.js');

function loadApp({ confirmAnswer = true } = {}) {
  const els = {};
  const confirms = [];
  const document = {
    getElementById: (id) => (els[id] ||= new El(SELECTS.has(id) ? 'select' : 'div')),
    createElement: (tag) => new El(tag)
  };
  const confirm = (message) => {
    confirms.push(message);
    return typeof confirmAnswer === 'function' ? confirmAnswer(message) : confirmAnswer;
  };
  const src = fs.readFileSync(APP_PATH, 'utf8');
  vm.runInNewContext(src, { document, console, confirm, window: { confirm } }, { filename: APP_PATH });

  const strip = (s) => s.replace(/<[^>]*>/g, '').trim();
  const part = (html, cls) => ((html.match(new RegExp(`class="${cls}">([^<]*)<`)) || [])[1] || '').trim();
  const court = () => els.court.children.map((b) => {
    return {
      role: part(b.html, 'role'),
      name: part(b.html, 'name'),
      pos: part(b.html, 'pos-label'),
      serving: b.html.includes('server-badge'),
      selected: b.className.split(' ').includes('selected'),
      front: b.className.split(' ').includes('front-row'),
      x: Number(b.style.getPropertyValue('--x') || parseFloat(b.style.left)),
      y: Number(b.style.getPropertyValue('--y') || parseFloat(b.style.top))
    };
  });
  const card = (name) => els.court.children[court().findIndex((c) => c.name === name)];
  const select = els['on-court-select'];
  const benchSelect = els['bench-select'];

  return {
    els,
    confirms,
    court,
    el: (id) => document.getElementById(id),
    click: (id) => document.getElementById(id).click(),
    tapPlayer: (name) => card(name).click(),
    chooseBench: (name) => {
      const opt = benchSelect.children.find((o) => o.textContent.endsWith(` ${name}`));
      benchSelect.value = opt.value;
    },
    sub(outName, inName) {
      this.tapPlayer(outName);
      this.chooseBench(inName);
      this.click('make-sub');
    },
    score: () => `${els['score-us'].textContent}-${els['score-opp'].textContent}`,
    mode: () => els['mode-label'].textContent || 'Receive',
    rotation: () => Number((els['context-line'].textContent.match(/Rotation (\d)\b/) || [])[1]),
    // Rotation label shown in the context line, for example "Rotation 2 · Setter in 6".
    contextLabel: () => (els['context-line'].textContent.match(/(Rotation \d[^.,]*)\.$/) || [])[1],
    // Rotation label above the court map, for example "Rot 2 · Setter in 6".
    courtLabel: () => els['rot-label'].textContent,
    status: () => els['sub-status'].textContent,
    subTarget: () => select.children[select.selectedIndex].textContent,
    options: () => select.children.map((o) => o.textContent),
    bench: () => benchSelect.children.map((o) => o.textContent),
    log: () => els['rally-log'].children.map((li) => strip(li.html).replace(/\s+/g, ' '))
  };
}

module.exports = { loadApp };
