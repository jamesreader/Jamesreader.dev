import type { Metadata } from 'next';
import type { WorldName } from '@/components/world';
import Link from 'next/link';
import { getPostBySlug, getAllPosts } from '@/lib/blog-posts';
import { notFound } from 'next/navigation';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  if (!post) return { title: 'Post Not Found' };
  return {
    title: `${post.title} — James Reader`,
    description: post.excerpt,
  };
}

const markdownComponents: Components = {
  h2: ({ children }) => (
    <h2 className="font-serif text-2xl font-bold text-charcoal dark:text-cream mt-12 mb-4">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-serif text-xl font-bold text-charcoal dark:text-cream mt-8 mb-3">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="font-sans text-charcoal/70 dark:text-dark-muted leading-relaxed my-4">{children}</p>
  ),
  a: ({ href, children }) => (
    <a href={href} className="text-turquoise hover:underline">{children}</a>
  ),
  strong: ({ children }) => (
    <strong className="text-charcoal dark:text-cream font-semibold">{children}</strong>
  ),
  ul: ({ children }) => <ul className="space-y-2 my-4">{children}</ul>,
  ol: ({ children }) => (
    <ol className="list-decimal pl-6 space-y-2 my-4 font-sans text-charcoal/70 dark:text-dark-muted marker:text-turquoise">{children}</ol>
  ),
  // Bulleted lists get the turquoise dot; inside an <ol> the dot hides and the number shows.
  li: ({ children }) => (
    <li className="flex items-start gap-3 [ol_&]:list-item [ol_&]:pl-1">
      <span className="mt-2 w-1.5 h-1.5 bg-turquoise rounded-full flex-shrink-0 [ol_&]:hidden" />
      <span className="font-sans text-charcoal/70 dark:text-dark-muted leading-relaxed">{children}</span>
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-6 border-l-2 border-turquoise pl-4 [&_p]:my-2 italic">{children}</blockquote>
  ),
  code: ({ children, className }) =>
    className ? (
      <code className={`${className} block overflow-x-auto text-sm`}>{children}</code>
    ) : (
      <code className="text-sm bg-stone/30 dark:bg-dark-border/30 px-1.5 py-0.5 rounded font-mono">{children}</code>
    ),
  pre: ({ children }) => (
    <pre className="my-6 p-4 rounded bg-stone/30 dark:bg-dark-border/30 overflow-x-auto font-mono text-sm">{children}</pre>
  ),
};

// World-engine scene for each blog category (undefined → no data-world attribute).
const BLOG_CATEGORY_WORLD: Record<string, WorldName> = {
  Infrastructure: 'homelab',
  Government: 'mesa',
  Product: 'envelopes',
  AI: 'records',
  Career: 'strata',
  Tutorial: 'blueprint',
};

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  return (
    <div className="py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-6">
        <Link href="/blog" className="font-sans text-sm text-turquoise hover:underline mb-8 inline-block">
          ← Back to blog
        </Link>

        <article data-world={BLOG_CATEGORY_WORLD[post.category]}>
          {/* Header */}
          <header className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="font-sans text-xs font-semibold uppercase tracking-widest text-turquoise">
                {post.category}
              </span>
              <span className="text-charcoal/20 dark:text-dark-muted/30">/</span>
              <span className="font-sans text-xs text-charcoal/40 dark:text-dark-muted">
                {post.displayDate}
              </span>
              <span className="text-charcoal/20 dark:text-dark-muted/30">/</span>
              <span className="font-sans text-xs text-charcoal/40 dark:text-dark-muted">
                {post.readTime}
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-5xl font-bold text-charcoal dark:text-cream mb-4 leading-tight">
              {post.title}
            </h1>
            <p className="font-sans text-lg text-charcoal/50 dark:text-dark-muted italic">
              {post.excerpt}
            </p>
          </header>

          {/* Divider */}
          <div className="border-t border-stone-dark/15 dark:border-dark-border/20 mb-10" />

          {/* Content */}
          <div className="blog-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Footer */}
          <div className="mt-16 pt-10 border-t border-stone-dark/15 dark:border-dark-border/20">
            <div className="flex items-center justify-between">
              <Link href="/blog" className="font-sans text-sm text-turquoise hover:underline">
                ← All posts
              </Link>
              <p className="font-sans text-sm text-charcoal/40 dark:text-dark-muted">
                Written by James Reader
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}