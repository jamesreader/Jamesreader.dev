'use client';
// /lab world gallery: James's review surface for every world treatment. Not linked from the nav.
import { useEffect, useRef, useState } from 'react';
import { useWorld } from './WorldProvider';
import { FOCUS_TAGS, WORLD_NAMES, type WorldName } from './types';
import { WORLD_META } from './catalog';
import { PALETTES, type Theme } from './palettes';

const AMBIENT = 0.35;
const panel =
  'rounded-xl border border-stone-dark/40 dark:border-dark-border/60 bg-cream/85 dark:bg-dark-bg/80 backdrop-blur-sm';
const mono = "font-['JetBrains_Mono',ui-monospace,monospace] text-[11px] uppercase tracking-[0.12em]";

function useTheme(): Theme {
  const [theme, setTheme] = useState<Theme>('dark');
  useEffect(() => {
    const root = document.documentElement;
    const read = () => setTheme(root.classList.contains('dark') ? 'dark' : 'light');
    read();
    const mo = new MutationObserver(read);
    mo.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, []);
  return theme;
}

export default function WorldGallery() {
  const { world, setWorld, setFocus, swarmTo, pulse, setIntensity } = useWorld();
  const theme = useTheme();
  const [focus, setFocusState] = useState<string | null>(null);
  const [ambient, setAmbient] = useState(false);
  const [cardShown, setCardShown] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);
  const revealTimer = useRef<ReturnType<typeof setTimeout>>();

  // Review at full intensity; restore the route default on the way out.
  useEffect(() => {
    setIntensity?.(ambient ? AMBIENT : 1);
  }, [ambient, setIntensity]);
  useEffect(() => () => setIntensity?.(null), [setIntensity]);
  useEffect(() => () => { setFocus(null); clearTimeout(revealTimer.current); }, [setFocus]);

  const choose = (name: WorldName) => {
    setFocusState(null);
    setFocus(null);
    setWorld(name);
  };
  const toggleFocus = (tag: string) => {
    const next = focus === tag ? null : tag;
    setFocusState(next);
    setFocus(next);
  };
  const runSwarm = () => {
    const el = cardRef.current;
    if (!el) return;
    clearTimeout(revealTimer.current);
    setCardShown(false);
    swarmTo(el);
    revealTimer.current = setTimeout(() => setCardShown(true), 1100);
  };

  const tags = FOCUS_TAGS[world];

  return (
    <div id="page-lab" className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-[46vh] lg:pt-16 pb-24">
        <div className="lg:max-w-[27rem] space-y-5">
          <header className={`${panel} p-5`}>
            <p className={`${mono} mb-2`} style={{ color: 'var(--world-accent, #00B4D8)' }}>
              Lab · world engine
            </p>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-charcoal dark:text-cream mb-2">Worlds</h1>
            <p className="font-sans text-sm text-charcoal/70 dark:text-dark-muted leading-relaxed">
              Every scene the site&apos;s particle field can rebuild itself into. Pick one to watch the left-to-right
              rebuild; toggle a focus tag to light up that part of the world.
            </p>
          </header>

          <section aria-labelledby="worlds-h" className={`${panel} p-3`}>
            <h2 id="worlds-h" className={`${mono} px-2 pt-1 pb-2 text-charcoal/60 dark:text-dark-muted`}>
              {WORLD_NAMES.length} worlds
            </h2>
            <ul className="grid gap-1.5">
              {WORLD_NAMES.map((name) => {
                const pal = PALETTES[name][theme];
                const active = name === world;
                return (
                  <li key={name}>
                    <button
                      type="button"
                      onClick={() => choose(name)}
                      aria-pressed={active}
                      className={`w-full text-left rounded-lg border px-3 py-2.5 transition-colors ${
                        active
                          ? 'bg-white/70 dark:bg-dark-surface/80'
                          : 'border-transparent hover:bg-white/50 dark:hover:bg-dark-surface/50'
                      }`}
                      style={active ? { borderColor: pal.a } : undefined}
                    >
                      <span className="flex items-center gap-2">
                        <span aria-hidden className="inline-flex gap-0.5">
                          <span className="w-2 h-2 rounded-full" style={{ background: pal.a }} />
                          <span className="w-2 h-2 rounded-full" style={{ background: pal.b }} />
                        </span>
                        <span className={`${mono} text-charcoal dark:text-cream`}>{WORLD_META[name].title}</span>
                      </span>
                      <span className="block mt-1 font-sans text-[13px] leading-snug text-charcoal/65 dark:text-dark-muted">
                        {WORLD_META[name].line}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <section aria-labelledby="focus-h" className={`${panel} p-4`}>
            <h2 id="focus-h" className={`${mono} mb-3 text-charcoal/60 dark:text-dark-muted`}>
              Focus tags · {WORLD_META[world].title}
            </h2>
            {tags.length ? (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleFocus(tag)}
                    aria-pressed={focus === tag}
                    className={`${mono} rounded-full border px-3 py-1.5 transition-colors ${
                      focus === tag
                        ? 'text-cream dark:text-dark-bg'
                        : 'text-charcoal/80 dark:text-dark-text border-stone-dark/60 dark:border-dark-border'
                    }`}
                    style={focus === tag ? { background: 'var(--world-accent)', borderColor: 'var(--world-accent)' } : undefined}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            ) : (
              <p className="font-sans text-sm text-charcoal/60 dark:text-dark-muted">This world has no focus tags.</p>
            )}
          </section>

          <section aria-labelledby="ctl-h" className={`${panel} p-4 space-y-3`}>
            <h2 id="ctl-h" className={`${mono} text-charcoal/60 dark:text-dark-muted`}>Controls</h2>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setAmbient((a) => !a)}
                aria-pressed={ambient}
                className={`${mono} rounded-lg border border-stone-dark/60 dark:border-dark-border px-3 py-2 text-charcoal dark:text-dark-text`}
              >
                {ambient ? 'Ambient · 35%' : 'Full · 100%'}
              </button>
              <button
                type="button"
                onClick={pulse}
                className={`${mono} rounded-lg border border-stone-dark/60 dark:border-dark-border px-3 py-2 text-charcoal dark:text-dark-text`}
              >
                Pulse
              </button>
            </div>
            <p className="font-sans text-[13px] leading-snug text-charcoal/60 dark:text-dark-muted">
              Ambient is how every page except home shows the world. Content routes set a default world (about:
              strata, blog: records, changelog: blueprint), and any element with <code className="font-mono">data-world</code>{' '}
              takes over as it crosses the middle of the screen.
            </p>
          </section>

          {/* No panel fill here: the canvas sits behind the page, so the swarm outline must not be covered. */}
          <section aria-labelledby="swarm-h" className="rounded-xl border border-stone-dark/40 dark:border-dark-border/60 p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 id="swarm-h" className={`${mono} text-charcoal/60 dark:text-dark-muted`}>Swarm demo</h2>
              <button
                type="button"
                onClick={runSwarm}
                className={`${mono} rounded-lg px-3 py-2 text-cream dark:text-dark-bg`}
                style={{ background: 'var(--world-accent, #00B4D8)' }}
              >
                Swarm
              </button>
            </div>
            <div
              ref={cardRef}
              className="rounded-xl border p-4 transition-all duration-500"
              style={{
                borderColor: 'color-mix(in srgb, var(--world-accent, #00B4D8) 45%, transparent)',
                opacity: cardShown ? 1 : 0,
                transform: cardShown ? 'none' : 'scale(0.98)',
              }}
            >
              <p className={`${mono} mb-1`} style={{ color: 'var(--world-accent, #00B4D8)' }}>Project</p>
              <p className="font-serif text-xl text-charcoal dark:text-cream leading-tight mb-2">Edgewood internal tools</p>
              <ul className="list-disc pl-5 font-sans text-sm text-charcoal/75 dark:text-dark-text space-y-0.5">
                <li>Onboarding and offboarding across 8 systems</li>
                <li>Equipment tracking with signed forms</li>
                <li>Records portal, IPRA tools, site assistant</li>
              </ul>
            </div>
            <p className="font-sans text-[13px] leading-snug text-charcoal/60 dark:text-dark-muted">
              swarmTo(el) flies particles to outline the card for ~1.2 s, then releases them; the card reveals at 1.1 s.
            </p>
          </section>

          <section className={`${panel} p-4`}>
            <h2 className={`${mono} mb-2 text-charcoal/60 dark:text-dark-muted`}>Light / dark</h2>
            <p className="font-sans text-[13px] leading-snug text-charcoal/70 dark:text-dark-muted">
              Showing the <strong className="font-semibold">{theme}</strong> palette. Every world has a dark palette (on
              navy) and a deeper, more saturated light palette (on cream); flip the theme with the sun/moon in the nav
              to compare. The current world also sets <code className="font-mono">--world-accent</code> and{' '}
              <code className="font-mono">--world-accent-2</code> on the page, which tint this panel. With
              reduced motion on, worlds still change (instantly) and hold still.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
