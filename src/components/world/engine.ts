// The world engine: a full-viewport canvas particle field that rebuilds itself into different
// "worlds". Framework-free; WorldProvider wraps it for React. Browser-only (call from effects).
//
// Model (ported from the approved reader-worlds mockup):
// - N particles spring toward per-world target positions (world.pos(i, t)).
// - Consecutive particles that share a stroke id are joined by a thread (if closer than world.link).
// - Each particle has a color slot (palette a / b / c) and optional brightness level (world.level).
// - A world change sweeps left to right: each particle switches target after a staggered delay.
// - Mouse repels (pointerType 'mouse' only), scrolling adds jitter, pulse() adds a burst.
// - setFocus(tag) highlights particles carrying that focus tag; swarmTo(el) outlines an element.
// - Labels (uppercase mono) fade in after a transition.
import { FOCUS_TAGS, type WorldName } from './types';
import { BUILDERS, type BuildCtx, type Scene } from './worlds';
import { perim, rnd, type Out } from './worlds/shared';
import { hexToRgb, paletteFor, type Theme } from './palettes';

export interface EngineOptions {
  world: WorldName;
  theme: Theme;
  /** Canvas opacity, 0..1 (route ambience). */
  intensity?: number;
  /** Element that receives --world-accent / --world-accent-2 (default: <html>). */
  cssRoot?: HTMLElement;
}

export interface Engine {
  readonly world: WorldName;
  setWorld: (name: WorldName) => void;
  setFocus: (tag: string | null) => void;
  swarmTo: (el: HTMLElement) => void;
  pulse: () => void;
  setIntensity: (v: number) => void;
  setTheme: (theme: Theme) => void;
  destroy: () => void;
  /** Diagnostics for the lab page and debugging. */
  stats: () => { world: WorldName; particles: number; lowQuality: boolean; frameMs: number; reducedMotion: boolean };
}

interface Built {
  name: WorldName;
  scene: Scene;
  /** Focus-tag bitmask per particle (bit k = FOCUS_TAGS[name][k]). */
  mask: Uint32Array;
}

const LEVEL_ALPHA = [0, 0.3, 0.62, 1];
const LINE_ALPHA = [0.5, 0.5, 0.35];
const DOT_ALPHA = [0.95, 0.95, 0.55];
const DOT_SIZE = [1.6, 2.2, 1.6];
const LINE_WIDTH = [0.8, 1.1, 0.8];
const LABEL_FONT = '500 10.5px "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
const SWARM_MS = 2600, SWARM_RELEASE_MS = 1500;
const DEV = process.env.NODE_ENV !== 'production';

const quantize = (v: number): number => (v <= 0.03 ? 0 : v < 0.42 ? 1 : v < 0.78 ? 2 : 3);
const rgba = (rgb: [number, number, number], a: number) => `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a.toFixed(3)})`;

export function createEngine(canvas: HTMLCanvasElement, opts: EngineOptions): Engine {
  const ctx = canvas.getContext('2d');
  const cssRoot = opts.cssRoot ?? document.documentElement;
  const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const cores = navigator.hardwareConcurrency || 8;

  let reduce = mqReduce.matches;
  let W = 0, H = 0, DPR = 1, N = 0;
  let px = new Float32Array(0), py = new Float32Array(0), vx = new Float32Array(0), vy = new Float32Array(0);
  let delay = new Float32Array(0), lv = new Uint8Array(0);
  let cur: WorldName = opts.world, prev: WorldName | null = null;
  let WC: Built | null = null, WP: Built | null = null;
  let theme: Theme = opts.theme;
  let changedAt = 0, clock = 0, last = performance.now();
  let mx = -1e4, my = -1e4, scrollV = 0, burst = 0;
  let focusTag: string | null = null, focusAmt = 0;
  let swarm: { el: HTMLElement; t0: number } | null = null;
  let lowQuality = false, slowSince = -1, emaMs = 16.7;
  let raf = 0, destroyed = false, dirty = true;
  let resizeTimer: ReturnType<typeof setTimeout> | undefined;
  const scrollPos = new WeakMap<EventTarget, number>();
  const out: Out = { x: 0, y: 0 };
  const warned = new Set<string>();

  // ── building ──────────────────────────────────────────────────────────
  function wantN(): number {
    let n = W < 700 ? 700 : 1500;
    if (cores <= 4) n *= 0.7;
    if (lowQuality) n *= 0.7;
    return Math.round(n);
  }

  function buildCtx(): BuildCtx {
    const wide = W > 1024;
    const stage = wide
      ? { cx: W * 0.67, cy: H * 0.5, s: Math.min(W * 0.54, H * 0.8) }
      : { cx: W * 0.5, cy: H * 0.27, s: Math.min(W * 0.9, H * 0.4) };
    return { N, W, H, wide, stage };
  }

  function build(name: WorldName): Built {
    const scene = BUILDERS[name](buildCtx());
    const tags = FOCUS_TAGS[name];
    const mask = new Uint32Array(N);
    const counts = new Array<number>(tags.length).fill(0);
    for (let i = 0; i < N; i++) {
      const t = scene.tag[i];
      if (!t) continue;
      for (const word of t.split(' ')) {
        const k = tags.indexOf(word);
        if (k >= 0) {
          mask[i] |= 1 << k;
          counts[k]++;
        } else if (DEV && !warned.has(name + word)) {
          warned.add(name + word);
          console.warn(`[world] ${name}: particle tag "${word}" is not in FOCUS_TAGS`);
        }
      }
    }
    if (DEV)
      tags.forEach((tg, k) => {
        if (!counts[k] && !warned.has(name + ':' + tg)) {
          warned.add(name + ':' + tg);
          console.warn(`[world] ${name}: focus tag "${tg}" has no particles`);
        }
      });
    return { name, scene, mask };
  }

  function realloc(n: number) {
    if (n === N) return;
    const keep = Math.min(n, N);
    const grow = (a: Float32Array) => {
      const b = new Float32Array(n);
      b.set(a.subarray(0, keep));
      return b;
    };
    px = grow(px); py = grow(py); vx = grow(vx); vy = grow(vy); delay = grow(delay);
    lv = new Uint8Array(n);
    for (let i = keep; i < n; i++) {
      px[i] = Math.random() * W;
      py[i] = Math.random() * H;
    }
    N = n;
  }

  function rebuild() {
    WC = build(cur);
    WP = WP && prev ? build(prev) : null;
    dirty = true;
  }

  function resize() {
    const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
    if (w === W && h === H && N) return;
    W = w; H = h;
    DPR = Math.min(window.devicePixelRatio || 1, W < 700 ? 1.5 : 2);
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx?.setTransform(DPR, 0, 0, DPR, 0, 0);
    realloc(wantN());
    rebuild();
  }

  function applyCssVars() {
    const pal = paletteFor(cur, theme);
    cssRoot.style.setProperty('--world-accent', pal.a);
    cssRoot.style.setProperty('--world-accent-2', pal.b);
  }

  // ── frame ─────────────────────────────────────────────────────────────
  function trackQuality(raw: number, now: number) {
    if (reduce || lowQuality || raw > 100) return;
    emaMs += (raw - emaMs) * 0.05;
    if (emaMs > 24) {
      if (slowSince < 0) slowSince = now;
      else if (now - slowSince > 2000) {
        // Adaptive quality: 70% of the particles, and no threads for the faint color slot.
        lowQuality = true;
        realloc(wantN());
        rebuild();
      }
    } else slowSince = -1;
  }

  function step(dt: number, now: number) {
    const C = WC!;
    const sc = C.scene, sp = WP?.scene;
    const t = reduce ? sc.still ?? 0 : clock, tp = reduce ? sp?.still ?? 0 : clock;
    const since = clock - changedAt;
    const f = dt * 60, k0 = 0.045 * f, damp = Math.pow(0.78, f);
    const jitter = reduce ? 0 : Math.min(6, scrollV * 0.04) + burst * 4;
    scrollV *= Math.pow(0.85, f);
    burst *= Math.pow(0.94, f);

    let sw: { r: DOMRect; release: boolean; n: number } | null = null;
    if (swarm) {
      const age = now - swarm.t0;
      if (age > SWARM_MS || !swarm.el.isConnected) swarm = null;
      else sw = { r: swarm.el.getBoundingClientRect(), release: age > SWARM_RELEASE_MS, n: Math.min(260, Math.floor(N * 0.2)) };
    }
    const lvlC = sc.level, lvlP = sp?.level;
    const tick = (clock * 60) | 0;
    for (let i = 0; i < N; i++) {
      let lev = 1, k = k0;
      if (sw && !sw.release && i < sw.n) {
        const pt = perim(i, sw.n);
        out.x = sw.r.left + pt[0] * sw.r.width;
        out.y = sw.r.top + pt[1] * sw.r.height;
        k = k0 * 2;
      } else if (sp && since < delay[i]) {
        sp.pos(i, tp, out);
        if (lvlP) lev = lvlP(i, tp);
      } else {
        sc.pos(i, t, out);
        if (lvlC) lev = lvlC(i, t);
      }
      lv[i] = quantize(lev);
      if (reduce) {
        px[i] = out.x; py[i] = out.y; vx[i] = 0; vy[i] = 0;
        continue;
      }
      vx[i] += (out.x - px[i]) * k;
      vy[i] += (out.y - py[i]) * k;
      const ddx = px[i] - mx, ddy = py[i] - my, d2 = ddx * ddx + ddy * ddy;
      if (d2 < 9000) {
        const fr = ((9000 - d2) / 9000) * 2.2 * f, d = Math.sqrt(d2 + 1);
        vx[i] += (ddx / d) * fr;
        vy[i] += (ddy / d) * fr;
      }
      if (jitter > 0.2) {
        vx[i] += (rnd(i, tick) - 0.5) * jitter;
        vy[i] += (rnd(i + 7, tick) - 0.5) * jitter;
      }
      vx[i] *= damp; vy[i] *= damp;
      px[i] += vx[i]; py[i] += vy[i];
    }
    return sw;
  }

  function draw(sw: { r: DOMRect; release: boolean; n: number } | null, dt: number) {
    if (!ctx) return;
    const C = WC!, sc = C.scene;
    const pal = paletteFor(cur, theme);
    const cols = [hexToRgb(pal.a), hexToRgb(pal.b), hexToRgb(pal.c)] as const;
    const S = sc.stroke, CL = sc.color, M = C.mask;
    const tags = FOCUS_TAGS[cur];
    const fk = focusTag ? tags.indexOf(focusTag) : -1;
    const fbit = fk >= 0 ? 1 << fk : 0;
    focusAmt += ((fbit ? 1 : 0) - focusAmt) * (reduce ? 1 : Math.min(1, dt * 10));
    const dim = 1 - 0.65 * focusAmt;
    const link2 = sc.link * sc.link;

    ctx.clearRect(0, 0, W, H);

    // Threads, batched by color slot and brightness level.
    for (let c = 0; c < 3; c++) {
      if (c === 2 && lowQuality) continue;
      const paths: (Path2D | null)[] = [null, null, null, null];
      for (let i = 0; i < N - 1; i++) {
        if (S[i] < 0 || S[i] !== S[i + 1] || CL[i] !== c) continue;
        const q = lv[i] < lv[i + 1] ? lv[i] : lv[i + 1];
        if (!q) continue;
        const dx = px[i + 1] - px[i], dy = py[i + 1] - py[i];
        if (dx * dx + dy * dy > link2) continue;
        const p = paths[q] ?? (paths[q] = new Path2D());
        p.moveTo(px[i], py[i]);
        p.lineTo(px[i + 1], py[i + 1]);
      }
      ctx.lineWidth = LINE_WIDTH[c];
      for (let q = 1; q < 4; q++) {
        const p = paths[q];
        if (!p) continue;
        ctx.strokeStyle = rgba(cols[c], LINE_ALPHA[c] * LEVEL_ALPHA[q] * dim);
        ctx.stroke(p);
      }
    }

    // Swarm outline.
    if (sw && !sw.release) {
      ctx.beginPath();
      ctx.strokeStyle = rgba(cols[1], 0.7);
      ctx.lineWidth = 1;
      for (let i = 0; i < sw.n - 1; i++) {
        ctx.moveTo(px[i], py[i]);
        ctx.lineTo(px[i + 1], py[i + 1]);
      }
      ctx.stroke();
    }

    // Particles, batched the same way; focused particles are drawn last, highlighted.
    for (let c = 0; c < 3; c++) {
      const paths: (Path2D | null)[] = [null, null, null, null];
      const sz = DOT_SIZE[c], h = sz / 2;
      for (let i = 0; i < N; i++) {
        if (CL[i] !== c || !lv[i] || (fbit && M[i] & fbit)) continue;
        const p = paths[lv[i]] ?? (paths[lv[i]] = new Path2D());
        p.rect(px[i] - h, py[i] - h, sz, sz);
      }
      for (let q = 1; q < 4; q++) {
        const p = paths[q];
        if (!p) continue;
        ctx.fillStyle = rgba(cols[c], DOT_ALPHA[c] * LEVEL_ALPHA[q] * dim);
        ctx.fill(p);
      }
    }
    if (fbit) {
      const p = new Path2D();
      for (let i = 0; i < N; i++) if (M[i] & fbit && lv[i]) p.rect(px[i] - 1.5, py[i] - 1.5, 3, 3);
      ctx.save();
      ctx.globalAlpha = Math.max(0.35, focusAmt);
      ctx.fillStyle = theme === 'dark' ? '#ffffff' : pal.b;
      ctx.shadowColor = pal.a;
      ctx.shadowBlur = 8;
      ctx.fill(p);
      ctx.restore();
    }

    // Labels fade in after a transition.
    const since = clock - changedAt;
    const fade = reduce ? 1 : Math.min(1, Math.max(0, (since - 0.9) / 0.6));
    if (fade > 0) {
      const t = reduce ? sc.still ?? 0 : clock;
      const labelRgb = hexToRgb(pal.label ?? pal.b);
      ctx.font = LABEL_FONT;
      ctx.textBaseline = 'alphabetic';
      for (const l of sc.labels(t)) {
        const text = l.text.toUpperCase();
        const w = ctx.measureText(text).width;
        const align = l.align ?? 'center';
        // Keep every label on screen (8px gutter).
        const minX = align === 'center' ? 8 + w / 2 : align === 'right' || align === 'end' ? 8 + w : 8;
        const maxX = align === 'center' ? W - 8 - w / 2 : align === 'right' || align === 'end' ? W - 8 : W - 8 - w;
        const x = Math.min(Math.max(l.x, minX), Math.max(minX, maxX));
        ctx.textAlign = align;
        ctx.fillStyle = rgba(l.slot !== undefined ? cols[l.slot] : labelRgb, 0.85 * fade * (l.alpha ?? 1) * (0.55 + 0.45 * dim));
        ctx.fillText(text, x, l.y);
      }
    }
  }

  function frame(now: number) {
    raf = 0;
    if (destroyed) return;
    const raw = now - last;
    last = now;
    trackQuality(raw, now);
    const dt = Math.min(0.05, Math.max(0.001, raw / 1000));
    if (!reduce) clock += dt;
    if (WP && clock - changedAt > 1.15) WP = null; // max stagger is 0.7 + 0.35 s
    if (WC && (!reduce || dirty || swarm || Math.abs(focusAmt - (focusTag ? 1 : 0)) > 0.01)) {
      const sw = step(dt, now);
      draw(sw, dt);
      dirty = false;
    }
    schedule();
  }

  function schedule() {
    if (!raf && !destroyed && !document.hidden) raf = requestAnimationFrame(frame);
  }

  // ── events ────────────────────────────────────────────────────────────
  const onPointerMove = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') {
      mx = e.clientX;
      my = e.clientY;
    } else {
      mx = my = -1e4;
    }
  };
  const onPointerOut = (e: PointerEvent) => {
    if (!e.relatedTarget) mx = my = -1e4;
  };
  const onBlur = () => {
    mx = my = -1e4;
  };
  const onScroll = (e: Event) => {
    const target = e.target;
    if (!target) return;
    const y = target === document ? window.scrollY : (target as Element).scrollTop ?? 0;
    const prevY = scrollPos.get(target);
    scrollPos.set(target, y);
    if (prevY !== undefined) scrollV += Math.abs(y - prevY);
  };
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  };
  const onVisibility = () => {
    if (document.hidden) {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    } else {
      last = performance.now();
      slowSince = -1;
      schedule();
    }
  };
  const onReduceChange = () => {
    reduce = mqReduce.matches;
    if (reduce) WP = null;
    dirty = true;
  };
  const onFonts = () => {
    dirty = true;
  };

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerout', onPointerOut, { passive: true });
  window.addEventListener('blur', onBlur);
  window.addEventListener('scroll', onScroll, { passive: true, capture: true });
  window.addEventListener('resize', onResize, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  mqReduce.addEventListener?.('change', onReduceChange);
  document.fonts?.ready.then(onFonts).catch(() => {});

  // ── boot ──────────────────────────────────────────────────────────────
  canvas.style.opacity = String(opts.intensity ?? 1);
  resize();
  applyCssVars();
  schedule();

  const engine: Engine = {
    get world() {
      return cur;
    },
    setWorld(name) {
      if (destroyed || !BUILDERS[name] || name === cur) return;
      prev = cur;
      cur = name;
      WP = reduce ? null : WC;
      WC = build(name);
      changedAt = clock;
      if (!reduce) for (let i = 0; i < N; i++) delay[i] = (px[i] / Math.max(1, W)) * 0.7 + rnd(i, 42) * 0.35;
      burst = reduce ? 0 : 1;
      if (focusTag && !FOCUS_TAGS[name].includes(focusTag)) focusTag = null;
      applyCssVars();
      dirty = true;
    },
    setFocus(tag) {
      focusTag = tag || null;
      dirty = true;
    },
    swarmTo(el) {
      swarm = { el, t0: performance.now() };
      dirty = true;
    },
    pulse() {
      if (!reduce) burst = 1;
    },
    setIntensity(v) {
      canvas.style.opacity = String(Math.max(0, Math.min(1, v)));
    },
    setTheme(th) {
      if (th === theme) return;
      theme = th;
      applyCssVars();
      dirty = true;
    },
    destroy() {
      destroyed = true;
      if (raf) cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerout', onPointerOut);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('scroll', onScroll, { capture: true });
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      mqReduce.removeEventListener?.('change', onReduceChange);
    },
    stats: () => ({ world: cur, particles: N, lowQuality, frameMs: Math.round(emaMs * 10) / 10, reducedMotion: reduce }),
  };
  return engine;
}
