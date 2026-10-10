// Meridian Money: envelope budgeting; dollars fall into named envelopes ("every dollar gets a job").
import { alloc, lerp, perim, rnd, set, type WorldBuilder } from './shared';

type P = { k: 0; e: number; fx: number; fy: number } | { k: 1; e: number; off: number; sp: number; jx: number; x0: number };

export const envelopes: WorldBuilder = ({ N, wide, stage }) => {
  const { cx, cy, s } = stage;
  const { stroke, color, tag } = alloc(N);
  const P: P[] = new Array(N);
  const n = wide ? 5 : 3, ew = s * (wide ? 0.16 : 0.26), eh = ew * 0.66, gap = ew * 1.24, ey = cy + s * 0.2;
  const names = ['rent', 'groceries', 'gas', 'fun', 'savings'], env: number[] = [];
  for (let k = 0; k < n; k++) env.push(cx - ((n - 1) * gap) / 2 + k * gap);
  let i = 0;
  const outline = 44, flap = 18;
  for (let k = 0; k < n; k++) {
    for (let q = 0; q < outline; q++, i++) {
      const pt = perim(q, outline);
      P[i] = { k: 0, e: k, fx: pt[0], fy: pt[1] }; stroke[i] = 7000 + k; color[i] = 0; tag[i] = 'envelopes';
    }
    for (let q = 0; q < flap; q++, i++) {
      const f = q / (flap - 1);
      P[i] = { k: 0, e: k, fx: f, fy: (f < 0.5 ? f : 1 - f) * 1.1 }; stroke[i] = 7100 + k; color[i] = 1; tag[i] = 'envelopes';
    }
  }
  for (; i < N; i++) {
    P[i] = { k: 1, e: Math.floor(rnd(i, 1) * n), off: rnd(i, 2), sp: 0.08 + rnd(i, 3) * 0.08, jx: (rnd(i, 4) - 0.5) * ew * 0.6, x0: (rnd(i, 5) - 0.5) * s * 1.2 };
    color[i] = rnd(i, 6) < 0.2 ? 1 : 2; tag[i] = 'dollars';
  }
  return {
    stroke, color, tag, link: 60,
    pos: (j, t, o) => {
      const p = P[j];
      if (p.k === 0) return set(o, env[p.e] - ew / 2 + p.fx * ew, ey - eh / 2 + p.fy * eh);
      const ph = (t * p.sp + p.off) % 1;
      set(o, lerp(cx + p.x0, env[p.e] + p.jx, Math.min(1, ph * 1.4)), lerp(cy - s * 0.55, ey - eh * 0.2, ph * ph));
    },
    labels: () => env.map((x, k) => ({ x, y: ey + eh / 2 + 20, text: names[k] })),
  };
};
