// "I need something built." A faint blueprint grid with a scan line; an isometric wireframe building
// (three stacked volumes and a mast) whose edges draw themselves from a moving pen, hold, fade and
// loop. Dimension lines with tick labels appear once the structure is up. Hidden edges are dashed.
import { alloc, clamp01, dashId, lerp, scaled, set, smooth, type Label, type WorldBuilder } from './shared';

type V3 = [number, number, number];
type Edge = { a: V3; b: V3; hidden: boolean };

type P =
  | { k: 'grid'; vert: boolean; line: number; f: number; major: boolean }
  | { k: 'edge'; e: number; f: number; c: number }
  | { k: 'dim'; d: number; f: number }
  | { k: 'nib'; dx: number; dy: number };

const PERIOD = 16; // seconds per draw / hold / fade cycle
const DRAW_END = 0.6, HOLD_END = 0.86, FADE_END = 0.95;

function boxEdges(x0: number, x1: number, y0: number, y1: number, z0: number, z1: number): Edge[] {
  const v = (x: number, y: number, z: number): V3 => [x, y, z];
  const back = (p: V3) => p[0] === x0 && p[1] === y0; // the back vertical column is hidden in this view
  const out: Edge[] = [];
  const ring = (z: number) => [v(x0, y0, z), v(x1, y0, z), v(x1, y1, z), v(x0, y1, z)];
  // Draw like a drafter: footprint, uprights, then the top.
  const bottom = ring(z0), top = ring(z1);
  for (let k = 0; k < 4; k++) out.push({ a: bottom[k], b: bottom[(k + 1) % 4], hidden: back(bottom[k]) || back(bottom[(k + 1) % 4]) });
  for (let k = 0; k < 4; k++) out.push({ a: bottom[k], b: top[k], hidden: back(bottom[k]) });
  for (let k = 0; k < 4; k++) out.push({ a: top[k], b: top[(k + 1) % 4], hidden: false });
  return out;
}

export const blueprint: WorldBuilder = ({ N, wide, stage }) => {
  const { cx, cy, s } = stage;
  const { stroke, color, tag } = alloc(N);
  const P: P[] = new Array(N);
  const hx = wide ? 1 : 0.86;

  const edges: Edge[] = [
    ...boxEdges(0, 6, 0, 4, 0, 2),
    ...boxEdges(0.8, 5.2, 0.6, 3.4, 2, 3.8),
    ...boxEdges(3.4, 5.2, 0.6, 2.2, 3.8, 6.2),
    { a: [4.3, 1.4, 6.2], b: [4.3, 1.4, 7.4], hidden: false },
  ];
  const u = (s * 0.7) / 11; // iso unit: drawing plus dimension lines span ~11 units vertically
  const C30 = Math.cos(Math.PI / 6), S30 = 0.5;
  // Center the projected drawing on the stage (its projected center is near x - y = 0.6, (x + y)/2 - z = 0).
  const ox = cx - 0.6 * C30 * u, oy = cy + 0.2 * u;
  const iso = (p: V3): [number, number] => [ox + (p[0] - p[1]) * C30 * u, oy + (p[0] + p[1]) * S30 * u - p[2] * u];
  const len3 = (e: Edge) => Math.hypot(e.b[0] - e.a[0], e.b[1] - e.a[1], e.b[2] - e.a[2]);

  // Dimension lines (in model space), each with end ticks drawn as separate strokes.
  const dims: { a: V3; b: V3; text: string; tick: V3 }[] = [
    { a: [0, 5, 0], b: [6, 5, 0], text: `24'-0"`, tick: [0, 0.35, 0] },
    { a: [7, 0, 0], b: [7, 4, 0], text: `16'-0"`, tick: [0.35, 0, 0] },
    { a: [-0.9, 4.9, 0], b: [-0.9, 4.9, 7.4], text: `31'-0"`, tick: [0.3, -0.3, 0] },
  ];

  // Budget.
  const nibPts = 5, dimPts = scaled(N, 30, 10), tickPts = 3;
  const edgeBudget = Math.round(N * 0.42);
  const totalLen = edges.reduce((a, e) => a + len3(e), 0);
  const density = edgeBudget / totalLen;

  let i = 0, cum = 0;
  edges.forEach((e, ei) => {
    const L = len3(e), n = Math.max(3, Math.round(L * density));
    for (let k = 0; k < n && i < N; k++, i++) {
      const f = k / (n - 1);
      P[i] = { k: 'edge', e: ei, f, c: (cum + f * L) / totalLen };
      stroke[i] = e.hidden ? dashId(20000 + ei * 100, k, 1) : 20000 + ei * 100;
      color[i] = ei >= edges.length - 1 ? 1 : 0;
      tag[i] = 'structure';
    }
    cum += L;
  });
  dims.forEach((_, d) => {
    for (let k = 0; k < dimPts && i < N; k++, i++) {
      P[i] = { k: 'dim', d, f: k / (dimPts - 1) }; stroke[i] = 30000 + d * 10; color[i] = 0; tag[i] = 'structure';
    }
    for (const end of [0, 1])
      for (let k = 0; k < tickPts && i < N; k++, i++) {
        // f outside [0, 1] encodes tick points: 2 + end + k / (tickPts - 1) * 0.999
        P[i] = { k: 'dim', d, f: 2 + end * 2 + k / (tickPts - 1) }; stroke[i] = 30000 + d * 10 + 1 + end; color[i] = 0; tag[i] = 'structure';
      }
  });
  const nib: [number, number][] = [[0, 0], [-4, 0], [4, 0], [0, -4], [0, 4]];
  for (let k = 0; k < nibPts && i < N; k++, i++) {
    P[i] = { k: 'nib', dx: nib[k][0], dy: nib[k][1] }; color[i] = 1; tag[i] = 'structure';
  }
  // The grid takes what is left.
  const gx0 = cx - s * 0.62 * hx, gx1 = cx + s * 0.62 * hx, gy0 = cy - s * 0.44, gy1 = cy + s * 0.44;
  const cols = wide ? 13 : 9, rows = 9, gridLines = cols + rows;
  const perLine = Math.max(4, Math.floor((N - i) / gridLines));
  for (let line = 0; line < gridLines; line++) {
    const vert = line < cols, idx = vert ? line : line - cols;
    for (let k = 0; k < perLine && i < N; k++, i++) {
      P[i] = { k: 'grid', vert, line: idx, f: k / (perLine - 1), major: idx % 4 === 0 };
      stroke[i] = 40000 + line; color[i] = 2; tag[i] = 'grid';
    }
  }
  for (; i < N; i++) {
    P[i] = { k: 'grid', vert: false, line: 0, f: (i % 7) / 6, major: false };
    color[i] = 2; tag[i] = 'grid';
  }

  const cycle = (t: number) => (t / PERIOD) % 1;
  const pen = (t: number) => clamp01(cycle(t) / DRAW_END);
  const fadeOut = (t: number) => {
    const c = cycle(t);
    return c < HOLD_END ? 1 : c > FADE_END ? 0 : 1 - (c - HOLD_END) / (FADE_END - HOLD_END);
  };
  /** Pen position along the drawing (cumulative arc fraction c → point). */
  const penPoint = (c: number): [number, number] => {
    let acc = 0;
    for (const e of edges) {
      const L = len3(e) / totalLen;
      if (c <= acc + L || e === edges[edges.length - 1]) {
        const f = clamp01((c - acc) / L), A = iso(e.a), B = iso(e.b);
        return [lerp(A[0], B[0], f), lerp(A[1], B[1], f)];
      }
      acc += L;
    }
    return iso(edges[0].a);
  };
  let penT = -1, penXY: [number, number] = [0, 0];
  const penAt = (t: number) => {
    if (t !== penT) { penT = t; penXY = penPoint(pen(t)); }
    return penXY;
  };
  const dimEnds = (d: number): [[number, number], [number, number]] => [iso(dims[d].a), iso(dims[d].b)];
  const dimLevel = (t: number) => smooth((cycle(t) - DRAW_END * 0.85) / 0.08) * fadeOut(t);

  return {
    stroke, color, tag, link: s * 0.4,
    still: PERIOD * 0.75,
    pos: (j, t, o) => {
      const p = P[j];
      switch (p.k) {
        case 'edge': {
          if (p.c > pen(t)) { const q = penAt(t); return set(o, q[0], q[1]); }
          const e = edges[p.e], A = iso(e.a), B = iso(e.b);
          return set(o, lerp(A[0], B[0], p.f), lerp(A[1], B[1], p.f));
        }
        case 'dim': {
          const dm = dims[p.d], [A, B] = dimEnds(p.d);
          if (p.f <= 1) return set(o, lerp(A[0], B[0], p.f), lerp(A[1], B[1], p.f));
          const end = p.f >= 4 ? 1 : 0, g = (p.f - 2 - end * 2) * 2 - 1;
          const base = end ? dm.b : dm.a;
          const q = iso([base[0] + dm.tick[0] * g, base[1] + dm.tick[1] * g, base[2] + dm.tick[2] * g]);
          return set(o, q[0], q[1]);
        }
        case 'nib': {
          const q = penAt(t);
          return set(o, q[0] + p.dx, q[1] + p.dy);
        }
        default: {
          if (p.vert) return set(o, lerp(gx0, gx1, p.line / (wide ? 12 : 8)), lerp(gy0, gy1, p.f));
          return set(o, lerp(gx0, gx1, p.f), lerp(gy0, gy1, p.line / 8));
        }
      }
    },
    level: (j, t) => {
      const p = P[j];
      switch (p.k) {
        case 'edge':
          return p.c <= pen(t) ? fadeOut(t) : 0;
        case 'dim':
          return dimLevel(t) * 0.6;
        case 'nib':
          return cycle(t) < DRAW_END ? 1 : 0;
        default: {
          // A slow scan line brightens the grid as it passes.
          const scan = ((t * 0.06) % 1.3) - 0.15;
          const y = p.vert ? p.f : p.line / 8;
          return (p.major ? 0.85 : 0.5) + 0.5 * Math.exp(-((y - scan) ** 2) / 0.004);
        }
      }
    },
    labels: (t) => {
      const a = dimLevel(t);
      const out: Label[] = [{ x: gx1 - 4, y: gy1 + 18, text: wide ? 'sheet a-101 · built to spec' : 'a-101 · to spec', align: 'right', alpha: 0.75 }];
      if (a > 0.05) {
        dims.forEach((d, k) => {
          const [A, B] = dimEnds(k);
          const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
          if (k === 0) out.push({ x: mx - 10, y: my + 18, text: d.text, alpha: a, align: 'right' });
          else if (k === 1) out.push({ x: mx + 10, y: my + 18, text: d.text, alpha: a, align: 'left' });
          else out.push({ x: mx - 8, y: my, text: d.text, alpha: a, align: 'right' });
        });
      }
      return out;
    },
  };
};
