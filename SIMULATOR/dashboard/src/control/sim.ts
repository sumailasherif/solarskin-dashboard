// The ONE running simulation, plus the loop that moves it forward and tells the screens.
// Kept outside the React components so it is created only once.
import { useEffect, useState } from 'react';
import { startBroadcasting } from '../engine/channel';
import { SimEngine } from '../engine/engine';

export const engine = new SimEngine(Date.now(), 'clear');
const broadcaster = startBroadcasting(() => engine.state);

const TICK_MS = 100; // move the simulation forward 10 times per second
const SEND_MS = 250; // update the screens 4 times per second

/**
 * Runs the simulation loop and returns a fresh copy of the state for the control panel,
 * plus `refresh()` to call right after you press a control (so the screens react at once).
 */
export function useSimulation() {
  const [snapshot, setSnapshot] = useState(() => ({ ...engine.state }));

  useEffect(() => {
    let last = performance.now();
    let lastSend = 0;
    const id = setInterval(() => {
      const now = performance.now();
      engine.advance(now - last);
      last = now;
      if (now - lastSend >= SEND_MS) {
        lastSend = now;
        broadcaster.send();
        setSnapshot({ ...engine.state });
      }
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);

  const refresh = () => {
    broadcaster.send();
    setSnapshot({ ...engine.state });
  };
  return { state: snapshot, refresh };
}
