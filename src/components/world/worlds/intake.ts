// Classification on ingest (Town of Edgewood document platform). Page outlines stream in from the
// upper left (the archive keeps growing), squeeze through a pulsing classifier ring (the local model),
// then fan out into three bins: PUBLIC, RELEASABLE, and a closed CONFIDENTIAL box that stays on town
// hardware. Beyond the releasable bin, a faint dashed outline: the cloud, releasable only.
import { alloc, clamp01, dashId, lerp, perim, pick, rnd, scaled, set, smooth, TAU, type Label, type WorldBuilder } from './shared';

type Lane = 0 | 1 | 2; // public, releasable, confidential
const LANE_TAG = ['public', 'releasable', 'confidential'] as const;

type P =
  | { k: 'doc'; d: number; fx: number; fy: number }
  | { k: 'ring'; a: number; r: number; spin: number }
  | { k: 'bin'; b: Lane; fx: number; fy: number }
  | { k: 'filed'; b: Lane; fx: number; fy: number }
  | { k: 'cloud'; fx: number; fy: number }
  | { k: 'wire'; f: number }
  | { k: 'dust'; x: number; y: number; w: number };

interface Doc {
  lane: Lane;
  off: number;
  sp: number;
  jx: number;
  jy: number;
}

export const intake: WorldBuilder = ({ N, wide, stage }) => {
  const { cx, cy, s } = stage;
  const { stroke, color, tag } = alloc(N);
  const P: P[] = new Array(N);
  const hx = wide ? 1 : 0.86; // horizontal compression on narrow screens

  // Geometry, in px.
  const X = (u: number) => cx + u * s * hx;
  const Y = (v: number) => cy + v * s;
  const src = { x: X(-0.6), y: Y(-0.4) };
  const ring = { x: X(-0.14), y: Y(-0.02), r: s * 0.085 };
  const binW = s * 0.17 * hx, binH = s * 0.15;
  const bins = [
    { x: X(0.24), y: Y(-0.27) },
    { x: X(0.24), y: Y(0.0) },
    { x: X(0.24), y: Y(0.29) },
  ];
  const cloud = { x: X(0.5), y: Y(0.0), w: s * 0.12 * hx, h: s * 0.13 };
  const docW = s * 0.04, docH = docW * 1.3;

  // Budget.
  const ringPts = scaled(N, 44, 16), innerPts = scaled(N, 30, 10);
  const binPts = scaled(N, 48, 16), lidPts = scaled(N, 14, 6);
  const filedLines = 4, filedPer = scaled(N, 7, 3);
  const cloudPts = scaled(N, 44, 16), wirePts = scaled(N, 12, 6);
  // A page: closed outline with a dog-eared corner, the fold, and a title line.
  const OUTLINE: [number, number][] = [[0, 1], [0, 0.5], [0, 0], [0.65, 0], [1, 0.25], [1, 0.62], [1, 1], [0.5, 1], [0, 1]];
  const FOLD: [number, number][] = [[0.65, 0], [0.65, 0.25], [1, 0.25]];
  const TITLE: [number, number][] = [[0.18, 0.45], [0.48, 0.45], [0.78, 0.45]];
  const docPts = OUTLINE.length + FOLD.length + TITLE.length;
  const structural = ringPts + 1 + innerPts + 3 * (binPts + filedLines * filedPer) + lidPts + cloudPts + wirePts;
  const dustN = Math.round(N * 0.08);
  const docCount = Math.max(6, Math.floor((N - structural - dustN) / docPts));

  const docs: Doc[] = [];
  for (let d = 0; d < docCount; d++) {
    const r = rnd(d, 11);
    const lane: Lane = r < 0.48 ? 0 : r < 0.8 ? 1 : 2;
    docs.push({ lane, off: d / docCount + rnd(d, 12) * 0.02, sp: 0.055, jx: (rnd(d, 13) - 0.5), jy: (rnd(d, 14) - 0.5) });
  }

  let i = 0;
  // Documents: page outline with a dog-ear, plus a title line.
  for (let d = 0; d < docCount && i + docPts <= N; d++) {
    const docTag = 'incoming ' + LANE_TAG[docs[d].lane];
    const parts: [[number, number][], number][] = [[OUTLINE, docs[d].lane === 2 ? 1 : 0], [FOLD, 0], [TITLE, 2]];
    parts.forEach(([pts, slot], part) => {
      for (const [fx, fy] of pts) {
        P[i] = { k: 'doc', d, fx, fy };
        stroke[i] = 100000 + d * 4 + part;
        color[i] = slot;
        tag[i] = docTag;
        i++;
      }
    });
  }
  // Classifier: a closed pulsing ring and a counter-rotating dashed scanner inside it.
  for (let k = 0; k <= ringPts && i < N; k++, i++) {
    P[i] = { k: 'ring', a: ((k % ringPts) / ringPts) * TAU, r: 1, spin: 0 };
    stroke[i] = 8000; color[i] = 1; tag[i] = 'classifier';
  }
  for (let k = 0; k < innerPts && i < N; k++, i++) {
    P[i] = { k: 'ring', a: (k / innerPts) * TAU, r: 0.62, spin: -0.9 };
    stroke[i] = dashId(8100, k, 2); color[i] = 0; tag[i] = 'classifier';
  }
  // Bins: PUBLIC and RELEASABLE are open trays; CONFIDENTIAL is a closed box with a lid.
  for (let b = 0 as Lane; b < 3; b = (b + 1) as Lane) {
    for (let k = 0; k < binPts && i < N; k++, i++) {
      let fx: number, fy: number;
      if (b === 2) [fx, fy] = perim(k, binPts - 1);
      else {
        // U shape: down the left, across the bottom, up the right.
        const f = k / (binPts - 1), L = 1 + 1 + 1;
        const q = f * L;
        if (q < 1) [fx, fy] = [0, q];
        else if (q < 2) [fx, fy] = [q - 1, 1];
        else [fx, fy] = [1, 1 - (q - 2)];
      }
      if (b === 2 && k === binPts - 1) [fx, fy] = [0, 0];
      P[i] = { k: 'bin', b, fx, fy };
      stroke[i] = 8200 + b; color[i] = b === 2 ? 1 : 0; tag[i] = LANE_TAG[b];
    }
    for (let l = 0; l < filedLines; l++)
      for (let k = 0; k < filedPer && i < N; k++, i++) {
        P[i] = { k: 'filed', b, fx: 0.16 + (k / (filedPer - 1)) * 0.68, fy: 0.9 - l * 0.12 };
        stroke[i] = 8300 + b * 10 + l; color[i] = 2; tag[i] = LANE_TAG[b];
      }
  }
  // The confidential lid: a second line just above the box (closed, sealed).
  for (let k = 0; k < lidPts && i < N; k++, i++) {
    P[i] = { k: 'bin', b: 2, fx: -0.06 + (k / (lidPts - 1)) * 1.12, fy: -0.14 };
    stroke[i] = 8250; color[i] = 1; tag[i] = 'confidential';
  }
  // Cloud: dashed rounded outline beyond the releasable bin, and a dashed wire to it.
  for (let k = 0; k < cloudPts && i < N; k++, i++) {
    const a = (k / cloudPts) * TAU;
    P[i] = { k: 'cloud', fx: 0.5 + 0.5 * Math.cos(a), fy: 0.5 + 0.5 * Math.sin(a) };
    stroke[i] = dashId(8400, k, 1); color[i] = 2; tag[i] = 'releasable';
  }
  for (let k = 0; k < wirePts && i < N; k++, i++) {
    P[i] = { k: 'wire', f: k / (wirePts - 1) };
    stroke[i] = dashId(8500, k, 1); color[i] = 2; tag[i] = 'releasable';
  }
  for (; i < N; i++) {
    P[i] = { k: 'dust', x: rnd(i, 21), y: rnd(i, 22), w: rnd(i, 23) };
    color[i] = 2;
  }

  // Document path: source → classifier (0..0.46), squeeze (0.46..0.56), lane → bin (0.56..0.94), fade.
  const docState = (d: number, t: number) => {
    const doc = docs[d], ph = (t * doc.sp + doc.off) % 1, bin = bins[doc.lane];
    let x: number, y: number, sc = 1;
    if (ph < 0.46) {
      const f = ph / 0.46, e = f * (2 - f);
      const sx = src.x + doc.jx * s * 0.12, sy = src.y + doc.jy * s * 0.06;
      const mx = lerp(sx, ring.x, 0.55), my = sy + s * 0.02;
      const u = 1 - e;
      x = u * u * sx + 2 * u * e * mx + e * e * ring.x;
      y = u * u * sy + 2 * u * e * my + e * e * ring.y;
      sc = 1 - smooth((f - 0.75) / 0.25) * 0.55;
    } else if (ph < 0.56) {
      const f = (ph - 0.46) / 0.1;
      x = ring.x + (f - 0.5) * ring.r * 0.6; y = ring.y; sc = 0.45;
    } else {
      const f = clamp01((ph - 0.56) / 0.36), e = smooth(f);
      const ex = bin.x + doc.jx * binW * 0.5, ey = bin.y + binH * 0.05 + doc.jy * binH * 0.2;
      const ox = ring.x + ring.r * 0.4;
      x = lerp(ox, ex, e);
      y = lerp(ring.y, ey, e) - Math.sin(e * Math.PI) * s * 0.03;
      sc = lerp(0.45, 0.8, e);
    }
    const lvl = ph < 0.04 ? ph / 0.04 : ph > 0.94 ? 0 : ph > 0.9 ? (0.94 - ph) / 0.04 : 1;
    return { x, y, sc, lvl };
  };
  // Cache per doc per frame: pos() is called once per particle, and docs share their transform.
  let cacheT = -1;
  const cache = docs.map(() => ({ x: 0, y: 0, sc: 1, lvl: 1 }));
  const docAt = (d: number, t: number) => {
    if (t !== cacheT) {
      cacheT = t;
      for (let k = 0; k < docs.length; k++) Object.assign(cache[k], docState(k, t));
    }
    return cache[d];
  };

  return {
    stroke, color, tag, link: s * 0.2,
    still: 7.3,
    pos: (j, t, o) => {
      const p = P[j];
      switch (p.k) {
        case 'doc': {
          const st = docAt(p.d, t);
          return set(o, st.x + (p.fx - 0.5) * docW * st.sc, st.y + (p.fy - 0.5) * docH * st.sc);
        }
        case 'ring': {
          const pulse = 1 + 0.09 * Math.sin(t * 3.2) + (p.spin ? 0 : 0.04 * Math.sin(t * 7 + p.a * 2));
          const a = p.a + t * p.spin;
          return set(o, ring.x + Math.cos(a) * ring.r * p.r * pulse, ring.y + Math.sin(a) * ring.r * p.r * pulse);
        }
        case 'bin':
        case 'filed': {
          const b = bins[p.b];
          return set(o, b.x - binW / 2 + p.fx * binW, b.y - binH / 2 + p.fy * binH);
        }
        case 'cloud':
          return set(o, cloud.x - cloud.w / 2 + p.fx * cloud.w + Math.sin(t * 0.5 + p.fy * 4) * 1.5, cloud.y - cloud.h / 2 + p.fy * cloud.h);
        case 'wire':
          return set(o, lerp(bins[1].x + binW / 2 + 6, cloud.x - cloud.w / 2 - 6, p.f), bins[1].y);
        default: {
          const a = p.w * TAU + t * 0.05;
          return set(o, X(-0.65 + p.x * 1.3) + Math.cos(a) * 6, Y(-0.5 + p.y * 1.0) + Math.sin(a) * 6);
        }
      }
    },
    level: (j, t) => {
      const p = P[j];
      if (p.k === 'doc') return docAt(p.d, t).lvl;
      if (p.k === 'cloud' || p.k === 'wire') return 0.55;
      if (p.k === 'dust') return 0.5;
      return 1;
    },
    labels: () => {
      const out: Label[] = [
        { x: src.x - s * 0.06, y: src.y - s * 0.08, text: pick(wide, 'every agenda · every set of minutes · every IPRA release', 'agendas · minutes · IPRA'), align: 'left' },
        { x: ring.x, y: ring.y + ring.r * 1.3 + 16, text: 'local model', slot: 1 },
        { x: bins[0].x, y: bins[0].y - binH / 2 - 10, text: 'public' },
        { x: bins[1].x, y: bins[1].y - binH / 2 - 10, text: 'releasable' },
        { x: bins[2].x, y: bins[2].y - binH / 2 - binH * 0.14 - 10, text: 'confidential', slot: 1 },
        { x: bins[2].x, y: bins[2].y + binH / 2 + 18, text: pick(wide, 'stays on town hardware', 'on town hardware'), alpha: 0.75 },
        { x: cloud.x, y: cloud.y - cloud.h / 2 - 10, text: pick(wide, 'cloud: releasable only', 'cloud'), alpha: 0.7 },
      ];
      return out;
    },
  };
};
