import type { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getAllChangelogEntries, formatChangelogDate } from '@/lib/changelog';

export const metadata: Metadata = {
  title: 'Changelog — James Reader',
  description: 'What is shipping on jamesreader.dev and the infrastructure behind it.',
};

const CATEGORY_LABELS: Record<string, string> = {
  feat: 'Feature',
  fix: 'Fix',
  infra: 'Infrastructure',
  content: 'Content',
  meta: 'Meta',
};

export default function ChangelogPage() {
  const entries = getAllChangelogEntries();

  return (
    <div id="page-changelog" className="py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="mb-16">
          <p className="font-sans text-xs font-semibold uppercase tracking-widest text-turquoise mb-3">
            Changelog
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-charcoal dark:text-cream mb-6">
            Shipping Log
          </h1>
          <p className="font-sans text-lg text-charcoal/70 dark:text-dark-muted leading-relaxed">
            A record of what is actually shipping on this site and the infrastructure behind it.
            Published entries are written in my own voice; drafts are auto-generated from git
            history and curated before going live.
          </p>
        </div>

        {/* Entries */}
        {entries.length === 0 ? (
          <p className="font-sans text-charcoal/50 dark:text-dark-muted italic">
            Nothing published yet.
          </p>
        ) : (
          <div className="space-y-16">
            {entries.map((entry, i) => (
              <article key={entry.slug}>
                {i > 0 && (
                  <div className="mb-16 border-t border-stone-dark/10 dark:border-dark-border/10" />
                )}
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="font-sans text-xs text-charcoal/40 dark:text-dark-muted">
                    {formatChangelogDate(entry.date)}
                  </span>
                  {entry.categories.length > 0 && (
                    <>
                      <span className="text-charcoal/20 dark:text-dark-muted/30">/</span>
                      <div className="flex items-center gap-2">
                        {entry.categories.map((cat) => (
                          <span
                            key={cat}
                            className="font-sans text-xs font-semibold uppercase tracking-widest text-turquoise"
                          >
                            {CATEGORY_LABELS[cat] ?? cat}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-charcoal dark:text-cream mb-3">
                  {entry.title}
                </h2>
                {entry.summary && (
                  <p className="font-sans text-charcoal/70 dark:text-dark-muted leading-relaxed mb-4 italic">
                    {entry.summary}
                  </p>
                )}
                <div className="prose prose-stone dark:prose-invert font-sans text-charcoal/80 dark:text-dark-muted max-w-none leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{entry.body}</ReactMarkdown>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
