'use client';

import type { Metadata } from 'next';
import { useEffect, useRef, useState } from 'react';

export default function LabPage() {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 pt-16 md:pt-24 pb-8">
        <p className="font-sans text-xs font-semibold uppercase tracking-widest text-turquoise mb-3">
          Lab
        </p>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-charcoal dark:text-cream mb-4">
          Where creative meets technical
        </h1>
        <p className="font-sans text-lg text-charcoal/70 dark:text-dark-muted max-w-2xl leading-relaxed">
          Experiments, simulations, and side projects that exist because they&apos;re interesting. 
          Not everything needs a business case.
        </p>
      </div>

      {/* Particle Simulation */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="rounded-lg overflow-hidden border border-stone-dark/20 dark:border-dark-border/30 bg-black relative">
          <div className="flex items-center justify-between px-4 py-3 bg-charcoal/5 dark:bg-dark-surface border-b border-stone-dark/20 dark:border-dark-border/30">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                <div className="w-3 h-3 rounded-full bg-green-400/60" />
              </div>
              <span className="font-sans text-xs text-charcoal/40 dark:text-dark-muted">
                particle-simulation.js
              </span>
            </div>
            <span className="font-sans text-xs text-turquoise">
              Three.js / WebGL
            </span>
          </div>

          <div className="relative" style={{ height: '70vh', minHeight: '500px' }}>
            {!loaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-turquoise/30 border-t-turquoise rounded-full animate-spin mx-auto mb-4" />
                  <p className="font-sans text-sm text-white/40">Loading simulation...</p>
                </div>
              </div>
            )}
            <iframe
              src="http://daedalus:8899"
              className="w-full h-full border-0"
              onLoad={() => setLoaded(true)}
              onError={() => setLoaded(true)}
              allow="accelerometer; autoplay"
              title="Particle Simulation"
            />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-dark-surface border border-stone-dark/20 dark:border-dark-border/30 rounded-lg p-6">
            <h3 className="font-serif text-lg font-bold text-charcoal dark:text-cream mb-2">
              About this simulation
            </h3>
            <p className="font-sans text-sm text-charcoal/60 dark:text-dark-muted leading-relaxed">
              An interactive particle system running on an NVIDIA DGX Spark. The simulation is hosted 
              on local infrastructure and may not be accessible from external networks. If the frame 
              above is blank, the simulation server is on a private network.
            </p>
          </div>

          <div className="bg-white dark:bg-dark-surface border border-stone-dark/20 dark:border-dark-border/30 rounded-lg p-6">
            <h3 className="font-serif text-lg font-bold text-charcoal dark:text-cream mb-2">
              More experiments coming
            </h3>
            <p className="font-sans text-sm text-charcoal/60 dark:text-dark-muted leading-relaxed">
              This page is a living space for creative technical work. Neural network visualizations, 
              generative art, interactive data explorations. The lab is always open.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
