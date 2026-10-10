'use client';

import { useWorld, type WorldApi } from '@/components/world';

const NOOP_WORLD: WorldApi = {
  world: 'constellation',
  setWorld: () => {},
  setFocus: () => {},
  swarmTo: () => {},
  pulse: () => {},
};

/**
 * useWorld(), degrading to a no-op world if the page is rendered outside <WorldProvider>
 * (e.g. while the engine is being wired into the root layout). useWorld always calls
 * useContext before throwing, so hook order is stable across renders.
 */
export function useWorldSafe(): WorldApi {
  try {
    return useWorld();
  } catch {
    return NOOP_WORLD;
  }
}
