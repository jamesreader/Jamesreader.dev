// Document platform: a grid of pages, amends / repeals / cites arcs between them, entities in orbit.
import { alloc, perim, rnd, set, TAU, type WorldBuilder } from './shared';

type P =
  | { k: 0; p: number; fx: number; fy: number }
  | { k: 1; a: number; f: number }
  | { k: 2; p: number; r: number; a: number; w: number };

type Arc = [number, number, 'amends' | 'repeals' | 'cites'];

export const records: WorldBuilder = ({ N, wide, stage }) => {
  const { cx, cy, s } = stage;
  const { stroke, color, tag } = alloc(N);
  const P: P[] = new Array(N);
  const cols = wide ? 4 : 3, rowsN = 3, pw = s * (wide ? 0.2 : 0.25), ph = pw * 1.3, gx = pw * 1.28, gy = ph * 1.18;
  const pages: { x: number; y: number }[] = [];
  for (let r = 0; r < rowsN; r++)
    for (let c = 0; c < cols; c++)
      pages.push({
        x: cx - ((cols - 1) * gx) / 2 + c * gx + (r % 2 ? pw * 0.12 : 0),
        y: cy - ((rowsN - 1) * gy) / 2 + r * gy + ph * 0.15,
      });
  // The 3-column (narrow) grid has 9 pages; give it its own arcs so every relation still shows.
  const arcs: Arc[] = wide
    ? [[0, 5, 'amends'], [5, 10, 'repeals'], [2, 7, 'cites'], [1, 6, 'amends'], [7, 9, 'repeals'], [3, 4, 'amends']]
    : [[0, 4, 'amends'], [4, 8, 'repeals'], [2, 6, 'cites'], [1, 5, 'amends'], [6, 7, 'repeals']];
  // Budgets scale down on small particle counts; arcs and a share of entities are reserved first.
  const tier = N >= 1000 ? 2 : N >= 600 ? 1 : 0;
  const outline = [16, 28, 36][tier], lines = 4, perLine = [4, 6, 8][tier], perPage = outline + lines * perLine, arcPts = [12, 20, 34][tier];
  const pageBudget = N - arcs.length * arcPts - Math.round(N * 0.12);
  let i = 0;
  for (let p = 0; p < pages.length && i + perPage <= pageBudget; p++) {
    for (let k = 0; k < outline; k++, i++) {
      const pt = perim(k, outline);
      P[i] = { k: 0, p, fx: pt[0], fy: pt[1] };
      stroke[i] = 3000 + p; color[i] = 0; tag[i] = 'docs';
    }
    for (let l = 0; l < lines; l++)
      for (let k = 0; k < perLine; k++, i++) {
        const len = l === 0 ? 0.55 : 0.78 - rnd(p * 9 + l, 2) * 0.2;
        P[i] = { k: 0, p, fx: 0.14 + (k / (perLine - 1)) * len, fy: 0.22 + l * 0.17 };
        stroke[i] = 4000 + p * 10 + l; color[i] = l === 0 ? 1 : 2; tag[i] = 'docs';
      }
  }
  for (let a = 0; a < arcs.length && i + arcPts <= N; a++)
    for (let k = 0; k < arcPts; k++, i++) {
      P[i] = { k: 1, a, f: k / (arcPts - 1) };
      stroke[i] = 5000 + a; color[i] = 1; tag[i] = 'links ' + arcs[a][2];
    }
  for (; i < N; i++) {
    P[i] = { k: 2, p: Math.floor(rnd(i, 1) * pages.length), r: 0.55 + rnd(i, 2) * 0.5, a: rnd(i, 3) * TAU, w: (rnd(i, 4) - 0.5) * 0.5 };
    color[i] = 2; tag[i] = 'entities';
  }
  const arcAt = (a: number, f: number, t: number, o: { x: number; y: number }) => {
    const [A, B] = arcs[a], ax = pages[A].x, ay = pages[A].y - ph * 0.1, bx = pages[B].x, by = pages[B].y - ph * 0.1;
    const mx = (ax + bx) / 2, my = Math.min(ay, by) - ph * (0.55 + 0.1 * Math.sin(t * 0.8 + a)), u = 1 - f;
    set(o, u * u * ax + 2 * u * f * mx + f * f * bx, u * u * ay + 2 * u * f * my + f * f * by);
  };
  const tmp = { x: 0, y: 0 };
  return {
    stroke, color, tag, link: 70,
    pos: (j, t, o) => {
      const p = P[j];
      if (p.k === 0) return set(o, pages[p.p].x - pw / 2 + p.fx * pw, pages[p.p].y - ph / 2 + p.fy * ph + Math.sin(t * 0.6 + p.p) * 2);
      if (p.k === 1) return arcAt(p.a, p.f, t, o);
      const a = p.a + t * p.w, pg = pages[p.p];
      set(o, pg.x + Math.cos(a) * pw * p.r, pg.y + Math.sin(a) * ph * p.r * 0.7);
    },
    labels: (t) =>
      arcs.map((a, k) => {
        arcAt(k, 0.5, t, tmp);
        return { x: tmp.x, y: tmp.y - 8, text: a[2] };
      }),
  };
};
