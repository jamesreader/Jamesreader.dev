// Job-fit evaluation: a six-axis radar chart. ROLE (what the job asks for, dashed, secondary color)
// and JAMES (accent, solid) slowly morph toward each other; the overlap is filled with particles.
// Values are illustrative.
import { alloc, dashId, rnd, scaled, set, TAU, type Label, type WorldBuilder } from './shared';

const AXES = [
  { long: 'AI/ML', short: 'AI/ML' },
  { long: 'Infrastructure', short: 'Infra' },
  { long: 'Security', short: 'Security' },
  { long: 'Government', short: 'Gov' },
  { long: 'Hands-on', short: 'Hands-on' },
  { long: 'Leadership', short: 'Leadership' },
];
const ROLE = [0.78, 0.7, 0.86, 0.62, 0.66, 0.84];
const JAMES = [0.9, 0.92, 0.8, 0.88, 0.95, 0.7];

type P =
  | { k: 'spoke'; ax: number; f: number }
  | { k: 'ring'; ring: number; c: number }
  | { k: 'poly'; who: 0 | 1 | 2; c: number } // 0 = role, 1 = james, 2 = overlap outline
  | { k: 'mark'; who: 0 | 1; ax: number; dx: number; dy: number }
  | { k: 'fill'; ax: number; u: number; v: number; ph: number };

const angle = (k: number) => -Math.PI / 2 + (k * TAU) / 6;

export const fit: WorldBuilder = ({ N, wide, stage }) => {
  const { cx, cy, s } = stage;
  const { stroke, color, tag } = alloc(N);
  const P: P[] = new Array(N);
  const R = s * (wide ? 0.38 : 0.35);

  const spokePts = scaled(N, 14, 4), ringSide = scaled(N, 11, 3), polySide = scaled(N, 16, 4), overlapSide = scaled(N, 9, 3);
  let i = 0;
  for (let ax = 0; ax < 6; ax++)
    for (let k = 0; k < spokePts && i < N; k++, i++) {
      P[i] = { k: 'spoke', ax, f: k / (spokePts - 1) }; stroke[i] = 60000 + ax; color[i] = 2;
    }
  for (let ring = 1; ring <= 4; ring++) {
    const n = ringSide * 6;
    for (let k = 0; k <= n && i < N; k++, i++) {
      P[i] = { k: 'ring', ring, c: (k % n) / ringSide }; stroke[i] = 60100 + ring; color[i] = 2;
    }
  }
  ([0, 1, 2] as const).forEach((who) => {
    const side = who === 2 ? overlapSide : polySide, n = side * 6;
    for (let k = 0; k <= n && i < N; k++, i++) {
      P[i] = { k: 'poly', who, c: (k % n) / side };
      stroke[i] = who === 0 ? dashId(61000, k, 2) : 62000 + who;
      color[i] = who === 0 ? 1 : who === 1 ? 0 : 2;
      tag[i] = who === 0 ? 'role' : who === 1 ? 'james' : 'overlap';
    }
  });
  const diamond: [number, number][] = [[0, -1], [1, 0], [0, 1], [-1, 0], [0, -1]];
  ([0, 1] as const).forEach((who) => {
    for (let ax = 0; ax < 6; ax++)
      for (const [dx, dy] of diamond) {
        if (i >= N) break;
        P[i] = { k: 'mark', who, ax, dx, dy }; stroke[i] = 63000 + who * 10 + ax;
        color[i] = who === 0 ? 1 : 0; tag[i] = who === 0 ? 'role' : 'james';
        i++;
      }
  });
  for (; i < N; i++) {
    // Uniform point in the triangle (center, axis ax, axis ax + 1).
    let u = rnd(i, 101), v = rnd(i, 102);
    if (u + v > 1) { u = 1 - u; v = 1 - v; }
    P[i] = { k: 'fill', ax: Math.floor(rnd(i, 103) * 6), u, v, ph: rnd(i, 104) * TAU };
    color[i] = 0; tag[i] = 'overlap';
  }

  // Per-frame polygon values (cached: every particle reads them).
  let vt = -1;
  const vals = [new Float64Array(6), new Float64Array(6), new Float64Array(6)];
  const values = (t: number) => {
    if (t === vt) return vals;
    vt = t;
    const m = 0.38 * (0.5 - 0.5 * Math.cos(t * 0.28));
    for (let k = 0; k < 6; k++) {
      const mid = (ROLE[k] + JAMES[k]) / 2, wob = 0.025 * Math.sin(t * 0.9 + k * 1.7);
      vals[0][k] = ROLE[k] + (mid - ROLE[k]) * m + wob;
      vals[1][k] = JAMES[k] + (mid - JAMES[k]) * m - wob * 0.6;
      vals[2][k] = Math.min(vals[0][k], vals[1][k]);
    }
    return vals;
  };
  const vert = (who: number, k: number, t: number, o: { x: number; y: number }) => {
    const v = values(t)[who][k % 6] * R, a = angle(k);
    set(o, cx + Math.cos(a) * v, cy + Math.sin(a) * v);
  };
  const A = { x: 0, y: 0 }, B = { x: 0, y: 0 };
  const along = (who: number, c: number, t: number, o: { x: number; y: number }) => {
    const k = Math.floor(c) % 6, f = c - Math.floor(c);
    vert(who, k, t, A); vert(who, k + 1, t, B);
    set(o, A.x + (B.x - A.x) * f, A.y + (B.y - A.y) * f);
  };

  return {
    stroke, color, tag, link: s * 0.3,
    still: 6,
    pos: (j, t, o) => {
      const p = P[j];
      switch (p.k) {
        case 'spoke': {
          const a = angle(p.ax);
          return set(o, cx + Math.cos(a) * R * p.f, cy + Math.sin(a) * R * p.f);
        }
        case 'ring': {
          const k = Math.floor(p.c) % 6, f = p.c - Math.floor(p.c), r = (R * p.ring) / 4;
          const a0 = angle(k), a1 = angle(k + 1);
          return set(o, cx + (Math.cos(a0) + (Math.cos(a1) - Math.cos(a0)) * f) * r, cy + (Math.sin(a0) + (Math.sin(a1) - Math.sin(a0)) * f) * r);
        }
        case 'poly':
          return along(p.who, p.c, t, o);
        case 'mark': {
          vert(p.who, p.ax, t, o);
          const sz = p.who === 1 ? 3.5 : 3;
          return set(o, o.x + p.dx * sz, o.y + p.dy * sz);
        }
        default: {
          vert(2, p.ax, t, A); vert(2, p.ax + 1, t, B);
          const sh = 0.02 * Math.sin(t * 1.3 + p.ph);
          const u = p.u * (1 + sh), v = p.v * (1 - sh);
          return set(o, cx + (A.x - cx) * u + (B.x - cx) * v, cy + (A.y - cy) * u + (B.y - cy) * v);
        }
      }
    },
    level: (j, t) => {
      const p = P[j];
      if (p.k === 'fill') return 0.3 + 0.35 * (0.5 + 0.5 * Math.sin(t * 1.1 + p.ph));
      if (p.k === 'ring') return p.ring === 4 ? 0.9 : 0.5;
      if (p.k === 'spoke') return 0.6;
      if (p.k === 'poly' && p.who === 2) return 0.5;
      return 1;
    },
    labels: () => {
      const out: Label[] = AXES.map((ax, k) => {
        const a = angle(k), c = Math.cos(a), sn = Math.sin(a), r = R * 1.08 + 10;
        return {
          x: cx + c * r, y: cy + sn * r + 4 + (sn > 0.9 ? 8 : sn < -0.9 ? -4 : 0),
          text: wide ? ax.long : ax.short,
          align: Math.abs(c) < 0.2 ? 'center' : c > 0 ? 'left' : 'right',
        };
      });
      const ly = cy + R * 1.08 + 46;
      out.push({ x: cx - 12, y: ly, text: 'james', slot: 0, align: 'right' }, { x: cx + 12, y: ly, text: 'role', slot: 1, align: 'left' });
      return out;
    },
  };
};
