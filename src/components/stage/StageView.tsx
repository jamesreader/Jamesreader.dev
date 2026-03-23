'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgent, useConversation } from '@/context/AgentProvider';
import type { Intent } from '@/context/AgentProvider';
import TransitionPrompts from './TransitionPrompts';
import { ProjectCard, InfraCard, StatCard, PhilosophyCard, CTACard } from './ContentCards';
import NeuralConstellation from '@/components/NeuralConstellation';
import JobEvaluator from '@/components/agent/JobEvaluator';

// ── Content block parser ───────────────────────────────
// Detects content directives in agent messages and renders them

interface ParsedBlock {
  type: 'text' | 'content';
  value: string;
  contentType?: string;
  props?: Record<string, unknown>;
}

// Directive patterns the agent can include:
// {{project:smis}} {{project:meridian-money}} etc
// {{infra}} 
// {{stat:45 tok/s|Inference Speed|On DGX Spark}}
// {{philosophy:quote text here}}
// {{cta}}
function parseAgentMessage(text: string): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];
  // Match both {{type:data}} and {type:data} (some models use single braces)
  const pattern = /\{\{?(\w+)(?::([^}]*))?\}?\}/g;
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    // Text before this block
    if (match.index > lastIndex) {
      const textBefore = text.slice(lastIndex, match.index).trim();
      if (textBefore) {
        blocks.push({ type: 'text', value: textBefore });
      }
    }

    const blockType = match[1];
    const blockData = match[2] || '';

    // Strip leading/trailing quotes and whitespace from data
    const cleanData = blockData.replace(/^[\s"']+|[\s"']+$/g, '').trim();

    switch (blockType) {
      case 'project':
        blocks.push({ type: 'content', value: cleanData, contentType: 'project', props: { projectId: cleanData.replace(/[- ]/g, (m) => m === ' ' ? '-' : m).toLowerCase() } });
        break;
      case 'infra':
        blocks.push({ type: 'content', value: 'infra', contentType: 'infra' });
        break;
      case 'stat': {
        const [value, label, context] = cleanData.split('|');
        blocks.push({ type: 'content', value: 'stat', contentType: 'stat', props: { value, label, context } });
        break;
      }
      case 'philosophy':
        blocks.push({ type: 'content', value: cleanData, contentType: 'philosophy', props: { quote: cleanData } });
        break;
      case 'cta':
        blocks.push({ type: 'content', value: 'cta', contentType: 'cta' });
        break;
      default:
        blocks.push({ type: 'text', value: match[0] });
    }

    lastIndex = match.index + match[0].length;
  }

  // Remaining text
  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex).trim();
    if (remaining) {
      blocks.push({ type: 'text', value: remaining });
    }
  }

  return blocks.length > 0 ? blocks : [{ type: 'text', value: text }];
}

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
    consulting: ['projects', 'smis', 'meridian', 'infra', 'consulting', 'philosophy'],
    technical: ['infra', 'localai', 'smis', 'projects', 'deep_smis', 'philosophy'],
    personal: ['story', 'philosophy', 'projects', 'meridian', 'infra', 'consulting'],
    exploring: ['projects', 'infra', 'story', 'philosophy', 'consulting', 'evaluate', 'smis'],
    evaluating: ['projects', 'infra', 'consulting', 'philosophy', 'smis', 'story'],
  };

  const ordered = priority[intent]
    .filter(key => !visitedTopics.includes(key))
    .map(key => all[key])
    .filter(Boolean);

  return { options: ordered.slice(0, 3) };
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
  const { intent, conversationHistory, isStreaming } = useAgent();
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
    <div className="h-[100dvh] flex flex-col overflow-hidden" style={{ overscrollBehavior: 'none' }}>
      {/* Ambient background */}
      <div className="fixed inset-0 bg-gradient-to-b from-cream via-cream to-stone/30 
        dark:from-dark-bg dark:via-dark-bg dark:to-dark-surface/50 -z-10" />
      
      {/* Neural constellation — fixed background layer */}
      <div className="fixed inset-0 -z-[5] opacity-[0.12] dark:opacity-[0.30]">
        <NeuralConstellation
          className="absolute inset-0 w-full h-full"
          nodeCount={45}
          connectionDistance={200}
          lineWidth={2.5}
          maxLineOpacity={0.45}
          maxNodeOpacity={0.7}
        />
      </div>

      {/* Stage content */}
      <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto px-6 pt-24 pb-8 min-h-0">
        {/* Breadcrumb */}
        <BreadcrumbTrail topics={visitedTopics} />

        {/* Job Evaluator — shown when evaluating intent or user clicks evaluate */}
        {showEvaluator && (
          <JobEvaluator />
        )}

        {/* Conversation flow */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 pb-4 scrollbar-thin min-h-0">
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
      </div>
    </div>
  );
}