'use client';

import { DESTINATIONS, type Destination } from './content';

interface OpeningSceneProps {
  onDestination: (d: Destination) => void;
  busy: boolean;
}

/** The front door: who's talking, one question, and places to go. */
export default function OpeningScene({ onDestination, busy }: OpeningSceneProps) {
  return (
    <section id="scene-opening" className="exp-scene exp-scene--opening" data-world="constellation" aria-labelledby="exp-opening-h">
      <p className="exp-eyebrow">jamesreader.dev · Reader, James&apos;s AI guide</p>
      <h1 id="exp-opening-h" className="exp-title" tabIndex={-1}>
        Where should we <em>go</em>?
      </h1>
      <p className="exp-lede">
        Ask me anything about James&apos;s work. The world behind this page rebuilds itself around what
        we&apos;re talking about, and every answer becomes part of the page.
      </p>
      <ul className="exp-dests" aria-label="Destinations">
        {DESTINATIONS.map((d) => (
          <li key={d.id}>
            <button
              type="button"
              className="exp-dest"
              style={{ '--d': d.tint } as React.CSSProperties}
              onClick={() => onDestination(d)}
              disabled={busy}
            >
              <span className="exp-dest-where">{d.where}</span>
              <span className="exp-dest-what">{d.what}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
