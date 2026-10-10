'use client';

import { useEffect, useRef, useState } from 'react';
import type { ParsedBlock } from '@/lib/parseAgentMessage';
import { PROJECT_WORLD, type WorldApi } from '@/components/world';
import { ProjectCard, InfraCard, StatCard, PhilosophyCard, CTACard } from '@/components/stage/ContentCards';
import { prefersReducedMotion } from './usePrefersReducedMotion';

/** Delay between asking the world to swarm a card's outline and revealing the card. */
const REVEAL_DELAY_MS = 1100;

interface InlineCardProps {
  block: ParsedBlock;
  /** True when the card appeared during a live stream (swarm + delayed reveal, maybe a world change). */
  live: boolean;
  world: Pick<WorldApi, 'setWorld' | 'swarmTo'>;
}

/**
 * A content-block card rendered in the reading flow, at the position the agent put it.
 * Live cards: switch the world for project blocks, swarm particles to the card's outline,
 * then fade/scale the card in. Cards restored from history simply appear.
 */
export default function InlineCard({ block, live, world }: InlineCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(!live);
  const [expanded, setExpanded] = useState(false);
  const projectId = block.contentType === 'project' ? String(block.props?.projectId ?? '') : '';

  // Run once on mount: the block's identity is fixed for the life of this element.
  const mountRef = useRef({ live, projectId, world });
  useEffect(() => {
    const { live: isLive, projectId: pid, world: w } = mountRef.current;
    if (!isLive) return;
    const target = pid ? PROJECT_WORLD[pid] : undefined;
    if (target) w.setWorld(target);
    const el = ref.current;
    if (prefersReducedMotion() || !el || el.childElementCount === 0) {
      setRevealed(true);
      return;
    }
    w.swarmTo(el);
    const t = window.setTimeout(() => setRevealed(true), REVEAL_DELAY_MS);
    return () => window.clearTimeout(t);
  }, []);

  let card: React.ReactNode = null;
  switch (block.contentType) {
    case 'project':
      card = (
        <ProjectCard projectId={projectId} expanded={expanded} onToggle={() => setExpanded((v) => !v)} />
      );
      break;
    case 'infra':
      card = <InfraCard />;
      break;
    case 'stat':
      card = (
        <StatCard
          value={String(block.props?.value ?? '')}
          label={String(block.props?.label ?? '')}
          context={block.props?.context ? String(block.props.context) : undefined}
        />
      );
      break;
    case 'philosophy':
      card = <PhilosophyCard quote={String(block.props?.quote ?? '')} />;
      break;
    case 'cta':
      card = (
        <CTACard
          headline="Let's build something"
          subtext="Start with a conversation. No commitment, no pitch deck required."
          buttonText="Get in touch"
          email="james@swds.biz"
        />
      );
      break;
    default:
      return null;
  }

  return (
    <div ref={ref} className="exp-card" data-revealed={revealed ? 'true' : 'false'} aria-hidden={revealed ? undefined : true}>
      {card}
    </div>
  );
}
