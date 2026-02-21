import { el } from '../ui.js';

function polar(cx, cy, r, a) {
  return {
    x: cx + r * Math.cos(a),
    y: cy + r * Math.sin(a),
  };
}

function arcPath(cx, cy, r, a0, a1) {
  const p0 = polar(cx, cy, r, a0);
  const p1 = polar(cx, cy, r, a1);
  const largeArc = Math.abs(a1 - a0) > Math.PI ? 1 : 0;
  const sweep = a1 > a0 ? 1 : 0;
  return `M ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} A ${r.toFixed(2)} ${r.toFixed(
    2
  )} 0 ${largeArc} ${sweep} ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`;
}

export function arrowWheel(names, { size = 720, radius = 310 } = {}) {
  const ns = Array.isArray(names) ? names.filter(Boolean) : [];
  const count = Math.max(1, ns.length);

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'arrow-wheel-svg');
  svg.setAttribute('viewBox', '0 0 1000 1000');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));

  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
  marker.setAttribute('id', 'arrowHead');
  marker.setAttribute('markerWidth', '10');
  marker.setAttribute('markerHeight', '10');
  marker.setAttribute('refX', '7');
  marker.setAttribute('refY', '3');
  marker.setAttribute('orient', 'auto');
  marker.setAttribute('markerUnits', 'strokeWidth');

  const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  arrow.setAttribute('d', 'M0,0 L8,3 L0,6');
  arrow.setAttribute('fill', 'none');
  arrow.setAttribute('stroke', 'currentColor');
  arrow.setAttribute('stroke-width', '1.6');
  marker.appendChild(arrow);
  defs.appendChild(marker);
  svg.appendChild(defs);

  const gRotor = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  gRotor.setAttribute('class', 'arrow-wheel-rotor');
  svg.appendChild(gRotor);

  const gArcs = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  gArcs.setAttribute('class', 'arrow-wheel-arcs');
  gRotor.appendChild(gArcs);

  const gLabels = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  gLabels.setAttribute('class', 'arrow-wheel-labels');
  gRotor.appendChild(gLabels);

  const cx = 500;
  const cy = 500;

  const arcEls = [];
  const arcAngles = [];
  const labelEls = [];
  const labelAngles = [];

  for (let i = 0; i < count; i += 1) {
    const a0 = (i / count) * Math.PI * 2 - Math.PI / 2;
    const a1 = ((i + 1) / count) * Math.PI * 2 - Math.PI / 2;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('class', 'arrow-wheel-arc');
    path.setAttribute('d', arcPath(cx, cy, radius, a0 + 0.02, a1 - 0.02));
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'currentColor');
    path.setAttribute('stroke-width', '1.2');
    path.setAttribute('marker-end', 'url(#arrowHead)');
    gArcs.appendChild(path);
    arcEls.push(path);
    arcAngles.push([a0, a1]);

    const mid = (a0 + a1) / 2;
    const p = polar(cx, cy, radius + 34, mid);
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('class', 'arrow-wheel-name arrow-wheel-label');
    text.setAttribute('x', p.x.toFixed(2));
    text.setAttribute('y', p.y.toFixed(2));
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.textContent = ns[i] || '';
    gLabels.appendChild(text);
    labelEls.push(text);
    labelAngles.push(mid);
  }

  const reduceMq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const reduce = Boolean(reduceMq?.matches);

  if (!reduce) {
    const DURATION_MS = 68000;
    const start = performance.now();
    let raf = 0;

    const tick = (now) => {
      if (!svg.isConnected) return;

      const t = (now - start) % DURATION_MS;
      const rotRad = (t / DURATION_MS) * Math.PI * 2;

      for (let i = 0; i < arcEls.length; i += 1) {
        const el = arcEls[i];
        const a0 = arcAngles[i][0] + rotRad;
        const a1 = arcAngles[i][1] + rotRad;
        el.setAttribute('d', arcPath(cx, cy, radius, a0 + 0.02, a1 - 0.02));
      }

      for (let i = 0; i < labelEls.length; i += 1) {
        const el = labelEls[i];
        const mid = labelAngles[i] + rotRad;
        const p = polar(cx, cy, radius + 34, mid);
        el.setAttribute('x', p.x.toFixed(2));
        el.setAttribute('y', p.y.toFixed(2));
        el.removeAttribute('transform');
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const onReduceChange = () => {
      if (reduceMq.matches) stop();
      else if (!raf) raf = requestAnimationFrame(tick);
    };

    if (reduceMq?.addEventListener) reduceMq.addEventListener('change', onReduceChange);
    else if (reduceMq?.addListener) reduceMq.addListener(onReduceChange);
  }

  const wrap = el('div', { class: 'arrow-wheel-wrap', 'aria-hidden': 'true' }, []);
  wrap.appendChild(svg);
  return wrap;
}
