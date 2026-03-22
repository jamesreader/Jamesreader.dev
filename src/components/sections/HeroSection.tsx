'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { Intent } from '@/context/AgentProvider';

const heroContent: Record<Intent, {
  label: string;
  headline: string;
  subtext: string;
  cta: { text: string; href: string };
  secondaryCta?: { text: string; href: string };
}> = {
  consulting: {
    label: 'Consulting & Build Services',
    headline: 'I turn complex AI ideas into production systems.',
    subtext: 'From RAG pipelines to full-stack applications, I build AI tools that solve real business problems. Government-tested, production-proven, and designed to last.',
    cta: { text: 'See what I build', href: '#projects' },
    secondaryCta: { text: 'Get in touch', href: '#contact' },
  },
  technical: {
    label: 'Architecture & Infrastructure',
    headline: 'Self-hosted LLMs, local inference, zero cloud dependency.',
    subtext: 'Running Qwen3.5-122B on an NVIDIA DGX Spark. vLLM for serving, pgvector for RAG, k3s for orchestration. This site is powered by the same infrastructure.',
    cta: { text: 'Explore the stack', href: '#infrastructure' },
    secondaryCta: { text: 'View projects', href: '#projects' },
  },
  personal: {
    label: 'The Story',
    headline: 'Twenty years in IT taught me what breaks. Now I build what lasts.',
    subtext: 'From crawling under desks to running production LLMs, from teaching CS to directing municipal IT — every role taught me something about what technology owes the people who depend on it.',
    cta: { text: 'Read my story', href: '#story' },
    secondaryCta: { text: 'See my work', href: '#projects' },
  },
  exploring: {
    label: 'Builder / IT Leader / AI Engineer',
    headline: 'I build systems that think, infrastructure that scales, and tools that solve real problems.',
    subtext: 'Twenty years in IT taught me what breaks. Now I build what lasts. From government infrastructure to AI-powered products, I solve problems that matter.',
    cta: { text: 'See my work', href: '#projects' },
    secondaryCta: { text: 'About me', href: '#story' },
  },
  evaluating: {
    label: 'Job Fit Evaluator',
    headline: 'Is James the right fit? Let\u2019s find out — honestly.',
    subtext: 'Paste a job description and Reader will give you a straight assessment. Strong matches, partial fits, and real gaps — no sales pitch.',
    cta: { text: 'Start evaluation', href: '#evaluate' },
  },
};

export default function HeroSection({ intent }: { intent: Intent }) {
  const content = heroContent[intent];

  return (
    <section className="ambient-gradient min-h-[70vh] flex items-center">
      <div className="max-w-5xl mx-auto px-6 py-20">
        <motion.div
          key={intent}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' as const }}
        >
          <p className="font-sans text-sm font-medium tracking-widest uppercase text-turquoise mb-6">
            {content.label}
          </p>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] text-charcoal dark:text-cream max-w-4xl">
            {content.headline}
          </h1>

          <p className="mt-8 text-lg md:text-xl text-charcoal/70 dark:text-dark-muted max-w-2xl leading-relaxed font-sans">
            {content.subtext}
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href={content.cta.href}
              className="inline-flex items-center px-6 py-3 bg-charcoal dark:bg-cream text-cream dark:text-charcoal font-sans text-sm font-medium rounded hover:bg-charcoal/90 dark:hover:bg-cream/90 transition-colors"
            >
              {content.cta.text}
            </Link>
            {content.secondaryCta && (
              <Link
                href={content.secondaryCta.href}
                className="inline-flex items-center px-6 py-3 border border-charcoal/20 dark:border-dark-border text-charcoal dark:text-cream font-sans text-sm font-medium rounded hover:border-turquoise hover:text-turquoise transition-colors"
              >
                {content.secondaryCta.text}
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
