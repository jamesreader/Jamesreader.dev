'use client';

import { motion } from 'framer-motion';

interface AgentNarrationProps {
  message: string;
  delay?: number;
}

export default function AgentNarration({ message, delay = 0 }: AgentNarrationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' as const }}
      className="max-w-3xl mx-auto px-6 py-8"
    >
      <div className="flex items-start gap-4">
        <div className="w-8 h-8 rounded-full bg-turquoise/15 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-turquoise text-sm font-bold font-serif">R</span>
        </div>
        <p className="font-sans text-lg text-charcoal/80 dark:text-dark-text leading-relaxed">
          {message}
        </p>
      </div>
    </motion.div>
  );
}
