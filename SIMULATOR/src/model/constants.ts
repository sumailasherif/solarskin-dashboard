// Every fixed number the simulator uses, in ONE place.
// The real numbers come from the project brief. When Milestone 6 (impact module) lands,
// the emission factors and tariffs move to /shared so the backend uses the same values.

/** The pilot site and its sensor kit. */
export const SITE = {
  siteId: 'fergana-pilot-01',
  deviceId: 'ss-kit-001',
  name: 'Fergana pilot block',
  lat: 40.38, // Fergana, Uzbekistan
  lon: 71.78,
  utcOffsetHours: 5, // Asia/Tashkent, no daylight saving
  kwp: 10, // about 10 kWp of modules…
  wallAzimuthDeg: 180, // …on the south wall (0 = north, 90 = east, 180 = south)
} as const;

/** What the simulated kit reports as its firmware. "-sim" so it can never be mistaken for real data. */
export const FIRMWARE_VERSION = '1.0.0-sim';

/**
 * Headline grid emission factor: 0.550 t CO₂/MWh = 0.55 kg CO₂ per kWh.
 * Source: UNFCCC CDM ASB0003, Uzbekistan grid combined margin for wind/solar (2011 data).
 */
export const EMISSION_FACTOR_KG_PER_KWH = 0.55;

/** Sensitivity check: 0.47 t CO₂/MWh (about 473 g CO₂e/kWh, 2023 average grid intensity). */
export const SENSITIVITY_FACTOR_KG_PER_KWH = 0.47;

/** Household tariff from 1 June 2026 (UZS per kWh). */
export const TARIFF = { lowUzsPerKwh: 650, lowLimitKwhPerMonth: 200, highUzsPerKwh: 900 } as const;

/** The dashboard raises an "offline" alert after this long without a reading. */
export const OFFLINE_AFTER_MINUTES = 30;

/** Planning yield from the brief: 800 kWh per kWp per year (about 8,000 kWh/yr for the pilot). */
export const PLANNING_YIELD_KWH_PER_KWP_YEAR = 800;
