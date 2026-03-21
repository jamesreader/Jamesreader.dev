import Link from 'next/link';
import IntentSelector from '@/components/agent/IntentSelector';

const featuredProjects = [
  {
    title: 'Meridian Money',
    category: 'Fintech',
    description: 'A personal finance app that makes envelope budgeting intuitive. Built for people who want control over their money without the complexity.',
    href: '/work#meridian-money',
    tags: ['Next.js', 'React', 'Stripe', 'AI'],
  },
  {
    title: 'SMIS AI Tool',
    category: 'Enterprise AI',
    description: 'Bid intelligence platform for forestry and construction. Turns thousands of federal contract listings into actionable opportunities.',
    href: '/work#smis',
    tags: ['Python', 'LLMs', 'RAG', 'SAM.gov'],
  },
  {
    title: 'Local AI Infrastructure',
    category: 'Infrastructure',
    description: 'Running production LLMs on an NVIDIA DGX Spark with 128GB unified memory. vLLM, custom pipelines, zero cloud dependency.',
    href: '/work#local-ai',
    tags: ['NVIDIA DGX', 'vLLM', 'Docker', 'k3s'],
  },
];

export default function Home() {
  return (
    <>
      {/* Agent Intent Selector — first-time visitors */}
      <IntentSelector />

      {/* Hero */}
      <section className="ambient-gradient min-h-[85vh] flex items-center">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="animate-fade-in-up">
            <p className="font-sans text-sm font-medium tracking-widest uppercase text-turquoise mb-6">
              Builder / IT Leader / AI Engineer
            </p>
          </div>

          <h1 className="animate-fade-in-up delay-100 font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] text-charcoal dark:text-cream max-w-4xl">
            I build systems that think, infrastructure that scales, and tools that solve real problems.
          </h1>

          <p className="animate-fade-in-up delay-200 mt-8 text-lg md:text-xl text-charcoal/70 dark:text-dark-muted max-w-2xl leading-relaxed font-sans">
            Twenty years in IT taught me what breaks. Now I build what lasts. From government infrastructure to AI-powered products, I solve problems that matter.
          </p>

          <div className="animate-fade-in-up delay-300 mt-10 flex flex-wrap gap-4">
            <Link
              href="/work"
              className="inline-flex items-center px-6 py-3 bg-charcoal dark:bg-cream text-cream dark:text-charcoal font-sans text-sm font-medium rounded hover:bg-charcoal/90 dark:hover:bg-cream/90 transition-colors"
            >
              See my work
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center px-6 py-3 border border-charcoal/20 dark:border-dark-border text-charcoal dark:text-cream font-sans text-sm font-medium rounded hover:border-turquoise hover:text-turquoise transition-colors"
            >
              About me
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Work */}
      <section className="bg-cream-dark/50 dark:bg-dark-surface/50 py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="font-sans text-xs font-semibold uppercase tracking-widest text-turquoise mb-2">
                Selected Work
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-charcoal dark:text-cream">
                Things I&apos;ve built
              </h2>
            </div>
            <Link href="/work" className="hidden sm:inline-flex text-sm text-charcoal/60 dark:text-dark-muted hover:text-turquoise transition-colors">
              View all &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProjects.map((project) => (
              <Link
                key={project.title}
                href={project.href}
                className="group bg-white dark:bg-dark-surface border border-stone-dark/20 dark:border-dark-border/30 rounded-lg p-6 hover:border-turquoise/40 transition-all duration-300 hover:shadow-lg hover:shadow-turquoise/5"
              >
                <p className="font-sans text-xs font-semibold uppercase tracking-widest text-turquoise mb-3">
                  {project.category}
                </p>
                <h3 className="font-serif text-xl font-bold text-charcoal dark:text-cream mb-3 group-hover:text-turquoise transition-colors">
                  {project.title}
                </h3>
                <p className="font-sans text-sm text-charcoal/60 dark:text-dark-muted leading-relaxed mb-4">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span key={tag} className="text-xs font-sans px-2 py-1 bg-stone/50 dark:bg-dark-border/30 text-charcoal/60 dark:text-dark-muted rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest from the blog (placeholder) */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="font-sans text-xs font-semibold uppercase tracking-widest text-turquoise mb-2">
                Writing
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-charcoal dark:text-cream">
                From the blog
              </h2>
            </div>
            <Link href="/blog" className="hidden sm:inline-flex text-sm text-charcoal/60 dark:text-dark-muted hover:text-turquoise transition-colors">
              All posts &rarr;
            </Link>
          </div>

          <div className="border border-stone-dark/20 dark:border-dark-border/30 rounded-lg p-8 md:p-12 bg-white dark:bg-dark-surface">
            <p className="font-sans text-xs font-semibold uppercase tracking-widest text-turquoise mb-3">
              Coming Soon
            </p>
            <h3 className="font-serif text-2xl md:text-3xl font-bold text-charcoal dark:text-cream mb-4">
              Running Production LLMs on a DGX Spark
            </h3>
            <p className="font-sans text-charcoal/60 dark:text-dark-muted leading-relaxed max-w-2xl">
              What it actually takes to run large language models locally. Hardware choices, memory architecture, 
              inference optimization, and why 128GB of unified memory changes the game.
            </p>
            <p className="mt-6 text-sm text-charcoal/40 dark:text-dark-muted">
              First post coming soon. Stay tuned.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
