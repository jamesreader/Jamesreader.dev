'use client';

import { motion } from 'framer-motion';
import { useAgent } from '@/context/AgentProvider';

const engagementModels = [
  {
    title: 'Build Sprint',
    duration: '2-4 weeks',
    description: 'Focused engagement for a specific deliverable. AI tool, data pipeline, prototype — scoped, built, and delivered.',
    bestFor: 'You know what you need built',
  },
  {
    title: 'Technical Advisory',
    duration: 'Ongoing',
    description: 'Architecture reviews, AI strategy, technology selection. Think fractional CTO for AI decisions.',
    bestFor: 'You\'re evaluating AI for your organization',
  },
  {
    title: 'Full Product Build',
    duration: '1-3 months',
    description: 'End-to-end product development from concept to production. Design, build, deploy, and support.',
    bestFor: 'You have an idea that needs to become a product',
  },
];

export default function ConsultingCTA() {
  const { toggleOpen } = useAgent();

  return (
    <section id="contact" className="py-20 md:py-28 scroll-mt-20">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          <p className="font-sans text-xs font-semibold uppercase tracking-widest text-turquoise mb-2">
            Work With Me
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-charcoal dark:text-cream mb-4">
            Let&apos;s build something real
          </h2>
          <p className="font-sans text-lg text-charcoal/60 dark:text-dark-muted max-w-2xl">
            I take on a small number of consulting engagements at a time. If you have a problem that AI can solve,
            let&apos;s talk about it.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {engagementModels.map((model, i) => (
            <motion.div
              key={model.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="p-6 rounded-xl bg-white/70 dark:bg-dark-surface/70 border border-stone-dark/15 dark:border-dark-border/25"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-lg font-bold text-charcoal dark:text-cream">
                  {model.title}
                </h3>
                <span className="text-xs font-sans px-2 py-0.5 bg-turquoise/10 text-turquoise rounded-full">
                  {model.duration}
                </span>
              </div>
              <p className="font-sans text-sm text-charcoal/60 dark:text-dark-muted leading-relaxed mb-4">
                {model.description}
              </p>
              <p className="font-sans text-xs text-charcoal/40 dark:text-dark-muted/60">
                <span className="font-medium">Best for:</span> {model.bestFor}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <a
            href="mailto:james@swds.biz"
            className="inline-flex items-center px-6 py-3 bg-charcoal dark:bg-cream text-cream dark:text-charcoal font-sans text-sm font-medium rounded hover:bg-charcoal/90 dark:hover:bg-cream/90 transition-colors"
          >
            Email james@swds.biz
          </a>
          <button
            onClick={toggleOpen}
            className="inline-flex items-center px-6 py-3 border border-turquoise text-turquoise font-sans text-sm font-medium rounded hover:bg-turquoise/10 transition-colors"
          >
            Ask Reader about my work
          </button>
        </motion.div>
      </div>
    </section>
  );
}
