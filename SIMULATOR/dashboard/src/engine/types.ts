// The shapes of the data that flows through the simulator.
import type { Weather } from '../../../src/model/fergana';

export type { Weather };

/** One reading, exactly the payload the real kit will POST every minute (see the project brief). */
export type Reading = {
  device_id: string;
  site_id: string;
  ts: string; // UTC, ISO 8601
  pv_power_w: number;
  pv_energy_wh: number; // lifetime counter, kept in the kit's flash memory
  irradiance_wm2: number;
  panel_temp_c: number;
  wall_temp_shaded_c: number;
  wall_temp_reference_c: number;
  ambient_temp_c: number;
  // Diagnostics
  voltage_v: number;
  current_a: number;
  rssi: number | null; // Wi-Fi signal (dBm); null = not connected
  firmware_version: string;
  uptime_s: number;
  reboot_count: number;
};

/** One finished day, as the server would store it. */
export type DaySummary = {
  date: string; // Fergana date, YYYY-MM-DD
  weather: Weather;
  energyKwh: number;
  peakPowerW: number;
  peakIrradiance: number;
  maxCooling: number; // biggest (reference wall − shaded wall) difference, °C
  minutes: number; // how many of the 1,440 minutes have a reading
};

/** A line in the kit's serial monitor. */
export type LogLine = {
  id: number;
  ts: number; // simulated time, UTC ms
  level: 'ok' | 'info' | 'warn' | 'error';
  text: string;
};

/** A notification for the home owner (shown in their app). */
export type OwnerEvent = {
  id: number;
  ts: number;
  tone: 'good' | 'info' | 'warn';
  title: string;
  text: string;
};

/** Everything the 3 screens need, sent from the control room a few times per second. */
export type SimState = {
  nowMs: number; // simulated time, UTC ms
  speed: number; // 60 = one simulated minute per real second
  running: boolean;
  weather: Weather;
  wifi: boolean; // fault switch: is the kit's Wi-Fi working?
  powered: boolean; // fault switch: does the kit have power?
  device: {
    booting: boolean;
    uptimeS: number;
    rebootCount: number;
    queue: number; // readings stored on the kit, waiting for Wi-Fi
    rssi: number | null;
    recent: Reading[]; // the kit's last 60 readings (sent or not)
    lastSentMs: number | null;
  };
  server: {
    date: string; // the Fergana date of `today`
    today: Reading[]; // every reading the server has received for today
    lastContactMs: number | null; // when the server last heard from the kit
    history: DaySummary[]; // earlier days, oldest first
  };
  log: LogLine[];
  events: OwnerEvent[];
};
