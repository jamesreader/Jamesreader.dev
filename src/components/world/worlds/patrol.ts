// Caretaker: a model-free patrol at the center sends a probe to each host in turn. Every cycle one
// host raises an alarm; the playbook fix travels out and the alarm clears. On the right, the approvals
// ledger grows a line at a time, and the patrol's authority ring widens with it, but never past the
// fixed dashed fence (money, outbound, reboots) that stays put.
import { alloc, dashId, lerp, perim, pick, rnd, scaled, set, smooth, TAU, type Label, type WorldBuilder } from './shared';

const CYCLE = 16;
const HOSTS = 8;
const HOST_NAMES = ['servers', 'sites', 'ai box', 'repos', 'proxy', 'media', 'backups', 'certs'];

type P =
  | { k: 'core'; fx: number; fy: number }
  | { k: 'host'; h: number; a: number; alarm: boolean }
  | { k: 'probe'; f: number }
  | { k: 'fix'; seg: number }
  | { k: 'authority'; a: number }
  | { k: 'fence'; a: number }
  | { k: 'ledger'; row: number; f: number }
  | { k: 'dust'; x: number; y: number; w: number };

export const patrol: WorldBuilder = ({ N, wide, stage }) => {
  const { cx, cy, s } = stage;
  const { stroke, color, tag } = alloc(N);
  const P: P[] = new Array(N);
  const hx = wide ? 1 : 0.86;
  const X = (u: number) => cx + u * s * hx;
  const Y = (v: number) => cy + v * s;

  const core = { x: X(-0.14), y: Y(0.0), w: s * 0.07 };
  const ringR = s * 0.27, hostR = s * 0.035, fenceR = s * 0.4;
  const hosts = Array.from({ length: HOSTS }, (_, h) => {
    const a = -Math.PI / 2 + (h / HOSTS) * TAU;
    return { x: core.x + Math.cos(a) * ringR * hx, y: core.y + Math.sin(a) * ringR };
  });
  const ledger = { x: X(0.36), y: Y(0.3), w: s * 0.2 * hx, rows: 10, gap: s * 0.055 };

  // Budget.
  const corePts = scaled(N, 40, 16), hostPts = scaled(N, 22, 10), alarmPts = scaled(N, 26, 10);
  const probePts = scaled(N, 24, 10), fixPts = 4, authPts = scaled(N, 70, 24), fencePts = scaled(N, 110, 36);
  const ledgerPts = scaled(N, 12, 5);

  let i = 0;
  for (let k = 0; k <= corePts && i < N; k++, i++) {
    const [fx, fy] = perim(k % corePts, corePts);
    P[i] = { k: 'core', fx, fy }; stroke[i] = 8000; color[i] = 1; tag[i] = 'probe';
  }
  for (let h = 0; h < HOSTS; h++) {
    for (let k = 0; k <= hostPts && i < N; k++, i++) {
      P[i] = { k: 'host', h, a: (k / hostPts) * TAU, alarm: false };
      stroke[i] = 8100 + h; color[i] = 0; tag[i] = 'hosts';
    }
    for (let k = 0; k <= alarmPts && i < N; k++, i++) {
      P[i] = { k: 'host', h, a: (k / alarmPts) * TAU, alarm: true };
      stroke[i] = 8200 + h; color[i] = 1; tag[i] = 'hosts';
    }
  }
  for (let k = 0; k < probePts && i < N; k++, i++) {
    P[i] = { k: 'probe', f: k / (probePts - 1) };
    stroke[i] = dashId(8300, k, 1); color[i] = 0; tag[i] = 'probe';
  }
  for (let k = 0; k < fixPts && i < N; k++, i++) {
    P[i] = { k: 'fix', seg: k }; stroke[i] = 8400; color[i] = 1; tag[i] = 'probe';
  }
  for (let k = 0; k <= authPts && i < N; k++, i++) {
    P[i] = { k: 'authority', a: (k / authPts) * TAU }; stroke[i] = 8500; color[i] = 0; tag[i] = 'ledger';
  }
  for (let k = 0; k < fencePts && i < N; k++, i++) {
    P[i] = { k: 'fence', a: (k / fencePts) * TAU }; stroke[i] = dashId(9000, k, 2); color[i] = 1; tag[i] = 'fence';
  }
  for (let r = 0; r < ledger.rows; r++)
    for (let k = 0; k < ledgerPts && i < N; k++, i++) {
      P[i] = { k: 'ledger', row: r, f: k / (ledgerPts - 1) };
      stroke[i] = 9500 + r; color[i] = r % 3 === 0 ? 0 : 2; tag[i] = 'ledger';
    }
  for (; i < N; i++) {
    P[i] = { k: 'dust', x: rnd(i, 21), y: rnd(i, 22), w: rnd(i, 23) };
    color[i] = 2;
  }

  const phase = (t: number) => (t / CYCLE) % 1;
  const cycleNo = (t: number) => Math.floor(t / CYCLE);
  // The probe hops host to host, ~1 s each.
  const probeAt = (t: number) => {
    const q = t / 1.0;
    return { h: Math.floor(q) % HOSTS, f: q - Math.floor(q) };
  };
  // Incident: one host per cycle alarms at 0.2, the fix leaves at 0.45, arrives at 0.55.
  const sick = (t: number) => (cycleNo(t) * 3 + 2) % HOSTS;
  const alarm = (t: number) => {
    const ph = phase(t);
    return smooth((ph - 0.2) / 0.03) * (1 - smooth((ph - 0.55) / 0.04));
  };
  // Ledger rows filled so far (grows through the cycle, resets after a pause at the end).
  const filled = (t: number) => {
    const ph = phase(t);
    return ph > 0.95 ? 0 : Math.min(ledger.rows, 2 + ph * 9.5);
  };
  const authR = (t: number) => lerp(ringR * 0.55, fenceR * 0.86, filled(t) / ledger.rows);

  return {
    stroke, color, tag, link: s * 0.18,
    still: CYCLE * 0.42,
    pos: (j, t, o) => {
      const p = P[j];
      switch (p.k) {
        case 'core':
          return set(o, core.x + (p.fx - 0.5) * core.w, core.y + (p.fy - 0.5) * core.w);
        case 'host': {
          const H = hosts[p.h];
          const shake = p.alarm && p.h === sick(t) ? Math.sin(t * 40 + p.a) * 1.8 * alarm(t) : 0;
          const r = hostR * (p.alarm ? 1.6 + 0.15 * Math.sin(t * 9) : 1);
          return set(o, H.x + Math.cos(p.a) * r + shake, H.y + Math.sin(p.a) * r);
        }
        case 'probe': {
          const pr = probeAt(t), H = hosts[pr.h];
          const reach = Math.min(1, pr.f * 3);
          return set(o, lerp(core.x, lerp(core.x, H.x, reach), p.f), lerp(core.y, lerp(core.y, H.y, reach), p.f));
        }
        case 'fix': {
          const ph = phase(t), H = hosts[sick(t)];
          const f = smooth((ph - 0.45) / 0.1);
          return set(o, lerp(core.x, H.x, f) + (p.seg - 1.5) * 3, lerp(core.y, H.y, f));
        }
        case 'authority': {
          const r = authR(t);
          return set(o, core.x + Math.cos(p.a) * r * hx, core.y + Math.sin(p.a) * r);
        }
        case 'fence':
          return set(o, core.x + Math.cos(p.a) * fenceR * hx, core.y + Math.sin(p.a) * fenceR);
        case 'ledger':
          return set(o, ledger.x + p.f * ledger.w * (p.row % 3 === 0 ? 1 : 0.75), ledger.y - p.row * ledger.gap);
        default: {
          const a = p.w * TAU + t * 0.05;
          return set(o, X(-0.6 + p.x * 1.25) + Math.cos(a) * 6, Y(-0.45 + p.y * 0.9) + Math.sin(a) * 6);
        }
      }
    },
    level: (j, t) => {
      const p = P[j];
      switch (p.k) {
        case 'host': {
          const visited = probeAt(t).h === p.h ? 1 : 0.55;
          if (p.alarm) return p.h === sick(t) ? alarm(t) : 0;
          return visited;
        }
        case 'probe':
          return 0.85;
        case 'fix': {
          const ph = phase(t);
          return ph > 0.44 && ph < 0.56 ? 1 : 0;
        }
        case 'authority':
          return 0.5;
        case 'fence':
          return 0.8;
        case 'ledger': {
          const f = filled(t) - p.row;
          return f <= 0 ? 0 : Math.min(1, f) * (p.row % 3 === 0 ? 1 : 0.8);
        }
        case 'dust':
          return 0.45;
        default:
          return 1;
      }
    },
    labels: (t) => {
      const pr = probeAt(t);
      const a = alarm(t);
      const sk = hosts[sick(t)];
      const out: Label[] = [
        { x: core.x, y: core.y + core.w / 2 + 16, text: pick(wide, 'patrol · no ai', 'patrol'), slot: 1 },
        { x: core.x, y: core.y - fenceR - 10, text: pick(wide, 'fence: money · outbound · reboots · credentials', 'fence'), slot: 1, alpha: 0.75 },
        { x: ledger.x, y: ledger.y + 22, text: pick(wide, 'approvals ledger', 'ledger'), align: 'left' },
        { x: hosts[pr.h].x, y: hosts[pr.h].y - hostR * 2 - 6, text: HOST_NAMES[pr.h], alpha: 0.75 },
      ];
      if (a > 0.3) out.push({ x: sk.x, y: sk.y + hostR * 2 + 14, text: phase(t) < 0.45 ? 'alarm' : 'playbook fix', slot: 1, alpha: a });
      return out;
    },
  };
};
