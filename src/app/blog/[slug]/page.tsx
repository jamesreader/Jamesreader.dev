import type { Metadata } from 'next';
import Link from 'next/link';

// This is a placeholder page. Once Tina CMS is fully configured with
// tina cloud credentials, this will pull from the generated client.
// For now, it shows a simple "coming soon" state.

export const metadata: Metadata = {
  title: 'Blog Post',
};

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  return (
    <div className="py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-6">
        <Link href="/blog" className="font-sans text-sm text-turquoise hover:underline mb-8 inline-block">
          &larr; Back to blog
        </Link>

        <article className="prose">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-charcoal dark:text-cream mb-4">
            Post: {params.slug.replace(/-/g, ' ')}
          </h1>
          <p className="text-lg text-charcoal/60 dark:text-dark-muted">
            This post is coming soon. Content will be managed through Tina CMS.
          </p>
        </article>
      </div>
    </div>
  );
}
