import type { WorldName } from './types';

/** Human-facing name and one-line description per world (gallery, HUDs). */
export const WORLD_META: Record<WorldName, { title: string; line: string }> = {
  constellation: { title: 'Constellation', line: 'Idle and exploring: drifting node clusters in a field of dust.' },
  mesa: { title: 'Mesa', line: 'Town of Edgewood: high-desert ridgelines, eight sites, the PD pulsing 24/7.' },
  records: { title: 'Records', line: 'The document platform: pages linked by amends, repeals and cites, entities in orbit.' },
  intake: { title: 'Intake', line: 'Classification on ingest: documents pass the local model into public, releasable, confidential.' },
  sparks: { title: 'Sparks', line: "Town of Edgewood's AI: two mirrored Sparks, a balancer, session pinning and a fenced cloud lane." },
  homelab: { title: 'Home lab', line: "James's experimentation and learning rig: one DGX Spark shared by this site and his private agents, caches salted apart." },
  envelopes: { title: 'Envelopes', line: 'Meridian Money: dollars falling into envelopes. Every dollar gets a job.' },
  radar: { title: 'Radar', line: 'SMIS: a sweep over SAM.gov, opportunity blips flaring and scored as the beam passes.' },
  strata: { title: 'Strata', line: "James's career as rock layers, 2012 to now, cut by the Reader & Associates vein." },
  blueprint: { title: 'Blueprint', line: '"I need something built": an isometric structure drawing itself over a blueprint grid.' },
  lattice: { title: 'Lattice', line: 'Security first: a hex lattice tightening around a bright core; untrusted input turned away.' },
  fit: { title: 'Fit', line: 'Job-fit evaluation: role and James on six axes, converging, overlap filled.' },
};
