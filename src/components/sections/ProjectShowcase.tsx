'use client';

import { motion } from 'framer-motion';
import type { Intent } from '@/context/AgentProvider';

interface Project {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  description: string;
  details: string[];
  status: string;
  link?: string;
  linkLabel?: string;
  relevance: Record<Intent, number>; // 0-10 priority per intent
}

const allProjects: Project[] = [
  {
    id: 'meridian-money',
    category: 'Fintech Product',
    title: 'Meridian Money',
    subtitle: 'Personal finance, reimagined',
    description: 'Envelope budgeting that actually makes sense, powered by AI insights. The YNAB alternative at a third of the price.',
    details: [
      'Envelope budgeting with AI-powered categorization',
      'Bank sync via Stripe Financial Connections',
      'Real-time spending insights and trend analysis',
      'Built with Next.js, React, Prisma, PostgreSQL',
      '$5/month — positioned against YNAB at $14.99',
    ],
    status: 'Live',
    link: 'https://meridianmoney.app',
    linkLabel: 'Visit meridianmoney.app',
    relevance: { consulting: 9, technical: 6, personal: 5, exploring: 8, evaluating: 7 },
  },
  {
    id: 'smis',
    category: 'Enterprise AI',
    title: 'SMIS AI Tool',
    subtitle: 'Bid intelligence for forestry and construction',
    description: 'Federal contracting is a $700B market buried in bureaucratic noise. SMIS cuts through it — monitoring SAM.gov, scoring opportunities with LLMs, and delivering qualified leads.',
    details: [
      'Automated SAM.gov monitoring and opportunity scoring',
      'RAG pipeline matching company capabilities to contracts',
      'LLM-powered bid analysis and competitive intelligence',
      'Custom relevance scoring for forestry/construction',
      'Structured outputs + prompt caching for consistent results',
    ],
    status: 'Active',
    link: 'https://smis.personafi.app',
    linkLabel: 'View live app',
    relevance: { consulting: 10, technical: 8, personal: 4, exploring: 7, evaluating: 8 },
  },
  {
    id: 'local-ai',
    category: 'Infrastructure',
    title: 'Local AI Infrastructure',
    subtitle: 'Production LLMs, zero cloud dependency',
    description: 'Running Qwen3.5-122B on an NVIDIA DGX Spark with 128GB unified memory. vLLM for inference, custom orchestration, and performance that makes cloud APIs look expensive.',
    details: [
      'NVIDIA DGX Spark — Grace CPU, 128GB unified memory',
      'vLLM inference with continuous batching + PagedAttention',
      'PostgreSQL + pgvector for RAG retrieval',
      'k3s cluster for container orchestration',
      'This site\'s AI agent runs on this exact stack',
    ],
    status: 'Running',
    relevance: { consulting: 6, technical: 10, personal: 3, exploring: 7, evaluating: 6 },
  },
  {
    id: 'edgewood-ai',
    category: 'Government AI',
    title: 'Edgewood Municipal AI',
    subtitle: 'Modernizing government from the inside',
    description: 'Bringing AI capabilities to a growing New Mexico municipality — document management, multimodal RAG for policy search, and AI-assisted workflows that save staff hundreds of hours.',
    details: [
      'Multimodal document understanding (text, tables, scanned docs)',
      'Elasticsearch-powered document search across 160K+ files',
      'AI-assisted document classification and retention scheduling',
      'Privacy-first: all processing on local infrastructure',
    ],
    status: 'Active',
    relevance: { consulting: 8, technical: 7, personal: 6, exploring: 6, evaluating: 7 },
  },
];

function getProjectsForIntent(intent: Intent): Project[] {
  return [...allProjects].sort((a, b) => b.relevance[intent] - a.relevance[intent]);
}

const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export default function ProjectShowcase({ intent }: { intent: Intent }) {
  const projects = getProjectsForIntent(intent);

  const sectionTitle = intent === 'consulting'
    ? 'What I\'ve built for clients'
    : intent === 'technical'
    ? 'Production systems'
    : intent === 'personal'
    ? 'Things I\'ve built'
    : 'Selected work';

  return (
    <section id="projects" className="py-20 md:py-28 scroll-mt-20">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          <p className="font-sans text-xs font-semibold uppercase tracking-widest text-turquoise mb-2">
            Projects
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-charcoal dark:text-cream">
            {sectionTitle}
          </h2>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-30px' }}
          className="space-y-16"
        >
          {projects.map((project) => (
            <motion.article
              key={project.id}
              variants={item}
              className="group"
              data-project={project.id}
            >
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                {/* Left: meta */}
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-sans text-xs font-semibold uppercase tracking-widest text-turquoise">
                      {project.category}
                    </span>
                    <span className="text-xs font-sans px-2 py-0.5 bg-stone/50 dark:bg-dark-border/30 text-charcoal/50 dark:text-dark-muted rounded-full">
                      {project.status}
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl md:text-3xl font-bold text-charcoal dark:text-cream mb-2">
                    {project.title}
                  </h3>
                  <p className="font-serif text-base italic text-charcoal/50 dark:text-dark-muted mb-4">
                    {project.subtitle}
                  </p>
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center font-sans text-sm text-turquoise hover:underline"
                    >
                      {project.linkLabel} →
                    </a>
                  )}
                </div>

                {/* Right: details */}
                <div className="lg:col-span-3">
                  <p className="font-sans text-charcoal/70 dark:text-dark-muted leading-relaxed mb-6">
                    {project.description}
                  </p>
                  <ul className="space-y-2.5">
                    {project.details.map((detail) => (
                      <li key={detail} className="flex items-start gap-3">
                        <span className="mt-2 w-1.5 h-1.5 bg-turquoise rounded-full flex-shrink-0" />
                        <span className="font-sans text-sm text-charcoal/60 dark:text-dark-muted">
                          {detail}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Divider */}
              <div className="mt-12 border-b border-stone-dark/15 dark:border-dark-border/20" />
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
