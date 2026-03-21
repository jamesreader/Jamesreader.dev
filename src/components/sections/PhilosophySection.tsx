'use client';

import { motion } from 'framer-motion';

const principles = [
  {
    title: 'Security first, always',
    description: 'Every variable untrusted. Every query parameterized. Every secret an environment variable. Every endpoint authenticated. Security isn\'t a feature — it\'s the foundation.',
    icon: '🔒',
  },
  {
    title: 'Own your infrastructure',
    description: 'When you run your own models on your own hardware, you control your costs, your data, and your destiny. Cloud APIs are someone else\'s computer — and someone else\'s pricing.',
    icon: '🏠',
  },
  {
    title: 'Done beats perfect',
    description: 'Ship it. A working tool that solves 80% of the problem today beats a perfect tool that ships never. Iterate in public, improve with feedback, and let users tell you what matters.',
    icon: '🚀',
  },
  {
    title: 'Build for the worst case',
    description: 'Twenty years of "what breaks at 2 AM" teaches you to design for failure. Graceful degradation, clear error states, and systems that tell you what\'s wrong before users notice.',
    icon: '🛡️',
  },
  {
    title: 'Respect the user\'s time',
    description: 'Nobody has time for clever solutions that take three clicks when one would do. Technology should disappear into the workflow, not demand attention.',
    icon: '⏱️',
  },
  {
    title: 'Show, don\'t tell',
    description: 'The best demo is the product itself. This site isn\'t a portfolio with a chatbot — it\'s a live demonstration of self-hosted AI, RAG pipelines, and real-time inference.',
    icon: '🎯',
  },
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

export default function PhilosophySection() {
  return (
    <section id="philosophy" className="py-20 md:py-28 bg-cream-dark/50 dark:bg-dark-surface/30 scroll-mt-20">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          <p className="font-sans text-xs font-semibold uppercase tracking-widest text-turquoise mb-2">
            Philosophy
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-charcoal dark:text-cream mb-4">
            How I think about building
          </h2>
          <p className="font-sans text-lg text-charcoal/60 dark:text-dark-muted max-w-2xl">
            Principles forged in production, not theory. Every one of these came from something breaking.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-30px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {principles.map((principle) => (
            <motion.div
              key={principle.title}
              variants={item}
              className="p-6 rounded-xl bg-white/70 dark:bg-dark-surface/70 border border-stone-dark/15 dark:border-dark-border/25"
            >
              <span className="text-2xl mb-3 block">{principle.icon}</span>
              <h3 className="font-serif text-lg font-bold text-charcoal dark:text-cream mb-2">
                {principle.title}
              </h3>
              <p className="font-sans text-sm text-charcoal/60 dark:text-dark-muted leading-relaxed">
                {principle.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
