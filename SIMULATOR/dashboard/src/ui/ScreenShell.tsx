// Shared bits for the 3 screens: a "waiting" page and the "simulated data" label.
import type { ReactNode } from 'react';
import { useSimState } from '../engine/channel';
import type { SimState } from '../engine/types';

/** True when this screen is open in its own tab (not inside a MacBook on the control room page). */
const standalone = typeof window !== 'undefined' && window.self === window.top;

/**
 * Wraps a screen: shows a friendly message until the control room sends the first state,
 * then draws the screen with that state.
 */
export function ScreenShell({ children }: { children: (state: SimState) => ReactNode }) {
  const state = useSimState();
  if (!state) {
    return (
      <div className="grid min-h-screen place-items-center bg-forest-950 p-8 text-center">
        <div>
          <p className="font-display text-2xl">Waiting for the simulator…</p>
          <p className="mt-3 text-sm text-white/60">
            Keep the control room page (SolarSkin Simulator) open in another tab. This screen fills
            in as soon as it starts.
          </p>
        </div>
      </div>
    );
  }
  return (
    <>
      {children(state)}
      {standalone && (
        <p className="fixed bottom-4 left-4 z-[100] rounded-full bg-solar px-3 py-1.5 text-xs font-semibold text-forest-950 shadow-lg">
          Simulator · simulated readings
        </p>
      )}
    </>
  );
}
