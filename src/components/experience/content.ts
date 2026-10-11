// Static copy for the home experience: opening destinations, follow-up paths per world,
// and the human label each world shows in a scene's eyebrow.
import type { Intent } from '@/context/AgentProvider';
import type { WorldName } from '@/components/world';

export const QUESTIONS = {
  edgewood: 'What has James built for the Town of Edgewood?',
  records: "How do Edgewood's records tools connect?",
  localAi: "Where does Edgewood's AI run, and how is it kept private?",
  meridian: 'What is Meridian Money?',
  consulting: 'What can James build for my organization?',
  personal: 'Who is James, and what drives him?',
  smis: 'What is SMIS, and how does it score opportunities?',
  intake: 'How are documents classified when they come in?',
  thisSite: 'How does the agent on this site work?',
  homelab: 'What hardware runs this site?',
  approach: 'How does James approach building software?',
  engagement: 'What does working with James look like?',
} as const;

export interface Destination {
  id: string;
  /** Mono "where" label. */
  where: string;
  /** Serif "what" line. */
  what: string;
  intent: Intent;
  /** Question to ask; omitted for the job-fit destination, which opens the evaluator instead. */
  question?: string;
  /** Destination tint (hover border + where label). */
  tint: string;
}

export const DESTINATIONS: Destination[] = [
  {
    id: 'edgewood',
    where: '35.06° N · Edgewood, NM',
    what: 'A two-person IT shop that builds instead of buys',
    intent: 'exploring',
    question: QUESTIONS.edgewood,
    tint: '#f0a35e',
  },
  {
    id: 'records',
    where: 'Every document, classified',
    what: "How the town's records system connects",
    intent: 'exploring',
    question: QUESTIONS.records,
    tint: '#d9b86c',
  },
  {
    id: 'local-ai',
    where: "The town's two mirrored Sparks",
    what: "Where Edgewood's AI runs",
    intent: 'technical',
    question: QUESTIONS.localAi,
    tint: '#2fcfb4',
  },
  {
    id: 'meridian',
    where: '$5 / month',
    what: 'Meridian: envelope budgeting, AI-optional',
    intent: 'exploring',
    question: QUESTIONS.meridian,
    tint: '#5ccf7e',
  },
  {
    id: 'consulting',
    where: 'Your organization',
    what: 'I need something built',
    intent: 'consulting',
    question: QUESTIONS.consulting,
    tint: '#6aa8ff',
  },
  {
    id: 'fit',
    where: 'Role vs. résumé',
    what: 'Evaluate a job fit',
    intent: 'evaluating',
    tint: '#c79bff',
  },
  {
    id: 'personal',
    where: 'Twenty years in IT',
    what: 'Learn about James',
    intent: 'personal',
    question: QUESTIONS.personal,
    tint: '#e08a8a',
  },
];

/** Follow-up "paths" offered after an answer, by the scene's world. */
export const PATHS: Record<WorldName, string[]> = {
  constellation: [QUESTIONS.edgewood, QUESTIONS.meridian, QUESTIONS.personal],
  mesa: [QUESTIONS.records, QUESTIONS.localAi, QUESTIONS.approach],
  records: [QUESTIONS.intake, QUESTIONS.localAi, QUESTIONS.edgewood],
  intake: [QUESTIONS.records, QUESTIONS.localAi],
  sparks: [QUESTIONS.intake, QUESTIONS.records, QUESTIONS.homelab],
  homelab: [QUESTIONS.thisSite, QUESTIONS.localAi, QUESTIONS.meridian],
  envelopes: [QUESTIONS.smis, QUESTIONS.edgewood, QUESTIONS.consulting],
  radar: [QUESTIONS.meridian, QUESTIONS.consulting, QUESTIONS.edgewood],
  strata: [QUESTIONS.edgewood, QUESTIONS.approach, QUESTIONS.consulting],
  blueprint: [QUESTIONS.engagement, QUESTIONS.edgewood, QUESTIONS.meridian],
  lattice: [QUESTIONS.localAi, QUESTIONS.approach],
  fit: [QUESTIONS.personal, QUESTIONS.edgewood],
};

/** Short place-name for each world, shown in the scene eyebrow ("You asked · Edgewood, NM"). */
export const WORLD_LABEL: Record<WorldName, string> = {
  constellation: 'Open sky',
  mesa: 'Edgewood, NM',
  records: 'The records',
  intake: 'Intake',
  sparks: "Edgewood's AI",
  homelab: 'Home lab',
  envelopes: 'Meridian Money',
  radar: 'SMIS',
  strata: 'Career',
  blueprint: 'Blueprint',
  lattice: 'Security',
  fit: 'Job fit',
};

export function pathsFor(world: WorldName | undefined, asked: string): string[] {
  const list = PATHS[world ?? 'constellation'] ?? PATHS.constellation;
  const norm = (s: string) => s.trim().toLowerCase();
  return list.filter((q) => norm(q) !== norm(asked)).slice(0, 3);
}
