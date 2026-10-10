// Minimal frontmatter parser for content/*.md — flat `key: value` lines,
// inline `[a, b]` lists, booleans, and quoted strings. No nested YAML.
export function parseFrontmatter(raw: string): { data: Record<string, unknown>; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };
  const [, yamlBlock, content] = match;
  const data: Record<string, unknown> = {};
  for (const line of yamlBlock.split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    const rawValue = m[2].trim();
    if (rawValue.startsWith('[') && rawValue.endsWith(']')) {
      data[key] = rawValue
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
    } else if (rawValue === 'true' || rawValue === 'false') {
      data[key] = rawValue === 'true';
    } else if (rawValue.startsWith('"') && rawValue.endsWith('"') && rawValue.length >= 2) {
      try {
        data[key] = JSON.parse(rawValue);
      } catch {
        data[key] = rawValue.slice(1, -1);
      }
    } else {
      data[key] = rawValue.replace(/^'|'$/g, '');
    }
  }
  return { data, content: content.trim() };
}
