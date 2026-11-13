// Agent-operated hosting: a grid of client sites behind the edge cache. The agent sits to the right and
// reaches the sites only through a narrow control API, one way (packets never flow back). Each cycle one
// site is hit: a sensor cages it in seconds with no AI involved, a clean snapshot rises from the vault
// below and restores it, and the cage lifts.
import { alloc, dashId, lerp, perim, pick, rnd, scaled, set, smooth, TAU, type Label, type WorldBuilder } from './shared';

const CYCLE = 14;
const COLS = 4, ROWS = 3;

type P =
  | { k: 'site'; n: number; fx: number; fy: number }
  | { k: 'hit'; n: number; fx: number; fy: number }
  | { k: 'cage'; fx: number; fy: number }
  | { k: 'edge'; f: number }
  | { k: 'vault'; v: number; fx: number; fy: number }
  | { k: 'snap'; fx: number; fy: number }
  | { k: 'agent'; a: number }
  | { k: 'api'; fx: number; fy: number }
  | { k: 'wire'; f: number }
  | { k: 'cmd'; c: number; seg: number }
  | { k: 'dust'; x: number; y: number; w: number };

export const sites: WorldBuilder = ({ N, wide, stage }) => {
  const { cx, cy, s } = stage;
  const { stroke, color, tag } = alloc(N);
  const P: P[] = new Array(N);
  const hx = wide ? 1 : 0.86;
  const X = (u: number) => cx + u * s * hx;
  const Y = (v: number) => cy + v * s;

  const sw = s * 0.1 * hx, sh = s * 0.075, gx = s * 0.14 * hx, gy = s * 0.12;
  const grid0 = { x: X(-0.42), y: Y(-0.14) };
  const siteXY = (n: number) => ({ x: grid0.x + (n % COLS) * gx, y: grid0.y + Math.floor(n / COLS) * gy });
  const gridRight = grid0.x + (COLS - 1) * gx + sw / 2;
  const edgeY = grid0.y - sh / 2 - s * 0.08;
  const vault = { x: X(-0.21), y: Y(0.34) };
  const agent = { x: X(0.46), y: Y(0.0), r: s * 0.05 };
  const api = { x: X(0.26), y: Y(0.0), w: s * 0.06 * hx, h: s * 0.05 };

  // Budget.
  const sitePts = scaled(N, 30, 12), barPts = scaled(N, 6, 3), hitPts = scaled(N, 30, 12);
  const cagePts = scaled(N, 44, 16), edgePts = scaled(N, 60, 20), vaultPts = scaled(N, 26, 10);
  const snapPts = scaled(N, 30, 12), agentPts = scaled(N, 40, 14), apiPts = scaled(N, 26, 10);
  const wirePts = scaled(N, 30, 10), cmdCount = scaled(N, 6, 3);

  let i = 0;
  for (let n = 0; n < COLS * ROWS; n++) {
    for (let k = 0; k <= sitePts && i < N; k++, i++) {
      const [fx, fy] = perim(k % sitePts, sitePts);
      P[i] = { k: 'site', n, fx, fy }; stroke[i] = 8000 + n; color[i] = 0; tag[i] = 'sites';
    }
    // Browser chrome: the title bar.
    for (let k = 0; k < barPts && i < N; k++, i++) {
      P[i] = { k: 'site', n, fx: k / (barPts - 1), fy: 0.25 };
      stroke[i] = 8100 + n; color[i] = 2; tag[i] = 'sites';
    }
    // Compromise overlay (shown only for the site that's hit).
    for (let k = 0; k <= hitPts && i < N; k++, i++) {
      const [fx, fy] = perim(k % hitPts, hitPts);
      P[i] = { k: 'hit', n, fx, fy }; stroke[i] = 8200 + n; color[i] = 1; tag[i] = 'contained';
    }
  }
  for (let k = 0; k < cagePts && i < N; k++, i++) {
    const [fx, fy] = perim(k, cagePts);
    P[i] = { k: 'cage', fx, fy }; stroke[i] = dashId(8300, k, 1); color[i] = 1; tag[i] = 'contained';
  }
  for (let k = 0; k < edgePts && i < N; k++, i++) {
    P[i] = { k: 'edge', f: k / (edgePts - 1) }; stroke[i] = dashId(8400, k, 2); color[i] = 0; tag[i] = 'edge';
  }
  for (let v = 0; v < 4; v++)
    for (let k = 0; k <= vaultPts && i < N; k++, i++) {
      const [fx, fy] = perim(k % vaultPts, vaultPts);
      P[i] = { k: 'vault', v, fx, fy }; stroke[i] = 8500 + v; color[i] = 2; tag[i] = 'snapshot';
    }
  for (let k = 0; k <= snapPts && i < N; k++, i++) {
    const [fx, fy] = perim(k % snapPts, snapPts);
    P[i] = { k: 'snap', fx, fy }; stroke[i] = 8600; color[i] = 0; tag[i] = 'snapshot';
  }
  for (let k = 0; k <= agentPts && i < N; k++, i++) {
    P[i] = { k: 'agent', a: (k / agentPts) * TAU }; stroke[i] = 8700; color[i] = 1; tag[i] = 'agent';
  }
  for (let k = 0; k <= apiPts && i < N; k++, i++) {
    const [fx, fy] = perim(k % apiPts, apiPts);
    P[i] = { k: 'api', fx, fy }; stroke[i] = 8800; color[i] = 0; tag[i] = 'agent';
  }
  for (let k = 0; k < wirePts && i < N; k++, i++) {
    P[i] = { k: 'wire', f: k / (wirePts - 1) }; stroke[i] = 8900; color[i] = 2; tag[i] = 'agent';
  }
  for (let c = 0; c < cmdCount; c++)
    for (let g = 0; g < 3 && i < N; g++, i++) {
      P[i] = { k: 'cmd', c, seg: g }; stroke[i] = 20000 + c; color[i] = 0; tag[i] = 'agent';
    }
  for (; i < N; i++) {
    P[i] = { k: 'dust', x: rnd(i, 21), y: rnd(i, 22), w: rnd(i, 23) };
    color[i] = 2;
  }

  const phase = (t: number) => (t / CYCLE) % 1;
  const victim = (t: number) => (Math.floor(t / CYCLE) * 5 + 6) % (COLS * ROWS);
  // Timeline: hit 0.12, caged 0.18 (seconds, no AI), restore rises 0.32→0.5, cage lifts 0.62.
  const hit = (ph: number) => smooth((ph - 0.12) / 0.03) * (1 - smooth((ph - 0.5) / 0.04));
  const caged = (ph: number) => smooth((ph - 0.17) / 0.03) * (1 - smooth((ph - 0.62) / 0.04));
  const rising = (ph: number) => smooth((ph - 0.32) / 0.18);
  // Command path: agent → api → elbow to the grid's right edge. Never the other way.
  const wireXY = (f: number) => {
    const a = { x: agent.x - agent.r, y: agent.y }, b = { x: api.x + api.w / 2, y: api.y };
    const c = { x: api.x - api.w / 2, y: api.y }, d = { x: gridRight + s * 0.03, y: api.y };
    if (f < 0.45) return { x: lerp(a.x, b.x, f / 0.45), y: a.y };
    if (f < 0.55) return { x: lerp(b.x, c.x, (f - 0.45) / 0.1), y: b.y };
    return { x: lerp(c.x, d.x, (f - 0.55) / 0.45), y: c.y };
  };

  return {
    stroke, color, tag, link: s * 0.18,
    still: CYCLE * 0.3,
    pos: (j, t, o) => {
      const p = P[j];
      const ph = phase(t);
      switch (p.k) {
        case 'site': {
          const S = siteXY(p.n);
          return set(o, S.x + (p.fx - 0.5) * sw, S.y + (p.fy - 0.5) * sh);
        }
        case 'hit': {
          const S = siteXY(p.n);
          const j2 = Math.sin(t * 37 + p.fx * 9 + p.fy * 5) * 2.2;
          return set(o, S.x + (p.fx - 0.5) * sw * 0.8 + j2, S.y + (p.fy - 0.5) * sh * 0.7 - j2);
        }
        case 'cage': {
          const S = siteXY(victim(t)), c = caged(ph);
          const pad = lerp(s * 0.12, s * 0.018, c);
          return set(o, S.x + (p.fx - 0.5) * (sw + pad * 2), S.y + (p.fy - 0.5) * (sh + pad * 2));
        }
        case 'edge':
          return set(o, lerp(grid0.x - sw, gridRight + sw * 0.5, p.f), edgeY + Math.sin(p.f * 18 + t * 1.2) * 1.5);
        case 'vault':
          return set(o, vault.x + (p.fx - 0.5) * sw * 0.9 + p.v * 4, vault.y + (p.fy - 0.5) * sh * 0.8 - p.v * 4);
        case 'snap': {
          const S = siteXY(victim(t)), e = rising(ph);
          return set(o, lerp(vault.x + 12, S.x, e) + (p.fx - 0.5) * sw * 0.9, lerp(vault.y - 12, S.y, e) + (p.fy - 0.5) * sh * 0.8);
        }
        case 'agent': {
          const r = agent.r * (1 + 0.06 * Math.sin(t * 2.4));
          return set(o, agent.x + Math.cos(p.a) * r, agent.y + Math.sin(p.a) * r);
        }
        case 'api':
          return set(o, api.x + (p.fx - 0.5) * api.w, api.y + (p.fy - 0.5) * api.h);
        case 'wire': {
          const w = wireXY(p.f);
          return set(o, w.x, w.y);
        }
        case 'cmd': {
          const f = (t * 0.22 + p.c / cmdCount) % 1;
          const w = wireXY(f);
          return set(o, w.x + (p.seg - 1) * 3, w.y);
        }
        default: {
          const a = p.w * TAU + t * 0.05;
          return set(o, X(-0.6 + p.x * 1.25) + Math.cos(a) * 6, Y(-0.45 + p.y * 0.9) + Math.sin(a) * 6);
        }
      }
    },
    level: (j, t) => {
      const p = P[j];
      const ph = phase(t);
      switch (p.k) {
        case 'site':
          return p.n === victim(t) ? 1 - 0.6 * caged(ph) : 0.9;
        case 'hit':
          return p.n === victim(t) ? hit(ph) : 0;
        case 'cage':
          return caged(ph);
        case 'snap': {
          const e = rising(ph);
          return e <= 0 ? 0 : e >= 1 ? 1 - smooth((ph - 0.5) / 0.08) : 1;
        }
        case 'vault':
          return 0.65;
        case 'edge':
          return 0.7;
        case 'wire':
          return 0.6;
        case 'cmd': {
          const f = (t * 0.22 + p.c / cmdCount) % 1;
          return f < 0.05 ? f / 0.05 : f > 0.93 ? (1 - f) / 0.07 : 1;
        }
        case 'dust':
          return 0.45;
        default:
          return 1;
      }
    },
    labels: (t) => {
      const ph = phase(t);
      const S = siteXY(victim(t));
      const out: Label[] = [
        { x: (grid0.x + gridRight) / 2 - sw / 4, y: edgeY - 10, text: pick(wide, 'edge cache', 'edge') },
        { x: vault.x, y: vault.y + sh + 8, text: pick(wide, 'clean snapshots', 'snapshots'), alpha: 0.8 },
        { x: agent.x, y: agent.y + agent.r + 18, text: 'agent', slot: 1 },
        { x: api.x, y: api.y - api.h / 2 - 10, text: pick(wide, 'control api · one way', 'api'), alpha: 0.85 },
      ];
      const c = caged(ph);
      // Below the grid, under the hit site's column, so it never sits on a neighbouring site.
      const gridBottom = grid0.y + (ROWS - 1) * gy + sh / 2;
      if (c > 0.3) out.push({ x: S.x, y: gridBottom + 18, text: ph < 0.32 ? pick(wide, 'contained · no ai', 'contained') : 'restored', slot: 1, alpha: c });
      return out;
    },
  };
};
