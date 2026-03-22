'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAgent } from '@/context/AgentProvider';
import type { Intent } from '@/context/AgentProvider';
import IntentSelector from '@/components/agent/IntentSelector';
import FloatingGuide from '@/components/agent/FloatingGuide';
import HeroSection from '@/components/sections/HeroSection';
import ProjectShowcase from '@/components/sections/ProjectShowcase';
import InfrastructureSection from '@/components/sections/InfrastructureSection';
import StorySection from '@/components/sections/StorySection';
import PhilosophySection from '@/components/sections/PhilosophySection';
import ConsultingCTA from '@/components/sections/ConsultingCTA';

// ── Section ordering per intent ────────────────────────

const sectionOrder: Record<Intent, string[]> = {
  consulting:  ['hero', 'projects', 'infrastructure', 'consulting', 'philosophy'],
  technical:   ['hero', 'infrastructure', 'projects', 'philosophy', 'consulting'],
  personal:    ['hero', 'story', 'philosophy', 'projects', 'consulting'],
  exploring:   ['hero', 'projects', 'story', 'infrastructure', 'philosophy', 'consulting'],
};

function RenderSection({ id, intent }: { id: string; intent: Intent }) {
  switch (id) {
    case 'hero': return <HeroSection intent={intent} />;
    case 'projects': return <ProjectShowcase intent={intent} />;
    case 'infrastructure': return <InfrastructureSection />;
    case 'story': return <StorySection />;
    case 'philosophy': return <PhilosophySection />;
    case 'consulting': return <ConsultingCTA />;
    default: return null;
  }
}

// ── Section entrance animation ─────────────────────────

const sectionVariants = {
  hidden: { 
    opacity: 0, 
    y: 40,
    filter: 'blur(4px)',
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.6,
      delay: i * 0.12,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  }),
};

// ── Default page (no intent yet) ───────────────────────

function DefaultPage() {
  return (
    <section className="ambient-gradient min-h-[85vh] flex items-center">
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
            exit={{ opacity: 0, scale: 0.98, filter: 'blur(6px)' }}
            transition={{ duration: 0.4 }}
          >
            <DefaultPage />
          </motion.div>
        ) : (
          <motion.div
            key={`flow-${intent}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {sectionOrder[intent].map((sectionId, index) => (
              <motion.div
                key={sectionId}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
                variants={sectionVariants}
              >
                <RenderSection id={sectionId} intent={intent} />
              </motion.div>
            ))}

            <FloatingGuide />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}