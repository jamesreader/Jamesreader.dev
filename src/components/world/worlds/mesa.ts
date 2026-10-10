// Town of Edgewood: high-desert ridgelines with eight pulsing sites; the PD ring pulses faster (24/7).
import { alloc, lerp, rnd, set, TAU, vnoise, type WorldBuilder } from './shared';

type P = { kind: 0; u: number; r: number } | { kind: 1; k: number; a: number } | { kind: 2; x: number; y: number };

export const mesa: WorldBuilder = ({ N, wide, stage }) => {
  const { cx, cy, s } = stage;
  const { stroke, color, tag } = alloc(N);
  const P: P[] = [];
  const rows = wide ? 24 : 16, siteN = 8, ringPts = 14, per = Math.floor((N - siteN * ringPts) / rows);
  const x0 = cx - s * 0.62, x1 = cx + s * 0.62, y0 = cy - s * 0.3, gap = (s * 0.66) / rows;
  const height = (u: number, r: number) =>
    Math.max(0, Math.min((vnoise(u * 3.2, r * 0.23) * 0.7 + vnoise(u * 9, r * 0.5) * 0.3) * 1.6 - 0.35, 0.62));
  const sites: { u: number; r: number }[] = [];
  for (let k = 0; k < siteN; k++)
    sites.push({ u: 0.08 + (0.84 * k) / (siteN - 1) + (rnd(k, 2) - 0.5) * 0.06, r: 3 + Math.floor(rnd(k, 3) * (rows - 5)) });
  for (let i = 0; i < N; i++) {
    if (i < per * rows) {
      const r = Math.floor(i / per);
      P.push({ kind: 0, u: (i % per) / (per - 1), r });
      stroke[i] = 1000 + r;
      color[i] = r % 6 === 0 ? 1 : r > rows * 0.7 ? 2 : 0;
      tag[i] = 'land';
    } else if (i >= N - siteN * ringPts) {
      const j = i - (N - siteN * ringPts), k = Math.floor(j / ringPts);
      P.push({ kind: 1, k, a: ((j % ringPts) / ringPts) * TAU });
      stroke[i] = 2000 + k;
      color[i] = 1;
      tag[i] = k === 3 ? 'pd sites' : 'sites';
    } else {
      P.push({ kind: 2, x: rnd(i, 1), y: rnd(i, 2) });
      color[i] = 2;
    }
  }
  const ty = (u: number, r: number, t: number) =>
    y0 + r * gap - height(u + Math.sin(t * 0.05 + r) * 0.004, r) * s * 0.32 * (0.45 + r / rows);
  return {
    stroke, color, tag, link: 60,
    pos: (i, t, o) => {
      const p = P[i];
      if (p.kind === 0) return set(o, lerp(x0, x1, p.u), ty(p.u, p.r, t));
      if (p.kind === 1) {
        const st = sites[p.k], rad = 5 + 4 * (0.5 + 0.5 * Math.sin(t * 2.2 * (p.k === 3 ? 2.6 : 1) + p.k));
        return set(o, lerp(x0, x1, st.u) + Math.cos(p.a) * rad, ty(st.u, st.r, t) - 6 + Math.sin(p.a) * rad);
      }
      set(o, x0 + (x1 - x0) * p.x, cy - s * 0.5 + p.y * s * 0.2);
    },
    labels: (t) => {
      const st = sites[3];
      return [
        { x: lerp(x0, x1, st.u), y: ty(st.u, st.r, t) - 22, text: 'PD · 24/7' },
        { x: x0, y: y0 + rows * gap + 24, text: 'eight sites · two people', align: 'left' },
      ];
    },
  };
};
