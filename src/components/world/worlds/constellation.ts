// Idle / exploring: drifting node clusters joined by faint threads, plus a field of dust.
import { alloc, rnd, set, TAU, type WorldBuilder } from './shared';

interface P {
  gx: number;
  gy: number;
  r: number;
  a: number;
  w: number;
}

export const constellation: WorldBuilder = ({ N, W, H, stage }) => {
  const { cx, cy, s } = stage;
  const { stroke, color, tag } = alloc(N);
  const P: P[] = [];
  const per = 7, groups = Math.floor((N * 0.55) / per);
  for (let i = 0; i < N; i++) {
    if (i < groups * per) {
      const g = Math.floor(i / per);
      P.push({
        gx: cx + (rnd(g, 1) - 0.5) * s * 1.5,
        gy: cy + (rnd(g, 2) - 0.5) * s * 1.05,
        r: 18 + rnd(i, 3) * 70,
        a: rnd(i, 4) * TAU,
        w: (rnd(g, 5) - 0.5) * 0.12,
      });
      stroke[i] = g;
      color[i] = rnd(i, 9) < 0.12 ? 1 : 0;
    } else {
      P.push({ gx: W * rnd(i, 6), gy: H * rnd(i, 7), r: 6, a: rnd(i, 8) * TAU, w: 0.05 });
      color[i] = 2;
    }
  }
  return {
    stroke, color, tag, link: 120,
    pos: (i, t, o) => {
      const p = P[i], a = p.a + t * p.w;
      set(o, p.gx + Math.cos(a) * p.r, p.gy + Math.sin(a) * p.r * 0.8);
    },
    labels: () => [],
  };
};
