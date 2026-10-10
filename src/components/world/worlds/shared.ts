// Shared toolkit for world builders. Pure functions only: no DOM, no window access.
//
// A world is a function of the build context (particle count, viewport, layout stage) that returns a
// Scene: per-particle stroke ids (consecutive particles with the same id are joined by a thread),
// a color slot (0 = accent, 1 = highlight, 2 = faint), focus tags, and a target-position function.

export interface Stage {
  cx: number;
  cy: number;
  /** Characteristic size of the world in px. */
  s: number;
}

export interface BuildCtx {
  N: number;
  W: number;
  H: number;
  /** Width > 1024: world sits right of center; otherwise centered in the top ~45%. */
  wide: boolean;
  stage: Stage;
}

export interface Label {
  x: number;
  y: number;
  text: string;
  align?: CanvasTextAlign;
  /** 0..1 multiplier on the label's opacity. */
  alpha?: number;
  /** Palette slot for the text color; defaults to the palette's label color. */
  slot?: 0 | 1 | 2;
}

/** Output slot for pos(); avoids allocating a tuple per particle per frame. */
export interface Out {
  x: number;
  y: number;
}

export interface Scene {
  stroke: Int32Array;
  color: Uint8Array;
  /** Space-separated focus tags per particle (see FOCUS_TAGS). */
  tag: string[];
  /** Max thread length in px; longer joins are skipped. */
  link: number;
  pos: (i: number, t: number, o: Out) => void;
  /** Optional per-particle brightness 0..1 (0 hides the particle and its threads). */
  level?: (i: number, t: number) => number;
  labels: (t: number) => Label[];
  /** Time used to pose the world when the user prefers reduced motion. */
  still?: number;
}

export type WorldBuilder = (ctx: BuildCtx) => Scene;

export const TAU = Math.PI * 2;

/** Deterministic hash noise in [0, 1). */
export const rnd = (i: number, k = 0): number => {
  const s = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
export const clamp01 = (x: number): number => (x < 0 ? 0 : x > 1 ? 1 : x);
export const smooth = (x: number): number => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};

/** 2D value noise in [0, 1]. */
export function vnoise(x: number, y: number): number {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const h = (a: number, b: number) => rnd(a * 57 + b * 131, 3);
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  return lerp(lerp(h(xi, yi), h(xi + 1, yi), u), lerp(h(xi, yi + 1), h(xi + 1, yi + 1), u), v);
}

/** Point k of n around the unit square perimeter, clockwise from the top-left corner. */
export function perim(k: number, n: number): [number, number] {
  const q = (k / n) * 4, side = Math.floor(q), f = q - side;
  return side === 0 ? [f, 0] : side === 1 ? [1, f] : side === 2 ? [1 - f, 1] : [0, 1 - f];
}

export function set(o: Out, x: number, y: number): void {
  o.x = x;
  o.y = y;
}

/** Fresh per-particle arrays for a scene. */
export function alloc(N: number) {
  return {
    stroke: new Int32Array(N).fill(-1),
    color: new Uint8Array(N),
    tag: new Array<string>(N).fill(''),
  };
}

/** Scale a design-time particle count (authored for N = 1500) to the actual budget. */
export function scaled(N: number, base: number, min = 2): number {
  return Math.max(min, Math.round((base * N) / 1500));
}

/**
 * Stroke id for a dashed line: particles k and k+1 are joined only when they share an id, so
 * groups of (len + 1) particles give a dash of `len` segments followed by a one-segment gap.
 * Give each dashed shape its own base with plenty of headroom (ids are base + k / (len + 1)).
 */
export const dashId = (base: number, k: number, len = 1): number => base + Math.floor(k / (len + 1));

/** Shorter text on narrow layouts. */
export const pick = (wide: boolean, long: string, short: string): string => (wide ? long : short);
