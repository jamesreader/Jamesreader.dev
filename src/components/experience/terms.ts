// Per-world dictionary of phrases in Reader's answers that map to a part of the world.
// Hovering/focusing a matched term calls setFocus(tag); the tag must be one of FOCUS_TAGS[world].
// Only the scene's own world is matched, and only the first hit per tag is wired, so answers
// stay readable instead of turning into a field of underlines.
import type { WorldName } from '@/components/world';

export interface TermRule {
  /** Regex source (matched case-insensitively, on word boundaries where it makes sense). */
  pattern: string;
  tag: string;
}

export const WORLD_TERMS: Record<WorldName, TermRule[]> = {
  constellation: [],
  mesa: [
    { pattern: '\\b(?:eight|8) (?:sites|locations|buildings)\\b', tag: 'sites' },
    { pattern: '\\bpolice department\\b|\\bPD\\b', tag: 'pd' },
    { pattern: '\\bhigh[- ]desert\\b|\\bEast Mountains\\b', tag: 'land' },
  ],
  records: [
    { pattern: '\\bdocument platform\\b|\\bsystem of record\\b', tag: 'docs' },
    { pattern: '\\bamend(?:s|ed|ments?)?\\b', tag: 'amends' },
    { pattern: '\\brepeal(?:s|ed)?\\b', tag: 'repeals' },
    { pattern: '\\bcit(?:es|ed|ations?)\\b|\\bcross-referenc\\w*', tag: 'cites' },
    { pattern: '\\bentit(?:y|ies)\\b', tag: 'entities' },
    { pattern: '\\brelationships?\\b', tag: 'links' },
  ],
  intake: [
    { pattern: '\\bclassif(?:y|ies|ied|ication|ier)\\b', tag: 'classifier' },
    { pattern: '\\bconfidential\\b', tag: 'confidential' },
    { pattern: '\\breleasable\\b', tag: 'releasable' },
    { pattern: '\\bpublic records?\\b', tag: 'public' },
    { pattern: '\\b(?:ingest(?:ed|ion)?|incoming|uploads?)\\b', tag: 'incoming' },
  ],
  sparks: [
    { pattern: '\\bsession[- ]pinn(?:ing|ed)\\b', tag: 'pinning' },
    { pattern: '\\bload[- ]?balanc\\w*', tag: 'balancer' },
    { pattern: '\\bmirrored\\b|\\bDGX Sparks?\\b', tag: 'sparks' },
    { pattern: '\\bcloud\\b', tag: 'cloud' },
    { pattern: '\\breleasable\\b', tag: 'releasable' },
    { pattern: '\\brequests\\b', tag: 'requests' },
  ],
  envelopes: [
    { pattern: '\\benvelopes?\\b', tag: 'envelopes' },
    { pattern: '\\$\\d+(?:\\.\\d\\d)?(?:\\s?(?:/|per)\\s?month)?|\\bdollars?\\b', tag: 'dollars' },
  ],
  radar: [
    { pattern: '\\bSAM\\.gov\\b|\\bopportunit(?:y|ies)\\b', tag: 'blips' },
    { pattern: '\\bscor(?:e|es|ed|ing)\\b', tag: 'scored' },
    { pattern: '\\bfederal contract\\w*', tag: 'sweep' },
  ],
  strata: [
    { pattern: '\\bReader & Associates\\b|\\b(?:19|20)\\d\\d\\b', tag: 'layers' },
    { pattern: '\\bIT Director\\b|\\btoday\\b', tag: 'now' },
  ],
  blueprint: [
    { pattern: '\\brequirements\\b|\\bscop(?:e|ing)\\b', tag: 'grid' },
    { pattern: '\\bbuil(?:d|ds|t) (?:it|them|instead)\\b|\\bfrom scratch\\b', tag: 'structure' },
  ],
  lattice: [
    { pattern: '\\bsecurity\\b|\\bzero[- ]trust\\b', tag: 'lattice' },
    { pattern: '\\bprivacy\\b|\\bprivate\\b', tag: 'core' },
  ],
  fit: [
    { pattern: '\\b(?:the|this|your) role\\b|\\bjob description\\b', tag: 'role' },
    { pattern: '\\bJames\\b', tag: 'james' },
    { pattern: '\\boverlap\\w*|\\bstrong fit\\b', tag: 'overlap' },
  ],
};

/** One combined, case-insensitive regex per world; capture group i ↔ rules[i]. */
const compiled = new Map<WorldName, { re: RegExp; tags: string[] } | null>();

export function termMatcher(world: WorldName): { re: RegExp; tags: string[] } | null {
  if (compiled.has(world)) return compiled.get(world) ?? null;
  const rules = WORLD_TERMS[world] ?? [];
  const entry = rules.length
    ? { re: new RegExp(rules.map((r) => `(${r.pattern})`).join('|'), 'gi'), tags: rules.map((r) => r.tag) }
    : null;
  compiled.set(world, entry);
  return entry;
}
