// SMIS federal-contract intelligence: a radar scope over SAM.gov. Concentric range rings, a rotating
// sweep beam, and ~30 opportunity blips that flare as the beam passes; the strong ones flash a score.
import { alloc, dashId, pick, rnd, scaled, set, TAU, type Label, type WorldBuilder } from './shared';

type P =
  | { k: 'ring'; ring: number; a: number }
  | { k: 'tick'; a: number; r: number }
  | { k: 'cross'; axis: 0 | 1; f: number }
  | { k: 'beam'; ray: number; f: number }
  | { k: 'blip'; b: number; dx: number; dy: number }
  | { k: 'score'; b: number; f: number }
  | { k: 'clutter'; r: number; a: number; w: number };

interface Blip {
  r: number;
  a: number;
  score: number;
  scored: boolean;
}

const OMEGA = 0.85; // beam angular speed, rad/s (one sweep every ~7.4 s)

export const radar: WorldBuilder = ({ N, wide, stage }) => {
  const { cx, cy, s } = stage;
  const { stroke, color, tag } = alloc(N);
  const P: P[] = new Array(N);
  const R = s * (wide ? 0.43 : 0.47);

  const blipCount = 30, rays = 7;
  const ringPts = [scaled(N, 40, 14), scaled(N, 64, 20), scaled(N, 88, 26), scaled(N, 120, 32)];
  const tickN = scaled(N, 72, 24), crossPts = scaled(N, 26, 10), rayPts = scaled(N, 26, 10);
  const blips: Blip[] = [];
  for (let b = 0; b < blipCount; b++) {
    const score = Math.round(38 + rnd(b, 31) * 60);
    blips.push({ r: 0.16 + Math.sqrt(rnd(b, 32)) * 0.8, a: rnd(b, 33) * TAU, score, scored: score >= 80 });
  }

  let i = 0;
  // Range rings (closed).
  ringPts.forEach((n, ring) => {
    for (let k = 0; k <= n && i < N; k++, i++) {
      P[i] = { k: 'ring', ring, a: ((k % n) / n) * TAU };
      stroke[i] = 9000 + ring; color[i] = ring === 3 ? 0 : 2; tag[i] = '';
    }
  });
  // Bearing ticks on the outer ring (every 4th is longer).
  for (let k = 0; k < tickN && i + 1 < N; k++) {
    const a = (k / tickN) * TAU, len = k % 4 === 0 ? 0.06 : 0.025;
    P[i] = { k: 'tick', a, r: 1 }; stroke[i] = 9100 + k; color[i] = 2; i++;
    P[i] = { k: 'tick', a, r: 1 + len }; stroke[i] = 9100 + k; color[i] = 2; i++;
  }
  // Dashed crosshair.
  for (let axis = 0 as 0 | 1; axis < 2; axis = (axis + 1) as 0 | 1)
    for (let k = 0; k < crossPts && i < N; k++, i++) {
      P[i] = { k: 'cross', axis, f: k / (crossPts - 1) };
      stroke[i] = dashId(9300 + axis * 100, k, 1); color[i] = 2;
    }
  // Sweep beam: a fan of rays trailing the leading edge.
  for (let ray = 0; ray < rays; ray++)
    for (let k = 0; k < rayPts && i < N; k++, i++) {
      P[i] = { k: 'beam', ray, f: k / (rayPts - 1) };
      stroke[i] = 9500 + ray; color[i] = ray === 0 ? 1 : 0; tag[i] = 'sweep';
    }
  // Blips: a small diamond each.
  const diamond: [number, number][] = [[0, -1], [1, 0], [0, 1], [-1, 0], [0, -1]];
  for (let b = 0; b < blipCount && i + diamond.length <= N; b++)
    for (const [dx, dy] of diamond) {
      P[i] = { k: 'blip', b, dx, dy };
      stroke[i] = 9600 + b; color[i] = blips[b].scored ? 1 : 0;
      tag[i] = blips[b].scored ? 'blips scored' : 'blips';
      i++;
    }
  // Score ticks: a short vertical bar beside each scored blip, height ~ score.
  for (let b = 0; b < blipCount; b++) {
    if (!blips[b].scored) continue;
    for (let k = 0; k < 3 && i < N; k++, i++) {
      P[i] = { k: 'score', b, f: k / 2 }; stroke[i] = 9700 + b; color[i] = 1; tag[i] = 'scored';
    }
  }
  // Clutter: faint noise inside the scope.
  for (; i < N; i++) {
    P[i] = { k: 'clutter', r: Math.sqrt(rnd(i, 41)) * 1.08, a: rnd(i, 42) * TAU, w: (rnd(i, 43) - 0.5) * 0.04 };
    color[i] = 2;
  }

  const sweepAt = (t: number) => (t * OMEGA) % TAU;
  /** Seconds since the beam last crossed angle a. */
  const age = (a: number, t: number) => {
    let d = sweepAt(t) - a;
    d = ((d % TAU) + TAU) % TAU;
    return d / OMEGA;
  };
  const bx = (b: Blip) => cx + Math.cos(b.a) * b.r * R;
  const by = (b: Blip) => cy + Math.sin(b.a) * b.r * R;
  const flare = (b: Blip, t: number) => Math.exp(-age(b.a, t) * 0.75);

  return {
    stroke, color, tag, link: s * 0.2,
    still: 2.4,
    pos: (j, t, o) => {
      const p = P[j];
      switch (p.k) {
        case 'ring': {
          const rr = R * (p.ring + 1) / 4;
          return set(o, cx + Math.cos(p.a) * rr, cy + Math.sin(p.a) * rr);
        }
        case 'tick':
          return set(o, cx + Math.cos(p.a) * R * p.r, cy + Math.sin(p.a) * R * p.r);
        case 'cross': {
          const v = (p.f * 2 - 1) * R;
          return p.axis === 0 ? set(o, cx + v, cy) : set(o, cx, cy + v);
        }
        case 'beam': {
          const a = sweepAt(t) - p.ray * 0.055;
          return set(o, cx + Math.cos(a) * p.f * R, cy + Math.sin(a) * p.f * R);
        }
        case 'blip': {
          const b = blips[p.b], sz = 2.5 + flare(b, t) * (b.scored ? 4 : 2.5);
          return set(o, bx(b) + p.dx * sz, by(b) + p.dy * sz);
        }
        case 'score': {
          const b = blips[p.b], h = 6 + (b.score - 80) * 0.6;
          return set(o, bx(b) + 9, by(b) + 3 - p.f * h * (0.4 + 0.6 * flare(b, t)));
        }
        default: {
          const a = p.a + t * p.w;
          return set(o, cx + Math.cos(a) * p.r * R, cy + Math.sin(a) * p.r * R);
        }
      }
    },
    level: (j, t) => {
      const p = P[j];
      switch (p.k) {
        case 'beam':
          return 1 - p.ray / 7.5;
        case 'blip':
          return 0.3 + 0.7 * flare(blips[p.b], t);
        case 'score':
          return flare(blips[p.b], t) > 0.12 ? flare(blips[p.b], t) : 0;
        case 'clutter':
          return 0.25 + 0.5 * Math.exp(-age(p.a, t) * 1.6);
        default:
          return 1;
      }
    },
    labels: (t) => {
      const out: Label[] = [
        { x: cx - R * 0.72, y: cy - R * 0.72 - 14, text: 'sam.gov', align: 'right' },
        { x: cx + R * 0.72, y: cy + R * 0.72 + 22, text: pick(wide, 'scored · fit ≥ 80', 'scored'), align: 'left', slot: 1 },
      ];
      for (const b of blips) {
        if (!b.scored) continue;
        const f = flare(b, t);
        if (f < 0.1) continue;
        out.push({ x: bx(b) + 14, y: by(b) - 4, text: String(b.score), align: 'left', alpha: f, slot: 1 });
      }
      return out;
    },
  };
};
