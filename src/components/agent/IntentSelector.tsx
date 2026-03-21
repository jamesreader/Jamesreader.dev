'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgent, useConversation, type Intent } from '@/context/AgentProvider';

// ── Intent Card Data ───────────────────────────────────

const intents: Array<{
  id: Intent;
  icon: string;
  title: string;
  description: string;
}> = [
  {
    id: 'consulting',
    icon: '🏗️',
    title: 'I need something built',
    description: 'Explore consulting services, capabilities, and engagement models.',
  },
  {
    id: 'technical',
    icon: '🔍',
    title: 'Researching AI solutions',
    description: 'Deep-dive into architectures, technical decisions, and live infrastructure.',
  },
  {
    id: 'personal',
    icon: '👤',
    title: 'Learn about James',
    description: 'The journey from IT Director to AI engineer — philosophy, story, and approach.',
  },
  {
    id: 'exploring',
    icon: '🧭',
    title: 'Just exploring',
    description: 'Curiosity-driven discovery. Let me show you around.',
  },
];

// ── Component ──────────────────────────────────────────

export default function IntentSelector() {
  const { intent, setIntent } = useAgent();
  const { initSession } = useConversation();
  const [isSelecting, setIsSelecting] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't render if intent already set or dismissed
  if (intent || isDismissed) return null;

  const handleSelect = async (selectedIntent: Intent) => {
    setIsSelecting(true);
    await initSession(selectedIntent);
    // Small delay so the exit animation plays
    setTimeout(() => setIsSelecting(false), 400);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  return (
    <AnimatePresence>
      {!isSelecting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-cream/90 dark:bg-dark-bg/90 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
            className="max-w-3xl w-full mx-6"
          >
            {/* Header */}
            <div className="text-center mb-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-turquoise/10 mb-6"
              >
                <span className="text-turquoise text-2xl font-serif font-bold">R</span>
              </motion.div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal dark:text-cream mb-3">
                Welcome. I&apos;m Reader.
              </h2>
              <p className="font-sans text-charcoal/60 dark:text-dark-muted text-lg max-w-lg mx-auto">
                I&apos;m James&apos;s AI guide. What brings you here today?
              </p>
            </div>

            {/* Intent Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {intents.map((item, index) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.08 }}
                  onClick={() => handleSelect(item.id)}
                  className="group text-left p-6 rounded-xl
                    bg-white/70 dark:bg-dark-surface/70 backdrop-blur-sm
                    border border-stone-dark/20 dark:border-dark-border/30
                    hover:border-turquoise/50 hover:shadow-lg hover:shadow-turquoise/5
                    transition-all duration-300"
                >
                  <span className="text-2xl mb-3 block">{item.icon}</span>
                  <h3 className="font-serif text-lg font-semibold text-charcoal dark:text-cream mb-1 group-hover:text-turquoise transition-colors">
                    {item.title}
                  </h3>
                  <p className="font-sans text-sm text-charcoal/60 dark:text-dark-muted leading-relaxed">
                    {item.description}
                  </p>
                </motion.button>
              ))}
            </div>

            {/* Dismiss link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center mt-8"
            >
              <button
                onClick={handleDismiss}
                className="font-sans text-sm text-charcoal/40 dark:text-dark-muted/60 hover:text-turquoise transition-colors underline underline-offset-4 decoration-charcoal/20 dark:decoration-dark-muted/30 hover:decoration-turquoise"
              >
                Or just browse the site →
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
