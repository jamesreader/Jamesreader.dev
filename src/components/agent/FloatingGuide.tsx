'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Intent } from '@/context/AgentProvider';
import { useAgent } from '@/context/AgentProvider';

// ── Annotation data ────────────────────────────────────

interface Annotation {
  id: string;
  sectionId: string;          // which section triggers this
  triggerPercent: number;      // % scrolled through that section (0-1)
  content: string;
  intents: Intent[];
  cta?: { label: string; action: 'open-chat' | 'scroll-to'; target?: string };
}

const allAnnotations: Annotation[] = [
  {
    id: 'welcome-projects',
    sectionId: 'projects',
    triggerPercent: 0.1,
    content: "Each of these started as a real business problem, not a portfolio piece. Want to hear the story behind any of them?",
    intents: ['consulting', 'exploring'],
    cta: { label: 'Ask Reader', action: 'open-chat' },
  },
  {
    id: 'smis-growth',
    sectionId: 'projects',
    triggerPercent: 0.4,
    content: "The SMIS tool started as a $5K build. It's growing into a full AI platform — that's what happens when you solve a real pain point.",
    intents: ['consulting', 'technical'],
  },
  {
    id: 'infra-meta',
    sectionId: 'infrastructure',
    triggerPercent: 0.15,
    content: "You're experiencing this stack right now. The AI behind this site runs on the same Daedalus hardware described here.",
    intents: ['technical', 'exploring', 'consulting'],
  },
  {
    id: 'infra-cost',
    sectionId: 'infrastructure',
    triggerPercent: 0.6,
    content: "Cloud API costs for this level of inference: $2,000+/month. Self-hosted on Daedalus: electricity. The economics are transformative.",
    intents: ['consulting', 'technical'],
  },
  {
    id: 'story-pivot',
    sectionId: 'story',
    triggerPercent: 0.3,
    content: "The jump from IT Director to AI builder wasn't a career change — it was a natural evolution. The infrastructure knowledge IS the competitive advantage.",
    intents: ['personal', 'consulting', 'exploring'],
  },
  {
    id: 'philosophy-security',
    sectionId: 'philosophy',
    triggerPercent: 0.2,
    content: "The security-first approach isn't abstract — it comes from running government IT where a breach means real consequences for real people.",
    intents: ['technical', 'personal'],
  },
  {
    id: 'consulting-pitch',
    sectionId: 'consulting',
    triggerPercent: 0.1,
    content: "Curious about working together? I can answer questions about James's process, availability, and approach.",
    intents: ['consulting', 'exploring'],
    cta: { label: 'Ask me anything', action: 'open-chat' },
  },
  {
    id: 'hero-explore',
    sectionId: 'hero',
    triggerPercent: 0.8,
    content: "Scroll to explore, or ask me about anything that catches your eye. I know James's work inside and out.",
    intents: ['exploring'],
    cta: { label: 'Talk to Reader', action: 'open-chat' },
  },
];

// ── Section nav ────────────────────────────────────────

interface SectionInfo {
  id: string;
  label: string;
  icon: string;
}

const sectionMeta: Record<string, SectionInfo> = {
  hero: { id: 'hero', label: 'Intro', icon: '🏠' },
  projects: { id: 'projects', label: 'Projects', icon: '🔨' },
  infrastructure: { id: 'infrastructure', label: 'Infrastructure', icon: '⚙️' },
  story: { id: 'story', label: 'Story', icon: '📖' },
  philosophy: { id: 'philosophy', label: 'Philosophy', icon: '💡' },
  consulting: { id: 'consulting', label: 'Contact', icon: '🤝' },
};

// ── Component ──────────────────────────────────────────

interface FloatingGuideProps {
  intent: Intent;
  sections: string[];
}

export default function FloatingGuide({ intent, sections }: FloatingGuideProps) {
  const { toggleOpen } = useAgent();
  const [activeAnnotation, setActiveAnnotation] = useState<Annotation | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [shownIds, setShownIds] = useState<Set<string>>(new Set());
  const [currentSection, setCurrentSection] = useState<string>('hero');
  const [showNav, setShowNav] = useState(false);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Get annotations for current intent
  const intentAnnotations = allAnnotations.filter(a => a.intents.includes(intent));

  // Track scroll position and detect which section is in view
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const viewportH = window.innerHeight;

      // Show section nav after scrolling past hero
      setShowNav(scrollY > viewportH * 0.5);

      // Find which section is most in view
      for (const sectionId of [...sections].reverse()) {
        const el = document.getElementById(sectionId);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top < viewportH * 0.6) {
          setCurrentSection(sectionId);

          // Check if we should trigger an annotation
          const sectionProgress = Math.max(0, Math.min(1, -rect.top / (rect.height - viewportH)));

          for (const ann of intentAnnotations) {
            if (
              ann.sectionId === sectionId &&
              sectionProgress >= ann.triggerPercent &&
              !dismissedIds.has(ann.id) &&
              !shownIds.has(ann.id) &&
              !activeAnnotation
            ) {
              setActiveAnnotation(ann);
              setShownIds(prev => new Set([...prev, ann.id]));
            }
          }
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections, intentAnnotations, dismissedIds, shownIds, activeAnnotation]);

  // Auto-dismiss annotation after 12 seconds
  useEffect(() => {
    if (!activeAnnotation) return;
    dismissTimerRef.current = setTimeout(() => {
      setDismissedIds(prev => new Set([...prev, activeAnnotation.id]));
      setActiveAnnotation(null);
    }, 12000);
    return () => clearTimeout(dismissTimerRef.current);
  }, [activeAnnotation]);

  const dismissAnnotation = useCallback(() => {
    if (activeAnnotation) {
      setDismissedIds(prev => new Set([...prev, activeAnnotation.id]));
      setActiveAnnotation(null);
    }
  }, [activeAnnotation]);

  const handleCta = useCallback((cta: Annotation['cta']) => {
    dismissAnnotation();
    if (cta?.action === 'open-chat') {
      toggleOpen();
    } else if (cta?.action === 'scroll-to' && cta.target) {
      document.getElementById(cta.target)?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [dismissAnnotation, toggleOpen]);

  const scrollToSection = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setShowNav(false);
  }, []);

  return (
    <>
      {/* ── Floating section nav (left side) ──────────── */}
      <AnimatePresence>
        {showNav && (
          <motion.nav
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed left-4 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col gap-1.5"
          >
            {sections.filter(s => s !== 'hero').map((sectionId) => {
              const meta = sectionMeta[sectionId];
              if (!meta) return null;
              const isActive = currentSection === sectionId;
              return (
                <button
                  key={sectionId}
                  onClick={() => scrollToSection(sectionId)}
                  className={`group flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                    isActive
                      ? 'bg-turquoise/10 text-turquoise'
                      : 'text-charcoal/30 dark:text-dark-muted/40 hover:text-charcoal/60 dark:hover:text-dark-muted/70 hover:bg-stone/30 dark:hover:bg-dark-surface/30'
                  }`}
                  title={meta.label}
                >
                  <span className="text-sm">{meta.icon}</span>
                  <span className={`text-xs font-sans font-medium transition-all duration-200 overflow-hidden ${
                    isActive ? 'max-w-[80px] opacity-100' : 'max-w-0 opacity-0 group-hover:max-w-[80px] group-hover:opacity-100'
                  }`}>
                    {meta.label}
                  </span>
                </button>
              );
            })}
          </motion.nav>
        )}
      </AnimatePresence>

      {/* ── Floating annotation (right side desktop, bottom mobile) ── */}
      <AnimatePresence>
        {activeAnnotation && (
          <>
            {/* Desktop: right side */}
            <motion.div
              key={`desktop-${activeAnnotation.id}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, scale: 0.97 }}
              transition={{ duration: 0.35, ease: 'easeOut' as const }}
              className="fixed right-6 top-1/2 -translate-y-1/2 z-30 max-w-[280px] hidden lg:block"
            >
              <div className="bg-white/92 dark:bg-dark-surface/92 backdrop-blur-xl rounded-2xl border border-stone-dark/15 dark:border-dark-border/30 shadow-xl shadow-black/5 overflow-hidden">
                {/* Accent top */}
                <div className="h-0.5 bg-gradient-to-r from-turquoise/60 to-turquoise/0" />

                <div className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-7 h-7 rounded-full bg-turquoise/12 flex items-center justify-center flex-shrink-0">
                      <span className="text-turquoise text-xs font-bold font-serif">R</span>
                    </div>
                    <p className="font-sans text-[13px] text-charcoal/75 dark:text-dark-text/85 leading-relaxed pt-0.5">
                      {activeAnnotation.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between ml-10">
                    {activeAnnotation.cta ? (
                      <button
                        onClick={() => handleCta(activeAnnotation.cta)}
                        className="font-sans text-xs text-turquoise hover:text-turquoise-dim transition-colors font-medium"
                      >
                        {activeAnnotation.cta.label} →
                      </button>
                    ) : (
                      <div />
                    )}
                    <button
                      onClick={dismissAnnotation}
                      className="font-sans text-[10px] text-charcoal/25 dark:text-dark-muted/35 hover:text-charcoal/50 dark:hover:text-dark-muted/60 transition-colors"
                    >
                      dismiss
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Mobile: bottom toast */}
            <motion.div
              key={`mobile-${activeAnnotation.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="fixed bottom-20 left-3 right-3 z-30 lg:hidden"
            >
              <div className="bg-white/95 dark:bg-dark-surface/95 backdrop-blur-xl rounded-xl border border-stone-dark/15 dark:border-dark-border/30 shadow-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-turquoise/12 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-turquoise text-[10px] font-bold font-serif">R</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-sm text-charcoal/75 dark:text-dark-text/85 leading-relaxed">
                      {activeAnnotation.content}
                    </p>
                    {activeAnnotation.cta && (
                      <button
                        onClick={() => handleCta(activeAnnotation.cta)}
                        className="font-sans text-xs text-turquoise mt-2 font-medium"
                      >
                        {activeAnnotation.cta.label} →
                      </button>
                    )}
                  </div>
                  <button
                    onClick={dismissAnnotation}
                    className="p-1 text-charcoal/25 dark:text-dark-muted/35"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
