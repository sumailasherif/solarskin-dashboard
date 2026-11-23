// Checks the simulated demo data is sensible (it feeds the "Simulated demo" switch).
import { describe, expect, it } from 'vitest';
import { demoSnapshot } from './demoReadings';

// 21 June 2026, 13:00 in Fergana (UTC+5) = 08:00 UTC: a clear summer midday
const SUMMER_MIDDAY = Date.parse('2026-06-21T08:00:00Z');
// 23 November 2026, 02:00 in Fergana: night
const NIGHT = Date.parse('2026-11-22T21:00:00Z');

describe('demoSnapshot', () => {
  it('gives Fergana local time and a point every 5 minutes since midnight', () => {
    const s = demoSnapshot(SUMMER_MIDDAY);
    expect(s.time).toBe('13:00');
    expect(s.series.powerW).toHaveLength(13 * 12 + 1); // 00:00 … 13:00 in 5-minute steps
  });

  it('produces power and a cooler shaded wall on a summer midday', () => {
    const s = demoSnapshot(SUMMER_MIDDAY);
    expect(s.now.powerW).toBeGreaterThan(0);
    expect(s.now.wallShaded).toBeLessThan(s.now.wallReference);
    expect(s.totals.energyKwh).toBeGreaterThan(0);
    expect(s.totals.co2Kg).toBeCloseTo(s.totals.energyKwh * 0.55, 6);
  });

  it('produces no power at night', () => {
    expect(demoSnapshot(NIGHT).now.powerW).toBe(0);
  });
});
