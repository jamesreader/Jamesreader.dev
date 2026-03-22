'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Intent } from '@/context/AgentProvider';
import { useAgent } from '@/context/AgentProvider';
import AgentNarration from './AgentNarration';
import TransitionPrompt, { type TransitionOption } from './TransitionPrompt';
import HeroSection from '@/components/sections/HeroSection';
import ProjectShowcase from '@/components/sections/ProjectShowcase';
import InfrastructureSection from '@/components/sections/InfrastructureSection';
import StorySection from '@/components/sections/StorySection';
import PhilosophySection from '@/components/sections/PhilosophySection';
import ConsultingCTA from '@/components/sections/ConsultingCTA';

// ── Flow definitions per intent ────────────────────────

type StepType = 'narration' | 'section' | 'prompt';

interface NarrationStep {
  type: 'narration';
  message: string;
}

interface SectionStep {
  type: 'section';
  id: string;
  component: string;
}

interface PromptStep {
  type: 'prompt';
  question: string;
  options: (TransitionOption & { nextSteps: string })[];
}

type FlowStep = NarrationStep | SectionStep | PromptStep;

// Each intent has a branching flow
interface FlowDefinition {
  initial: FlowStep[];
  branches: Record<string, FlowStep[]>;
}

const flows: Record<Intent, FlowDefinition> = {
  consulting: {
    initial: [
      { type: 'section', id: 'hero', component: 'hero' },
      { type: 'narration', message: "Here's a look at what I've built for clients — each one started as a real business problem." },
      { type: 'section', id: 'projects', component: 'projects' },
      {
        type: 'prompt',
        question: 'What would you like to explore next?',
        options: [
          { id: 'how-i-work', icon: '🤝', label: 'How I work with clients', description: 'Engagement models, process, and what to expect.', nextSteps: 'consulting-cta' },
          { id: 'tech-stack', icon: '⚙️', label: 'The tech behind it', description: 'Infrastructure, stack choices, and why self-hosted AI matters.', nextSteps: 'infra' },
          { id: 'my-approach', icon: '💡', label: 'My philosophy', description: 'How I think about building — security, reliability, shipping.', nextSteps: 'philosophy' },
        ],
      },
    ],
    branches: {
      'consulting-cta': [
        { type: 'narration', message: "I take on a small number of engagements at a time so each one gets real attention." },
        { type: 'section', id: 'consulting', component: 'consulting' },
        {
          type: 'prompt',
          question: 'Want to go deeper?',
          options: [
            { id: 'tech-stack', icon: '⚙️', label: 'See the infrastructure', description: 'What powers everything under the hood.', nextSteps: 'infra' },
            { id: 'my-approach', icon: '💡', label: 'My building philosophy', description: 'The principles behind the work.', nextSteps: 'philosophy' },
          ],
        },
      ],
      infra: [
        { type: 'narration', message: 'Everything runs on hardware I own. The AI you could be talking to right now runs on this exact stack.' },
        { type: 'section', id: 'infrastructure', component: 'infrastructure' },
        {
          type: 'prompt',
          question: 'Where to next?',
          options: [
            { id: 'how-i-work', icon: '🤝', label: 'Working together', description: 'How engagements work.', nextSteps: 'consulting-cta' },
            { id: 'my-approach', icon: '💡', label: 'Building philosophy', description: 'Security-first, ship-fast principles.', nextSteps: 'philosophy' },
          ],
        },
      ],
      philosophy: [
        { type: 'narration', message: 'These principles came from things breaking in production — every one has a war story behind it.' },
        { type: 'section', id: 'philosophy', component: 'philosophy' },
        {
          type: 'prompt',
          question: 'Anything else catch your eye?',
          options: [
            { id: 'how-i-work', icon: '🤝', label: 'Let\'s talk', description: 'Engagement models and getting started.', nextSteps: 'consulting-cta' },
            { id: 'tech-stack', icon: '⚙️', label: 'The infrastructure', description: 'DGX Spark, vLLM, and the full stack.', nextSteps: 'infra' },
          ],
        },
      ],
    },
  },

  technical: {
    initial: [
      { type: 'section', id: 'hero', component: 'hero' },
      { type: 'narration', message: 'Let me show you what\'s running under the hood. This is all self-hosted — no cloud APIs in the loop.' },
      { type: 'section', id: 'infrastructure', component: 'infrastructure' },
      {
        type: 'prompt',
        question: 'What interests you most?',
        options: [
          { id: 'see-projects', icon: '🔨', label: 'Production systems', description: 'Real applications built on this stack.', nextSteps: 'projects' },
          { id: 'my-approach', icon: '🔒', label: 'Security & philosophy', description: 'How I think about building secure systems.', nextSteps: 'philosophy' },
          { id: 'the-journey', icon: '📖', label: 'How I got here', description: 'From IT Director to running production LLMs.', nextSteps: 'story' },
        ],
      },
    ],
    branches: {
      projects: [
        { type: 'narration', message: 'Every one of these is live and handling real users. No demos, no prototypes.' },
        { type: 'section', id: 'projects', component: 'projects' },
        {
          type: 'prompt',
          question: 'Want to dig deeper?',
          options: [
            { id: 'my-approach', icon: '🔒', label: 'Building philosophy', description: 'Security-first, done-beats-perfect.', nextSteps: 'philosophy' },
            { id: 'work-together', icon: '🤝', label: 'Work together', description: 'Consulting and build services.', nextSteps: 'consulting-cta' },
          ],
        },
      ],
      philosophy: [
        { type: 'narration', message: 'Twenty years of production incidents distilled into a few core principles.' },
        { type: 'section', id: 'philosophy', component: 'philosophy' },
        {
          type: 'prompt',
          question: 'Where next?',
          options: [
            { id: 'see-projects', icon: '🔨', label: 'See what I\'ve built', description: 'Production systems and live apps.', nextSteps: 'projects' },
            { id: 'the-journey', icon: '📖', label: 'The story', description: 'From IT Director to AI builder.', nextSteps: 'story' },
          ],
        },
      ],
      story: [
        { type: 'narration', message: 'The path wasn\'t linear, but every step built on the last.' },
        { type: 'section', id: 'story', component: 'story' },
        {
          type: 'prompt',
          question: 'Anything else?',
          options: [
            { id: 'see-projects', icon: '🔨', label: 'Production systems', description: 'Real apps running on this infra.', nextSteps: 'projects' },
            { id: 'work-together', icon: '🤝', label: 'Let\'s build', description: 'Consulting engagements.', nextSteps: 'consulting-cta' },
          ],
        },
      ],
      'consulting-cta': [
        { type: 'narration', message: 'If you\'ve got a technical problem that needs solving, I\'d like to hear about it.' },
        { type: 'section', id: 'consulting', component: 'consulting' },
      ],
    },
  },

  personal: {
    initial: [
      { type: 'section', id: 'hero', component: 'hero' },
      { type: 'narration', message: 'The short version: twenty years of building, breaking, and fixing things. Here\'s the longer version.' },
      { type: 'section', id: 'story', component: 'story' },
      {
        type: 'prompt',
        question: 'What resonates?',
        options: [
          { id: 'my-approach', icon: '💡', label: 'How I think about building', description: 'The principles that came from all those years.', nextSteps: 'philosophy' },
          { id: 'see-work', icon: '🔨', label: 'See the work', description: 'Projects that put the philosophy into practice.', nextSteps: 'projects' },
          { id: 'the-stack', icon: '⚙️', label: 'The infrastructure', description: 'What\'s actually running behind the scenes.', nextSteps: 'infra' },
        ],
      },
    ],
    branches: {
      philosophy: [
        { type: 'narration', message: 'Every principle here has a story. Most of them involve something breaking at 2 AM.' },
        { type: 'section', id: 'philosophy', component: 'philosophy' },
        {
          type: 'prompt',
          question: 'Curious about more?',
          options: [
            { id: 'see-work', icon: '🔨', label: 'See the work', description: 'Where these principles become products.', nextSteps: 'projects' },
            { id: 'the-stack', icon: '⚙️', label: 'The stack', description: 'Self-hosted AI infrastructure.', nextSteps: 'infra' },
          ],
        },
      ],
      projects: [
        { type: 'narration', message: 'These aren\'t side projects — they\'re live products solving real problems for real people.' },
        { type: 'section', id: 'projects', component: 'projects' },
        {
          type: 'prompt',
          question: 'Where to next?',
          options: [
            { id: 'my-approach', icon: '💡', label: 'Building philosophy', description: 'The thinking behind the work.', nextSteps: 'philosophy' },
            { id: 'get-in-touch', icon: '🤝', label: 'Get in touch', description: 'Let\'s talk about working together.', nextSteps: 'consulting-cta' },
          ],
        },
      ],
      infra: [
        { type: 'narration', message: 'This is where the conviction meets the hardware. Everything local, everything owned.' },
        { type: 'section', id: 'infrastructure', component: 'infrastructure' },
        {
          type: 'prompt',
          question: 'What next?',
          options: [
            { id: 'see-work', icon: '🔨', label: 'See the projects', description: 'What this stack powers.', nextSteps: 'projects' },
            { id: 'get-in-touch', icon: '🤝', label: 'Work together', description: 'Consulting opportunities.', nextSteps: 'consulting-cta' },
          ],
        },
      ],
      'consulting-cta': [
        { type: 'section', id: 'consulting', component: 'consulting' },
      ],
    },
  },

  exploring: {
    initial: [
      { type: 'section', id: 'hero', component: 'hero' },
      { type: 'narration', message: 'Welcome — I\'m Reader, James\'s AI guide. Let me show you around. Where should we start?' },
      {
        type: 'prompt',
        question: 'Pick whatever looks interesting.',
        options: [
          { id: 'see-work', icon: '🔨', label: 'The projects', description: 'Live products and systems James has built.', nextSteps: 'projects' },
          { id: 'the-journey', icon: '📖', label: 'The story', description: 'How James went from IT Director to AI builder.', nextSteps: 'story' },
          { id: 'the-stack', icon: '⚙️', label: 'The infrastructure', description: 'Self-hosted LLMs and the hardware powering this site.', nextSteps: 'infra' },
          { id: 'my-approach', icon: '💡', label: 'Philosophy', description: 'How James thinks about building things.', nextSteps: 'philosophy' },
        ],
      },
    ],
    branches: {
      projects: [
        { type: 'narration', message: 'Each of these is live and handling real users.' },
        { type: 'section', id: 'projects', component: 'projects' },
        {
          type: 'prompt',
          question: 'What catches your eye?',
          options: [
            { id: 'the-stack', icon: '⚙️', label: 'The infrastructure', description: 'What powers all of this.', nextSteps: 'infra' },
            { id: 'the-journey', icon: '📖', label: 'The story', description: 'The person behind the projects.', nextSteps: 'story' },
            { id: 'get-in-touch', icon: '🤝', label: 'Get in touch', description: 'Work with James.', nextSteps: 'consulting-cta' },
          ],
        },
      ],
      story: [
        { type: 'section', id: 'story', component: 'story' },
        {
          type: 'prompt',
          question: 'Where to next?',
          options: [
            { id: 'see-work', icon: '🔨', label: 'The projects', description: 'What all that experience produced.', nextSteps: 'projects' },
            { id: 'my-approach', icon: '💡', label: 'Philosophy', description: 'Principles behind the work.', nextSteps: 'philosophy' },
          ],
        },
      ],
      infra: [
        { type: 'narration', message: 'This is the real deal — no cloud APIs, no third-party inference.' },
        { type: 'section', id: 'infrastructure', component: 'infrastructure' },
        {
          type: 'prompt',
          question: 'Curious about more?',
          options: [
            { id: 'see-work', icon: '🔨', label: 'See the projects', description: 'What this stack powers.', nextSteps: 'projects' },
            { id: 'my-approach', icon: '💡', label: 'Philosophy', description: 'How James thinks about building.', nextSteps: 'philosophy' },
          ],
        },
      ],
      philosophy: [
        { type: 'section', id: 'philosophy', component: 'philosophy' },
        {
          type: 'prompt',
          question: 'Anything else?',
          options: [
            { id: 'see-work', icon: '🔨', label: 'The projects', description: 'See it in practice.', nextSteps: 'projects' },
            { id: 'get-in-touch', icon: '🤝', label: 'Get in touch', description: 'Consulting and collaboration.', nextSteps: 'consulting-cta' },
          ],
        },
      ],
      'consulting-cta': [
        { type: 'section', id: 'consulting', component: 'consulting' },
      ],
    },
  },
  evaluating: {
    initial: [
      { type: 'section', id: 'hero', component: 'hero' },
      { type: 'narration', message: "Paste or upload a job description and I'll give you an honest assessment of whether James is a good fit — no sales pitch, just the truth." },
      {
        type: 'prompt',
        question: 'After the evaluation, want to explore more?',
        options: [
          { id: 'see-work', icon: '🔨', label: 'See the projects', description: 'What James has actually built.', nextSteps: 'projects' },
          { id: 'the-stack', icon: '⚙️', label: 'The infrastructure', description: 'Self-hosted AI and hardware.', nextSteps: 'infra' },
          { id: 'get-in-touch', icon: '🤝', label: 'Get in touch', description: 'Start a conversation.', nextSteps: 'consulting-cta' },
        ],
      },
    ],
    branches: {
      projects: [
        { type: 'section', id: 'projects', component: 'projects' },
        {
          type: 'prompt',
          question: 'What next?',
          options: [
            { id: 'the-stack', icon: '⚙️', label: 'The infrastructure', description: 'What powers all of this.', nextSteps: 'infra' },
            { id: 'get-in-touch', icon: '🤝', label: 'Get in touch', description: 'Work with James.', nextSteps: 'consulting-cta' },
          ],
        },
      ],
      infra: [
        { type: 'section', id: 'infrastructure', component: 'infrastructure' },
        {
          type: 'prompt',
          question: 'Anything else?',
          options: [
            { id: 'see-work', icon: '🔨', label: 'The projects', description: 'What this stack powers.', nextSteps: 'projects' },
            { id: 'get-in-touch', icon: '🤝', label: 'Get in touch', description: 'Consulting and collaboration.', nextSteps: 'consulting-cta' },
          ],
        },
      ],
      'consulting-cta': [
        { type: 'section', id: 'consulting', component: 'consulting' },
      ],
    },
  },
};

// ── Section renderer ───────────────────────────────────

function RenderSection({ componentName, intent }: { componentName: string; intent: Intent }) {
  switch (componentName) {
    case 'hero': return <HeroSection intent={intent} />;
    case 'projects': return <ProjectShowcase intent={intent} />;
    case 'infrastructure': return <InfrastructureSection />;
    case 'story': return <StorySection />;
    case 'philosophy': return <PhilosophySection />;
    case 'consulting': return <ConsultingCTA />;
    default: return null;
  }
}

// ── Main guided experience ─────────────────────────────

export default function GuidedExperience({ intent }: { intent: Intent }) {
  const [revealedSteps, setRevealedSteps] = useState<FlowStep[]>([]);
  const [currentBranch, setCurrentBranch] = useState<string | null>(null);
  const [visitedSections, setVisitedSections] = useState<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);
  const { toggleOpen } = useAgent();

  // Initialize with the flow's initial steps
  useEffect(() => {
    const flow = flows[intent];
    if (flow) {
      setRevealedSteps(flow.initial);
      // Track which sections are in the initial flow
      const sections = new Set<string>();
      flow.initial.forEach(s => {
        if (s.type === 'section') sections.add(s.id);
      });
      setVisitedSections(sections);
    }
  }, [intent]);

  // Scroll to bottom when new steps revealed
  useEffect(() => {
    if (revealedSteps.length > 0) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    }
  }, [revealedSteps.length]);

  const handlePromptSelect = useCallback((optionId: string) => {
    const flow = flows[intent];
    if (!flow) return;

    // Find the selected option to get its nextSteps
    const lastPrompt = revealedSteps.filter(s => s.type === 'prompt').pop() as PromptStep | undefined;
    if (!lastPrompt) return;

    const selected = lastPrompt.options.find(o => o.id === optionId);
    if (!selected) return;

    const branchKey = selected.nextSteps;
    const branchSteps = flow.branches[branchKey];
    if (!branchSteps) return;

    // Filter out sections we've already shown
    const filteredSteps = branchSteps.filter(step => {
      if (step.type === 'section' && visitedSections.has(step.id)) return false;
      return true;
    });

    // Also filter prompt options that lead to already-visited sections
    const processedSteps = filteredSteps.map(step => {
      if (step.type === 'prompt') {
        return {
          ...step,
          options: step.options.filter(opt => {
            const targetBranch = flow.branches[opt.nextSteps];
            if (!targetBranch) return false;
            // Keep option if its branch has at least one unvisited section
            return targetBranch.some(s => s.type !== 'section' || !visitedSections.has(s.id));
          }),
        };
      }
      return step;
    }).filter(step => {
      // Remove empty prompts
      if (step.type === 'prompt' && (step as PromptStep).options.length === 0) return false;
      return true;
    });

    // Update visited sections
    const newVisited = new Set(visitedSections);
    processedSteps.forEach(s => {
      if (s.type === 'section') newVisited.add(s.id);
    });
    setVisitedSections(newVisited);

    // Remove the old prompt and add new steps
    setRevealedSteps(prev => {
      const withoutLastPrompt = [...prev];
      // Find and remove the last prompt
      for (let i = withoutLastPrompt.length - 1; i >= 0; i--) {
        if (withoutLastPrompt[i].type === 'prompt') {
          withoutLastPrompt.splice(i, 1);
          break;
        }
      }
      return [...withoutLastPrompt, ...processedSteps];
    });
    setCurrentBranch(branchKey);
  }, [intent, revealedSteps, visitedSections]);

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="sync">
        {revealedSteps.map((step, index) => {
          const key = `${step.type}-${index}`;

          if (step.type === 'narration') {
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <AgentNarration message={step.message} />
              </motion.div>
            );
          }

          if (step.type === 'section') {
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' as const }}
              >
                <RenderSection componentName={step.component} intent={intent} />
              </motion.div>
            );
          }

          if (step.type === 'prompt') {
            const promptStep = step as PromptStep;
            if (promptStep.options.length === 0) return null;
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <TransitionPrompt
                  question={promptStep.question}
                  options={promptStep.options}
                  onSelect={handlePromptSelect}
                />
              </motion.div>
            );
          }

          return null;
        })}
      </AnimatePresence>

      {/* Scroll anchor */}
      <div ref={bottomRef} className="h-1" />

      {/* Persistent "talk to Reader" mini-prompt at bottom */}
      {revealedSteps.length > 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="max-w-3xl mx-auto px-6 py-8 mb-12"
        >
          <div className="flex items-center gap-3 text-charcoal/40 dark:text-dark-muted/50">
            <div className="h-px flex-1 bg-stone-dark/20 dark:bg-dark-border/20" />
            <button
              onClick={toggleOpen}
              className="font-sans text-xs hover:text-turquoise transition-colors"
            >
              Have a question? Talk to Reader →
            </button>
            <div className="h-px flex-1 bg-stone-dark/20 dark:bg-dark-border/20" />
          </div>
        </motion.div>
      )}
    </div>
  );
}
