// The "physics" of the simulator: what a sensor kit on a south wall in Fergana would see
// at any moment. Everything here is a pure function of time (and cloudiness), so the
// visual dashboard and the Milestone 5 script get exactly the same numbers.
//
// The models are simple, well-known textbook formulas, NOT a replacement for real data:
//   sun position   NOAA solar-position equations (accurate to a fraction of a degree)
//   clear sky      Meinel air-mass model for direct sunlight + a fixed share of sky light
//   wall plane     direct light × cos(angle to the wall) + half the sky + ground reflection
//   temperatures   ambient (Fergana seasonal climate) + heating from sunlight
//   power          10 kWp × sunlight × temperature loss × 70 % system efficiency
import { SITE } from './constants';

/**
 * Share of the modules' rated output that reaches the building: inverter, cables, dust and
 * shade from balconies and neighbouring blocks. 0.7 is TUNED so a typical simulated year lands
 * near the brief's planning yield (800 kWh per kWp); the real figure will come from the pilot.
 */
export const SYSTEM_EFFICIENCY = 0.7;

const HOUR = 3_600_000;
const DAY = 86_400_000;
const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;
const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

export type Weather = 'clear' | 'partly' | 'overcast';

/** Fergana local date and time for a UTC moment, e.g. { date: '2026-06-21', dayOfYear: 172, hours: 13.5 } */
export function localTime(utcMs: number) {
  const local = new Date(utcMs + SITE.utcOffsetHours * HOUR);
  const year = local.getUTCFullYear();
  const midnight = Date.UTC(year, local.getUTCMonth(), local.getUTCDate());
  return {
    date: local.toISOString().slice(0, 10),
    dayOfYear: Math.round((midnight - Date.UTC(year, 0, 1)) / DAY) + 1,
    month: local.getUTCMonth(), // 0 = January
    hours: local.getUTCHours() + local.getUTCMinutes() / 60 + local.getUTCSeconds() / 3600,
  };
}

/** The UTC moment of local midnight in Fergana for a 'YYYY-MM-DD' date. */
export function localMidnightUtc(date: string) {
  return Date.parse(`${date}T00:00:00Z`) - SITE.utcOffsetHours * HOUR;
}

/** Where the sun is: elevation above the horizon and compass direction (0 = north, 180 = south). */
export function sunPosition(utcMs: number) {
  const { dayOfYear, hours } = localTime(utcMs);
  // "Fractional year" in radians (NOAA)
  const g = ((2 * Math.PI) / 365) * (dayOfYear - 1 + (hours - 12) / 24);
  const declination =
    0.006918 -
    0.399912 * Math.cos(g) +
    0.070257 * Math.sin(g) -
    0.006758 * Math.cos(2 * g) +
    0.000907 * Math.sin(2 * g) -
    0.002697 * Math.cos(3 * g) +
    0.00148 * Math.sin(3 * g);
  const eqTimeMin =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(g) -
      0.032077 * Math.sin(g) -
      0.014615 * Math.cos(2 * g) -
      0.040849 * Math.sin(2 * g));

  // True solar time → hour angle (0 at solar noon, negative in the morning)
  const solarMinutes = hours * 60 + eqTimeMin + 4 * SITE.lon - 60 * SITE.utcOffsetHours;
  const hourAngle = rad(solarMinutes / 4 - 180);
  const lat = rad(SITE.lat);

  const cosZenith =
    Math.sin(lat) * Math.sin(declination) +
    Math.cos(lat) * Math.cos(declination) * Math.cos(hourAngle);
  const elevationDeg = 90 - deg(Math.acos(clamp(cosZenith, -1, 1)));
  const azimuthDeg =
    (deg(
      Math.atan2(
        Math.sin(hourAngle),
        Math.cos(hourAngle) * Math.sin(lat) - Math.tan(declination) * Math.cos(lat),
      ),
    ) +
      180) %
    360;
  return { elevationDeg, azimuthDeg };
}

/** Sunlight on a cloud-free day: direct beam (DNI) and sky light (DHI), in W/m². */
export function clearSky(elevationDeg: number) {
  if (elevationDeg <= 0) return { dni: 0, dhi: 0 };
  const zenith = 90 - elevationDeg;
  // Air mass: how much atmosphere the light passes through (Kasten & Young)
  const airMass = 1 / (Math.cos(rad(zenith)) + 0.50572 * Math.pow(96.07995 - zenith, -1.6364));
  const dni = 1353 * Math.pow(0.68, Math.pow(airMass, 0.678)); // 0.68: the Fergana valley is often dusty/hazy
  return { dni, dhi: 0.1 * dni };
}

/**
 * Sunlight hitting the wall (W/m²), i.e. what the irradiance sensor in the plane of the modules reads.
 * @param clearness 1 = no clouds, 0 = thick cloud (see cloudClearness)
 */
export function wallIrradiance(utcMs: number, clearness: number) {
  const sun = sunPosition(utcMs);
  const sky = clearSky(sun.elevationDeg);
  if (sky.dni === 0) return 0;
  const beam = sky.dni * clearness; // direct light that gets through the clouds
  const diffuse = sky.dhi + sky.dni * (1 - clearness) * 0.12; // clouds scatter a little of the blocked light
  const ghi = beam * Math.sin(rad(sun.elevationDeg)) + diffuse; // light on flat ground
  // A vertical wall only gets the beam when the sun is in front of it
  const cosIncidence =
    Math.cos(rad(sun.elevationDeg)) * Math.cos(rad(sun.azimuthDeg - SITE.wallAzimuthDeg));
  const onWall = beam * Math.max(0, cosIncidence) + diffuse * 0.5 + ghi * 0.2 * 0.5; // 0.2 = ground albedo
  return Math.max(0, onWall);
}

/** Air temperature in Fergana (°C): about -1 °C in mid-January, 28 °C in mid-July (monthly means). */
export function ambientTemp(utcMs: number, clearness: number) {
  const { dayOfYear, hours } = localTime(utcMs);
  const season = -Math.cos((2 * Math.PI * (dayOfYear - 15)) / 365); // -1 mid-Jan … +1 mid-Jul
  const mean = 13.5 + 14.5 * season;
  const dailySwing = (7 + 2 * season) * (0.5 + 0.5 * clearness); // clouds flatten the day/night swing
  return mean + dailySwing * Math.cos((2 * Math.PI * (hours - 15)) / 24); // warmest about 15:00
}

/** Everything the kit measures at one moment, before sensor noise and rounding. */
export type Conditions = {
  irradiance: number; // W/m² on the wall
  ambient: number; // °C
  panel: number; // °C, back of a module
  wallShaded: number; // °C, wall surface behind the modules
  wallReference: number; // °C, bare wall of the same building
  powerW: number; // AC power of the whole 10 kWp array
  voltageV: number; // DC string voltage
  currentA: number; // DC string current
};

export function conditions(utcMs: number, clearness: number): Conditions {
  const irradiance = wallIrradiance(utcMs, clearness);
  const hourAgo = wallIrradiance(utcMs - HOUR, clearness); // walls heat up slowly (thermal lag)
  const ambient = ambientTemp(utcMs, clearness);
  const nightCooling = 1 - Math.min(1, irradiance / 50); // a bare wall loses heat to the night sky

  const panel = ambient + 0.035 * irradiance; // façade modules run hot: little air behind them
  const wallReference = ambient + 0.018 * irradiance + 0.009 * hourAgo - 0.8 * nightCooling;
  // Behind the modules the wall is in the shade (cooler by day) but also covered (a bit warmer at night)
  const wallShaded = ambient + 0.005 * irradiance + 0.003 * hourAgo + 0.4 * nightCooling;

  const tempLoss = 1 - 0.004 * (panel - 25); // modules lose about 0.4 % per °C above 25 °C
  const powerW = irradiance < 8 ? 0 : SITE.kwp * 1000 * (irradiance / 1000) * tempLoss * SYSTEM_EFFICIENCY;
  const voltageV =
    powerW === 0 ? 0 : 380 * (1 - 0.0035 * (panel - 25)) * (0.9 + 0.1 * Math.min(1, irradiance / 200));
  const currentA = voltageV === 0 ? 0 : powerW / voltageV;

  return { irradiance, ambient, panel, wallShaded, wallReference, powerW, voltageV, currentA };
}

// ---------- Clouds ----------

/** A repeatable "random" number 0…1 for whole number n (the same n always gives the same value). */
function hash01(n: number, seed: number) {
  const x = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** Smooth random wobble 0…1 that changes gently over time t (value noise with cosine blending). */
function smoothNoise(t: number, seed: number) {
  const i = Math.floor(t);
  const f = (1 - Math.cos((t - i) * Math.PI)) / 2;
  return hash01(i, seed) * (1 - f) + hash01(i + 1, seed) * f;
}

/** How clear the sky is (1 = cloud-free) at a moment, for a weather type. Repeatable for the same time. */
export function cloudClearness(weather: Weather, utcMs: number, seed = 7) {
  const minute = utcMs / 60_000;
  if (weather === 'clear') return 0.97 - 0.05 * smoothNoise(minute / 90, seed); // a little haze
  if (weather === 'overcast') return 0.12 + 0.18 * smoothNoise(minute / 40, seed);
  // Partly cloudy: clouds drift past, so the sun comes and goes every few minutes
  const n = smoothNoise(minute / 18, seed) * 0.7 + smoothNoise(minute / 5, seed + 1) * 0.3;
  const cover = clamp((n - 0.42) / 0.16, 0, 1);
  return 0.95 - 0.72 * cover;
}

/** Fergana is sunny most of the year, cloudier in winter. Chance of [clear, partly cloudy] per month. */
const MONTH_ODDS: [number, number][] = [
  [0.35, 0.35],
  [0.35, 0.35],
  [0.4, 0.35],
  [0.5, 0.3],
  [0.6, 0.3],
  [0.8, 0.15],
  [0.9, 0.08],
  [0.9, 0.08],
  [0.8, 0.15],
  [0.6, 0.25],
  [0.45, 0.3],
  [0.35, 0.35],
];

/** A typical (repeatable) weather type for a past day, so the history charts look like real Fergana. */
export function typicalWeather(date: string): Weather {
  const [clear, partly] = MONTH_ODDS[Number(date.slice(5, 7)) - 1] ?? [0.6, 0.25];
  const roll = hash01(Number(date.replace(/-/g, '')), 3);
  return roll < clear ? 'clear' : roll < clear + partly ? 'partly' : 'overcast';
}
