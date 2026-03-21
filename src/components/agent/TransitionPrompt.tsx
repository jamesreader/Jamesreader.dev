'use client';

import { motion } from 'framer-motion';

export interface TransitionOption {
  id: string;
  icon: string;
  label: string;
  description: string;
}

interface TransitionPromptProps {
  question: string;
  options: TransitionOption[];
  onSelect: (id: string) => void;
  delay?: number;
}

export default function TransitionPrompt({ question, options, onSelect, delay = 0 }: TransitionPromptProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' as const }}
      className="max-w-3xl mx-auto px-6 py-12"
    >
      {/* Agent asks */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-8 h-8 rounded-full bg-turquoise/15 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-turquoise text-sm font-bold font-serif">R</span>
        </div>
        <p className="font-serif text-xl md:text-2xl text-charcoal dark:text-cream leading-snug">
          {question}
        </p>
      </div>

      {/* Options */}
      <div className="ml-12 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((opt, i) => (
          <motion.button
            key={opt.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: delay + 0.2 + i * 0.07, ease: 'easeOut' as const }}
            onClick={() => onSelect(opt.id)}
            className="group text-left p-5 rounded-xl
              bg-white/70 dark:bg-dark-surface/70 backdrop-blur-sm
              border border-stone-dark/15 dark:border-dark-border/25
              hover:border-turquoise/50 hover:shadow-lg hover:shadow-turquoise/5
              transition-all duration-200"
          >
            <span className="text-xl mb-2 block">{opt.icon}</span>
            <h4 className="font-sans text-sm font-semibold text-charcoal dark:text-cream group-hover:text-turquoise transition-colors mb-1">
              {opt.label}
            </h4>
            <p className="font-sans text-xs text-charcoal/50 dark:text-dark-muted leading-relaxed">
              {opt.description}
            </p>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
