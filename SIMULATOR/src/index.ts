// Command-line simulator (Milestone 5 will make it POST readings to the ingest API like a real ESP32).
// For now it prints a summary of one simulated day, using the same Fergana model as the
// visual test dashboard (run that with: npm run simulator).
//   npm start -w SIMULATOR                 → today
//   npm start -w SIMULATOR -- 2026-06-21   → any date
import { APP_NAME, DISPLAY_TIMEZONE } from '@solarskin/shared';
import {
  cloudClearness,
  conditions,
  localMidnightUtc,
  localTime,
  typicalWeather,
} from './model/fergana';

const date = process.argv[2] ?? localTime(Date.now()).date;
const weather = typicalWeather(date);
const start = localMidnightUtc(date);

let energyWh = 0;
let peakW = 0;
let maxCooling = 0;
for (let minute = 0; minute < 1440; minute++) {
  const t = start + minute * 60_000;
  const c = conditions(t, cloudClearness(weather, t));
  energyWh += c.powerW / 60; // one minute at this power
  peakW = Math.max(peakW, c.powerW);
  maxCooling = Math.max(maxCooling, c.wallReference - c.wallShaded);
}

console.log(`${APP_NAME} simulator · ${date} (${DISPLAY_TIMEZONE}) · weather: ${weather}`);
console.log(`  energy     ${(energyWh / 1000).toFixed(1)} kWh`);
console.log(`  peak power ${(peakW / 1000).toFixed(2)} kW`);
console.log(`  max wall cooling ${maxCooling.toFixed(1)} °C`);
console.log('  (simulated data, not real readings)');
