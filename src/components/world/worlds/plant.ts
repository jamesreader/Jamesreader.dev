// Millwright: a prompt comes in from the left, prebuilt blocks fly off the catalog shelf and lock into
// an app, then data flows through it. Normal values pass the gate to the broker and out; restricted
// values (highlight) stop dead at the gate and fade. A dashed sandbox wraps the custom-code block.
// Loops every CYCLE seconds: assemble, run, dissolve back to the shelf.
import { alloc, clamp01, dashId, lerp, perim, pick, rnd, scaled, set, smooth, TAU, type Label, type WorldBuilder } from './shared';

const CYCLE = 18;

type P =
  | { k: 'block'; b: number; fx: number; fy: number }
  | { k: 'shelf'; r: number; fx: number; fy: number }
  | { k: 'edge'; e: number; f: number }
  | { k: 'gate'; f: number }
  | { k: 'broker'; fx: number; fy: number }
  | { k: 'sandbox'; fx: number; fy: number }
  | { k: 'prompt'; f: number }
  | { k: 'pkt'; n: number; seg: number }
  | { k: 'dust'; x: number; y: number; w: number };

export const plant: WorldBuilder = ({ N, wide, stage }) => {
  const { cx, cy, s } = stage;
  const { stroke, color, tag } = alloc(N);
  const P: P[] = new Array(N);
  const hx = wide ? 0.85 : 0.74;
  const X = (u: number) => cx + u * s * hx;
  const Y = (v: number) => cy + v * s;

  // Blocks: form, entity, approval, connector, code, api.
  const B = [
    { x: X(-0.34), y: Y(-0.14), name: 'form' },
    { x: X(-0.08), y: Y(-0.14), name: 'entity' },
    { x: X(0.18), y: Y(-0.14), name: 'approval' },
    { x: X(0.5), y: Y(-0.14), name: 'connector' },
    { x: X(-0.08), y: Y(0.18), name: 'code' },
    { x: X(0.18), y: Y(0.18), name: 'api' },
  ];
  const bw = s * 0.15 * hx, bh = s * 0.1;
  const EDGES: [number, number][] = [[0, 1], [1, 2], [2, 3], [1, 4], [4, 5]];
  const gateX = X(0.34), gateY = B[2].y, gateH = s * 0.16;
  const shelf = { x: X(-0.6), y: Y(-0.02) };
  const prompt = { x0: X(-0.66), x1: X(-0.44), y: Y(-0.3) };

  // Per-block assembly offsets within the cycle.
  const arrive = (b: number) => 0.04 + b * 0.035;

  // Budget.
  const blockPts = scaled(N, 56, 20), barPts = scaled(N, 9, 4);
  const shelfRows = 6, shelfPts = scaled(N, 16, 6);
  const edgePts = scaled(N, 14, 6), gatePts = scaled(N, 18, 8);
  const brokerPts = scaled(N, 60, 20), sandPts = scaled(N, 60, 20), promptPts = scaled(N, 22, 8);
  const pktCount = scaled(N, 26, 8), pktPts = 3;

  // Packets: path is form → entity → approval → (gate) → connector. ~30% are restricted.
  const pkts = Array.from({ length: pktCount }, (_, n) => ({
    restricted: rnd(n, 5) < 0.3,
    off: n / pktCount + rnd(n, 6) * 0.02,
    jy: (rnd(n, 7) - 0.5) * bh * 0.4,
  }));

  let i = 0;
  for (let b = 0; b < B.length; b++) {
    for (let k = 0; k <= blockPts && i < N; k++, i++) {
      const [fx, fy] = perim(k % blockPts, blockPts);
      P[i] = { k: 'block', b, fx, fy };
      stroke[i] = 8000 + b; color[i] = 0; tag[i] = 'blocks';
    }
    // A title bar inside each block.
    for (let k = 0; k < barPts && i < N; k++, i++) {
      P[i] = { k: 'block', b, fx: 0.15 + (0.7 * k) / (barPts - 1), fy: 0.3 };
      stroke[i] = 8100 + b; color[i] = 2; tag[i] = 'blocks';
    }
  }
  // Catalog shelf: ghost block outlines stacked on the left (where the blocks come from).
  for (let r = 0; r < shelfRows; r++)
    for (let k = 0; k <= shelfPts && i < N; k++, i++) {
      const [fx, fy] = perim(k % shelfPts, shelfPts);
      P[i] = { k: 'shelf', r, fx, fy };
      stroke[i] = 8200 + r; color[i] = 2; tag[i] = 'blocks';
    }
  for (let e = 0; e < EDGES.length; e++)
    for (let k = 0; k < edgePts && i < N; k++, i++) {
      P[i] = { k: 'edge', e, f: k / (edgePts - 1) };
      stroke[i] = 8300 + e; color[i] = 2; tag[i] = '';
    }
  for (let k = 0; k < gatePts && i < N; k++, i++) {
    P[i] = { k: 'gate', f: k / (gatePts - 1) };
    stroke[i] = 8400; color[i] = 1; tag[i] = 'gate';
  }
  // Broker: dashed box around the connector (it holds the keys, the agent never does).
  for (let k = 0; k <= brokerPts && i < N; k++, i++) {
    const [fx, fy] = perim(k % brokerPts, brokerPts);
    P[i] = { k: 'broker', fx, fy };
    stroke[i] = dashId(9000, k, 2); color[i] = 0; tag[i] = 'broker';
  }
  // Sandbox: dashed rounded box around the code block.
  for (let k = 0; k < sandPts && i < N; k++, i++) {
    const a = (k / sandPts) * TAU;
    P[i] = { k: 'sandbox', fx: Math.cos(a), fy: Math.sin(a) };
    stroke[i] = dashId(9500, k, 1); color[i] = 2; tag[i] = 'blocks';
  }
  for (let k = 0; k < promptPts && i < N; k++, i++) {
    P[i] = { k: 'prompt', f: k / (promptPts - 1) };
    stroke[i] = 9900; color[i] = 1; tag[i] = 'prompt';
  }
  for (let n = 0; n < pktCount; n++)
    for (let g = 0; g < pktPts && i < N; g++, i++) {
      P[i] = { k: 'pkt', n, seg: g };
      stroke[i] = 20000 + n; color[i] = pkts[n].restricted ? 1 : 0;
      tag[i] = pkts[n].restricted ? 'restricted' : '';
    }
  for (; i < N; i++) {
    P[i] = { k: 'dust', x: rnd(i, 21), y: rnd(i, 22), w: rnd(i, 23) };
    color[i] = 2;
  }

  // Cycle phase helpers.
  const phase = (t: number) => (t / CYCLE) % 1;
  // 0 on the shelf, 1 locked in place. Dissolves back at the end of the cycle.
  const placed = (b: number, ph: number) =>
    smooth((ph - arrive(b)) / 0.08) * (1 - smooth((ph - 0.93) / 0.06));
  const running = (ph: number) => smooth((ph - 0.3) / 0.06) * (1 - smooth((ph - 0.9) / 0.04));

  const blockXY = (b: number, ph: number) => {
    const e = placed(b, ph);
    const sy = shelf.y + (b - 2.5) * bh * 0.6;
    return { x: lerp(shelf.x, B[b].x, e), y: lerp(sy, B[b].y, e) - Math.sin(e * Math.PI) * s * 0.06, sc: lerp(0.55, 1, e) };
  };

  // Packet path: x along the top row; restricted ones stop at the gate.
  const pktState = (n: number, t: number) => {
    const p = pkts[n];
    const f = ((t * 0.09 + p.off) % 1);
    const x0 = B[0].x - bw * 0.3, x1 = B[3].x + bw * 0.2;
    let x = lerp(x0, x1, f), lvl = 1, held = 0;
    if (p.restricted && x > gateX - 8) {
      held = (x - (gateX - 8)) / (x1 - gateX);
      x = gateX - 8;
      lvl = Math.max(0, 1 - held * 2.2);
    }
    if (f < 0.04) lvl *= f / 0.04;
    if (f > 0.95) lvl *= (1 - f) / 0.05;
    return { x, y: gateY + p.jy, lvl, held };
  };

  return {
    stroke, color, tag, link: s * 0.2,
    still: CYCLE * 0.62,
    pos: (j, t, o) => {
      const p = P[j];
      const ph = phase(t);
      switch (p.k) {
        case 'block': {
          const st = blockXY(p.b, ph);
          return set(o, st.x + (p.fx - 0.5) * bw * st.sc, st.y + (p.fy - 0.5) * bh * st.sc);
        }
        case 'shelf':
          return set(o, shelf.x + (p.fx - 0.5) * bw * 0.55, shelf.y + (p.r - 2.5) * bh * 0.6 + (p.fy - 0.5) * bh * 0.45);
        case 'edge': {
          const [a, b] = EDGES[p.e];
          const A = blockXY(a, ph), Bb = blockXY(b, ph);
          const horiz = Math.abs(A.y - Bb.y) < 4;
          const ax = horiz ? A.x + bw / 2 : A.x, ay = horiz ? A.y : A.y + bh / 2;
          const bx = horiz ? Bb.x - bw / 2 : Bb.x - (Bb.x !== A.x ? bw / 2 : 0), by = horiz ? Bb.y : Bb.y - (Bb.x !== A.x ? 0 : bh / 2);
          if (horiz || Bb.x === A.x) return set(o, lerp(ax, bx, p.f), lerp(ay, by, p.f));
          // Elbow: down, then across.
          return p.f < 0.5 ? set(o, ax, lerp(ay, by, p.f * 2)) : set(o, lerp(ax, bx, (p.f - 0.5) * 2), by);
        }
        case 'gate': {
          const shake = (Math.sin(t * 31) * 1.5) * gateHit(t);
          return set(o, gateX + shake, gateY - gateH / 2 + p.f * gateH);
        }
        case 'broker':
          return set(o, B[3].x + (p.fx - 0.5) * bw * 1.45, B[3].y + (p.fy - 0.5) * bh * 1.9);
        case 'sandbox':
          return set(o, B[4].x + p.fx * bw * 0.72, B[4].y + p.fy * bh * 0.85);
        case 'prompt': {
          // A typed line: it writes itself at the start of each cycle.
          const shown = clamp01(ph / 0.05);
          return set(o, lerp(prompt.x0, lerp(prompt.x0, prompt.x1, shown), p.f), prompt.y);
        }
        case 'pkt': {
          const st = pktState(p.n, t);
          return set(o, st.x + (p.seg - 1) * 3, st.y);
        }
        default: {
          const a = p.w * TAU + t * 0.05;
          return set(o, X(-0.7 + p.x * 1.4) + Math.cos(a) * 6, Y(-0.45 + p.y * 0.9) + Math.sin(a) * 6);
        }
      }
    },
    level: (j, t) => {
      const p = P[j];
      const ph = phase(t);
      switch (p.k) {
        case 'pkt':
          return pktState(p.n, t).lvl * running(ph);
        case 'edge': {
          const [a, b] = EDGES[p.e];
          return 0.8 * Math.min(placed(a, ph), placed(b, ph)) * smooth((ph - 0.24) / 0.06);
        }
        case 'gate':
          return 0.55 + 0.45 * gateHit(t);
        case 'broker':
          return 0.75 * placed(3, ph);
        case 'sandbox':
          return 0.7 * placed(4, ph);
        case 'shelf':
          return 0.6;
        case 'prompt':
          return ph < 0.3 ? 1 : 0.5;
        case 'dust':
          return 0.45;
        default:
          return 1;
      }
    },
    labels: (t) => {
      const ph = phase(t);
      const on = running(ph);
      const out: Label[] = [
        { x: prompt.x0, y: prompt.y - 12, text: pick(wide, '"track equipment checkouts, approve over $500"', '"track checkouts"'), align: 'left', alpha: 0.8 },
        { x: shelf.x, y: shelf.y + bh * 2.1 + 10, text: pick(wide, 'reviewed blocks', 'blocks'), alpha: 0.7 },
        { x: gateX, y: gateY - gateH / 2 - 10, text: 'gate', slot: 1 },
        { x: B[3].x, y: B[3].y - bh * 0.95 - 8, text: 'broker', alpha: placed(3, ph) },
        { x: B[4].x, y: B[4].y + bh * 0.85 + 16, text: pick(wide, 'sandboxed code', 'sandbox'), alpha: placed(4, ph) * 0.8 },
        { x: B[5].x, y: B[5].y + bh / 2 + 16, text: pick(wide, 'published api', 'api'), alpha: placed(5, ph) * 0.8 },
      ];
      if (on > 0.5) out.push({ x: gateX - 8, y: gateY + gateH / 2 + 16, text: pick(wide, 'restricted stops here', 'blocked'), align: 'right', slot: 1, alpha: 0.6 + 0.4 * gateHit(t) });
      return out;
    },
  };

  // Brightness spike when a restricted packet hits the gate.
  function gateHit(t: number): number {
    let m = 0;
    for (let n = 0; n < pkts.length; n++) {
      if (!pkts[n].restricted) continue;
      const h = pktState(n, t).held;
      if (h > 0 && h < 0.12) m = Math.max(m, 1 - h / 0.12);
    }
    return m * running(phase(t));
  }
};
