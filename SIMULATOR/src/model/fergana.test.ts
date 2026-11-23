// Sanity checks: does the simulated Fergana wall behave like the real world would?
import { describe, expect, it } from 'vitest';
import { PLANNING_YIELD_KWH_PER_KWP_YEAR, SITE } from './constants';
import {
  cloudClearness,
  conditions,
  localMidnightUtc,
  localTime,
  sunPosition,
  typicalWeather,
} from './fergana';

const MINUTE = 60_000;

/**
 * kWh made on one day with a given weather type (or the typical weather for that date).
 * `stepMinutes` > 1 samples fewer moments (faster) and counts each one for that many minutes.
 */
function dayEnergyKwh(date: string, weather = typicalWeather(date), stepMinutes = 1) {
  const start = localMidnightUtc(date);
  let wh = 0;
  for (let m = 0; m < 1440; m += stepMinutes) {
    const t = start + m * MINUTE;
    wh += (conditions(t, cloudClearness(weather, t)).powerW * stepMinutes) / 60;
  }
  return wh / 1000;
}

describe('Fergana model', () => {
  it('converts UTC to Fergana local time (UTC+5)', () => {
    const t = Date.parse('2026-06-21T07:30:00Z');
    expect(localTime(t)).toMatchObject({ date: '2026-06-21', hours: 12.5 });
    expect(localMidnightUtc('2026-06-21')).toBe(Date.parse('2026-06-20T19:00:00Z'));
  });

  it('puts the sun high and roughly south at midday in June', () => {
    const noon = sunPosition(Date.parse('2026-06-21T07:45:00Z')); // 12:45 local ≈ solar noon
    expect(noon.elevationDeg).toBeGreaterThan(70);
    expect(noon.azimuthDeg).toBeGreaterThan(160);
    expect(noon.azimuthDeg).toBeLessThan(220);
  });

  it('makes no power at night', () => {
    const midnight = Date.parse('2026-06-21T19:00:00Z'); // 00:00 local
    expect(conditions(midnight, 1).powerW).toBe(0);
    expect(conditions(midnight, 1).irradiance).toBe(0);
  });

  it('makes more on a clear day than an overcast one', () => {
    expect(dayEnergyKwh('2026-03-21', 'clear')).toBeGreaterThan(
      2 * dayEnergyKwh('2026-03-21', 'overcast'),
    );
  });

  it('keeps the shaded wall cooler than the bare wall on a sunny afternoon', () => {
    const c = conditions(Date.parse('2026-07-15T09:00:00Z'), 1); // 14:00 local
    expect(c.wallReference - c.wallShaded).toBeGreaterThan(3);
  });

  it('lands near the planning yield over a typical year (800 kWh/kWp ± 20 %)', () => {
    let kwh = 0;
    for (let d = 0; d < 365; d++) {
      const date = new Date(Date.UTC(2026, 0, 1 + d)).toISOString().slice(0, 10);
      kwh += dayEnergyKwh(date, typicalWeather(date), 5);
    }
    const perKwp = kwh / SITE.kwp;
    expect(perKwp).toBeGreaterThan(PLANNING_YIELD_KWH_PER_KWP_YEAR * 0.8);
    expect(perKwp).toBeLessThan(PLANNING_YIELD_KWH_PER_KWP_YEAR * 1.2);
  }, 30_000); // a whole year of maths: allow up to 30 s on a slow computer
});
