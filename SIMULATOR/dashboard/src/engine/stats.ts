// Turning raw readings into the numbers people see (energy, CO₂, money, wall cooling).
// The website and the home-owner screen both use these, so they always agree.
import {
  EMISSION_FACTOR_KG_PER_KWH,
  OFFLINE_AFTER_MINUTES,
  SITE,
  TARIFF,
} from '../../../src/model/constants';
import { localMidnightUtc } from '../../../src/model/fergana';
import type { DaySummary, Reading, SimState, Weather } from './types';

const MINUTE = 60_000;

/** kWh from a list of one-minute readings: each reading = that power for one minute. */
export const energyKwh = (readings: Reading[]) =>
  readings.reduce((sum, r) => sum + r.pv_power_w, 0) / 60 / 1000;

/** How much cooler the shaded wall is than the bare reference wall (°C). */
export const cooling = (r: Reading) => r.wall_temp_reference_c - r.wall_temp_shaded_c;

export function summarizeDay(date: string, readings: Reading[], weather: Weather): DaySummary {
  return {
    date,
    weather,
    energyKwh: energyKwh(readings),
    peakPowerW: Math.max(0, ...readings.map((r) => r.pv_power_w)),
    peakIrradiance: Math.max(0, ...readings.map((r) => r.irradiance_wm2)),
    maxCooling: Math.max(0, ...readings.map(cooling)),
    minutes: readings.length,
  };
}

/** Today's headline numbers, straight from the readings the server has. */
export function todayStats(state: SimState) {
  const readings = state.server.today;
  const latest = readings.at(-1) ?? null;
  const peak = readings.reduce<Reading | null>(
    (best, r) => (!best || r.pv_power_w > best.pv_power_w ? r : best),
    null,
  );
  const sinceMidnight = Math.floor((state.nowMs - localMidnightUtc(state.server.date)) / MINUTE);
  return {
    ...summarizeDay(state.server.date, readings, state.weather),
    latest,
    peak,
    coolingNow: latest ? cooling(latest) : null,
    expectedMinutes: Math.min(1440, Math.max(1, sinceMidnight + 1)),
  };
}

/** The last `n` days including today (today is summed live), oldest first. */
export function lastDays(state: SimState, n: number): DaySummary[] {
  const today = summarizeDay(state.server.date, state.server.today, state.weather);
  return [...state.server.history, today].slice(-n);
}

export const co2Kg = (kwh: number, factor = EMISSION_FACTOR_KG_PER_KWH) => kwh * factor;

/** What that electricity would cost from the grid, at the 650 UZS/kWh tariff (an estimate). */
export const valueUzs = (kwh: number) => kwh * TARIFF.lowUzsPerKwh;

/** Minutes since the server last heard from the kit (null = never). */
export function minutesSinceContact(state: SimState) {
  const last = state.server.lastContactMs;
  return last === null ? null : Math.floor((state.nowMs - last) / MINUTE);
}

/** Has the kit been silent for 30 minutes or more? */
export function isOffline(state: SimState) {
  const m = minutesSinceContact(state);
  return m === null || m >= OFFLINE_AFTER_MINUTES;
}

/** Measured yield so far, scaled to a year: kWh per kWp per year (an extrapolation). */
export function annualisedYield(days: DaySummary[]) {
  const full = days.filter((d) => d.minutes > 0);
  if (full.length === 0) return 0;
  const perDay = full.reduce((s, d) => s + d.energyKwh, 0) / full.length;
  return (perDay * 365) / SITE.kwp;
}
