'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAgent, useConversation } from '@/context/AgentProvider';
import { parseAgentMessage } from '@/lib/parseAgentMessage';
import { ProjectCard, InfraCard, StatCard, PhilosophyCard, CTACard } from '@/components/stage/ContentCards';

// ── Typing Indicator ───────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full bg-turquoise/60"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.85, 1, 0.85] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

// ── Message Bubble ─────────────────────────────────────

function MessageBubble({ role, content, isStreaming }: {
  role: 'user' | 'agent';
  content: string;
  isStreaming?: boolean;
}) {
  const isUser = role === 'user';
  const blocks = !isUser ? parseAgentMessage(content) : null;
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  const toggleProject = (id: string) => {
    setExpandedProjects(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}
    >
      <div className={`max-w-[85%] ${isUser ? '' : 'w-full'}`}>
        {isUser ? (
          <div className="rounded-2xl rounded-br-md px-4 py-3 text-sm leading-relaxed bg-turquoise text-white">
            <p className="whitespace-pre-wrap">{content}</p>
          </div>
        ) : !content ? (
          isStreaming ? (
            <div className="rounded-2xl rounded-bl-md px-4 py-3 bg-white/80 dark:bg-dark-surface/80 border border-stone-dark/20 dark:border-dark-border/30">
              <TypingIndicator />
            </div>
          ) : null
        ) : (
          <div className="space-y-3">
            {blocks!.map((block, i) => {
              if (block.type === 'text') {
                return (
                  <div key={i} className="rounded-2xl rounded-bl-md px-4 py-3 text-sm leading-relaxed bg-white/80 dark:bg-dark-surface/80 text-charcoal dark:text-dark-text border border-stone-dark/20 dark:border-dark-border/30">
                    <div className="prose-agent">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.value}</ReactMarkdown>
                    </div>
                    {isStreaming && i === blocks!.length - 1 && (
                      <motion.span
                        className="inline-block w-0.5 h-4 bg-turquoise ml-0.5 align-text-bottom"
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                      />
                    )}
                  </div>
                );
              }
              // Content blocks
              switch (block.contentType) {
                case 'project':
                  return (
                    <ProjectCard
                      key={i}
                      projectId={block.props?.projectId as string}
                      expanded={expandedProjects.has(block.props?.projectId as string)}
                      onToggle={() => toggleProject(block.props?.projectId as string)}
                    />
                  );
                case 'infra':
                  return <InfraCard key={i} />;
                case 'stat':
                  return <StatCard key={i} value={block.props?.value as string} label={block.props?.label as string} context={block.props?.context as string} />;
                case 'philosophy':
                  return <PhilosophyCard key={i} quote={block.props?.quote as string} />;
                case 'cta':
                  return <CTACard key={i} headline="Let's build something" subtext="Start with a conversation — no commitment, no pitch deck required." buttonText="Get in touch" email="james@swds.biz" />;
                default:
                  return null;
              }
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Main Thread ────────────────────────────────────────

export default function ConversationThread() {
  const { isOpen, setIsOpen, isConnected, isStreaming } = useAgent();
  const { messages, sendMessage } = useConversation();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full z-50 w-full sm:w-[400px] flex flex-col
              bg-cream/95 dark:bg-dark-bg/95 backdrop-blur-xl
              border-l border-stone-dark/20 dark:border-dark-border/40
              shadow-2xl shadow-black/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-dark/20 dark:border-dark-border/30">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-turquoise/20 flex items-center justify-center">
                    <span className="text-turquoise text-sm font-bold font-serif">R</span>
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-cream dark:border-dark-bg ${
                      isConnected ? 'bg-emerald-400' : 'bg-stone-dark dark:bg-dark-muted'
                    }`}
                  />
                </div>
                <div>
                  <p className="font-serif text-sm font-semibold text-charcoal dark:text-cream">Reader</p>
                  <p className="text-xs text-charcoal/50 dark:text-dark-muted">
                    {isConnected ? 'Online' : 'Connecting…'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-stone/50 dark:hover:bg-dark-surface transition-colors text-charcoal/50 dark:text-dark-muted hover:text-charcoal dark:hover:text-cream"
                aria-label="Close conversation"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center px-6 opacity-60">
                  <div className="w-12 h-12 rounded-full bg-turquoise/10 flex items-center justify-center mb-4">
                    <span className="text-turquoise text-xl font-serif font-bold">R</span>
                  </div>
                  <p className="font-serif text-lg text-charcoal dark:text-cream mb-2">Ask me anything</p>
                  <p className="text-sm text-charcoal/60 dark:text-dark-muted">
                    About James&apos;s work, technical approach, or consulting services.
                  </p>
                </div>
              )}

              {messages.map((msg, i) => (
                <MessageBubble
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  isStreaming={isStreaming && i === messages.length - 1 && msg.role === 'agent'}
                />
              ))}

              {isStreaming && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
                <div className="flex justify-start mb-3">
                  <div className="bg-white/80 dark:bg-dark-surface/80 border border-stone-dark/20 dark:border-dark-border/30 rounded-2xl rounded-bl-md">
                    <TypingIndicator />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 pb-4 pt-2 border-t border-stone-dark/10 dark:border-dark-border/20">
              <div className="flex items-end gap-2 bg-white dark:bg-dark-surface rounded-xl border border-stone-dark/20 dark:border-dark-border/30 p-2 focus-within:border-turquoise/50 transition-colors">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isConnected ? 'Type a message…' : 'Connecting to Reader…'}
                  disabled={!isConnected}
                  rows={1}
                  className="flex-1 resize-none bg-transparent text-sm text-charcoal dark:text-dark-text placeholder:text-charcoal/40 dark:placeholder:text-dark-muted/60 outline-none max-h-32 py-1 px-2"
                  style={{ minHeight: '1.75rem' }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isStreaming || !isConnected}
                  className="p-2 rounded-lg bg-turquoise text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-turquoise-dim transition-colors shrink-0"
                  aria-label="Send message"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </button>
              </div>
              <p className="text-[10px] text-charcoal/30 dark:text-dark-muted/40 text-center mt-2">
                Powered by Reader &middot; James&apos;s AI guide
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
