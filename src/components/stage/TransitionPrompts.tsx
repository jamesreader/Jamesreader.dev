'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PromptOption {
  label: string;
  value: string;
  icon?: string;
}

interface TransitionPromptsProps {
  options: PromptOption[];
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export default function TransitionPrompts({ options, onSelect, disabled }: TransitionPromptsProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (value: string) => {
    if (disabled || selected) return;
    setSelected(value);
    onSelect(value);
  };

  return (
    <motion.div
      id="stage-suggestions"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="w-full max-w-2xl mx-auto mt-6"
    >
      <div className="space-y-2.5">
        {options.map((option, i) => (
          <motion.button
            key={option.value}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.08, duration: 0.3 }}
            onClick={() => handleSelect(option.value)}
            disabled={disabled || !!selected}
            className={`
              w-full text-left px-5 py-3.5 rounded-xl font-sans text-sm
              border transition-all duration-200 group
              ${selected === option.value
                ? 'bg-turquoise/10 border-turquoise/40 text-turquoise'
                : selected
                  ? 'opacity-40 border-charcoal/5 dark:border-dark-border/10'
                  : 'bg-cream/5 dark:bg-dark-surface/30 border-charcoal/10 dark:border-dark-border/20 hover:border-turquoise/40 hover:bg-turquoise/5 text-charcoal dark:text-cream'
              }
            `}
          >
            <span className="flex items-center gap-3">
              {option.icon && <span className="text-base">{option.icon}</span>}
              <span>{option.label}</span>
              {!selected && (
                <span className="ml-auto text-turquoise/0 group-hover:text-turquoise/60 transition-colors">
                  →
                </span>
              )}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
