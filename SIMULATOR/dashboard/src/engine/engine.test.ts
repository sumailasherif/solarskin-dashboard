// Does the simulated kit + server behave like the real system should when things go wrong?
import { describe, expect, it } from 'vitest';
import { localMidnightUtc } from '../../../src/model/fergana';
import { SimEngine } from './engine';

const MINUTE = 60_000;
const at = (date: string, hours: number) => localMidnightUtc(date) + hours * 3_600_000;

/** A fresh engine at 10:00 on 21 June, running at real speed (so advance(ms) = simulated ms). */
function engineAt10() {
  const engine = new SimEngine(at('2026-06-21', 10), 'clear');
  engine.setSpeed(1);
  return engine;
}

describe('SimEngine', () => {
  it('pre-fills today from midnight, one reading per minute', () => {
    const engine = engineAt10();
    expect(engine.state.server.today).toHaveLength(10 * 60 + 1); // 00:00 … 10:00
    expect(engine.state.server.history).toHaveLength(13);
  });

  it('stores readings during a Wi-Fi outage, raises the offline alert, then back-fills with no gaps', () => {
    const engine = engineAt10();
    const before = engine.state.server.today.length;
    engine.wifiOutage(45);

    engine.advance(31 * MINUTE);
    expect(engine.state.server.today).toHaveLength(before); // nothing reached the server
    expect(engine.state.device.queue).toBeGreaterThanOrEqual(30); // …but the kit kept measuring
    expect(engine.state.events.map((e) => e.title)).toContain('Sensor kit offline');

    engine.advance(20 * MINUTE); // Wi-Fi comes back after 45 min
    expect(engine.state.wifi).toBe(true);
    expect(engine.state.device.queue).toBe(0);
    expect(engine.state.server.today).toHaveLength(before + 51); // every minute is there
    expect(engine.state.events.map((e) => e.title)).toContain('Sensor kit back online');
  });

  it('leaves a real gap when the kit has no power, and counts the restart', () => {
    const engine = engineAt10();
    const before = engine.state.server.today.length;
    engine.setPowered(false);
    engine.advance(10 * MINUTE);
    engine.setPowered(true);
    engine.advance(10 * MINUTE);
    // 10 minutes off + 1 skipped while booting = 11 of the 20 minutes missing
    expect(engine.state.server.today).toHaveLength(before + 9);
    expect(engine.state.server.today.at(-1)?.reboot_count).toBe(1);
  });

  it('starts a new day at Fergana midnight and keeps yesterday in the history', () => {
    const engine = new SimEngine(at('2026-06-21', 23.75), 'clear'); // 23:45
    engine.setSpeed(1);
    engine.advance(30 * MINUTE); // → 00:15 on 22 June
    expect(engine.state.server.date).toBe('2026-06-22');
    expect(engine.state.server.today).toHaveLength(16); // 00:00 … 00:15
    expect(engine.state.server.history.at(-1)?.date).toBe('2026-06-21');
    expect(engine.state.server.history.at(-1)?.minutes).toBe(1440);
  });
});
