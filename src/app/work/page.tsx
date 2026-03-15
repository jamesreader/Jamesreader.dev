import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Work',
  description: 'Projects and products built by James Reader. From personal finance apps to AI-powered bid intelligence.',
};

const projects = [
  {
    id: 'meridian-money',
    category: 'Fintech Product',
    title: 'Meridian Money',
    subtitle: 'Personal finance, reimagined',
    description: `Most budgeting apps are either too simple to be useful or too complex to stick with. Meridian Money sits in the sweet spot: envelope budgeting that actually makes sense, powered by AI insights that help you see patterns in your spending before they become problems.`,
    details: [
      'Envelope budgeting system with AI-powered categorization',
      'Bank sync via Stripe Financial Connections',
      'Real-time spending insights and trend analysis',
      'Built with Next.js, React, and TypeScript',
      'Positioned as the YNAB alternative at $5/month vs $14.99',
    ],
    link: 'https://meridianmoney.app',
    linkLabel: 'Visit meridianmoney.app',
    status: 'Live',
  },
  {
    id: 'smis',
    category: 'Enterprise AI',
    title: 'SMIS AI Tool',
    subtitle: 'Bid intelligence for forestry and construction',
    description: `Federal contracting is a $700B market buried in bureaucratic noise. SMIS cuts through it. The platform monitors SAM.gov, analyzes contract opportunities using LLMs, and delivers qualified leads to forestry and construction companies who used to spend hours manually searching.`,
    details: [
      'Automated SAM.gov monitoring and opportunity scoring',
      'RAG pipeline for matching company capabilities to contracts',
      'LLM-powered bid analysis and competitive intelligence',
      'Custom relevance scoring for forestry/construction verticals',
      'Built with Python, FastAPI, and vector databases',
    ],
    link: null,
    linkLabel: null,
    status: 'Active Development',
  },
  {
    id: 'local-ai',
    category: 'Infrastructure',
    title: 'Local AI Infrastructure',
    subtitle: 'Production LLMs, zero cloud dependency',
    description: `Running large language models shouldn't require sending your data to someone else's servers. I built a local AI infrastructure stack on an NVIDIA DGX Spark with 128GB of unified memory. vLLM for inference, custom orchestration, and the kind of performance that makes cloud APIs look expensive and slow.`,
    details: [
      'NVIDIA DGX Spark with Grace CPU and 128GB unified memory',
      'vLLM inference server with multiple model support',
      'Open WebUI for team access and prompt management',
      'k3s cluster for orchestration and scaling',
      'Docker-based deployment pipeline',
      'Models: Qwen, DeepSeek, Devstral, and custom fine-tunes',
    ],
    link: null,
    linkLabel: null,
    status: 'Running',
  },
];

export default function WorkPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-16">
          <p className="font-sans text-xs font-semibold uppercase tracking-widest text-turquoise mb-3">
            Selected Work
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-charcoal dark:text-cream mb-6">
            Building things that matter
          </h1>
          <p className="font-sans text-lg text-charcoal/70 dark:text-dark-muted max-w-2xl leading-relaxed">
            I don&apos;t build demos. Everything here is either live, in production, or actively being used to solve real problems for real people.
          </p>
        </div>

        {/* Projects */}
        <div className="space-y-20">
          {projects.map((project, i) => (
            <article key={project.id} id={project.id} className="scroll-mt-24">
              {/* Divider (not on first) */}
              {i > 0 && (
                <div className="mb-12 border-t border-stone-dark/20 dark:border-dark-border/20" />
              )}

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <p className="font-sans text-xs font-semibold uppercase tracking-widest text-turquoise">
                    {project.category}
                  </p>
                  <span className="text-xs font-sans px-2 py-0.5 bg-stone/50 dark:bg-dark-border/30 text-charcoal/50 dark:text-dark-muted rounded-full">
                    {project.status}
                  </span>
                </div>

                <h2 className="font-serif text-3xl md:text-4xl font-bold text-charcoal dark:text-cream mb-2">
                  {project.title}
                </h2>
                <p className="font-serif text-lg italic text-charcoal/50 dark:text-dark-muted mb-6">
                  {project.subtitle}
                </p>

                <p className="font-sans text-charcoal/70 dark:text-dark-muted leading-relaxed mb-8 text-lg">
                  {project.description}
                </p>

                <ul className="space-y-3 mb-8">
                  {project.details.map((detail) => (
                    <li key={detail} className="flex items-start gap-3">
                      <span className="mt-2 w-1.5 h-1.5 bg-turquoise rounded-full flex-shrink-0" />
                      <span className="font-sans text-sm text-charcoal/60 dark:text-dark-muted">
                        {detail}
                      </span>
                    </li>
                  ))}
                </ul>

                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center font-sans text-sm text-turquoise hover:underline"
                  >
                    {project.linkLabel} &rarr;
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
