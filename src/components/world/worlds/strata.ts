// James's career as high-desert rock strata, oldest at the bottom. Each layer is a role; the top layer
// (Town of Edgewood) is the brightest and still accreting. A mineral vein starts inside the NMSU layer
// at 2014 and cuts up through every later layer: Reader & Associates, continuous since 2014.
import { alloc, clamp01, dashId, lerp, pick, rnd, scaled, set, smooth, vnoise, type Label, type WorldBuilder } from './shared';

interface Layer {
  year: number;
  until: number;
  role: string;
  short: string;
  weight: number;
}

const LAYERS: Layer[] = [
  { year: 2012, until: 2013, role: 'Grants / Cibola Schools', short: 'Cibola Schools', weight: 1.3 },
  { year: 2013, until: 2015, role: 'NMSU adjunct', short: 'NMSU adjunct', weight: 1.8 },
  { year: 2015, until: 2018, role: 'Plateau Telecom', short: 'Plateau Telecom', weight: 2.2 },
  { year: 2018, until: 2021, role: 'DocTech', short: 'DocTech', weight: 2.2 },
  { year: 2021, until: 2024, role: 'IPS', short: 'IPS', weight: 2.2 },
  { year: 2024, until: 2027, role: 'Town of Edgewood', short: 'Town of Edgewood', weight: 2.6 },
];
const TOP = LAYERS.length - 1;
const VEIN_YEAR = 2014;

type P =
  | { k: 'edge'; b: number; u: number }
  | { k: 'bed'; L: number; u: number }
  | { k: 'grain'; L: number; u: number; v: number; ph: number }
  | { k: 'vein'; strand: number; f: number }
  | { k: 'glint'; f: number; ph: number }
  | { k: 'silt'; u: number; off: number; sp: number };

export const strata: WorldBuilder = ({ N, wide, stage }) => {
  const { cx, cy, s } = stage;
  const { stroke, color, tag } = alloc(N);
  const P: P[] = new Array(N);
  const hx = wide ? 1 : 0.86;
  // Wide: asymmetric span so the left-edge layer labels stay clear of the reading column.
  const x0 = wide ? cx - s * 0.42 : cx - s * 0.62 * hx, x1 = cx + s * 0.62 * hx;
  const yTop = cy - s * 0.34, yBot = cy + s * 0.38;

  // Boundary b (0 = base of the oldest layer, LAYERS.length = surface) baseline y.
  const total = LAYERS.reduce((a, l) => a + l.weight, 0);
  const base: number[] = [yBot];
  for (let b = 0; b < LAYERS.length; b++) base.push(base[b] - ((yBot - yTop) * LAYERS[b].weight) / total);
  const fold = (u: number, t: number) => (vnoise(u * 2.2 + t * 0.03, 0.5) - 0.5) * s * 0.09 + Math.sin(u * 3.1 + 0.6) * s * 0.025;
  const own = (u: number, b: number, t: number) => (vnoise(u * 4 + b * 1.7, b * 3.1 + t * 0.02) - 0.5) * s * 0.026;
  /** Boundary b at horizontal fraction u. */
  const by = (u: number, b: number, t: number) => base[b] + fold(u, t) + (b === 0 ? 0 : own(u, b, t));
  const X = (u: number) => lerp(x0, x1, u);

  const edgePts = scaled(N, 78, 22), bedPts = scaled(N, 40, 12), veinPts = scaled(N, 46, 16);
  const glints = scaled(N, 22, 6), silt = scaled(N, 34, 8);
  const veinU = 0.7;
  // The vein starts at 2014: halfway up the NMSU layer (2013 → 2015).
  const startL = LAYERS.findIndex((l) => VEIN_YEAR >= l.year && VEIN_YEAR < l.until);
  const startFrac = (VEIN_YEAR - LAYERS[startL].year) / (LAYERS[startL].until - LAYERS[startL].year);
  const veinY0 = (t: number) => lerp(by(veinU, startL, t), by(veinU, startL + 1, t), startFrac);
  const veinX = (f: number, strand: number) => X(veinU) + (vnoise(f * 9, 7.7) - 0.5) * s * 0.05 + (f - 0.5) * s * 0.03 + strand * 2.6;

  let i = 0;
  const layerTag = (L: number) => (L === TOP ? 'layers now' : 'layers');
  for (let b = 0; b <= LAYERS.length; b++)
    for (let k = 0; k < edgePts && i < N; k++, i++) {
      P[i] = { k: 'edge', b, u: k / (edgePts - 1) };
      stroke[i] = 10000 + b;
      color[i] = b === LAYERS.length ? 1 : b === 0 ? 2 : 0;
      tag[i] = b === LAYERS.length ? 'layers now' : 'layers';
    }
  for (let L = 0; L < LAYERS.length; L++)
    for (let k = 0; k < bedPts && i < N; k++, i++) {
      P[i] = { k: 'bed', L, u: k / (bedPts - 1) };
      stroke[i] = dashId(11000 + L * 100, k, 2); color[i] = 2; tag[i] = layerTag(L);
    }
  for (let strand = 0; strand < 2; strand++)
    for (let k = 0; k < veinPts && i < N; k++, i++) {
      P[i] = { k: 'vein', strand, f: k / (veinPts - 1) };
      stroke[i] = 12000 + strand; color[i] = 1;
    }
  for (let k = 0; k < glints && i < N; k++, i++) {
    P[i] = { k: 'glint', f: rnd(k, 51), ph: rnd(k, 52) * 6.28 };
    color[i] = 1;
  }
  for (let k = 0; k < silt && i < N; k++, i++) {
    P[i] = { k: 'silt', u: 0.04 + rnd(k, 61) * 0.92, off: rnd(k, 62), sp: 0.05 + rnd(k, 63) * 0.04 };
    color[i] = 0; tag[i] = 'now';
  }
  // Grains, distributed by layer thickness.
  for (; i < N; i++) {
    const r = rnd(i, 71) * total;
    let acc = 0, L = 0;
    for (; L < TOP; L++) { acc += LAYERS[L].weight; if (r < acc) break; }
    P[i] = { k: 'grain', L, u: rnd(i, 72), v: 0.12 + rnd(i, 73) * 0.76, ph: rnd(i, 74) * 6.28 };
    color[i] = L >= TOP - 1 ? 0 : 2; tag[i] = layerTag(L);
  }

  return {
    stroke, color, tag, link: s * 0.12,
    pos: (j, t, o) => {
      const p = P[j];
      switch (p.k) {
        case 'edge':
          return set(o, X(p.u), by(p.u, p.b, t));
        case 'bed': {
          const u = p.u;
          return set(o, X(u), lerp(by(u, p.L, t), by(u, p.L + 1, t), 0.5 + 0.12 * Math.sin(u * 7 + p.L)));
        }
        case 'grain': {
          const u = clamp01(p.u + Math.sin(t * 0.18 + p.ph) * 0.006);
          return set(o, X(u), lerp(by(u, p.L, t), by(u, p.L + 1, t), p.v));
        }
        case 'vein': {
          const top = by(veinU, LAYERS.length, t);
          return set(o, veinX(p.f, p.strand), lerp(veinY0(t), top, p.f));
        }
        case 'glint': {
          const top = by(veinU, LAYERS.length, t);
          return set(o, veinX(p.f, 0) + 1.3 + Math.sin(t * 0.9 + p.ph) * 3, lerp(veinY0(t), top, p.f));
        }
        default: {
          // Silt settling onto the surface: the top layer is still being laid down.
          const ph = (t * p.sp + p.off) % 1;
          const surf = by(p.u, LAYERS.length, t);
          return set(o, X(p.u) + Math.sin(t * 0.7 + p.off * 9) * 4, lerp(surf - s * 0.2, surf - 2, smooth(ph)));
        }
      }
    },
    level: (j, t) => {
      const p = P[j];
      switch (p.k) {
        case 'edge':
          return p.b === 0 ? 0.6 : 0.62 + 0.38 * (p.b / LAYERS.length);
        case 'bed':
          return 0.45 + 0.55 * (p.L / TOP);
        case 'grain':
          return 0.5 + 0.5 * (p.L / TOP);
        case 'glint':
          return 0.4 + 0.6 * Math.max(0, Math.sin(t * 1.7 + p.ph * 3));
        case 'silt': {
          const ph = (t * p.sp + p.off) % 1;
          return ph < 0.1 ? ph / 0.1 : ph > 0.9 ? (1 - ph) / 0.1 : 1;
        }
        default:
          return 1;
      }
    },
    labels: (t) => {
      const out: Label[] = LAYERS.map((l, L) => {
        const u = 0.012;
        const y = lerp(by(u, L, t), by(u, L + 1, t), 0.5) + 4;
        return {
          x: x0 + 6, y, align: 'left' as CanvasTextAlign,
          text: `${l.year} · ${wide ? l.role : l.short}`,
          alpha: L === TOP ? 1 : 0.72 + 0.2 * (L / TOP),
          slot: L === TOP ? 1 : undefined,
        };
      });
      const top = by(veinU, LAYERS.length, t);
      out.push({ x: veinX(1, 0), y: top - 16, text: pick(wide, 'Reader & Associates · 2014 → now', 'Reader & Assoc. · 2014 → now'), slot: 1 });
      return out;
    },
  };
};
