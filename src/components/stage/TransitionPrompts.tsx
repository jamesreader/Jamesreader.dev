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
  const [customMode, setCustomMode] = useState(false);
  const [customInput, setCustomInput] = useState('');

  const handleSelect = (value: string) => {
    if (disabled || selected) return;
    setSelected(value);
    onSelect(value);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim() || disabled || selected) return;
    setSelected('custom');
    onSelect(customInput.trim());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="w-full max-w-2xl mx-auto mt-6"
    >
      <AnimatePresence mode="wait">
        {!customMode ? (
          <motion.div
            key="options"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2.5"
          >
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

            {/* Something else option */}
            <motion.button
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + options.length * 0.08, duration: 0.3 }}
              onClick={() => setCustomMode(true)}
              disabled={disabled || !!selected}
              className={`
                w-full text-left px-5 py-3.5 rounded-xl font-sans text-sm
                border border-dashed transition-all duration-200
                ${selected
                  ? 'opacity-40 border-charcoal/5 dark:border-dark-border/10'
                  : 'border-charcoal/15 dark:border-dark-border/25 hover:border-turquoise/40 text-charcoal/50 dark:text-dark-muted hover:text-turquoise'
                }
              `}
            >
              <span className="flex items-center gap-3">
                <span className="text-base">💬</span>
                <span>Something else — ask me anything</span>
              </span>
            </motion.button>
          </motion.div>
        ) : (
          <motion.form
            key="custom"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleCustomSubmit}
            className="flex gap-2"
          >
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="What would you like to know?"
              autoFocus
              disabled={disabled || !!selected}
              className="flex-1 px-4 py-3 rounded-xl bg-cream/5 dark:bg-dark-surface/30
                border border-charcoal/15 dark:border-dark-border/25
                font-sans text-sm text-charcoal dark:text-cream
                placeholder:text-charcoal/30 dark:placeholder:text-dark-muted/50
                focus:outline-none focus:border-turquoise/50 transition-colors"
            />
            <button
              type="submit"
              disabled={!customInput.trim() || disabled || !!selected}
              className="px-5 py-3 rounded-xl bg-turquoise text-white font-sans text-sm
                font-medium hover:bg-turquoise-dim transition-colors disabled:opacity-40"
            >
              Ask
            </button>
            <button
              type="button"
              onClick={() => setCustomMode(false)}
              className="px-3 py-3 rounded-xl text-charcoal/40 dark:text-dark-muted 
                hover:text-charcoal dark:hover:text-cream transition-colors text-sm"
            >
              ←
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}