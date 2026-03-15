import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Writing about AI, infrastructure, building products, and the intersection of technology and practical problem-solving.',
};

// Placeholder posts until Tina CMS content is created
const posts = [
  {
    slug: 'running-llms-on-dgx-spark',
    title: 'Running Production LLMs on a DGX Spark',
    excerpt: 'What it actually takes to run large language models locally. Hardware choices, memory architecture, inference optimization, and why 128GB of unified memory changes the game.',
    category: 'Infrastructure',
    date: 'Coming Soon',
  },
  {
    slug: 'ynab-alternative-why-i-built-meridian',
    title: 'Why I Built a YNAB Alternative',
    excerpt: 'Envelope budgeting is a solved problem. So why did I spend months building a new app? Because the existing solutions either cost too much or do too little.',
    category: 'Product',
    date: 'Coming Soon',
  },
  {
    slug: 'rag-pipelines-that-actually-work',
    title: 'RAG Pipelines That Actually Work',
    excerpt: 'Everyone is building RAG. Most of it is bad. Here is what I learned building a retrieval pipeline that handles real-world government data.',
    category: 'AI',
    date: 'Coming Soon',
  },
];

export default function BlogPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="mb-16">
          <p className="font-sans text-xs font-semibold uppercase tracking-widest text-turquoise mb-3">
            Blog
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-charcoal dark:text-cream mb-6">
            Writing
          </h1>
          <p className="font-sans text-lg text-charcoal/70 dark:text-dark-muted leading-relaxed">
            Thoughts on building with AI, running infrastructure, and the messy reality of making things work.
          </p>
        </div>

        {/* Posts */}
        <div className="space-y-12">
          {posts.map((post, i) => (
            <article key={post.slug}>
              {i > 0 && (
                <div className="mb-12 border-t border-stone-dark/10 dark:border-dark-border/10" />
              )}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-sans text-xs font-semibold uppercase tracking-widest text-turquoise">
                    {post.category}
                  </span>
                  <span className="text-charcoal/20 dark:text-dark-muted/30">/</span>
                  <span className="font-sans text-xs text-charcoal/40 dark:text-dark-muted">
                    {post.date}
                  </span>
                </div>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-charcoal dark:text-cream mb-3">
                  {post.title}
                </h2>
                <p className="font-sans text-charcoal/60 dark:text-dark-muted leading-relaxed">
                  {post.excerpt}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* CMS note */}
        <div className="mt-16 pt-10 border-t border-stone-dark/20 dark:border-dark-border/20">
          <p className="font-sans text-sm text-charcoal/40 dark:text-dark-muted text-center">
            Content managed with Tina CMS. New posts coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
