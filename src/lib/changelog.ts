import fs from 'fs';
import path from 'path';

export interface ChangelogEntry {
  slug: string;
  date: string;
  title: string;
  summary: string;
  categories: string[];
  published: boolean;
  body: string;
}

const CONTENT_DIR = path.join(process.cwd(), 'content', 'changelog');

function parseFrontmatter(raw: string): { data: Record<string, unknown>; content: string } {
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
    } else {
      data[key] = rawValue.replace(/^["']|["']$/g, '');
    }
  }
  return { data, content: content.trim() };
}

export function getAllChangelogEntries({ includeDrafts = false } = {}): ChangelogEntry[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));
  const entries: ChangelogEntry[] = [];
  for (const file of files) {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
    const { data, content } = parseFrontmatter(raw);
    const published = data.published !== false;
    if (!includeDrafts && !published) continue;
    entries.push({
      slug: file.replace(/\.(mdx|md)$/, ''),
      date: String(data.date ?? ''),
      title: String(data.title ?? file),
      summary: String(data.summary ?? ''),
      categories: Array.isArray(data.categories) ? (data.categories as string[]) : [],
      published,
      body: content,
    });
  }
  entries.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return entries;
}

export function formatChangelogDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
