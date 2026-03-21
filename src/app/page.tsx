'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAgent } from '@/context/AgentProvider';
import type { Intent } from '@/context/AgentProvider';
import IntentSelector from '@/components/agent/IntentSelector';
import HeroSection from '@/components/sections/HeroSection';
import ProjectShowcase from '@/components/sections/ProjectShowcase';
import InfrastructureSection from '@/components/sections/InfrastructureSection';
import StorySection from '@/components/sections/StorySection';
import PhilosophySection from '@/components/sections/PhilosophySection';
import ConsultingCTA from '@/components/sections/ConsultingCTA';
import GuideLayer from '@/components/sections/GuideLayer';

// ── Section ordering per intent ────────────────────────

type SectionId = 'hero' | 'projects' | 'infrastructure' | 'story' | 'philosophy' | 'consulting' | 'blog';

const sectionOrder: Record<Intent, SectionId[]> = {
  consulting: ['hero', 'projects', 'consulting', 'infrastructure', 'philosophy'],
  technical: ['hero', 'infrastructure', 'projects', 'philosophy', 'consulting'],
  personal: ['hero', 'story', 'philosophy', 'projects', 'consulting'],
  exploring: ['hero', 'projects', 'story', 'infrastructure', 'philosophy', 'consulting'],
};

// ── Section components map ─────────────────────────────

function SectionRenderer({ sectionId, intent }: { sectionId: SectionId; intent: Intent }) {
  switch (sectionId) {
    case 'hero':
      return <HeroSection intent={intent} />;
    case 'projects':
      return <ProjectShowcase intent={intent} />;
    case 'infrastructure':
      return <InfrastructureSection />;
    case 'story':
      return <StorySection />;
    case 'philosophy':
      return <PhilosophySection />;
    case 'consulting':
      return <ConsultingCTA />;
    case 'blog':
      return <BlogPreview />;
    default:
      return null;
  }
}

// ── Blog preview (kept from original) ──────────────────

function BlogPreview() {
  return (
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
            All posts →
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
  );
}

// ── Default (no intent) static page ────────────────────

function DefaultPage() {
  return (
    <>
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
    </>
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
            key={`intent-${intent}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {sectionOrder[intent].map((sectionId, index) => (
              <motion.div
                key={sectionId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.08,
                  ease: 'easeOut',
                }}
              >
                <SectionRenderer sectionId={sectionId} intent={intent} />
              </motion.div>
            ))}

            <GuideLayer intent={intent} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
