// Security-first: a hexagonal lattice around a bright core. The lattice breathes inward (tightening),
// trust brightens toward the center, and a pulse travels from the rim to the core. Untrusted input
// drifts in from outside and is turned away at the rim.
import { alloc, rnd, scaled, set, TAU, type Label, type WorldBuilder } from './shared';

type P =
  | { k: 'edge'; x: number; y: number; d: number } // lattice point in rest coordinates (relative to center)
  | { k: 'core'; r: number; a: number; w: number }
  | { k: 'probe'; a: number; off: number; sp: number; depth: number };

const RINGS = 3;
const SQ3 = Math.sqrt(3);

export const lattice: WorldBuilder = ({ N, wide, stage }) => {
  const { cx, cy, s } = stage;
  const { stroke, color, tag } = alloc(N);
  const P: P[] = new Array(N);
  const size = s * (wide ? 0.068 : 0.072);
  const Rout = (RINGS * SQ3 + 1) * size; // approximate outer radius of the lattice

  // Unique edges of all flat-top hex cells within RINGS of the center.
  const key = (x: number, y: number) => `${Math.round(x * 1000)},${Math.round(y * 1000)}`;
  const seen = new Set<string>();
  const edges: { ax: number; ay: number; bx: number; by: number; core: boolean; d: number }[] = [];
  for (let q = -RINGS; q <= RINGS; q++)
    for (let r = -RINGS; r <= RINGS; r++) {
      const d = Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r));
      if (d > RINGS) continue;
      const hx = 1.5 * q, hy = SQ3 * (r + q / 2); // cell center in units of size
      for (let k = 0; k < 6; k++) {
        const a0 = (k * Math.PI) / 3, a1 = ((k + 1) * Math.PI) / 3;
        const ax = hx + Math.cos(a0), ay = hy + Math.sin(a0), bx = hx + Math.cos(a1), by = hy + Math.sin(a1);
        const id = [key(ax, ay), key(bx, by)].sort().join('|');
        if (seen.has(id)) {
          if (d === 0) edges.forEach((e) => { if ([key(e.ax, e.ay), key(e.bx, e.by)].sort().join('|') === id) e.core = true; });
          continue;
        }
        seen.add(id);
        const md = Math.hypot((ax + bx) / 2, (ay + by) / 2) / (RINGS * SQ3 + 1);
        edges.push({ ax, ay, bx, by, core: d === 0, d: md });
      }
    }

  const coreN = scaled(N, 110, 20);
  const probeN = Math.round(N * 0.14);
  const perEdge = Math.max(2, Math.floor((N - coreN - probeN) / edges.length));

  let i = 0;
  edges.forEach((e, ei) => {
    for (let k = 0; k < perEdge && i < N; k++, i++) {
      const f = k / (perEdge - 1);
      P[i] = { k: 'edge', x: e.ax + (e.bx - e.ax) * f, y: e.ay + (e.by - e.ay) * f, d: e.d };
      stroke[i] = 50000 + ei;
      color[i] = e.core ? 1 : e.d > 0.78 ? 2 : 0;
      tag[i] = e.core ? 'lattice core' : 'lattice';
    }
  });
  for (let k = 0; k < coreN && i < N; k++, i++) {
    P[i] = { k: 'core', r: Math.sqrt(rnd(k, 81)) * 0.62, a: rnd(k, 82) * TAU, w: 0.4 + rnd(k, 83) * 0.8 };
    color[i] = 1; tag[i] = 'core';
  }
  for (; i < N; i++) {
    P[i] = { k: 'probe', a: rnd(i, 91) * TAU, off: rnd(i, 92), sp: 0.07 + rnd(i, 93) * 0.06, depth: rnd(i, 94) };
    color[i] = 0;
  }

  const rot = (t: number) => t * 0.025;
  /** Inward squeeze: outer rings tighten more. */
  const squeeze = (d: number, t: number) => 1 - (0.5 + 0.5 * Math.sin(t * 0.7)) * 0.11 * d;
  /** A pulse travelling from the rim to the core. */
  const wave = (d: number, t: number) => {
    const w = 1.15 - ((t * 0.22) % 1.4);
    return Math.exp(-((d - w) ** 2) / 0.012);
  };

  return {
    stroke, color, tag, link: size * 1.4,
    pos: (j, t, o) => {
      const p = P[j];
      switch (p.k) {
        case 'edge': {
          const sc = squeeze(p.d, t) * size, ca = Math.cos(rot(t)), sa = Math.sin(rot(t));
          const x = p.x * sc, y = p.y * sc;
          return set(o, cx + x * ca - y * sa, cy + x * sa + y * ca);
        }
        case 'core': {
          const a = p.a + t * p.w, r = p.r * size * (0.85 + 0.15 * Math.sin(t * 2.4));
          return set(o, cx + Math.cos(a) * r, cy + Math.sin(a) * r);
        }
        default: {
          // Probe: drift in toward the rim, get turned away, drift back out.
          const ph = (t * p.sp + p.off) % 1, tri = ph < 0.5 ? ph * 2 : (1 - ph) * 2;
          const e = tri * tri * (3 - 2 * tri);
          const r = Rout * (1.5 - e * (0.45 - p.depth * 0.05)) * squeeze(1, t);
          const a = p.a + Math.sin(ph * Math.PI) * 0.12 + rot(t);
          return set(o, cx + Math.cos(a) * r, cy + Math.sin(a) * r);
        }
      }
    },
    level: (j, t) => {
      const p = P[j];
      if (p.k === 'edge') return Math.min(1, 0.32 + (1 - p.d) * 0.5 + wave(p.d, t) * 0.6);
      if (p.k === 'probe') {
        const ph = (t * p.sp + p.off) % 1;
        return Math.min(ph, 1 - ph) * 1.2;
      }
      return 1;
    },
    labels: () => {
      const at = (deg: number, text: string): Label => {
        const a = (deg * Math.PI) / 180, r = Rout * 0.84 + 12, c = Math.cos(a);
        return { x: cx + c * r, y: cy + Math.sin(a) * r + 4, text, align: Math.abs(c) < 0.3 ? 'center' : c > 0 ? 'left' : 'right' };
      };
      // Labels stay off the left side on wide screens (reading column) and off the edges on narrow ones.
      return wide
        ? [at(-90, 'untrusted input'), at(18, 'parameterized'), at(128, 'authenticated')]
        : [at(-90, 'untrusted input'), at(132, 'parameterized'), at(48, 'authenticated')];
    },
  };
};
