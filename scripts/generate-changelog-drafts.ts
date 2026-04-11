#!/usr/bin/env npx tsx
/**
 * Reads recent git commits and emits draft changelog entries to content/changelog/
 * marked `published: false`. Curate, rewrite in the right voice, flip `published: true`.
 *
 * Usage:
 *   npx tsx scripts/generate-changelog-drafts.ts                  # last 14 days
 *   npx tsx scripts/generate-changelog-drafts.ts --since 30.days  # custom window
 *   DRY_RUN=1 npx tsx scripts/generate-changelog-drafts.ts        # print to stdout instead of writing
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const REPO_ROOT = path.resolve(__dirname, '..');
const CHANGELOG_DIR = path.join(REPO_ROOT, 'content', 'changelog');
const DEFAULT_SINCE = '14.days';
const DRY_RUN = process.env.DRY_RUN === '1';

interface Commit {
  hash: string;
  date: string; // YYYY-MM-DD
  subject: string;
  body: string;
  author: string;
}

function getArg(flag: string, fallback: string): string {
  const idx = process.argv.indexOf(flag);
  return idx >= 0 && process.argv[idx + 1] ? process.argv[idx + 1] : fallback;
}

function gitLog(since: string): Commit[] {
  const sep = '---COMMIT---';
  const fieldSep = '---F---';
  const format = [`%H`, `%ad`, `%s`, `%b`, `%an`].join(fieldSep);
  const out = execSync(
    `git log --since="${since}" --date=short --pretty=format:"${format}${sep}"`,
    { cwd: REPO_ROOT, encoding: 'utf-8' },
  );
  return out
    .split(sep)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const [hash, date, subject, body, author] = block.split(fieldSep);
      return { hash, date, subject: subject?.trim() ?? '', body: body?.trim() ?? '', author };
    })
    .filter((c) => c.hash && c.date && c.subject);
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function inferCategories(subject: string): string[] {
  const s = subject.toLowerCase();
  const cats: string[] = [];
  if (/^fix|\bfix\b|\bbug\b/.test(s)) cats.push('fix');
  if (/^feat|\badd\b|\bintroduce\b|\bship\b/.test(s)) cats.push('feat');
  if (/\binfra\b|\bdeploy\b|\bvllm\b|\blitellm\b|\bdocker\b|\bnginx\b|\bk8s\b|\bk3s\b/.test(s))
    cats.push('infra');
  if (/\bcontent\b|\bcopy\b|\bblog\b|\bmdx\b/.test(s)) cats.push('content');
  if (/\bchangelog\b|\bdocs\b|\breadme\b/.test(s)) cats.push('meta');
  return cats.length ? Array.from(new Set(cats)) : ['meta'];
}

function groupByDay(commits: Commit[]): Map<string, Commit[]> {
  const map = new Map<string, Commit[]>();
  for (const c of commits) {
    const list = map.get(c.date) ?? [];
    list.push(c);
    map.set(c.date, list);
  }
  return map;
}

function renderDraft(day: string, commits: Commit[]): { filename: string; content: string } {
  const title = commits.length === 1 ? commits[0].subject : `${commits.length} changes on ${day}`;
  const slug = slugify(`${day}-draft-${title}`);
  const filename = `${day}-draft-${slug}.mdx`;

  const categories = Array.from(
    new Set(commits.flatMap((c) => inferCategories(c.subject))),
  );

  const bodyLines: string[] = [];
  bodyLines.push(`_Auto-generated draft. Rewrite this in your own voice before publishing._`);
  bodyLines.push('');
  for (const c of commits) {
    bodyLines.push(`- **${c.subject}** (\`${c.hash.slice(0, 7)}\`)`);
    if (c.body) {
      const bodyText = c.body
        .split('\n')
        .filter((l) => l.trim() && !l.startsWith('Co-Authored-By'))
        .join(' ')
        .trim();
      if (bodyText) bodyLines.push(`  - ${bodyText.slice(0, 500)}${bodyText.length > 500 ? '…' : ''}`);
    }
  }

  const summary =
    commits.length === 1
      ? commits[0].subject
      : `${commits.length} commits landed on ${day}. Needs a voice pass.`;

  const frontmatter = [
    '---',
    `date: ${day}`,
    `title: "${title.replace(/"/g, '\\"')}"`,
    `summary: "${summary.replace(/"/g, '\\"')}"`,
    `categories: [${categories.join(', ')}]`,
    `published: false`,
    '---',
    '',
  ].join('\n');

  return { filename, content: frontmatter + bodyLines.join('\n') + '\n' };
}

function main() {
  const since = getArg('--since', DEFAULT_SINCE);
  const commits = gitLog(since);
  if (!commits.length) {
    console.log(`No commits in the last "${since}".`);
    return;
  }

  const byDay = groupByDay(commits);
  let written = 0;
  let skipped = 0;

  if (!DRY_RUN && !fs.existsSync(CHANGELOG_DIR)) {
    fs.mkdirSync(CHANGELOG_DIR, { recursive: true });
  }

  for (const [day, dayCommits] of byDay) {
    const draft = renderDraft(day, dayCommits);
    const out = path.join(CHANGELOG_DIR, draft.filename);

    if (!DRY_RUN && fs.existsSync(out)) {
      skipped++;
      continue;
    }

    if (DRY_RUN) {
      console.log(`--- ${draft.filename} ---`);
      console.log(draft.content);
    } else {
      fs.writeFileSync(out, draft.content);
      written++;
    }
  }

  console.log(
    `\n${DRY_RUN ? 'Would write' : 'Wrote'} ${written} draft(s) to content/changelog/ (skipped ${skipped} existing).`,
  );
  console.log(`Next: review each draft, rewrite in your voice, flip \`published: true\`.`);
}

main();
