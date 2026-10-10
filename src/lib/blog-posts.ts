import fs from 'fs';
import path from 'path';
import { parseFrontmatter } from './frontmatter';

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string; // ISO YYYY-MM-DD
  displayDate: string; // e.g. "April 2026"
  readTime: string;
  published: boolean;
  content: string; // markdown body
}

const CONTENT_DIR = path.join(process.cwd(), 'content', 'blog');
const WORDS_PER_MINUTE = 230;

function formatMonthYear(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

function loadPost(file: string): BlogPost {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
  const { data, content } = parseFrontmatter(raw);
  const date = String(data.date ?? '');
  const minutes = Math.max(1, Math.round(content.split(/\s+/).filter(Boolean).length / WORDS_PER_MINUTE));
  return {
    slug: String(data.slug || file.replace(/\.(mdx|md)$/, '')),
    title: String(data.title ?? file),
    excerpt: String(data.excerpt ?? ''),
    category: String(data.category ?? ''),
    date,
    displayDate: formatMonthYear(date),
    readTime: `${minutes} min read`,
    published: data.published !== false,
    content,
  };
}

export function getAllPosts({ includeDrafts = false } = {}): BlogPost[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.md') || f.endsWith('.mdx'))
    .map(loadPost)
    .filter((p) => includeDrafts || p.published)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}
