// James's home lab: ONE DGX Spark (not the town's mirrored pair). Two tenants share it: this site's
// public traffic and his private agents, each on its own salted prefix-cache lane inside the box.
import { alloc, dashId, lerp, perim, rnd, scaled, set, type WorldBuilder } from './shared';

type P =
  | { k: 0; fx: number; fy: number }
  | { k: 1; fx: number; fy: number }
  | { k: 2; side: 0 | 1; off: number; sp: number; sy: number; jx: number; jy: number };

export const homelab: WorldBuilder = ({ N, wide, stage }) => {
  const { cx, cy, s } = stage;
  const { stroke, color, tag } = alloc(N);
  const P: P[] = new Array(N);
  const bw = s * 0.42, bh = s * 0.46, bx = cx, by = cy + s * 0.04;
  const left = bx - bw / 2, top = by - bh / 2;
  let i = 0;

  // The one box.
  const outline = scaled(N, 110, 36);
  for (let k = 0; k < outline; k++, i++) {
    const pt = perim(k, outline);
    P[i] = { k: 0, fx: pt[0], fy: pt[1] }; stroke[i] = 8000; color[i] = 1; tag[i] = 'spark';
  }
  // Cooling fins.
  const fins = 6, finPts = scaled(N, 16, 5);
  for (let f = 0; f < fins; f++)
    for (let k = 0; k < finPts; k++, i++) {
      P[i] = { k: 0, fx: 0.1 + (0.8 * k) / (finPts - 1), fy: 0.12 + f * 0.035 };
      stroke[i] = 8100 + f; color[i] = 2; tag[i] = 'spark';
    }
  // Dashed divider: the two tenants' prefix caches are salted apart.
  const salt = scaled(N, 40, 12);
  for (let k = 0; k < salt; k++, i++) {
    P[i] = { k: 1, fx: 0.5, fy: 0.36 + (0.58 * k) / (salt - 1) };
    stroke[i] = dashId(8200, k, 2); color[i] = 1; tag[i] = 'salt';
  }
  // Requests: public (this site) from the left, private agents from the right.
  for (; i < N; i++) {
    const side = rnd(i, 1) < 0.5 ? 0 : 1;
    P[i] = {
      k: 2, side, off: rnd(i, 2), sp: 0.06 + rnd(i, 3) * 0.05, sy: cy + (rnd(i, 4) - 0.5) * s * 0.7,
      jx: 0.06 + rnd(i, 5) * 0.36, jy: 0.4 + rnd(i, 6) * 0.52,
    };
    color[i] = side === 0 ? 0 : 1; tag[i] = side === 0 ? 'public' : 'private';
  }

  const edgeL = cx - s * 0.62, edgeR = cx + s * 0.62;
  return {
    stroke, color, tag, link: 46,
    pos: (j, t, o) => {
      const p = P[j];
      if (p.k === 0 || p.k === 1) return set(o, left + p.fx * bw, top + p.fy * bh);
      const ph = (t * p.sp + p.off) % 1, e = 1 - Math.pow(1 - ph, 2);
      // Each tenant enters its own half of the box and settles there.
      const tx = p.side === 0 ? left + p.jx * bw : left + (1 - p.jx) * bw;
      const ty = top + p.jy * bh;
      const sx = p.side === 0 ? edgeL : edgeR;
      set(o, lerp(sx, tx, e), lerp(p.sy, ty, e) - Math.sin(ph * Math.PI) * s * 0.04);
    },
    labels: () => [
      { x: bx, y: top - 18, text: wide ? 'home lab · one dgx spark' : 'one dgx spark' },
      { x: left + bw * 0.25, y: top + bh + 22, text: 'public · this site' },
      { x: left + bw * 0.75, y: top + bh + 22, text: 'private agents' },
      { x: bx, y: top + bh * 0.31, text: 'salted caches', alpha: 0.7, slot: 1 },
    ],
    still: 3,
  };
};
