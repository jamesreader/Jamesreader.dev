// Client-side fallback for choosing a scene's world when the backend sends no `world` event
// (older reader-agent). Looks at the opening of the streamed answer; rules are ordered from
// most specific to most general, and the first rule that matches wins.
import { PROJECT_WORLD, type WorldName } from '@/components/world';

/** How much of the streamed answer to look at before deciding. */
export const INFER_WINDOW = 160;

const RULES: Array<[RegExp, WorldName]> = [
  [/\bmeridian\b|\benvelope|\bbudget(?:ing)?\b|\bYNAB\b/i, 'envelopes'],
  [/\bSMIS\b|\bSAM\.gov\b|\bfederal contract|\bopportunit(?:y|ies)\b/i, 'radar'],
  [/\bclassif(?:y|ies|ied|ication|ier)\b|\bconfidential\b|\breleasable\b|\bIPRA\b/i, 'intake'],
  [/\brecords?\b|\bordinances?\b|\bresolutions?\b|\bdocument platform\b|\bamend|\brepeal/i, 'records'],
  [/\bDGX\b|\bSparks?\b|\blocal(?:-first)? (?:AI|model|hardware|inference)\b|\bon-?prem|\bvLLM\b|\bGPUs?\b|\bself-hosted\b/i, 'sparks'],
  [/\bjob description\b|\bthe role\b|\bcandidate\b/i, 'fit'],
  [/\bEdgewood\b|\bthe town\b|\bpolice department\b|\beight sites\b/i, 'mesa'],
  [/\bengagements?\b|\bconsult(?:ing|ant)?\b|\bscope\b|\bbuild (?:for|something)\b/i, 'blueprint'],
  [/\bcareer\b|\bReader & Associates\b|\bgrew up\b|\bbackground\b|\bpassion|\bdrives? (?:him|me)\b/i, 'strata'],
  [/\bsecurity\b|\bzero[- ]trust\b|\bhardening\b/i, 'lattice'],
];

const PROJECT_DIRECTIVE = /\{\{?\s*project\s*:\s*["']?([\w -]+?)["']?\s*\}\}?/i;

/** Best-guess world for a chunk of text, or null if nothing matches. */
export function inferWorld(text: string): WorldName | null {
  if (!text) return null;
  const project = PROJECT_DIRECTIVE.exec(text);
  if (project) {
    const id = project[1].trim().toLowerCase().replace(/\s+/g, '-');
    if (PROJECT_WORLD[id]) return PROJECT_WORLD[id];
  }
  for (const [re, world] of RULES) if (re.test(text)) return world;
  return null;
}
