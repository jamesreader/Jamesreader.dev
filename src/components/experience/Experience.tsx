'use client';

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAgent, useConversation, type Intent, type Message } from '@/context/AgentProvider';
import type { WorldName } from '@/components/world';
import { useWorldSafe } from './useWorldSafe';
import { prefersReducedMotion } from './usePrefersReducedMotion';
import { inferWorld, INFER_WINDOW } from './inferWorld';
import type { Destination } from './content';
import OpeningScene from './OpeningScene';
import Scene from './Scene';
import FitScene from './FitScene';
import PromptBar from './PromptBar';
import './experience.css';

interface SceneModel {
  id: string;
  question: string | null;
  answer: Message | undefined;
}

/** Pair each question with the answer that follows it. */
function buildScenes(history: Message[]): SceneModel[] {
  const scenes: SceneModel[] = [];
  for (let i = 0; i < history.length; i++) {
    const m = history[i];
    if (m.role === 'user') {
      const next = history[i + 1];
      const answer = next?.role === 'agent' ? next : undefined;
      scenes.push({ id: m.id, question: m.content, answer });
      if (answer) i++;
    } else {
      scenes.push({ id: m.id, question: null, answer: m });
    }
  }
  return scenes;
}

/** Plain text for the screen-reader announcement once an answer completes. */
function toPlainText(md: string): string {
  return md
    .replace(/\{\{?[^{}]*\}?\}/g, ' ')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`#>]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function scrollBehavior(): ScrollBehavior {
  return prefersReducedMotion() ? 'auto' : 'smooth';
}

/** Space kept clear above the pinned prompt when following a streaming answer. */
const PROMPT_CLEARANCE = 112;

/**
 * The home page: the conversation is the page. An opening scene, then one scene per exchange,
 * derived from the persisted conversation history; the world engine behind follows the scenes.
 */
export default function Experience() {
  const agent = useAgent();
  const { conversationHistory: history, isStreaming, intent } = agent;
  const worldApi = useWorldSafe();
  const worldRef = useRef(worldApi);
  worldRef.current = worldApi;

  const onWorld = useCallback((w: WorldName) => worldRef.current.setWorld(w), []);
  const { sendMessage } = useConversation({ onWorld });

  const scenes = useMemo(() => buildScenes(history), [history]);
  const [fitAt, setFitAt] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState('');

  const sceneEls = useRef(new Map<string, HTMLElement>());
  const pendingScroll = useRef<'newest' | 'fit' | null>(null);
  const restored = useRef(false);
  const follow = useRef(false);
  const wasStreaming = useRef(false);

  const fitIsLast = fitAt !== null && fitAt >= scenes.length;
  const lastScene = scenes[scenes.length - 1];
  const liveSceneId = isStreaming && lastScene ? lastScene.id : null;

  const setSceneEl = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      if (el) sceneEls.current.set(id, el);
      else sceneEls.current.delete(id);
    },
    [],
  );

  // ── asking ──────────────────────────────────────────

  const ask = useCallback(
    (question: string, askIntent?: Intent, replaceLast = false) => {
      if (isStreaming || !question.trim()) return;
      const nextIntent: Intent = askIntent ?? intent ?? 'exploring';
      if (nextIntent !== intent) agent.setIntent(nextIntent);
      pendingScroll.current = 'newest';
      restored.current = true;
      follow.current = true;
      worldRef.current.pulse();
      void sendMessage(question, { intent: nextIntent, replaceLast });
    },
    [agent, intent, isStreaming, sendMessage],
  );

  const retry = useCallback(
    (question: string) => {
      const n = history.length;
      const isTrailing =
        n >= 2 && history[n - 2].role === 'user' && history[n - 2].content === question && history[n - 1].role === 'agent';
      ask(question, undefined, isTrailing);
    },
    [ask, history],
  );

  const onDestination = useCallback(
    (d: Destination) => {
      if (d.question) {
        ask(d.question, d.intent);
        return;
      }
      // Job fit: a scene hosting the evaluator, appended after the current conversation.
      agent.setIntent(d.intent);
      restored.current = true;
      worldRef.current.setWorld('fit');
      if (fitAt === null) {
        setFitAt(scenes.length);
        pendingScroll.current = 'fit';
      } else {
        sceneEls.current.get('fit')?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
      }
    },
    [agent, ask, fitAt, scenes.length],
  );

  const startOver = useCallback(() => {
    agent.clearSession();
    setFitAt(null);
    setAnnouncement('');
    follow.current = false;
    worldRef.current.setWorld('constellation');
    window.scrollTo({ top: 0, behavior: scrollBehavior() });
    // The restart button disappears; park focus on the opening headline (no mobile keyboard pop).
    document.getElementById('exp-opening-h')?.focus({ preventScroll: true });
  }, [agent]);

  // ── scrolling ───────────────────────────────────────

  // Our own scroll position handling for this page (reload lands on the last scene instead).
  useEffect(() => {
    if (!('scrollRestoration' in window.history)) return;
    const prev = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    return () => {
      window.history.scrollRestoration = prev;
    };
  }, []);

  // A new scene (or the fit scene) appeared because the visitor asked: bring it into view.
  const newestId = fitIsLast ? 'fit' : lastScene?.id;
  useEffect(() => {
    const want = pendingScroll.current;
    if (!want) return;
    const el = sceneEls.current.get(want === 'fit' ? 'fit' : newestId ?? '');
    if (!el) return;
    pendingScroll.current = null;
    el.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
  }, [newestId, scenes.length]);

  // Restore after a reload / return visit: last scene's world, scrolled into view.
  useEffect(() => {
    if (restored.current) return;
    if (scenes.length === 0) {
      worldRef.current.setWorld('constellation');
      return;
    }
    restored.current = true;
    const last = scenes[scenes.length - 1];
    const w = [...scenes].reverse().find((s) => s.answer?.world)?.answer?.world;
    if (w) worldRef.current.setWorld(w);
    requestAnimationFrame(() => {
      sceneEls.current.get(last.id)?.scrollIntoView({ behavior: 'auto', block: 'start' });
    });
  }, [scenes]);

  // Follow a streaming answer only while the visitor is reading at its end; scrolling up releases it.
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y < lastY - 2) {
        follow.current = false;
      } else if (liveSceneId) {
        const end = sceneEls.current.get(liveSceneId)?.querySelector('.exp-scene-end');
        if (end && end.getBoundingClientRect().bottom <= window.innerHeight - PROMPT_CLEARANCE + 48) {
          follow.current = true;
        }
      }
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [liveSceneId]);

  const liveContent = liveSceneId ? lastScene?.answer?.content : undefined;
  useEffect(() => {
    if (!liveSceneId || !follow.current || pendingScroll.current) return;
    const end = sceneEls.current.get(liveSceneId)?.querySelector('.exp-scene-end');
    if (!end) return;
    const overflow = end.getBoundingClientRect().bottom - (window.innerHeight - PROMPT_CLEARANCE);
    if (overflow > 0) window.scrollBy({ top: overflow, behavior: 'auto' });
  }, [liveSceneId, liveContent]);

  // ── world fallback (backend sent no `world` event) ──

  useEffect(() => {
    const a = lastScene?.answer;
    if (!isStreaming || !a || a.world || a.content.length < INFER_WINDOW) return;
    const w = inferWorld(a.content.slice(0, INFER_WINDOW)) ?? inferWorld(lastScene.question ?? '');
    if (!w) return;
    agent.patchMessage(a.id, { world: w });
    worldRef.current.setWorld(w);
  }, [agent, isStreaming, lastScene]);

  useEffect(() => {
    const justFinished = wasStreaming.current && !isStreaming;
    wasStreaming.current = isStreaming;
    if (isStreaming) return;

    // Backfill worlds for finished answers that never got one (old backend, old history).
    for (const s of scenes) {
      const a = s.answer;
      if (!a || a.world || !a.content || a.error) continue;
      const isNewest = s === lastScene;
      const w =
        inferWorld(a.content.slice(0, INFER_WINDOW)) ??
        inferWorld(s.question ?? '') ??
        (isNewest && justFinished ? worldRef.current.world : 'constellation');
      agent.patchMessage(a.id, { world: w });
      if (isNewest && justFinished) worldRef.current.setWorld(w);
    }

    if (justFinished && lastScene?.answer) {
      const a = lastScene.answer;
      setAnnouncement(a.error ? `Reader couldn't finish: ${a.error}` : `Reader answered: ${toPlainText(a.content)}`);
    }
  }, [agent, isStreaming, scenes, lastScene]);

  // ── render ──────────────────────────────────────────

  const worldForScenes = useMemo(
    () => ({ setWorld: worldApi.setWorld, swarmTo: worldApi.swarmTo, setFocus: worldApi.setFocus }),
    [worldApi.setWorld, worldApi.swarmTo, worldApi.setFocus],
  );

  const fitScene = <FitScene key="fit" ref={setSceneEl('fit')} isLast={fitIsLast} />;

  return (
    <div className="exp">
      <div className="exp-veil" aria-hidden="true" />
      <div className="exp-column">
        <OpeningScene onDestination={onDestination} busy={isStreaming} />

        <div className="exp-scenes">
          {fitAt === 0 && fitScene}
          {scenes.map((s, i) => (
            <Fragment key={s.id}>
              <Scene
                ref={setSceneEl(s.id)}
                id={s.id}
                question={s.question}
                answer={s.answer}
                live={s.id === liveSceneId}
                isLast={i === scenes.length - 1 && !fitIsLast}
                busy={isStreaming}
                onAsk={(q) => ask(q)}
                onRetry={retry}
                worldApi={worldForScenes}
              />
              {fitAt !== null && fitAt > 0 && (fitAt === i + 1 || (i === scenes.length - 1 && fitAt > scenes.length)) && fitScene}
            </Fragment>
          ))}
        </div>

        {(scenes.length > 0 || fitAt !== null) && (
          <div className="exp-restart">
            <button type="button" className="exp-textbtn" onClick={startOver} disabled={isStreaming}>
              ↺ Start over
            </button>
          </div>
        )}

        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {announcement}
        </div>
      </div>

      <PromptBar onAsk={(q) => ask(q)} streaming={isStreaming} />
    </div>
  );
}
