import {
  cannon,
  continuous,
  explosion,
  fire,
  fireworks,
  pride,
  rain,
  sideCannons,
  snow,
} from './lib/index.js';

const RISO = ['#ff48b0', '#0078bf', '#ffe800', '#00a95c', '#ff6c2f'];

// Mirrors the library defaults so the generated code only lists what you changed
const DEFAULTS = {
  particleCount: 50,
  angle: 90,
  spread: 45,
  startVelocity: 45,
  decay: 0.9,
  gravity: 1,
  drift: 0,
  ticks: 200,
  scalar: 1,
  originX: 0.5,
  originY: 0.5,
};

const PRESETS = { cannon, explosion, fireworks, rain, snow, sideCannons, pride };

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let motionOverride = false;

/** Options every call on this page gets, so the reduced-motion override applies everywhere */
function pageOptions() {
  return motionOverride ? { disableForReducedMotion: false } : {};
}

const announcer = document.getElementById('announcer');
function announce(text) {
  announcer.textContent = '';
  // A fresh text node makes screen readers repeat identical messages
  requestAnimationFrame(() => {
    announcer.textContent = text;
  });
}

/* Hero */

const hero = document.getElementById('hero');

document.getElementById('hero-fire').addEventListener('click', (event) => {
  event.stopPropagation();
  const rect = event.currentTarget.getBoundingClientRect();
  fire({
    particleCount: 120,
    spread: 80,
    startVelocity: 50,
    origin: {
      x: (rect.left + rect.width / 2) / window.innerWidth,
      y: (rect.top + rect.height / 2) / window.innerHeight,
    },
    colors: RISO,
    ...pageOptions(),
  });
});

hero.addEventListener('click', (event) => {
  if (event.target.closest('button, a, input, label, code, .motion-note')) return;
  fire({
    particleCount: 60,
    spread: 70,
    startVelocity: 35,
    origin: { x: event.clientX / window.innerWidth, y: event.clientY / window.innerHeight },
    colors: RISO,
    ...pageOptions(),
  });
});

if (reducedMotion.matches) {
  const note = document.getElementById('motion-note');
  note.hidden = false;
  document.getElementById('motion-override').addEventListener('change', (event) => {
    motionOverride = event.target.checked;
  });
} else {
  // One greeting burst on load
  window.addEventListener(
    'load',
    () => {
      sideCannons({ colors: RISO, particleCount: 60 });
    },
    { once: true }
  );
}

/* Playground */

const form = document.getElementById('controls');
const codeEl = document.getElementById('play-code');
const streamToggle = document.getElementById('stream-toggle');
let stopStream = null;

function readNumber(name) {
  return Number(form.elements[name].value);
}

function readConfig() {
  const colors = [...form.querySelectorAll('input[name="color"]')].map((input) => input.value);
  const shapes = [...form.querySelectorAll('input[name="shape"]:checked')].map((i) => i.value);
  return {
    particleCount: readNumber('particleCount'),
    angle: readNumber('angle'),
    spread: readNumber('spread'),
    startVelocity: readNumber('startVelocity'),
    gravity: readNumber('gravity'),
    decay: readNumber('decay'),
    drift: readNumber('drift'),
    scalar: readNumber('scalar'),
    ticks: readNumber('ticks'),
    origin: { x: readNumber('originX'), y: readNumber('originY') },
    colors,
    shapes: shapes.length > 0 ? shapes : ['circle', 'square'],
  };
}

function escapeHtml(text) {
  return text.replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]
  );
}

const num = (n) => `<span class="tok-num">${n}</span>`;
const str = (s) => `<span class="tok-str">'${escapeHtml(s)}'</span>`;
const key = (k) => `<span class="tok-key">${k}</span>`;

function renderCode() {
  const config = readConfig();
  const lines = [];

  for (const name of [
    'particleCount',
    'angle',
    'spread',
    'startVelocity',
    'gravity',
    'decay',
    'drift',
    'scalar',
    'ticks',
  ]) {
    if (config[name] !== DEFAULTS[name]) lines.push(`  ${key(name)}: ${num(config[name])},`);
  }

  if (config.origin.x !== DEFAULTS.originX || config.origin.y !== DEFAULTS.originY) {
    lines.push(
      `  ${key('origin')}: { ${key('x')}: ${num(config.origin.x)}, ${key('y')}: ${num(config.origin.y)} },`
    );
  }

  // Three colors per line keeps the snippet narrow enough for the panel
  const colorRows = [];
  for (let i = 0; i < config.colors.length; i += 3) {
    colorRows.push(
      `    ${config.colors
        .slice(i, i + 3)
        .map(str)
        .join(', ')},`
    );
  }
  lines.push(`  ${key('colors')}: [`, ...colorRows, '  ],');

  if (config.shapes.length === 1) {
    lines.push(`  ${key('shapes')}: [${str(config.shapes[0])}],`);
  }

  codeEl.innerHTML = [
    `<span class="tok-fn">import</span> { fire } <span class="tok-fn">from</span> ${str('@konfetti-js/core')};`,
    '',
    `<span class="tok-fn">fire</span>({`,
    ...lines,
    '});',
  ].join('\n');
}

function renderOutputs() {
  for (const output of form.querySelectorAll('output[data-for]')) {
    const value = readNumber(output.dataset.for);
    output.textContent = `${value}${output.dataset.unit ?? ''}`;
  }
}

function update() {
  // Keep at least one shape ticked
  const shapeBoxes = [...form.querySelectorAll('input[name="shape"]')];
  if (!shapeBoxes.some((box) => box.checked)) shapeBoxes[0].checked = true;
  renderOutputs();
  renderCode();
}

form.addEventListener('input', update);
form.addEventListener('change', update);
form.addEventListener('reset', () => requestAnimationFrame(update));
form.addEventListener('submit', (event) => event.preventDefault());

document.getElementById('play-fire').addEventListener('click', () => {
  fire({ ...readConfig(), ...pageOptions() });
});

for (const button of document.querySelectorAll('[data-preset]')) {
  button.addEventListener('click', () => {
    PRESETS[button.dataset.preset](pageOptions());
  });
}

streamToggle.addEventListener('click', () => {
  if (stopStream) {
    stopStream();
    stopStream = null;
    streamToggle.setAttribute('aria-pressed', 'false');
    streamToggle.textContent = 'Start stream';
  } else {
    const { origin, ...rest } = readConfig();
    stopStream = continuous({ ...rest, particleCount: 8, ...pageOptions() }, 200);
    streamToggle.setAttribute('aria-pressed', 'true');
    streamToggle.textContent = 'Stop stream';
  }
});

update();

/* Copy buttons */

for (const button of document.querySelectorAll('[data-copy-target]')) {
  button.addEventListener('click', async (event) => {
    event.stopPropagation();
    const text = document.getElementById(button.dataset.copyTarget).textContent;
    try {
      await navigator.clipboard.writeText(text);
      button.textContent = 'Copied';
      button.dataset.state = 'done';
      announce('Copied to clipboard');
    } catch {
      button.textContent = 'Press ⌘C';
      announce('Copy failed. Select the text and copy it manually.');
    }
    setTimeout(() => {
      button.textContent = 'Copy';
      delete button.dataset.state;
    }, 1600);
  });
}

/* Tabs */

const TAB_KEY = 'konfetti-site-tab';

for (const tabs of document.querySelectorAll('[data-tabs]')) {
  const tabList = [...tabs.querySelectorAll('[role="tab"]')];

  function select(tab, focus) {
    for (const other of tabList) {
      const selected = other === tab;
      other.setAttribute('aria-selected', String(selected));
      other.tabIndex = selected ? 0 : -1;
      document.getElementById(other.getAttribute('aria-controls')).hidden = !selected;
    }
    if (focus) tab.focus();
    try {
      localStorage.setItem(TAB_KEY, tab.id);
    } catch {
      // Storage can be unavailable (private mode); the tab still switches
    }
  }

  for (const tab of tabList) {
    tab.addEventListener('click', () => select(tab, false));
    tab.addEventListener('keydown', (event) => {
      const index = tabList.indexOf(tab);
      let next = null;
      if (event.key === 'ArrowRight') next = tabList[(index + 1) % tabList.length];
      if (event.key === 'ArrowLeft') next = tabList[(index - 1 + tabList.length) % tabList.length];
      if (event.key === 'Home') next = tabList[0];
      if (event.key === 'End') next = tabList[tabList.length - 1];
      if (next) {
        event.preventDefault();
        select(next, true);
      }
    });
  }

  try {
    const saved = document.getElementById(localStorage.getItem(TAB_KEY) ?? '');
    if (saved && tabList.includes(saved)) select(saved, false);
  } catch {
    // Ignore unavailable storage
  }
}

/* Light syntax coloring for the static snippets */

for (const block of document.querySelectorAll('code[class^="lang-"]')) {
  const source = block.textContent;
  let html = escapeHtml(source)
    // Only treat // as a comment at line start or after whitespace, so URLs stay intact
    .replace(/(^|\s)(\/\/[^\n]*)/gm, '$1<span class="tok-com">$2</span>')
    .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="tok-com">$1</span>')
    .replace(/('[^'\n]*')/g, '<span class="tok-str">$1</span>')
    .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="tok-num">$1</span>');
  // Undo coloring inside comments so they stay one color
  html = html.replace(/<span class="tok-com">([\s\S]*?)<\/span>/g, (_match, inner) => {
    return `<span class="tok-com">${inner.replace(/<[^>]+>/g, '')}</span>`;
  });
  block.innerHTML = html;
}
