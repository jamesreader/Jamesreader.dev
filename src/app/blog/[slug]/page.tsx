import type { Metadata } from 'next';
import Link from 'next/link';
import { getPostBySlug, getAllPosts } from '@/lib/blog-posts';
import { notFound } from 'next/navigation';

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

// Simple markdown-ish renderer — handles ## headers, paragraphs, 
// backtick code, bold, and list items
function renderContent(content: string) {
  const blocks = content.split('\n\n');
  
  return blocks.map((block, i) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    // ## Header
    if (trimmed.startsWith('## ')) {
      return (
        <h2 key={i} className="font-serif text-2xl font-bold text-charcoal dark:text-cream mt-12 mb-4">
          {trimmed.slice(3)}
        </h2>
      );
    }

    // ### Header
    if (trimmed.startsWith('### ')) {
      return (
        <h3 key={i} className="font-serif text-xl font-bold text-charcoal dark:text-cream mt-8 mb-3">
          {trimmed.slice(4)}
        </h3>
      );
    }

    // List items (lines starting with - or number.)
    const lines = trimmed.split('\n');
    const isListBlock = lines.every(l => /^(\d+\.\s|\-\s|\*\*[^*]+\*\*)/.test(l.trim()));
    if (isListBlock) {
      return (
        <ul key={i} className="space-y-2 my-4">
          {lines.map((line, j) => {
            const text = line.replace(/^(\d+\.\s|\-\s)/, '').trim();
            return (
              <li key={j} className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 bg-turquoise rounded-full flex-shrink-0" />
                <span className="font-sans text-charcoal/70 dark:text-dark-muted leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: text
                      .replace(/`([^`]+)`/g, '<code class="text-sm bg-stone/30 dark:bg-dark-border/30 px-1.5 py-0.5 rounded font-mono">$1</code>')
                      .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-charcoal dark:text-cream font-semibold">$1</strong>')
                  }} 
                />
              </li>
            );
          })}
        </ul>
      );
    }

    // Regular paragraph with inline formatting
    return (
      <p key={i} className="font-sans text-charcoal/70 dark:text-dark-muted leading-relaxed my-4"
        dangerouslySetInnerHTML={{
          __html: trimmed
            .replace(/`([^`]+)`/g, '<code class="text-sm bg-stone/30 dark:bg-dark-border/30 px-1.5 py-0.5 rounded font-mono">$1</code>')
            .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-charcoal dark:text-cream font-semibold">$1</strong>')
        }}
      />
    );
  });
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  return (
    <div className="py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-6">
        <Link href="/blog" className="font-sans text-sm text-turquoise hover:underline mb-8 inline-block">
          ← Back to blog
        </Link>

        <article>
          {/* Header */}
          <header className="mb-12">
            <div className="flex items-center gap-3 mb-4">
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
            {renderContent(post.content)}
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