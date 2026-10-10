import type { WorldName } from './types';

export type Theme = 'dark' | 'light';

/** Three color slots: a = accent, b = highlight, c = faint structure. */
export interface Palette {
  a: string;
  b: string;
  c: string;
  /** Canvas label color (defaults to b). */
  label?: string;
}

/**
 * Dark palettes read on navy (#0f1419); light palettes are deeper and more saturated so they read on
 * cream (#FAFAF7). Turquoise (#00B4D8) is the site's brand accent and anchors constellation and fit.
 */
export const PALETTES: Record<WorldName, Record<Theme, Palette>> = {
  constellation: {
    dark: { a: '#00b4d8', b: '#7fdcf0', c: '#3b5266' },
    light: { a: '#0091b0', b: '#005f78', c: '#8aa2b4' },
  },
  mesa: {
    dark: { a: '#f0a35e', b: '#ffd9a8', c: '#5c4636' },
    light: { a: '#c4661a', b: '#8a400c', c: '#b89b7e' },
  },
  records: {
    dark: { a: '#e6cf9b', b: '#fff1cf', c: '#4d4637' },
    light: { a: '#a87c22', b: '#6b4e10', c: '#b5a57f' },
  },
  intake: {
    dark: { a: '#2ec4b6', b: '#ffb347', c: '#34505a', label: '#bfeee8' },
    light: { a: '#0b8a7e', b: '#bf6a00', c: '#8eaaa7', label: '#0a5f57' },
  },
  sparks: {
    dark: { a: '#3fe0c5', b: '#bff8ee', c: '#27514c' },
    light: { a: '#0a9a84', b: '#05665a', c: '#8bb3ab' },
  },
  envelopes: {
    dark: { a: '#6fdc8c', b: '#d2f7db', c: '#2f5a3d' },
    light: { a: '#2c9a4c', b: '#196630', c: '#90b39a' },
  },
  radar: {
    dark: { a: '#41f07a', b: '#a8fff4', c: '#1d4a3c' },
    light: { a: '#13883d', b: '#007a87', c: '#8ab39a' },
  },
  strata: {
    dark: { a: '#d9774a', b: '#f3c89a', c: '#5a3e33' },
    light: { a: '#a8461d', b: '#73290c', c: '#b8957a' },
  },
  blueprint: {
    dark: { a: '#4a86ff', b: '#b3ccff', c: '#2f4d84' },
    light: { a: '#1f4fd1', b: '#0c2c8a', c: '#8e9fcb' },
  },
  lattice: {
    dark: { a: '#8b7bff', b: '#d6cfff', c: '#3a3466' },
    light: { a: '#5a45d6', b: '#35249a', c: '#a39bd2' },
  },
  fit: {
    dark: { a: '#00b4d8', b: '#ff7a6b', c: '#3b5266', label: '#bfe8f2' },
    light: { a: '#0091b0', b: '#d2452f', c: '#8ea4b6', label: '#005f78' },
  },
};

export function paletteFor(world: WorldName, theme: Theme): Palette {
  return PALETTES[world][theme];
}

export function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [n >> 16, (n >> 8) & 255, n & 255];
}
