'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Intent } from '@/context/AgentProvider';

interface Annotation {
  id: string;
  sectionId: string;
  content: string;
  intents: Intent[];
}

const annotations: Annotation[] = [
  {
    id: 'smis-growth',
    sectionId: 'projects',
    content: 'The SMIS tool started as a $5K consulting engagement. It\'s now growing into a full AI platform. This is what happens when you build for a real problem.',
    intents: ['consulting', 'exploring'],
  },
  {
    id: 'infra-meta',
    sectionId: 'infrastructure',
    content: 'This site\'s AI agent runs on the exact same Daedalus hardware described here. You\'re experiencing the infrastructure in real time.',
    intents: ['technical', 'exploring'],
  },
  {
    id: 'story-pivot',
    sectionId: 'story',
    content: 'The jump from IT Director to AI builder wasn\'t a career change — it was a natural evolution. The infrastructure knowledge IS the competitive advantage.',
    intents: ['personal', 'consulting'],
  },
  {
    id: 'philosophy-security',
    sectionId: 'philosophy',
    content: 'The security-first approach isn\'t just principle — it comes from running government IT where a breach means real consequences for real people.',
    intents: ['technical', 'personal'],
  },
  {
    id: 'cost-self-hosted',
    sectionId: 'infrastructure',
    content: 'Cloud API costs for this level of AI usage would be $2,000+/month. Self-hosted on Daedalus? Electricity. The economics are transformative.',
    intents: ['consulting', 'technical'],
  },
];

function getAnnotationsForIntent(intent: Intent): Annotation[] {
  return annotations.filter((a) => a.intents.includes(intent));
}

export default function GuideLayer({ intent }: { intent: Intent }) {
  const [visibleAnnotation, setVisibleAnnotation] = useState<Annotation | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);

  const available = getAnnotationsForIntent(intent).filter((a) => !dismissed.has(a.id));

  // Show annotations one at a time based on scroll position
  useEffect(() => {
    if (available.length === 0) return;

    const timer = setTimeout(() => {
      if (currentIndex < available.length && !visibleAnnotation) {
        setVisibleAnnotation(available[currentIndex]);
      }
    }, 3000 + currentIndex * 8000); // First one after 3s, then every 8s

    return () => clearTimeout(timer);
  }, [currentIndex, available, visibleAnnotation]);

  const dismiss = useCallback((id: string) => {
    setDismissed((prev) => new Set([...prev, id]));
    setVisibleAnnotation(null);
    setCurrentIndex((prev) => prev + 1);
  }, []);

  // Auto-dismiss after 10 seconds
  useEffect(() => {
    if (!visibleAnnotation) return;
    const timer = setTimeout(() => {
      dismiss(visibleAnnotation.id);
    }, 10000);
    return () => clearTimeout(timer);
  }, [visibleAnnotation, dismiss]);

  return (
    <AnimatePresence>
      {visibleAnnotation && (
        <motion.div
          key={visibleAnnotation.id}
          initial={{ opacity: 0, x: 30, y: 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 20, scale: 0.95 }}
          transition={{ duration: 0.35, ease: 'easeOut' as const }}
          className="fixed bottom-24 right-6 z-30 max-w-xs
            hidden lg:block"
        >
          <div className="bg-white/90 dark:bg-dark-surface/90 backdrop-blur-xl border border-turquoise/20 rounded-xl p-4 shadow-lg shadow-turquoise/5">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-turquoise/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-turquoise text-xs font-bold font-serif">R</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-sans text-sm text-charcoal/80 dark:text-dark-text leading-relaxed">
                  {visibleAnnotation.content}
                </p>
              </div>
              <button
                onClick={() => dismiss(visibleAnnotation.id)}
                className="p-1 rounded hover:bg-stone/50 dark:hover:bg-dark-border/30 text-charcoal/30 dark:text-dark-muted/50 hover:text-charcoal dark:hover:text-cream transition-colors flex-shrink-0"
                aria-label="Dismiss"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Mobile: bottom sheet style */}
      {visibleAnnotation && (
        <motion.div
          key={`mobile-${visibleAnnotation.id}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-20 left-4 right-4 z-30
            lg:hidden"
        >
          <div className="bg-white/95 dark:bg-dark-surface/95 backdrop-blur-xl border border-turquoise/20 rounded-xl p-4 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-turquoise/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-turquoise text-[10px] font-bold font-serif">R</span>
              </div>
              <p className="font-sans text-sm text-charcoal/80 dark:text-dark-text leading-relaxed flex-1">
                {visibleAnnotation.content}
              </p>
              <button
                onClick={() => dismiss(visibleAnnotation.id)}
                className="p-1 text-charcoal/30 dark:text-dark-muted/50"
                aria-label="Dismiss"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
