'use client';

import { useState, useEffect, useRef, useCallback, type KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgent, useConversation } from '@/context/AgentProvider';
import type { Intent } from '@/context/AgentProvider';
import TransitionPrompts from './TransitionPrompts';
import { ProjectCard, InfraCard, StatCard, PhilosophyCard, CTACard } from './ContentCards';
import NeuralConstellation from '@/components/NeuralConstellation';
import JobEvaluator from '@/components/agent/JobEvaluator';
import { parseAgentMessage } from '@/lib/parseAgentMessage';

// ── Transition prompt suggestions ──────────────────────

interface SuggestionSet {
  options: { label: string; value: string; icon: string }[];
}

function getSuggestionsForContext(intent: Intent, visitedTopics: string[]): SuggestionSet {
  const all: Record<string, { label: string; value: string; icon: string }> = {
    projects: { label: "Show me the projects", value: "Show me the projects you've built", icon: "🔨" },
    smis: { label: "Tell me about SMIS", value: "Tell me about the SMIS federal contract tool", icon: "📊" },
    meridian: { label: "Tell me about Meridian Money", value: "Tell me about Meridian Money", icon: "💰" },
    infra: { label: "What's the infrastructure like?", value: "Show me the infrastructure powering this site", icon: "🖥️" },
    story: { label: "What's James's background?", value: "Tell me about James's career journey", icon: "📖" },
    philosophy: { label: "What's the building philosophy?", value: "What's James's approach to building?", icon: "🧠" },
    consulting: { label: "I'm interested in working together", value: "I'm interested in consulting — how do engagements work?", icon: "🤝" },
    evaluate: { label: "Evaluate a job fit", value: "I'd like to evaluate whether James is a good fit for a role", icon: "🎯" },
    localai: { label: "How does the local AI work?", value: "Walk me through the local AI infrastructure", icon: "⚡" },
    deep_smis: { label: "Go deeper on SMIS architecture", value: "What's the technical architecture behind SMIS?", icon: "🔍" },
    deep_meridian: { label: "Go deeper on Meridian's stack", value: "What's the tech stack behind Meridian Money?", icon: "🔍" },
  };

  // Filter out visited topics and pick 2-3 relevant ones based on intent
  const available = Object.entries(all)
    .filter(([key]) => !visitedTopics.includes(key))
    .map(([, v]) => v);

  // Priority ordering by intent
  const priority: Record<Intent, string[]> = {
    consulting: ['projects', 'smis', 'meridian', 'infra', 'consulting', 'evaluate', 'philosophy'],
    technical: ['infra', 'localai', 'smis', 'projects', 'evaluate', 'deep_smis', 'philosophy'],
    personal: ['story', 'philosophy', 'projects', 'meridian', 'evaluate', 'infra', 'consulting'],
    exploring: ['projects', 'infra', 'story', 'evaluate', 'philosophy', 'consulting', 'smis'],
    evaluating: ['projects', 'infra', 'evaluate', 'consulting', 'philosophy', 'smis', 'story'],
  };

  const ordered = priority[intent]
    .filter(key => !visitedTopics.includes(key))
    .map(key => all[key])
    .filter(Boolean);

  return { options: ordered.slice(0, 4) };
}

// ── Message bubble ─────────────────────────────────────

function MessageBubble({ role, content, isStreaming }: { 
  role: 'user' | 'agent'; 
  content: string;
  isStreaming?: boolean;
}) {
  const blocks = role === 'agent' ? parseAgentMessage(content) : [{ type: 'text' as const, value: content }];
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`max-w-full ${role === 'user' ? 'max-w-md' : 'max-w-2xl w-full'}`}>
        {role === 'user' ? (
          <div className="px-4 py-3 rounded-2xl rounded-br-md bg-turquoise/10 border border-turquoise/20">
            <p className="font-sans text-sm text-charcoal dark:text-cream">{content}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {blocks.map((block, i) => {
              if (block.type === 'text') {
                return (
                  <div key={i} className="px-1">
                    <p className="font-sans text-sm text-charcoal/80 dark:text-cream/80 leading-relaxed whitespace-pre-wrap">
                      {block.value}
                      {isStreaming && i === blocks.length - 1 && (
                        <span className="inline-block w-1.5 h-4 bg-turquoise/60 ml-0.5 animate-pulse" />
                      )}
                    </p>
                  </div>
                );
              }

              // Content blocks
              switch (block.contentType) {
                case 'project':
                  return (
                    <div key={i} className="my-4">
                      <ProjectCard
                        projectId={block.props?.projectId as string}
                        expanded={expandedProjects.has(block.props?.projectId as string)}
                        onToggle={() => toggleProject(block.props?.projectId as string)}
                      />
                    </div>
                  );
                case 'infra':
                  return <div key={i} className="my-4"><InfraCard /></div>;
                case 'stat':
                  return (
                    <div key={i} className="my-4">
                      <StatCard
                        value={block.props?.value as string}
                        label={block.props?.label as string}
                        context={block.props?.context as string}
                      />
                    </div>
                  );
                case 'philosophy':
                  return (
                    <div key={i} className="my-4">
                      <PhilosophyCard quote={block.props?.quote as string} />
                    </div>
                  );
                case 'cta':
                  return (
                    <div key={i} className="my-4">
                      <CTACard
                        headline="Let's build something"
                        subtext="Start with a conversation — no commitment, no pitch deck required."
                        buttonText="Get in touch"
                        email="james@swds.biz"
                      />
                    </div>
                  );
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

// ── Breadcrumb trail ───────────────────────────────────

function BreadcrumbTrail({ topics }: { topics: string[] }) {
  if (topics.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-2 text-xs font-sans text-charcoal/30 dark:text-dark-muted/40 mb-6 flex-wrap"
    >
      {topics.map((topic, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span className="text-turquoise/30">→</span>}
          <span className="capitalize">{topic}</span>
        </span>
      ))}
    </motion.div>
  );
}

// ── Main Stage View ────────────────────────────────────

export default function StageView() {
  const { intent, conversationHistory, isStreaming, clearSession } = useAgent();
  const { sendMessage } = useConversation();
  const [visitedTopics, setVisitedTopics] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showEvaluator, setShowEvaluator] = useState(intent === 'evaluating');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [conversationHistory]);

  // Show suggestions after streaming completes
  useEffect(() => {
    if (!isStreaming && conversationHistory.length > 0) {
      const timer = setTimeout(() => setShowSuggestions(true), 500);
      return () => clearTimeout(timer);
    }
    setShowSuggestions(false);
  }, [isStreaming, conversationHistory.length]);

  const handlePromptSelect = useCallback((value: string) => {
    setShowSuggestions(false);
    
    // Track visited topics based on what was selected
    const topicMap: Record<string, string> = {
      'projects': 'projects',
      'SMIS': 'smis',
      'Meridian': 'meridian',
      'infrastructure': 'infra',
      'career': 'story',
      'background': 'story',
      'approach': 'philosophy',
      'philosophy': 'philosophy',
      'consulting': 'consulting',
      'local AI': 'localai',
    };

    for (const [keyword, topic] of Object.entries(topicMap)) {
      if (value.toLowerCase().includes(keyword.toLowerCase())) {
        setVisitedTopics(prev => prev.includes(topic) ? prev : [...prev, topic]);
        break;
      }
    }

    // If they clicked evaluate, show the evaluator instead of sending a message
    if (value.toLowerCase().includes('evaluate')) {
      setShowEvaluator(true);
      return;
    }

    sendMessage(value);
  }, [sendMessage]);

  if (!intent) return null;

  const suggestions = getSuggestionsForContext(intent, visitedTopics);

  return (
    <div id="stage-root" className="h-full" style={{ overscrollBehavior: 'none' }}>
      {/* Ambient background */}
      <div id="stage-bg" className="fixed inset-0 bg-gradient-to-b from-cream via-cream to-stone/30 
        dark:from-dark-bg dark:via-dark-bg dark:to-dark-surface/50 -z-10 pointer-events-none" />
      
      {/* Neural constellation — fixed background layer */}
      <div className="fixed inset-0 -z-[5] opacity-[0.12] dark:opacity-[0.30] pointer-events-none">
        <NeuralConstellation
          className="absolute inset-0 w-full h-full"
          nodeCount={45}
          connectionDistance={200}
          lineWidth={2.5}
          desktopLineWidth={5}
          desktopConnectionDistance={260}
          maxLineOpacity={0.45}
          maxNodeOpacity={0.7}
        />
      </div>

      {/* Stage content */}
      <div id="stage-content" className="max-w-3xl w-full mx-auto px-6 pt-6 pb-4">
        {/* Header with breadcrumb + start over */}
        <div id="stage-header" className="flex items-center justify-between mb-2">
          <BreadcrumbTrail topics={visitedTopics} />
          <button
            onClick={clearSession}
            className="shrink-0 flex items-center gap-1.5 text-xs font-sans text-charcoal/40 dark:text-dark-muted/50 hover:text-turquoise transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
            Start over
          </button>
        </div>

        {/* Job Evaluator — shown when evaluating intent or user clicks evaluate */}
        {showEvaluator && (
          <JobEvaluator />
        )}

        {/* Conversation flow */}
        <div id="stage-messages" ref={scrollRef} className="flex-1 space-y-2 pb-4 min-h-0">
          <AnimatePresence mode="popLayout">
            {conversationHistory.map((msg, i) => (
              <MessageBubble
                key={msg.id}
                role={msg.role}
                content={msg.content}
                isStreaming={isStreaming && i === conversationHistory.length - 1 && msg.role === 'agent'}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Transition prompts — appear after agent finishes speaking */}
        <AnimatePresence>
          {showSuggestions && !isStreaming && conversationHistory.length > 0 && (
            <TransitionPrompts
              options={suggestions.options}
              onSelect={handlePromptSelect}
              disabled={isStreaming}
            />
          )}
        </AnimatePresence>

        {/* Free-text input */}
        <StageInput onSend={sendMessage} disabled={isStreaming} />
      </div>
    </div>
  );
}

// ── Free-text input for Stage view ─────────────────────

function StageInput({ onSend, disabled }: { onSend: (text: string) => void; disabled: boolean }) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div id="stage-input" className="shrink-0 pt-2 pb-2">
      <div className="flex items-end gap-2 bg-white/70 dark:bg-dark-surface/50 backdrop-blur-sm rounded-xl border border-stone-dark/20 dark:border-dark-border/30 p-2 focus-within:border-turquoise/50 transition-colors">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask something else…"
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm text-charcoal dark:text-dark-text placeholder:text-charcoal/40 dark:placeholder:text-dark-muted/60 outline-none max-h-32 py-1 px-2"
          style={{ minHeight: '1.75rem' }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          className="p-2 rounded-lg bg-turquoise text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-turquoise-dim transition-colors shrink-0"
          aria-label="Send message"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}