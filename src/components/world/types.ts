// Shared contract between the world engine and everything that drives it.
// The engine (engine.ts, worlds/*) implements it; pages and the home experience only use useWorld().

export const WORLD_NAMES = [
  'constellation', // idle / exploring: drifting node clusters
  'mesa',          // Town of Edgewood: high-desert ridgelines, 8 pulsing sites (PD ring pulses faster)
  'records',       // document platform: pages + amends/repeals/cites arcs + orbiting entities
  'intake',        // classification on ingest: documents stream into a classifier, sorted into public / releasable / confidential lanes
  'sparks',        // local AI: two mirrored nodes, balancer, session-pinned packets, fenced cloud lane
  'envelopes',     // Meridian Money: envelopes filling with falling dollars
  'radar',         // SMIS: radar sweep over a field, opportunity blips scored as the beam passes
  'strata',        // James's career: rock layers (2012 → now), each a role
  'blueprint',     // "I need something built": blueprint grid, a wireframe structure assembling
  'lattice',       // security / philosophy: hex lattice that hardens
  'fit',           // job evaluation: two radar-chart polygons (role vs James) converging
] as const;

export type WorldName = (typeof WORLD_NAMES)[number];

export interface WorldApi {
  /** Current world. */
  world: WorldName;
  /** Rebuild the world (left-to-right wave). No-op if already current. */
  setWorld: (name: WorldName) => void;
  /** Highlight particles tagged with this focus key (see FOCUS_TAGS); null clears. */
  setFocus: (tag: string | null) => void;
  /**
   * Fly a slice of particles to outline this element's on-screen rectangle (~1.2 s),
   * then release them. Call when a card mounts; reveal the card ~1.1 s later.
   */
  swarmTo: (el: HTMLElement) => void;
  /** Momentary energy pulse (e.g. when a stream starts). */
  pulse: () => void;
  /** Current canvas intensity, 0..1 (1 on '/', ~0.35 ambient elsewhere). Additive (engine builder). */
  intensity?: number;
  /** Override the route's intensity; null restores the route default. Additive (engine builder). */
  setIntensity?: (v: number | null) => void;
}

/** Focus tags each world supports, for term → world highlighting. */
export const FOCUS_TAGS: Record<WorldName, string[]> = {
  constellation: [],
  mesa: ['sites', 'pd', 'land'],
  records: ['docs', 'links', 'amends', 'repeals', 'cites', 'entities'],
  intake: ['incoming', 'classifier', 'public', 'releasable', 'confidential'],
  sparks: ['sparks', 'balancer', 'pinning', 'cloud', 'releasable', 'requests'],
  envelopes: ['envelopes', 'dollars'],
  radar: ['sweep', 'blips', 'scored'],
  strata: ['layers', 'now'],
  blueprint: ['grid', 'structure'],
  lattice: ['lattice', 'core'],
  fit: ['role', 'james', 'overlap'],
};

/** Which world a Reader content block / project id belongs to. */
export const PROJECT_WORLD: Record<string, WorldName> = {
  'meridian-money': 'envelopes',
  smis: 'radar',
  'smis-ai-tool': 'radar',
  'local-ai': 'sparks',
  'jamesreader-dev': 'sparks',
  'edgewood-ai': 'records',
  'edgewood-tools': 'mesa',
};

/** Starting world for each Reader intent. */
export const INTENT_WORLD: Record<string, WorldName> = {
  exploring: 'constellation',
  consulting: 'blueprint',
  technical: 'sparks',
  personal: 'strata',
  evaluating: 'fit',
};

export function isWorldName(x: unknown): x is WorldName {
  return typeof x === 'string' && (WORLD_NAMES as readonly string[]).includes(x);
}
