'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAgent } from '@/context/AgentProvider';
import IntentSelector from '@/components/agent/IntentSelector';
import StageView from '@/components/stage/StageView';
import NeuralConstellation from '@/components/NeuralConstellation';

// ── Default page (no intent yet — the empty stage) ────

function DefaultPage() {
  return (
    <section className="min-h-[85vh] flex items-center relative overflow-hidden">
      {/* Subtle ambient gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-cream via-cream to-turquoise/3 
        dark:from-dark-bg dark:via-dark-bg dark:to-turquoise/5 -z-10" />
      
      {/* Neural constellation background */}
      <div className="absolute inset-0 -z-[5] opacity-[0.12] blur-[1.5px] dark:opacity-[0.25] dark:blur-[1px]">
        <NeuralConstellation
          className="absolute inset-0 w-full h-full"
          nodeCount={55}
          connectionDistance={160}
        />
      </div>
      
      <div className="max-w-5xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <p className="font-sans text-sm font-medium tracking-widest uppercase text-turquoise mb-6">
            Builder / IT Leader / AI Engineer
          </p>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
          className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] text-charcoal dark:text-cream max-w-4xl"
        >
          I build systems that think, infrastructure that scales, and tools that solve real problems.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: 'easeOut' }}
          className="mt-8 text-lg md:text-xl text-charcoal/70 dark:text-dark-muted max-w-2xl leading-relaxed font-sans"
        >
          Twenty years in IT taught me what breaks. Now I build what lasts.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
          className="mt-10 flex flex-wrap gap-4"
        >
          <Link href="/work" className="inline-flex items-center px-6 py-3 bg-charcoal dark:bg-cream text-cream dark:text-charcoal font-sans text-sm font-medium rounded hover:bg-charcoal/90 dark:hover:bg-cream/90 transition-colors">
            See my work
          </Link>
          <Link href="/about" className="inline-flex items-center px-6 py-3 border border-charcoal/20 dark:border-dark-border text-charcoal dark:text-cream font-sans text-sm font-medium rounded hover:border-turquoise hover:text-turquoise transition-colors">
            About me
          </Link>
        </motion.div>
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
            exit={{ opacity: 0, scale: 0.97, filter: 'blur(8px)' }}
            transition={{ duration: 0.5 }}
          >
            <DefaultPage />
          </motion.div>
        ) : (
          <motion.div
            key="stage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <StageView />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}