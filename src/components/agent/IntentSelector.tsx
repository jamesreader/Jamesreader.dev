'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgent, useConversation, type Intent } from '@/context/AgentProvider';

// ── Intent Card Data ───────────────────────────────────

const intents: Array<{
  id: Intent;
  icon: string;
  title: string;
  subtitle: string;
}> = [
  {
    id: 'consulting',
    icon: '🏗️',
    title: 'I need something built',
    subtitle: 'Consulting & capabilities',
  },
  {
    id: 'technical',
    icon: '🔍',
    title: 'Researching AI solutions',
    subtitle: 'Architecture & infrastructure',
  },
  {
    id: 'evaluating',
    icon: '🎯',
    title: 'Evaluate a job fit',
    subtitle: 'Paste a JD, get an honest assessment',
  },
  {
    id: 'personal',
    icon: '👤',
    title: 'Learn about James',
    subtitle: 'Story, philosophy & approach',
  },
  {
    id: 'exploring',
    icon: '🧭',
    title: 'Just exploring',
    subtitle: 'Curiosity-driven discovery',
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
          id="intent-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center bg-cream/90 dark:bg-dark-bg/90 backdrop-blur-md overflow-hidden"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
            id="intent-panel"
            className="max-w-2xl w-full mx-4 flex flex-col items-center max-h-[100dvh] py-6 sm:py-0"
          >
            {/* Header — compact on mobile */}
            <div className="text-center mb-4 sm:mb-8 shrink-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-turquoise/10 mb-3 sm:mb-5"
              >
                <span className="text-turquoise text-xl sm:text-2xl font-serif font-bold">R</span>
              </motion.div>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-charcoal dark:text-cream mb-1 sm:mb-2">
                Welcome. I&apos;m Reader.
              </h2>
              <p className="font-sans text-charcoal/60 dark:text-dark-muted text-sm sm:text-lg max-w-lg mx-auto">
                I&apos;m James&apos;s AI guide. What brings you here?
              </p>
            </div>

            {/* Intent Cards — compact stacked list */}
            <div className="w-full flex flex-col gap-2 sm:gap-3 shrink-0">
              {intents.map((item, index) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.25 + index * 0.06 }}
                  onClick={() => handleSelect(item.id)}
                  className="group flex items-center gap-3 sm:gap-4 px-4 py-3 sm:px-5 sm:py-4 rounded-xl
                    bg-white/70 dark:bg-dark-surface/70 backdrop-blur-sm
                    border border-stone-dark/20 dark:border-dark-border/30
                    hover:border-turquoise/50 hover:shadow-lg hover:shadow-turquoise/5
                    active:scale-[0.98]
                    transition-all duration-200 w-full text-left"
                >
                  <span className="text-xl sm:text-2xl shrink-0">{item.icon}</span>
                  <div className="min-w-0">
                    <h3 className="font-serif text-base sm:text-lg font-semibold text-charcoal dark:text-cream group-hover:text-turquoise transition-colors leading-tight">
                      {item.title}
                    </h3>
                    <p className="font-sans text-xs sm:text-sm text-charcoal/50 dark:text-dark-muted leading-snug">
                      {item.subtitle}
                    </p>
                  </div>
                  <span className="ml-auto text-charcoal/20 dark:text-dark-muted/30 group-hover:text-turquoise/50 transition-colors shrink-0">
                    →
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Dismiss link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center mt-4 sm:mt-6 shrink-0"
            >
              <button
                onClick={handleDismiss}
                className="font-sans text-xs sm:text-sm text-charcoal/40 dark:text-dark-muted/60 hover:text-turquoise transition-colors underline underline-offset-4 decoration-charcoal/20 dark:decoration-dark-muted/30 hover:decoration-turquoise"
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
