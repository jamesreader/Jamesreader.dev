// Local AI: two mirrored DGX Sparks behind a balancer; session-pinned packets; a fenced cloud lane
// that only releasable traffic may use.
import { alloc, lerp, perim, rnd, scaled, set, TAU, type WorldBuilder } from './shared';

type P =
  | { k: 0; b: number; fx: number; fy: number }
  | { k: 1; a: number; c: number; d: number; r: number }
  | { k: 2; node: number; off: number; sp: number; sx: number; rel: boolean; jx: number; jy: number };

export const sparks: WorldBuilder = ({ N, wide, stage }) => {
  const { cx, cy, s } = stage;
  const { stroke, color, tag } = alloc(N);
  const P: P[] = new Array(N);
  const bw = s * 0.26, bh = s * 0.32, dx = s * 0.24, by = cy + s * 0.16, lbx = cx, lby = cy - s * 0.16;
  const boxes: [number, number][] = [[cx - dx, by], [cx + dx, by]];
  const cloud: [number, number] = [cx + s * 0.46, cy - s * 0.38];
  let i = 0;
  const outline = scaled(N, 70, 24), fins = 7, finPts = scaled(N, 12, 4), ring = 18;
  for (let b = 0; b < 2; b++) {
    for (let k = 0; k < outline; k++, i++) {
      const pt = perim(k, outline);
      P[i] = { k: 0, b, fx: pt[0], fy: pt[1] }; stroke[i] = 6000 + b; color[i] = 1; tag[i] = 'sparks';
    }
    for (let f = 0; f < fins; f++)
      for (let k = 0; k < finPts; k++, i++) {
        P[i] = { k: 0, b, fx: 0.12 + (0.76 * k) / (finPts - 1), fy: 0.16 + f * 0.11 };
        stroke[i] = 6100 + b * 10 + f; color[i] = 2; tag[i] = 'sparks';
      }
  }
  for (let k = 0; k < ring; k++, i++) {
    P[i] = { k: 1, a: (k / ring) * TAU, c: lbx, d: lby, r: 12 }; stroke[i] = 6200; color[i] = 1; tag[i] = 'balancer pinning';
  }
  for (let k = 0; k < ring; k++, i++) {
    P[i] = { k: 1, a: (k / ring) * TAU, c: cloud[0], d: cloud[1], r: 16 }; stroke[i] = 6300; color[i] = 2; tag[i] = 'cloud';
  }
  for (; i < N; i++) {
    const sess = Math.floor(rnd(i, 1) * 10), rel = rnd(i, 2) < 0.05;
    P[i] = {
      k: 2, node: sess % 2, off: rnd(i, 3), sp: 0.07 + rnd(i, 4) * 0.05, sx: cx + (rnd(i, 5) - 0.5) * s * 0.9, rel,
      jx: (rnd(i, 6) - 0.5) * bw * 0.7, jy: (rnd(i, 7) - 0.3) * bh * 0.6,
    };
    color[i] = rel ? 1 : 0; tag[i] = rel ? 'cloud releasable' : 'pinning requests';
  }
  return {
    stroke, color, tag, link: 50,
    pos: (j, t, o) => {
      const p = P[j];
      if (p.k === 0) {
        const [bx, byy] = boxes[p.b];
        return set(o, bx - bw / 2 + p.fx * bw, byy - bh / 2 + p.fy * bh);
      }
      if (p.k === 1) {
        const r = p.r + Math.sin(t * 3 + p.a * 3) * 1.5;
        return set(o, p.c + Math.cos(p.a) * r, p.d + Math.sin(p.a) * r);
      }
      const ph = (t * p.sp + p.off) % 1, top = cy - s * 0.55;
      if (ph < 0.35) {
        const f = ph / 0.35;
        return set(o, lerp(p.sx, lbx, f * f), lerp(top, lby, f));
      }
      const f = (ph - 0.35) / 0.65, e = 1 - Math.pow(1 - f, 2);
      if (p.rel && Math.sin(t * 0.4) > 0.55) return set(o, lerp(lbx, cloud[0], e), lerp(lby, cloud[1], e) - Math.sin(f * 3.14) * 20);
      const [bx, byy] = boxes[p.node];
      set(o, lerp(lbx, bx + p.jx, e), lerp(lby, byy + p.jy, e) - Math.sin(f * 3.14) * s * 0.05);
    },
    labels: () => [
      { x: boxes[0][0], y: by + bh / 2 + 22, text: 'spark a' },
      { x: boxes[1][0], y: by + bh / 2 + 22, text: 'spark b' },
      { x: lbx, y: lby - 24, text: 'balancer' },
      { x: cloud[0], y: cloud[1] - 28, text: wide ? 'cloud · releasable only' : 'cloud' },
    ],
  };
};
