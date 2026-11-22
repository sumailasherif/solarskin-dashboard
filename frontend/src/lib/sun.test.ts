// Checks our simplified sunrise/sunset maths against the full NOAA solar calculator
// for Fergana (40.38° N, 71.78° E, UTC+5). We allow ±5 minutes.
import { describe, expect, it } from 'vitest';
import { ferganaNow, formatHours, sunTimes } from './sun';

const FIVE_MINUTES = 5 / 60;
const hm = (h: number, m: number) => h + m / 60;

describe('sunTimes (Fergana)', () => {
  // [day of year, NOAA sunrise, NOAA sunset]
  const cases: [string, number, number, number][] = [
    ['21 June (longest day)', 172, hm(4, 43), hm(19, 46)],
    ['21 December (shortest day)', 355, hm(7, 32), hm(16, 49)],
    ['20 March (equinox)', 79, hm(6, 16), hm(18, 24)],
    ['22 September (equinox)', 265, hm(6, 0), hm(18, 11)],
  ];

  it.each(cases)('is within 5 minutes of NOAA on %s', (_name, day, sunrise, sunset) => {
    const result = sunTimes(day);
    expect(Math.abs(result.sunrise - sunrise)).toBeLessThan(FIVE_MINUTES);
    expect(Math.abs(result.sunset - sunset)).toBeLessThan(FIVE_MINUTES);
  });
});

describe('ferganaNow', () => {
  it('shifts UTC to Fergana time (UTC+5)', () => {
    // 20:30 UTC on 31 Dec = 01:30 on 1 Jan in Fergana
    const { dayOfYear, hours } = ferganaNow(new Date('2026-12-31T20:30:00Z'));
    expect(dayOfYear).toBe(1);
    expect(hours).toBeCloseTo(1.5);
  });
});

describe('formatHours', () => {
  it('turns decimal hours into HH:MM', () => {
    expect(formatHours(7.25)).toBe('07:15');
    expect(formatHours(17)).toBe('17:00');
  });
});
