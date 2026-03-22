import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts } from '@/lib/blog-posts';

export const metadata: Metadata = {
  title: 'Blog — James Reader',
  description: 'Writing about AI, infrastructure, building products, and the intersection of technology and practical problem-solving.',
};

export default function BlogPage() {
  const posts = getAllPosts();

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
              <Link href={`/blog/${post.slug}`} className="block group">
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-sans text-xs font-semibold uppercase tracking-widest text-turquoise">
                    {post.category}
                  </span>
                  <span className="text-charcoal/20 dark:text-dark-muted/30">/</span>
                  <span className="font-sans text-xs text-charcoal/40 dark:text-dark-muted">
                    {post.date}
                  </span>
                  <span className="text-charcoal/20 dark:text-dark-muted/30">/</span>
                  <span className="font-sans text-xs text-charcoal/40 dark:text-dark-muted">
                    {post.readTime}
                  </span>
                </div>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-charcoal dark:text-cream mb-3
                  group-hover:text-turquoise transition-colors duration-200">
                  {post.title}
                </h2>
                <p className="font-sans text-charcoal/60 dark:text-dark-muted leading-relaxed">
                  {post.excerpt}
                </p>
                <span className="inline-block mt-4 font-sans text-sm text-turquoise group-hover:underline">
                  Read more →
                </span>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}