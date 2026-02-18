import { Router } from './router.js';
import { renderHomepage } from './pages/homepage.js';
import { renderArtists } from './pages/artists.js';
import { renderAbout } from './pages/about.js';
import { renderDaCapo } from './pages/da-capo-sine-fine.js';
import { renderPracticalInfo } from './pages/practical-info.js';
import { renderArtist } from './pages/artist.js';
import { initI18n } from './i18n.js';

const app = document.getElementById('app');
const glyphs = document.getElementById('glyphs');
let glyphPaths = [];
let glyphLengths = [];
let scrollEndTarget = null;
let glyphPhases = [];
let rootDot = null;
let glyphTargetP = 0;
let glyphCurrentP = 0;
let glyphAnimRaf = 0;

initI18n();

function initDotCursor() {
  const supportsFinePointer =
    window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!supportsFinePointer) return;

  if (document.getElementById('cursor-dot')) return;

  document.body.classList.add('has-dot-cursor');

  const dot = document.createElement('div');
  dot.id = 'cursor-dot';
  document.body.appendChild(dot);

  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let pending = false;

  const render = () => {
    pending = false;
    dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate3d(-50%, -50%, 0)`;
  };

  const onMove = (ev) => {
    x = ev.clientX;
    y = ev.clientY;
    if (!pending) {
      pending = true;
      requestAnimationFrame(render);
    }
  };

  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener(
    'pointerdown',
    () => {
      dot.classList.add('is-down');
    },
    { passive: true }
  );
  window.addEventListener(
    'pointerup',
    () => {
      dot.classList.remove('is-down');
    },
    { passive: true }
  );
  window.addEventListener(
    'pointerleave',
    () => {
      dot.style.opacity = '0';
    },
    { passive: true }
  );
  window.addEventListener(
    'pointerenter',
    () => {
      dot.style.opacity = '';
    },
    { passive: true }
  );
}

const GROW_SPAN = 0.92;
const START_PHASE = 0.18;

const router = new Router({
  routes: [
    { pattern: '/', render: () => renderHomepage(app) },
    { pattern: '/about', render: () => renderAbout(app) },
    { pattern: '/da-capo-sine-fine', render: () => renderDaCapo(app) },
    { pattern: '/artists', render: () => renderArtists(app) },
    { pattern: '/practical-info', render: () => renderPracticalInfo(app) },
    { pattern: '/artist/:slug', render: (params) => renderArtist(app, params) },
  ],
  onAfterNavigate: () => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      updateGlyphs();
    });
  },
});

window.addEventListener('i18n:change', () => {
  router.navigate(router.getPath());
});

initDotCursor();

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

function mulberry32(seed) {
  return function rand() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function vecFromAngle(a) {
  return { x: Math.cos(a), y: Math.sin(a) };
}

function catmullRomToBezier(points, alpha = 0.5) {
  if (points.length < 2) return '';
  const p = points;
  let d = `M ${p[0].x.toFixed(1)} ${p[0].y.toFixed(1)}`;

  for (let i = 0; i < p.length - 1; i += 1) {
    const p0 = p[Math.max(0, i - 1)];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[Math.min(p.length - 1, i + 2)];

    const c1x = p1.x + ((p2.x - p0.x) / 6) * alpha;
    const c1y = p1.y + ((p2.y - p0.y) / 6) * alpha;
    const c2x = p2.x - ((p3.x - p1.x) / 6) * alpha;
    const c2y = p2.y - ((p3.y - p1.y) / 6) * alpha;

    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  return d;
}

function growStroke({ rand, start, angle, length, steps, curl, drift }) {
  const pts = [start];
  let a = angle;
  let x = start.x;
  let y = start.y;
  const step = length / Math.max(1, steps);

  for (let i = 0; i < steps; i += 1) {
    const jitter = (rand() * 2 - 1) * curl;
    const gravity = drift;
    a += jitter;
    const v = vecFromAngle(a);
    x += v.x * step;
    y += v.y * step + gravity;
    x = clamp01(x / 1000) * 1000;
    pts.push({ x, y });
  }

  return pts;
}

function cumulativeLengths(points) {
  const cum = [0];
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    total += Math.hypot(dx, dy);
    cum.push(total);
  }
  return { cum, total: Math.max(1e-6, total) };
}

function idxAtRatio(points, ratio) {
  const r = Math.max(0, Math.min(1, ratio));
  const { cum, total } = cumulativeLengths(points);
  const target = r * total;
  for (let i = 1; i < cum.length; i += 1) {
    if (cum[i] >= target) return i;
  }
  return points.length - 1;
}

function intersectToBorder(p, dir) {
  const eps = 1e-6;
  const dx = Math.abs(dir.x) < eps ? (dir.x < 0 ? -eps : eps) : dir.x;
  const dy = Math.abs(dir.y) < eps ? (dir.y < 0 ? -eps : eps) : dir.y;

  const tx = dx > 0 ? (1000 - p.x) / dx : (0 - p.x) / dx;
  const ty = dy > 0 ? (1000 - p.y) / dy : (0 - p.y) / dy;

  const t = Math.min(tx, ty);
  return { x: p.x + dx * t, y: p.y + dy * t };
}

function extendStrokeToBorder(points, rand, intensity = 1) {
  if (points.length < 2) return points;
  const last = points[points.length - 1];
  const prev = points[points.length - 2];
  let dx = last.x - prev.x;
  let dy = last.y - prev.y;
  const mag = Math.hypot(dx, dy) || 1;
  dx /= mag;
  dy /= mag;

  const target = intersectToBorder(last, { x: dx, y: dy });
  const steps = 5;
  const out = points.slice();

  const px = -dy;
  const py = dx;
  const amp = (10 + rand() * 26) * intensity;
  const phase = rand() * Math.PI * 2;

  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    const sway = Math.sin(phase + t * Math.PI) * amp * (1 - t);
    const x = last.x + (target.x - last.x) * t + px * sway;
    const y = last.y + (target.y - last.y) * t + py * sway;
    out.push({ x: clamp01(x / 1000) * 1000, y: clamp01(y / 1000) * 1000 });
  }

  return out;
}

function clearGlyphs() {
  while (glyphs.firstChild) glyphs.removeChild(glyphs.firstChild);
  glyphPaths = [];
  glyphLengths = [];
  glyphPhases = [];
  rootDot = null;
}

function rebuildGlyphs(count, seed) {
  const n = Math.max(1, Math.min(80, Number(count) || 0));
  const maxPaths = Math.max(16, Math.min(220, 28 + n * 12));
  const maxDepth = Math.max(3, Math.min(8, 3 + Math.floor(n / 5)));
  const s = Number.isFinite(Number(seed)) ? Number(seed) : Date.now();
  const rand = mulberry32((s ^ (n * 2654435761)) >>> 0);
  clearGlyphs();

  const nodes = [];
  const root = { x: 500, y: 500 };
  rootDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  rootDot.setAttribute('class', 'root-dot');
  rootDot.setAttribute('cx', String(root.x));
  rootDot.setAttribute('cy', String(root.y));
  rootDot.setAttribute('r', '2.2');
  glyphs.appendChild(rootDot);

  const trunkAngle = -Math.PI / 2 + (rand() * 2 - 1) * 0.55;
  let trunk = growStroke({
    rand,
    start: root,
    angle: trunkAngle,
    length: 720 + rand() * 420,
    steps: 12,
    curl: 0.22,
    drift: (rand() * 2 - 1) * 0.25,
  });
  trunk = extendStrokeToBorder(trunk, rand, 1);

  nodes.push({ points: trunk, depth: 0, phase: START_PHASE, gate: START_PHASE, branch: false });

  function spawnBranchesFrom(points, depth, basePhase, parentGate) {
    if (nodes.length >= maxPaths) return;
    if (depth >= maxDepth) return;

    const { cum, total } = cumulativeLengths(points);
    const minRatio = Math.min(0.78, 0.22 + depth * 0.06);
    const maxRatio = 0.92;

    const branchCount = 2 + Math.floor(rand() * 4);
    const used = [];

    for (let i = 0; i < branchCount; i += 1) {
      if (nodes.length >= maxPaths) return;

      let ratio = minRatio + rand() * (maxRatio - minRatio);
      for (let k = 0; k < 12; k += 1) {
        const ok = used.every((u) => Math.abs(u - ratio) > 0.08);
        if (ok) break;
        ratio = minRatio + rand() * (maxRatio - minRatio);
      }
      used.push(ratio);

      const target = ratio * total;
      let idx = 1;
      for (let j = 1; j < cum.length; j += 1) {
        if (cum[j] >= target) {
          idx = j;
          break;
        }
      }
      idx = Math.max(2, Math.min(points.length - 2, idx));

      const p = points[idx];
      const pPrev = points[idx - 1];
      const a0 = Math.atan2(p.y - pPrev.y, p.x - pPrev.x);

      const side = rand() < 0.5 ? -1 : 1;
      const base = 0.6 + rand() * 1.5;
      const chaos = (rand() * 2 - 1) * (0.22 + depth * 0.06);
      const a = a0 + side * base + chaos;

      const len = (420 + rand() * 640) * (1 - depth * 0.12);
      const steps = 9 + Math.floor(rand() * 10);
      const curl = 0.26 + rand() * 0.38;
      const drift = (rand() * 2 - 1) * (0.08 + rand() * 0.34);

      let stroke = growStroke({ rand, start: { x: p.x, y: p.y }, angle: a, length: len, steps, curl, drift });
      const edgeChance = Math.max(0.35, 0.85 - depth * 0.12);
      if (rand() < edgeChance) {
        stroke = extendStrokeToBorder(stroke, rand, Math.max(0.55, 1 - depth * 0.14));
      }

      const parentReach = basePhase + ratio * GROW_SPAN;
      const phase = Math.min(
        0.985,
        Math.max(parentGate ?? basePhase, parentReach) + 0.012 + rand() * 0.05
      );
      const gate = phase;

      nodes.push({ points: stroke, depth: depth + 1, phase, gate, branch: true });

      const recurse = 0.92 - depth * 0.14;
      if (rand() < recurse) spawnBranchesFrom(stroke, depth + 1, phase, gate);
    }
  }

  const bursts = Math.max(3, 2 + Math.floor(rand() * 4));
  for (let i = 0; i < bursts; i += 1) {
    const a = (rand() * Math.PI * 2) + (rand() * 2 - 1) * 0.25;
    const len = 380 + rand() * 520;
    const steps = 9 + Math.floor(rand() * 8);
    let stroke = growStroke({
      rand,
      start: root,
      angle: a,
      length: len,
      steps,
      curl: 0.28 + rand() * 0.28,
      drift: (rand() * 2 - 1) * 0.22,
    });
    stroke = extendStrokeToBorder(stroke, rand, 0.95);
    const phase = START_PHASE + rand() * 0.05;
    nodes.push({ points: stroke, depth: 0, phase, gate: phase, branch: true });
    spawnBranchesFrom(stroke, 0, phase, phase);
  }

  spawnBranchesFrom(trunk, 0, START_PHASE, START_PHASE);

  for (let i = 0; i < nodes.length; i += 1) {
    const node = nodes[i];
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('class', node.branch ? 'glyph branch' : 'glyph');
    p.setAttribute('d', catmullRomToBezier(node.points, 1));
    p.style.opacity = '0';
    glyphs.appendChild(p);
    glyphPaths.push(p);
    glyphPhases.push(node.phase);
    p.dataset.gate = String(node.gate ?? node.phase);
  }

  glyphLengths = glyphPaths.map((p) => {
    const len = Math.max(1, Math.ceil(p.getTotalLength()));
    p.style.strokeDasharray = `${len} ${len}`;
    p.style.strokeDashoffset = String(len);
    return len;
  });
}

function getGlyphScrollProgress() {
  const doc = document.documentElement;
  const fallbackMax = Math.max(1, doc.scrollHeight - window.innerHeight);
  const max = Math.max(1, scrollEndTarget ?? fallbackMax);
  return clamp01(window.scrollY / max);
}

function renderGlyphs(p) {
  const progress = clamp01(p);

  if (rootDot) {
    const dotFade = 1 - clamp01((progress - (START_PHASE - 0.04)) / 0.14);
    rootDot.style.opacity = String(dotFade);
  }

  glyphs.style.opacity = '1';

  if (progress < START_PHASE) {
    for (let i = 0; i < glyphPaths.length; i += 1) {
      const len = glyphLengths[i] ?? 2400;
      glyphPaths[i].style.strokeDashoffset = String(len);
      glyphPaths[i].style.opacity = '0';
    }
    glyphs.style.transform = `translate3d(0, 0px, 0) scale(1)`;
    return;
  }

  const n = Math.max(1, glyphPaths.length);
  const span = 0.92;

  for (let i = 0; i < n; i += 1) {
    const gate = Number(glyphPaths[i]?.dataset?.gate);
    const g = Number.isFinite(gate) ? gate : (glyphPhases[i] ?? START_PHASE);

    if (progress <= g) {
      const len = glyphLengths[i] ?? 2400;
      glyphPaths[i].style.strokeDashoffset = String(len);
      glyphPaths[i].style.opacity = '0';
      continue;
    }

    const a = glyphPhases[i] ?? START_PHASE;
    const local = clamp01((progress - a) / span);
    const len = glyphLengths[i] ?? 2400;
    glyphPaths[i].style.strokeDashoffset = String(len * (1 - local));

    if (local <= 0) glyphPaths[i].style.opacity = '0';
    else glyphPaths[i].style.opacity = String(clamp01(local * 3.2));
  }

  glyphs.style.transform = `translate3d(0, ${progress * -22}px, 0) scale(${1 + progress * 0.03})`;
}

function updateGlyphTargets() {
  glyphTargetP = getGlyphScrollProgress();
  if (!glyphAnimRaf) glyphAnimRaf = requestAnimationFrame(animateGlyphs);
}

function animateGlyphs() {
  glyphAnimRaf = 0;

  const dist = glyphTargetP - glyphCurrentP;
  glyphCurrentP += dist * 0.12;

  if (Math.abs(dist) < 0.0008) {
    glyphCurrentP = glyphTargetP;
  }

  renderGlyphs(glyphCurrentP);

  if (glyphCurrentP !== glyphTargetP) {
    glyphAnimRaf = requestAnimationFrame(animateGlyphs);
  }
}

let raf = 0;
function onScroll() {
  if (raf) return;
  raf = requestAnimationFrame(() => {
    raf = 0;
    updateGlyphTargets();
  });
}

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', updateGlyphTargets);

window.addEventListener('catalog:count', (e) => {
  const count = e?.detail?.count ?? 0;
  const seed = e?.detail?.seed;
  rebuildGlyphs(count, seed);
  glyphCurrentP = getGlyphScrollProgress();
  glyphTargetP = glyphCurrentP;
  renderGlyphs(glyphCurrentP);
});

window.addEventListener('catalog:scrollEnd', (e) => {
  const v = Number(e?.detail?.scrollEnd);
  scrollEndTarget = Number.isFinite(v) && v > 0 ? v : null;
  updateGlyphTargets();
});

router.start();
rebuildGlyphs(6, Date.now());
glyphCurrentP = getGlyphScrollProgress();
glyphTargetP = glyphCurrentP;
renderGlyphs(glyphCurrentP);
