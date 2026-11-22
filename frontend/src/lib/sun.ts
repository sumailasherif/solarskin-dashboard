// Sunrise and sunset for Fergana, calculated with the standard astronomy formulas
// (a simplified version of NOAA's method). Accurate to a few minutes, which is
// plenty for drawing "where is the sun now" on the dashboard.

export const FERGANA = { lat: 40.38, lon: 71.78, utcOffsetHours: 5 };

const rad = (deg: number) => (deg * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

export type SunTimes = {
  /** Local clock time as decimal hours, e.g. 7.5 = 07:30. */
  sunrise: number;
  sunset: number;
};

/**
 * Sunrise and sunset (local clock hours) for one day of the year.
 * @param dayOfYear 1 = 1 January, 365 = 31 December
 */
export function sunTimes(dayOfYear: number, place = FERGANA): SunTimes {
  // How far the sun is north/south of the equator today (declination).
  const declination = -23.44 * Math.cos(rad((360 / 365) * (dayOfYear + 10)));

  // "Equation of time": real sun noon drifts up to ±16 minutes during the year.
  const b = rad((360 / 365) * (dayOfYear - 81));
  const eotMinutes = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);

  // When is the sun highest, on the local clock?
  const timeZoneMeridian = place.utcOffsetHours * 15;
  const solarNoon = 12 + (timeZoneMeridian - place.lon) / 15 - eotMinutes / 60;

  // How many degrees the Earth turns between sunrise and noon.
  // -0.833° = the sun's edge touching the horizon, including air refraction.
  const lat = rad(place.lat);
  const dec = rad(declination);
  const cosH =
    (Math.sin(rad(-0.833)) - Math.sin(lat) * Math.sin(dec)) / (Math.cos(lat) * Math.cos(dec));
  const halfDayHours = deg(Math.acos(Math.min(1, Math.max(-1, cosH)))) / 15;

  return { sunrise: solarNoon - halfDayHours, sunset: solarNoon + halfDayHours };
}

/** Today's date and time in Fergana, as { dayOfYear, hours } (hours like 13.25). */
export function ferganaNow(now = new Date(), place = FERGANA) {
  const local = new Date(now.getTime() + place.utcOffsetHours * 3_600_000);
  const startOfYear = Date.UTC(local.getUTCFullYear(), 0, 1);
  const dayOfYear = Math.floor((local.getTime() - startOfYear) / 86_400_000) + 1;
  const hours = local.getUTCHours() + local.getUTCMinutes() / 60;
  return { dayOfYear, hours };
}

/** 7.25 → "07:15" */
export function formatHours(h: number) {
  const totalMinutes = Math.round(h * 60);
  const hh = Math.floor(totalMinutes / 60);
  const mm = totalMinutes % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}
