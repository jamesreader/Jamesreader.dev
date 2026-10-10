'use client';
// React wrapper for the world engine.
// - <WorldProvider> owns world state, route defaults (world + intensity), the [data-world] scroll
//   observer, and theme tracking (the `dark` class on <html>).
// - <WorldCanvas/> is rendered once in the root layout, fixed behind all content; it creates the engine.
// - useWorld() returns the WorldApi contract (see types.ts).
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { createEngine, type Engine } from './engine';
import { isWorldName, type WorldApi, type WorldName } from './types';
import type { Theme } from './palettes';

/** Explicit setWorld() calls win over the [data-world] observer (and route defaults) for this long. */
const EXPLICIT_LOCK_MS = 1500;
/** Canvas opacity off the home page, so content stays readable. */
const AMBIENT_INTENSITY = 0.35;

/** Default world per route (null keeps the current world). */
export function routeWorld(pathname: string | null): WorldName | null {
  const p = pathname ?? '/';
  if (p === '/') return 'constellation';
  if (p === '/about') return 'strata';
  if (p === '/work') return 'constellation';
  if (p === '/blog') return 'records';
  if (p.startsWith('/blog/')) return 'constellation';
  if (p === '/changelog') return 'blueprint';
  return null; // '/lab' (the gallery picks) and anything else
}

export function routeIntensity(pathname: string | null): number {
  return (pathname ?? '/') === '/' ? 1 : AMBIENT_INTENSITY;
}

const readTheme = (): Theme => (document.documentElement.classList.contains('dark') ? 'dark' : 'light');

interface Internal {
  attach: (canvas: HTMLCanvasElement) => () => void;
}

const ApiCtx = createContext<WorldApi | null>(null);
const InternalCtx = createContext<Internal | null>(null);

export function WorldProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const initialWorld = useRef<WorldName>(routeWorld(pathname) ?? 'constellation');
  const [world, setWorldState] = useState<WorldName>(initialWorld.current);
  const [intensityOverride, setIntensityOverride] = useState<number | null>(null);

  const engineRef = useRef<Engine | null>(null);
  // Desired state, applied to the engine whenever it (re)attaches.
  const desired = useRef({ world: initialWorld.current, focus: null as string | null, intensity: routeIntensity(pathname) });
  const lockUntil = useRef(0);

  const applyWorld = useCallback((name: WorldName, explicit: boolean) => {
    if (!isWorldName(name)) return;
    if (explicit) lockUntil.current = performance.now() + EXPLICIT_LOCK_MS;
    desired.current.world = name;
    engineRef.current?.setWorld(name);
    setWorldState(name);
  }, []);

  const setWorld = useCallback((name: WorldName) => applyWorld(name, true), [applyWorld]);
  const setFocus = useCallback((tag: string | null) => {
    desired.current.focus = tag;
    engineRef.current?.setFocus(tag);
  }, []);
  const swarmTo = useCallback((el: HTMLElement) => engineRef.current?.swarmTo(el), []);
  const pulse = useCallback(() => engineRef.current?.pulse(), []);
  const setIntensity = useCallback((v: number | null) => setIntensityOverride(v), []);

  // Route defaults: ambient intensity off the home page; per-route default world. Runs after child
  // effects, so a page that called setWorld() on mount keeps its world (explicit lock).
  const intensity = intensityOverride ?? routeIntensity(pathname);
  useEffect(() => {
    desired.current.intensity = intensity;
    engineRef.current?.setIntensity(intensity);
  }, [intensity]);
  useEffect(() => {
    const w = routeWorld(pathname);
    if (w && performance.now() > lockUntil.current) applyWorld(w, false);
  }, [pathname, applyWorld]);

  // [data-world] elements drive the world as they cross the middle of the viewport.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const name = e.target.getAttribute('data-world');
          if (isWorldName(name) && performance.now() > lockUntil.current) applyWorld(name, false);
        }
      },
      { rootMargin: '-40% 0px -40% 0px' },
    );
    const observeTree = (node: Node) => {
      if (!(node instanceof Element)) return;
      if (node.hasAttribute('data-world')) io.observe(node);
      node.querySelectorAll('[data-world]').forEach((el) => io.observe(el));
    };
    const unobserveTree = (node: Node) => {
      if (!(node instanceof Element)) return;
      if (node.hasAttribute('data-world')) io.unobserve(node);
      node.querySelectorAll('[data-world]').forEach((el) => io.unobserve(el));
    };
    observeTree(document.body);
    const mo = new MutationObserver((muts) => {
      for (const m of muts) {
        if (m.type === 'attributes') {
          const el = m.target as Element;
          io.unobserve(el);
          if (el.hasAttribute('data-world')) io.observe(el); // re-observe: reports the current state again
        } else {
          m.removedNodes.forEach(unobserveTree);
          m.addedNodes.forEach(observeTree);
        }
      }
    });
    mo.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-world'] });
    return () => {
      mo.disconnect();
      io.disconnect();
    };
  }, [applyWorld]);

  // Theme: follow the `dark` class on <html>.
  useEffect(() => {
    const root = document.documentElement;
    const mo = new MutationObserver(() => engineRef.current?.setTheme(readTheme()));
    mo.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, []);

  const internal = useMemo<Internal>(
    () => ({
      attach(canvas) {
        const d = desired.current;
        const engine = createEngine(canvas, { world: d.world, theme: readTheme(), intensity: d.intensity });
        if (d.focus) engine.setFocus(d.focus);
        engineRef.current = engine;
        if (process.env.NODE_ENV !== 'production') (window as unknown as { __world?: Engine }).__world = engine;
        return () => {
          engine.destroy();
          if (engineRef.current === engine) engineRef.current = null;
        };
      },
    }),
    [],
  );

  const api = useMemo<WorldApi>(
    () => ({ world, setWorld, setFocus, swarmTo, pulse, intensity, setIntensity }),
    [world, setWorld, setFocus, swarmTo, pulse, intensity, setIntensity],
  );

  return (
    <InternalCtx.Provider value={internal}>
      <ApiCtx.Provider value={api}>{children}</ApiCtx.Provider>
    </InternalCtx.Provider>
  );
}

export function useWorld(): WorldApi {
  const v = useContext(ApiCtx);
  if (!v) throw new Error('useWorld must be used inside <WorldProvider>');
  return v;
}

/** Fixed full-viewport canvas rendered once in the root layout, behind all content. */
export function WorldCanvas() {
  const internal = useContext(InternalCtx);
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!internal || !ref.current) return;
    return internal.attach(ref.current);
  }, [internal]);
  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      data-world-canvas=""
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        // Large viewport height: mobile URL-bar show/hide doesn't resize (and re-lay out) the world.
        // Browsers without lvh fall back to top/bottom: 0.
        height: '100lvh',
        width: '100%',
        zIndex: -1,
        pointerEvents: 'none',
        display: 'block',
        opacity: 0,
        transition: 'opacity 0.8s ease',
      }}
    />
  );
}
