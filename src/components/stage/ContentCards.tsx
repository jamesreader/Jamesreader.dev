'use client';

import { motion } from 'framer-motion';
import type { Intent } from '@/context/AgentProvider';

// ── Types ──────────────────────────────────────────────

export type ContentBlockType = 
  | 'project' 
  | 'infrastructure' 
  | 'stat' 
  | 'philosophy' 
  | 'story' 
  | 'cta';

export interface ContentBlock {
  type: ContentBlockType;
  id: string;
  data: Record<string, unknown>;
}

// ── Animation variants ─────────────────────────────────

const cardEnter = {
  hidden: { opacity: 0, y: 30, scale: 0.96, filter: 'blur(6px)' },
  visible: { 
    opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }
  },
  exit: { 
    opacity: 0, y: -20, scale: 0.97, filter: 'blur(4px)',
    transition: { duration: 0.3 }
  },
};

// ── Project Card ───────────────────────────────────────

interface ProjectData {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  description: string;
  details: string[];
  status: string;
  link?: string;
  linkLabel?: string;
}

const PROJECTS: Record<string, ProjectData> = {
  'meridian-money': {
    id: 'meridian-money',
    title: 'Meridian Money',
    subtitle: 'Personal finance, reimagined',
    category: 'Fintech Product',
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
  },
  'smis': {
    id: 'smis',
    title: 'SMIS AI Tool',
    subtitle: 'Bid intelligence for forestry and construction',
    category: 'Enterprise AI',
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
  },
  'local-ai': {
    id: 'local-ai',
    title: 'Local AI Infrastructure',
    subtitle: 'Production LLMs, zero cloud dependency',
    category: 'Infrastructure',
    description: 'Running production models on an NVIDIA DGX Spark with 128GB unified memory. vLLM for inference, custom orchestration, and performance that makes cloud APIs look expensive.',
    details: [
      'NVIDIA DGX Spark — Grace CPU, 128GB unified memory',
      'vLLM inference with continuous batching + PagedAttention',
      'PostgreSQL + pgvector for RAG retrieval',
      'k3s cluster for container orchestration',
      'This conversation is running on this exact stack',
    ],
    status: 'Running',
  },
  'edgewood-ai': {
    id: 'edgewood-ai',
    title: 'Edgewood Municipal AI',
    subtitle: 'Modernizing government from the inside',
    category: 'Government AI',
    description: 'Bringing AI capabilities to a growing New Mexico municipality — document management, multimodal RAG for policy search, and AI-assisted workflows that save staff hundreds of hours.',
    details: [
      'Multimodal document understanding (text, tables, scanned docs)',
      'Elasticsearch-powered search across 160K+ files',
      'Retention schedule automation',
      'Built for air-gapped deployment — no data leaves the building',
    ],
    status: 'In Development',
  },
};

export function ProjectCard({ projectId, expanded = false, onToggle }: { 
  projectId: string; 
  expanded?: boolean;
  onToggle?: () => void;
}) {
  const project = PROJECTS[projectId];
  if (!project) return null;

  return (
    <motion.div
      variants={cardEnter}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      className="w-full max-w-2xl mx-auto"
    >
      <div className={`
        bg-cream/5 dark:bg-dark-surface/50 backdrop-blur-sm
        border border-charcoal/10 dark:border-dark-border/30 
        rounded-2xl overflow-hidden transition-all duration-500
        ${expanded ? 'shadow-2xl shadow-turquoise/5' : 'shadow-lg'}
      `}>
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="font-sans text-xs font-semibold uppercase tracking-widest text-turquoise">
              {project.category}
            </span>
            <span className="text-xs font-sans px-2.5 py-0.5 bg-turquoise/10 text-turquoise rounded-full">
              {project.status}
            </span>
          </div>
          <h3 className="font-serif text-2xl font-bold text-charcoal dark:text-cream mb-1">
            {project.title}
          </h3>
          <p className="font-serif text-sm italic text-charcoal/50 dark:text-dark-muted">
            {project.subtitle}
          </p>
        </div>

        {/* Description */}
        <div className="px-6 pb-4">
          <p className="font-sans text-sm text-charcoal/70 dark:text-dark-muted leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Expandable details */}
        <motion.div
          initial={false}
          animate={{ height: expanded ? 'auto' : 0, opacity: expanded ? 1 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className="px-6 pb-4">
            <div className="pt-3 border-t border-charcoal/10 dark:border-dark-border/20">
              <ul className="space-y-2.5 mt-3">
                {project.details.map((detail) => (
                  <li key={detail} className="flex items-start gap-2.5">
                    <span className="mt-1.5 w-1.5 h-1.5 bg-turquoise rounded-full flex-shrink-0" />
                    <span className="font-sans text-sm text-charcoal/60 dark:text-dark-muted">
                      {detail}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Footer actions */}
        <div className="px-6 pb-5 flex items-center gap-4">
          {onToggle && (
            <button
              onClick={onToggle}
              className="font-sans text-xs text-turquoise hover:text-turquoise-dim transition-colors"
            >
              {expanded ? '← Less' : 'Details →'}
            </button>
          )}
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-xs text-charcoal/40 dark:text-dark-muted hover:text-turquoise transition-colors"
            >
              {project.linkLabel || 'Visit'} ↗
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Stat Card ──────────────────────────────────────────

export function StatCard({ value, label, context }: { 
  value: string; 
  label: string; 
  context?: string;
}) {
  return (
    <motion.div
      variants={cardEnter}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-cream/5 dark:bg-dark-surface/50 backdrop-blur-sm
        border border-charcoal/10 dark:border-dark-border/30 
        rounded-2xl p-6 text-center">
        <p className="font-serif text-4xl font-bold text-turquoise mb-1">
          {value}
        </p>
        <p className="font-sans text-sm font-medium text-charcoal dark:text-cream">
          {label}
        </p>
        {context && (
          <p className="font-sans text-xs text-charcoal/50 dark:text-dark-muted mt-2">
            {context}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ── Infrastructure Card ────────────────────────────────

export function InfraCard() {
  const components = [
    { name: 'DGX Spark', role: 'Inference', detail: '128GB unified memory' },
    { name: 'vLLM', role: 'Serving', detail: 'Continuous batching' },
    { name: 'pgvector', role: 'RAG', detail: 'Semantic retrieval' },
    { name: 'k3s', role: 'Orchestration', detail: 'Container management' },
    { name: 'Redis', role: 'Sessions', detail: 'Conversation state' },
  ];

  return (
    <motion.div
      variants={cardEnter}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-2xl mx-auto"
    >
      <div className="bg-cream/5 dark:bg-dark-surface/50 backdrop-blur-sm
        border border-charcoal/10 dark:border-dark-border/30 rounded-2xl p-6">
        <p className="font-sans text-xs font-semibold uppercase tracking-widest text-turquoise mb-4">
          Live Infrastructure
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {components.map((comp) => (
            <div key={comp.name} className="flex items-center gap-3 p-3 rounded-lg
              bg-charcoal/5 dark:bg-dark-border/10">
              <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
              <div>
                <p className="font-sans text-sm font-medium text-charcoal dark:text-cream">
                  {comp.name}
                </p>
                <p className="font-sans text-xs text-charcoal/50 dark:text-dark-muted">
                  {comp.role} — {comp.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 font-sans text-xs text-charcoal/40 dark:text-dark-muted text-center italic">
          This conversation is running on this stack right now.
        </p>
      </div>
    </motion.div>
  );
}

// ── Philosophy Card ────────────────────────────────────

export function PhilosophyCard({ quote, attribution }: { quote: string; attribution?: string }) {
  return (
    <motion.div
      variants={cardEnter}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-xl mx-auto"
    >
      <div className="relative bg-cream/5 dark:bg-dark-surface/50 backdrop-blur-sm
        border border-charcoal/10 dark:border-dark-border/30 rounded-2xl p-8">
        <div className="absolute top-4 left-6 text-4xl text-turquoise/20 font-serif">"</div>
        <blockquote className="font-serif text-lg text-charcoal dark:text-cream leading-relaxed pl-4">
          {quote}
        </blockquote>
        {attribution && (
          <p className="mt-4 font-sans text-xs text-charcoal/40 dark:text-dark-muted pl-4">
            — {attribution}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ── CTA Card ───────────────────────────────────────────

export function CTACard({ headline, subtext, buttonText, email }: {
  headline: string;
  subtext: string;
  buttonText: string;
  email: string;
}) {
  return (
    <motion.div
      variants={cardEnter}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-xl mx-auto"
    >
      <div className="bg-gradient-to-br from-turquoise/10 to-turquoise/5
        border border-turquoise/20 rounded-2xl p-8 text-center">
        <h3 className="font-serif text-2xl font-bold text-charcoal dark:text-cream mb-2">
          {headline}
        </h3>
        <p className="font-sans text-sm text-charcoal/60 dark:text-dark-muted mb-6">
          {subtext}
        </p>
        <a
          href={`mailto:${email}`}
          className="inline-flex items-center px-6 py-3 bg-turquoise text-white 
            font-sans text-sm font-medium rounded-lg hover:bg-turquoise-dim 
            transition-colors shadow-md shadow-turquoise/20"
        >
          {buttonText}
        </a>
      </div>
    </motion.div>
  );
}
