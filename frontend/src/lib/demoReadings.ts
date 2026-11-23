// Simulated readings for the "Simulated demo" switch in the Readings section.
//
// It uses the SAME Fergana model as the simulator (SIMULATOR/src/model), read-only, so the
// website demo and the simulator always show the same numbers for the same moment.
// If that model moves to /shared later, only the two imports below need to change.
//
// These numbers are NOT measurements. The UI labels every one of them "Simulated".
import {
  cloudClearness,
  conditions,
  localMidnightUtc,
  localTime,
  typicalWeather,
} from '@solarskin/simulator/src/model/fergana';
import { EMISSION_FACTOR_KG_PER_KWH } from '@solarskin/simulator/src/model/constants';

/** What the sensor kit reports at one moment. */
export type Reading = {
  powerW: number; // AC power of the whole array
  irradiance: number; // W/m² on the wall
  panel: number; // °C, back of a module
  wallShaded: number; // °C, wall behind the modules
  wallReference: number; // °C, bare wall of the same building
  ambient: number; // °C, air
  voltageV: number; // DC string voltage
  currentA: number; // DC string current
};

export type ReadingKey = keyof Reading;

export type DemoSnapshot = {
  now: Reading;
  /** Fergana local time of "now", e.g. "14:35" */
  time: string;
  /** Today's values from local midnight until now, one point every 5 minutes */
  series: Record<ReadingKey, number[]>;
  /** Today's totals for the four summary cards */
  totals: { energyKwh: number; co2Kg: number; coolingC: number; peakIrradiance: number };
};

const STEP_MS = 5 * 60_000;
const KEYS: ReadingKey[] = [
  'powerW',
  'irradiance',
  'panel',
  'wallShaded',
  'wallReference',
  'ambient',
  'voltageV',
  'currentA',
];

/** Today's simulated day in Fergana, up to the moment `nowMs`. */
export function demoSnapshot(nowMs: number = Date.now()): DemoSnapshot {
  const { date, hours } = localTime(nowMs);
  const weather = typicalWeather(date);
  const readingAt = (t: number): Reading => conditions(t, cloudClearness(weather, t));

  const series = Object.fromEntries(KEYS.map((k) => [k, [] as number[]])) as DemoSnapshot['series'];
  let energyWh = 0;
  let peakIrradiance = 0;

  for (let t = localMidnightUtc(date); t <= nowMs; t += STEP_MS) {
    const r = readingAt(t);
    for (const k of KEYS) series[k].push(r[k]);
    energyWh += (r.powerW * STEP_MS) / 3_600_000; // power × time = energy
    peakIrradiance = Math.max(peakIrradiance, r.irradiance);
  }

  const now = readingAt(nowMs);
  const energyKwh = energyWh / 1000;
  const hh = String(Math.floor(hours)).padStart(2, '0');
  const mm = String(Math.floor((hours % 1) * 60)).padStart(2, '0');

  return {
    now,
    time: `${hh}:${mm}`,
    series,
    totals: {
      energyKwh,
      co2Kg: energyKwh * EMISSION_FACTOR_KG_PER_KWH,
      coolingC: now.wallReference - now.wallShaded,
      peakIrradiance,
    },
  };
}
