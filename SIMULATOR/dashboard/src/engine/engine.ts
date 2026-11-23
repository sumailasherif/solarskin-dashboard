// The simulation itself. It plays two roles:
//   1. the SENSOR KIT on the wall: takes a reading every simulated minute, stores it when
//      the Wi-Fi is down and uploads the backlog later (like the real ESP32 will);
//   2. the SERVER: receives readings (ignoring duplicates), raises the offline alert after
//      30 minutes of silence and creates notifications for the home owner.
// The numbers come from the Fergana model in SIMULATOR/src/model, plus a little sensor noise.
import { FIRMWARE_VERSION, OFFLINE_AFTER_MINUTES, SITE } from '../../../src/model/constants';
import {
  cloudClearness,
  conditions,
  localMidnightUtc,
  localTime,
  typicalWeather,
} from '../../../src/model/fergana';
import { cooling, summarizeDay } from './stats';
import type { DaySummary, LogLine, OwnerEvent, Reading, SimState, Weather } from './types';

const MINUTE = 60_000;
const DAY = 86_400_000;
const HISTORY_DAYS = 13; // pre-filled past days, so the 7/14-day charts are not empty
const KIT_STORAGE = 2880; // the kit can hold 2 days of readings while offline
const ENERGY_MILESTONES_KWH = [5, 10, 20, 30];

/** A value plus random sensor noise of up to ± spread. */
const jitter = (value: number, spread: number) => value + (Math.random() * 2 - 1) * spread;
const round = (x: number, decimals: number) => Number(x.toFixed(decimals));
const kw = (w: number) => `${(w / 1000).toFixed(2)} kW`;

/** A past day worked out straight from the model (no noise, no gaps). */
function modelDay(date: string, weather: Weather): DaySummary {
  const start = localMidnightUtc(date);
  let wh = 0;
  let peakPowerW = 0;
  let peakIrradiance = 0;
  let maxCooling = 0;
  for (let m = 0; m < 1440; m++) {
    const t = start + m * MINUTE;
    const c = conditions(t, cloudClearness(weather, t));
    wh += c.powerW / 60;
    peakPowerW = Math.max(peakPowerW, c.powerW);
    peakIrradiance = Math.max(peakIrradiance, c.irradiance);
    maxCooling = Math.max(maxCooling, c.wallReference - c.wallShaded);
  }
  return {
    date,
    weather,
    energyKwh: wh / 1000,
    peakPowerW,
    peakIrradiance,
    maxCooling,
    minutes: 1440,
  };
}

export class SimEngine {
  state!: SimState;
  private nextMinute = 0; // the next whole minute when the kit takes a reading
  private queue: Reading[] = []; // readings waiting on the kit for Wi-Fi
  private bootUntil = 0; // the kit is starting up until this time
  private seenTs = new Set<string>(); // server side: readings already stored today (idempotency)
  private todayWh = 0;
  private milestones = new Set<number>();
  private offlineAlerted = false;
  private lastRebootSeen = 0;
  private energyWh = 0; // the kit's lifetime energy counter
  private seed = 1; // cloud pattern for this run
  private wifiBackAt: number | null = null; // a planned outage ends at this time
  private quiet = false; // true while pre-filling: no log lines or notifications
  private ids = 0;

  constructor(startMs: number, weather: Weather = 'clear') {
    this.restart(startMs, weather);
  }

  /** Start over at a moment in time. The day so far (from midnight) is pre-filled quietly. */
  restart(startMs: number, weather: Weather = this.state?.weather ?? 'clear') {
    const start = Math.floor(startMs / MINUTE) * MINUTE;
    const { date } = localTime(start);
    const history: DaySummary[] = [];
    for (let i = HISTORY_DAYS; i >= 1; i--) {
      const day = localTime(localMidnightUtc(date) - i * DAY + 12 * 3_600_000).date;
      history.push(modelDay(day, typicalWeather(day)));
    }

    this.queue = [];
    this.bootUntil = 0;
    this.wifiBackAt = null;
    this.seenTs.clear();
    this.todayWh = 0;
    this.milestones.clear();
    this.offlineAlerted = false;
    this.lastRebootSeen = 0;
    this.energyWh = history.reduce((sum, d) => sum + d.energyKwh * 1000, 0);
    this.seed = Math.floor(Math.random() * 1000);
    this.nextMinute = localMidnightUtc(date);
    this.state = {
      nowMs: this.nextMinute,
      speed: this.state?.speed ?? 60,
      running: this.state?.running ?? true,
      weather,
      wifi: true,
      powered: true,
      device: {
        booting: false,
        uptimeS: 14 * 86_400, // pretend the kit has been running for two weeks
        rebootCount: 0,
        queue: 0,
        rssi: -61,
        recent: [],
        lastSentMs: null,
      },
      server: { date, today: [], lastContactMs: null, history },
      log: [],
      events: [],
    };

    this.quiet = true;
    this.runUntil(start);
    this.quiet = false;
    this.addLog('info', `Simulation started · ${date} · weather: ${weather}`);
  }

  /** Move the simulation forward by `realMs` of real time (× the speed). */
  advance(realMs: number) {
    if (!this.state.running) return;
    const simMs = Math.min(realMs * this.state.speed, DAY); // never jump more than a day at once
    this.runUntil(this.state.nowMs + simMs);
  }

  // ---------- Controls (called by the control room) ----------

  setRunning(running: boolean) {
    this.state.running = running;
  }
  setSpeed(speed: number) {
    this.state.speed = speed;
  }
  setWeather(weather: Weather) {
    this.state.weather = weather;
    this.addLog('info', `Weather changed: ${weather}`);
  }
  setWifi(on: boolean) {
    this.wifiBackAt = null;
    this.state.wifi = on;
    this.state.device.rssi = on ? -61 : null;
    if (on) this.addLog('ok', 'Wi-Fi connected');
    else this.addLog('error', 'Wi-Fi lost · readings will be stored on the kit');
  }
  setPowered(on: boolean) {
    this.state.powered = on;
    if (on) {
      this.addLog('info', 'Power back · booting…');
      this.startBoot();
    } else {
      this.addLog('error', 'Kit lost power · nothing is measured until it comes back');
    }
  }
  /** A test scenario: Wi-Fi drops now and comes back by itself after `minutes` simulated minutes. */
  wifiOutage(minutes: number) {
    this.setWifi(false);
    this.wifiBackAt = this.state.nowMs + minutes * MINUTE;
  }
  reboot() {
    if (!this.state.powered) return;
    this.addLog('warn', 'Rebooting…');
    this.startBoot();
  }

  // ---------- The kit ----------

  private startBoot() {
    const d = this.state.device;
    d.rebootCount += 1;
    d.uptimeS = 0;
    d.booting = true;
    this.bootUntil = this.nextMinute + 1; // skip the next reading while starting up
  }

  private runUntil(target: number) {
    while (this.nextMinute <= target) {
      this.state.nowMs = this.nextMinute;
      this.minute(this.nextMinute);
      this.nextMinute += MINUTE;
    }
    this.state.nowMs = target;
  }

  /** Everything that happens in one simulated minute. */
  private minute(t: number) {
    const s = this.state;
    if (localTime(t).date !== s.server.date) this.newDay(localTime(t).date);
    if (this.wifiBackAt !== null && t >= this.wifiBackAt) this.setWifi(true);
    this.checkOffline(t);
    if (!s.powered) return; // no power: the kit is off and measures nothing (a real gap)

    s.device.uptimeS += 60;
    if (t < this.bootUntil) return;
    if (s.device.booting) {
      s.device.booting = false;
      this.addLog('ok', `Booted · firmware ${FIRMWARE_VERSION} · reboot #${s.device.rebootCount}`);
    }

    const reading = this.measure(t);
    s.device.recent.push(reading);
    if (s.device.recent.length > 60) s.device.recent.shift();

    if (s.wifi) {
      const backlog = this.queue;
      this.queue = [];
      if (backlog.length > 0)
        this.addLog('ok', `Back-filled ${backlog.length} stored readings → 201 Created`);
      this.receive([...backlog, reading], t);
      s.device.lastSentMs = t;
      this.addLog('ok', `POST /api/v1/readings → 201 Created · ${kw(reading.pv_power_w)}`);
    } else {
      this.queue.push(reading);
      if (this.queue.length > KIT_STORAGE) this.queue.shift(); // storage full: oldest dropped
      this.addLog('warn', `No Wi-Fi · reading stored on the kit (${this.queue.length} waiting)`);
    }
    s.device.queue = this.queue.length;
  }

  /** Read all the sensors (model value + a little noise, rounded like the real sensors). */
  private measure(t: number): Reading {
    const s = this.state;
    const c = conditions(t, cloudClearness(s.weather, t, this.seed));
    const powerW = c.powerW === 0 ? 0 : Math.max(0, Math.round(jitter(c.powerW, c.powerW * 0.005)));
    const voltage = c.voltageV === 0 ? 0 : round(jitter(c.voltageV, 0.4), 1);
    this.energyWh += powerW / 60;
    const rssi = s.wifi ? Math.round(jitter(-61, 4)) : null;
    s.device.rssi = rssi;
    return {
      device_id: SITE.deviceId,
      site_id: SITE.siteId,
      ts: new Date(t).toISOString(),
      pv_power_w: powerW,
      pv_energy_wh: Math.round(this.energyWh),
      irradiance_wm2: Math.max(0, Math.round(jitter(c.irradiance, c.irradiance * 0.01))),
      panel_temp_c: round(jitter(c.panel, 0.15), 1),
      wall_temp_shaded_c: round(jitter(c.wallShaded, 0.1), 1),
      wall_temp_reference_c: round(jitter(c.wallReference, 0.1), 1),
      ambient_temp_c: round(jitter(c.ambient, 0.1), 1),
      voltage_v: voltage,
      current_a: voltage === 0 ? 0 : round(powerW / voltage, 2),
      rssi,
      firmware_version: FIRMWARE_VERSION,
      uptime_s: s.device.uptimeS,
      reboot_count: s.device.rebootCount,
    };
  }

  // ---------- The server ----------

  /** Store readings. The same (device_id, ts) twice is stored once (idempotent). */
  private receive(readings: Reading[], t: number) {
    const s = this.state;
    for (const r of readings) {
      const day = localTime(Date.parse(r.ts)).date;
      if (day === s.server.date) {
        if (this.seenTs.has(r.ts)) continue;
        this.seenTs.add(r.ts);
        s.server.today.push(r);
        this.todayWh += r.pv_power_w / 60;
      } else {
        // A late reading from an earlier day: add it to that day's totals
        const past = s.server.history.find((d) => d.date === day);
        if (past) {
          past.energyKwh += r.pv_power_w / 60 / 1000;
          past.minutes = Math.min(1440, past.minutes + 1);
          past.peakPowerW = Math.max(past.peakPowerW, r.pv_power_w);
          past.peakIrradiance = Math.max(past.peakIrradiance, r.irradiance_wm2);
          past.maxCooling = Math.max(past.maxCooling, cooling(r));
        }
      }
      if (r.reboot_count > this.lastRebootSeen) {
        this.lastRebootSeen = r.reboot_count;
        this.addEvent('info', 'Sensor kit restarted', 'It is measuring again. No action needed.');
      }
    }

    if (this.offlineAlerted) {
      this.offlineAlerted = false;
      const n = readings.length;
      this.addEvent(
        'good',
        'Sensor kit back online',
        n > 1 ? `${n} stored readings uploaded. No data lost.` : 'Readings are arriving again.',
      );
    }
    s.server.lastContactMs = t;

    for (const kwh of ENERGY_MILESTONES_KWH) {
      if (this.todayWh / 1000 >= kwh && !this.milestones.has(kwh)) {
        this.milestones.add(kwh);
        this.addEvent(
          'good',
          `Your wall passed ${kwh} kWh today`,
          'Clean electricity from sunlight.',
        );
      }
    }
  }

  private checkOffline(t: number) {
    const last = this.state.server.lastContactMs;
    if (last === null || this.offlineAlerted) return;
    if (t - last >= OFFLINE_AFTER_MINUTES * MINUTE) {
      this.offlineAlerted = true;
      this.addEvent(
        'warn',
        'Sensor kit offline',
        `No reading for ${OFFLINE_AFTER_MINUTES} minutes. The SolarSkin team has been alerted.`,
      );
    }
  }

  /** Local midnight: today's readings become a history day. */
  private newDay(date: string) {
    const s = this.state;
    const done = summarizeDay(s.server.date, s.server.today, s.weather);
    s.server.history = [...s.server.history, done].slice(-29);
    this.addEvent(
      'info',
      `Yesterday: ${done.energyKwh.toFixed(1)} kWh`,
      `Your wall's total for ${done.date}.`,
    );
    s.server.date = date;
    s.server.today = [];
    this.seenTs.clear();
    this.todayWh = 0;
    this.milestones.clear();
  }

  // ---------- Log + notifications ----------

  private addLog(level: LogLine['level'], text: string) {
    if (this.quiet) return;
    const log = this.state.log;
    log.push({ id: ++this.ids, ts: this.state.nowMs, level, text });
    if (log.length > 120) log.shift();
  }

  private addEvent(tone: OwnerEvent['tone'], title: string, text: string) {
    if (this.quiet) return;
    const events = this.state.events;
    events.push({ id: ++this.ids, ts: this.state.nowMs, tone, title, text });
    if (events.length > 40) events.shift();
  }
}
