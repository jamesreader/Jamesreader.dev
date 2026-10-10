// Rehype plugin: wraps world terms (see terms.ts) in <span data-term="tag"> so the Answer's
// custom `span` renderer can wire them to setFocus. Only the first hit per tag is wrapped;
// `exclude` lists tags already wired by earlier text segments of the same answer.
// The transformer is pure per run (React may render the same markdown twice).
import type { WorldName } from '@/components/world';
import { termMatcher } from './terms';

// Minimal hast shapes (avoids depending on @types/hast directly).
interface HText { type: 'text'; value: string }
interface HElement {
  type: 'element';
  tagName: string;
  properties: Record<string, unknown>;
  children: HNode[];
}
interface HParent { type: string; children?: HNode[] }
type HNode = HText | HElement | HParent;

const SKIP = new Set(['code', 'pre', 'a', 'kbd']);

export interface RehypeTermsOptions {
  world: WorldName;
  exclude?: readonly string[];
}

export default function rehypeTerms(options: RehypeTermsOptions) {
  const matcher = termMatcher(options.world);

  function splitText(value: string, seen: Set<string>): HNode[] | null {
    if (!matcher) return null;
    const re = new RegExp(matcher.re.source, matcher.re.flags);
    const out: HNode[] = [];
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(value)) !== null) {
      if (m[0] === '') { re.lastIndex++; continue; }
      const group = m.slice(1).findIndex((g) => g !== undefined);
      const tag = matcher.tags[group];
      if (!tag || seen.has(tag)) continue;
      seen.add(tag);
      if (m.index > last) out.push({ type: 'text', value: value.slice(last, m.index) });
      out.push({
        type: 'element',
        tagName: 'span',
        properties: { dataTerm: tag },
        children: [{ type: 'text', value: m[0] }],
      });
      last = m.index + m[0].length;
    }
    if (out.length === 0) return null;
    if (last < value.length) out.push({ type: 'text', value: value.slice(last) });
    return out;
  }

  function walk(node: HNode, seen: Set<string>) {
    const children = (node as HParent).children;
    if (!children) return;
    if (node.type === 'element' && SKIP.has((node as HElement).tagName)) return;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.type === 'text') {
        const parts = splitText((child as HText).value, seen);
        if (parts) {
          children.splice(i, 1, ...parts);
          i += parts.length - 1;
        }
      } else {
        walk(child, seen);
      }
    }
  }

  return (tree: unknown) => {
    if (!matcher) return;
    walk(tree as HNode, new Set(options.exclude ?? []));
  };
}

/** Focus tags a chunk of (markdown) text would wire, for computing later segments' `exclude`. */
export function tagsIn(world: WorldName, text: string): string[] {
  const matcher = termMatcher(world);
  if (!matcher) return [];
  const re = new RegExp(matcher.re.source, matcher.re.flags);
  const found = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m[0] === '') { re.lastIndex++; continue; }
    const tag = matcher.tags[m.slice(1).findIndex((g) => g !== undefined)];
    if (tag) found.add(tag);
  }
  return [...found];
}
