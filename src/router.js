function normalize(path) {
  if (!path) return '/';
  if (!path.startsWith('/')) return `/${path}`;
  return path;
}

function compile(pattern) {
  const parts = normalize(pattern).split('/').filter(Boolean);
  const keys = [];
  const reParts = parts.map((p) => {
    if (p.startsWith(':')) {
      keys.push(p.slice(1));
      return '([^/]+)';
    }
    return p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  });
  const re = new RegExp(`^/${reParts.join('/')}$`);
  return { re, keys };
}

export class Router {
  constructor({ routes, onAfterNavigate } = {}) {
    this.routes = (routes || []).map((r) => ({ ...r, ...compile(r.pattern) }));
    this.onAfterNavigate = onAfterNavigate;
    this.onHashChange = this.onHashChange.bind(this);
  }

  getPath() {
    const raw = window.location.hash.replace(/^#/, '');
    const p = raw.split('?')[0];
    return normalize(p || '/');
  }

  push(path) {
    const next = normalize(path);
    if (this.getPath() === next) return;
    window.location.hash = next;
  }

  start() {
    window.addEventListener('hashchange', this.onHashChange);
    if (!window.location.hash) window.location.hash = '#/';
    this.navigate(this.getPath());
  }

  stop() {
    window.removeEventListener('hashchange', this.onHashChange);
  }

  onHashChange() {
    this.navigate(this.getPath());
  }

  navigate(path) {
    for (const r of this.routes) {
      const m = path.match(r.re);
      if (!m) continue;
      const params = {};
      for (let i = 0; i < r.keys.length; i += 1) params[r.keys[i]] = decodeURIComponent(m[i + 1]);
      r.render(params);
      if (this.onAfterNavigate) this.onAfterNavigate();
      return;
    }

    const fallback = this.routes.find((x) => x.pattern === '/');
    if (fallback) {
      fallback.render({});
      if (this.onAfterNavigate) this.onAfterNavigate();
    }
  }
}
