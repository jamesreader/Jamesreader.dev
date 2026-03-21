'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAgent } from '@/context/AgentProvider';
import IntentSelector from '@/components/agent/IntentSelector';
import GuidedExperience from '@/components/agent/GuidedExperience';

// ── Default page (before intent selected or dismissed) ─

function DefaultPage() {
  return (
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
  );
}

// ── Main page ──────────────────────────────────────────

export default function Home() {
  const { intent } = useAgent();

  return (
    <>
      <IntentSelector />

      <AnimatePresence mode="wait">
        {!intent ? (
          <motion.div
            key="default"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <DefaultPage />
          </motion.div>
        ) : (
          <motion.div
            key={`guided-${intent}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <GuidedExperience intent={intent} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
