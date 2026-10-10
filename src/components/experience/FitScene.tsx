'use client';

import { forwardRef } from 'react';
import JobEvaluator from '@/components/agent/JobEvaluator';

/** "Evaluate a job fit": a scene hosting the existing evaluator (it streams from /api/agent/evaluate itself). */
const FitScene = forwardRef<HTMLElement, { isLast: boolean }>(function FitScene({ isLast }, ref) {
  return (
    <section
      ref={ref}
      id="scene-fit"
      className={`exp-scene exp-scene--fit${isLast ? ' exp-scene--last' : ''}`}
      data-world="fit"
      aria-labelledby="exp-fit-h"
    >
      <p className="exp-eyebrow">You asked · Job fit</p>
      <h2 id="exp-fit-h" className="exp-headline" data-size="lg">
        Would James fit this role?
      </h2>
      <p className="exp-lede">
        Paste a job description or upload one. Reader compares it against James&apos;s actual work and
        gives an honest read, gaps included.
      </p>
      <div className="exp-fit">
        <JobEvaluator />
      </div>
    </section>
  );
});

export default FitScene;
