'use client';

import { forwardRef } from 'react';
import type { Message } from '@/context/AgentProvider';
import type { WorldApi } from '@/components/world';
import Answer from './Answer';
import { WORLD_LABEL, pathsFor } from './content';

interface SceneProps {
  id: string;
  /** The visitor's question (null for an agent message with no question, e.g. an old welcome). */
  question: string | null;
  answer: Message | undefined;
  /** This scene's answer is streaming right now. */
  live: boolean;
  /** Paths and retry only make sense on the newest scene. */
  isLast: boolean;
  busy: boolean;
  onAsk: (question: string) => void;
  onRetry: (question: string) => void;
  worldApi: Pick<WorldApi, 'setWorld' | 'swarmTo' | 'setFocus'>;
}

function headlineSize(q: string): 'lg' | 'md' | 'sm' {
  if (q.length > 140) return 'sm';
  if (q.length > 70) return 'md';
  return 'lg';
}

/** One exchange, laid out as a scene: eyebrow, question as headline, trace, answer, paths. */
const Scene = forwardRef<HTMLElement, SceneProps>(function Scene(
  { id, question, answer, live, isLast, busy, onAsk, onRetry, worldApi },
  ref,
) {
  const world = answer?.world;
  const content = answer?.content ?? '';
  // An empty, finished answer means the stream was cut off (e.g. the page reloaded mid-answer).
  const error = answer?.error ?? (!live && !content ? 'The answer was interrupted before it arrived.' : undefined);
  const showAnswer = !!content && content !== error;
  const done = !live;

  let trace: string;
  if (live && !content) trace = 'retrieving';
  else if (live) trace = `${world ?? 'reader'} · streaming`;
  else if (error) trace = 'interrupted';
  else trace = 'answered on local hardware';

  const headingId = `scene-h-${id}`;
  const paths = done && !error && question ? pathsFor(world, question) : [];

  return (
    <section
      ref={ref}
      id={`scene-${id}`}
      className={`exp-scene${isLast ? ' exp-scene--last' : ''}`}
      data-world={world}
      aria-labelledby={question ? headingId : undefined}
      aria-busy={live || undefined}
    >
      <p className="exp-eyebrow">
        {question ? 'You asked' : 'Reader'}
        {world && <> · {WORLD_LABEL[world]}</>}
      </p>
      {question && (
        <h2 id={headingId} className="exp-headline" data-size={headlineSize(question)}>
          {question}
        </h2>
      )}
      <p className="exp-trace">
        <span>{trace}</span>
      </p>

      {(showAnswer || live) && (
        <Answer content={showAnswer ? content : ''} world={world} streaming={live} worldApi={worldApi} />
      )}

      {error && !live && (
        <div className="exp-error" role="status">
          <p className="exp-error-lead">That answer didn&apos;t make it all the way here.</p>
          <p className="exp-error-detail">{error}</p>
          {question && (
            <button type="button" className="exp-btn" onClick={() => onRetry(question)} disabled={busy}>
              Retry
            </button>
          )}
        </div>
      )}

      {isLast && paths.length > 0 && (
        <nav className="exp-paths" aria-label="Where to next">
          {paths.map((p) => (
            <button key={p} type="button" className="exp-path" onClick={() => onAsk(p)} disabled={busy}>
              {p}
            </button>
          ))}
        </nav>
      )}
      <div className="exp-scene-end" aria-hidden="true" />
    </section>
  );
});

export default Scene;
