// The control room: the simulator's main page.
// Top: the controls (time, speed, weather, faults, scenarios).
// Below: three MacBooks: 1 the sensor kit's console, 2 the public website, 3 the home owner's portal.
// Data flows left to right, just like in real life: kit → (Wi-Fi) → server → website + owner app.
import { useState, type ReactNode } from 'react';
import { LogoMark } from '@site/components/LogoMark';
import { localMidnightUtc, localTime } from '../../../src/model/fergana';
import { isOffline, minutesSinceContact, todayStats } from '../engine/stats';
import type { Weather } from '../engine/types';
import { clock, clockSeconds, longDate, num } from '../ui/format';
import { MacBook } from './MacBook';
import { engine, useSimulation } from './sim';

const SPEEDS = [
  [1, 'Real time'],
  [10, '10×'],
  [60, '60× · 1 reading/s'],
  [300, '300×'],
  [1200, '1200×'],
  [3600, '3600× · 1 h/s'],
] as const;

const WEATHER: [Weather, string][] = [
  ['clear', 'Clear'],
  ['partly', 'Partly cloudy'],
  ['overcast', 'Overcast'],
];

type View = 'all' | 'sensor' | 'website' | 'owner';

const SCREENS = [
  {
    id: 'sensor',
    src: '/sensor.html',
    url: '192.168.4.1 · kit console',
    label: '1 · Sensor kit',
    caption: 'What the ESP32 on the wall measures and sends',
  },
  {
    id: 'website',
    src: '/website.html',
    url: 'global-sustainability-challengesola.vercel.app',
    label: '2 · Public website',
    caption: 'The real site, filled with the readings',
  },
  {
    id: 'owner',
    src: '/owner.html',
    url: 'global-sustainability-challengesola.vercel.app/my-home',
    label: '3 · Home owner',
    caption: 'What a resident of the block sees',
  },
] as const;

/** Fergana date + hour → UTC ms */
const fergana = (date: string, hours: number) => localMidnightUtc(date) + hours * 3_600_000;

export function ControlRoom() {
  const { state, refresh } = useSimulation();
  const [view, setView] = useState<View>('all');
  const local = localTime(state.nowMs);
  const [date, setDate] = useState(local.date);
  const [time, setTime] = useState(clock(state.nowMs));
  const today = todayStats(state);
  const offline = isOffline(state);
  const silentFor = minutesSinceContact(state);

  /** Run a control, then update the screens straight away. */
  const act = (fn: () => void) => () => {
    fn();
    refresh();
  };

  const restartAt = (ms: number) => {
    engine.restart(ms);
    setDate(localTime(ms).date);
    setTime(clock(ms));
    refresh();
  };

  const thisYear = local.date.slice(0, 4);
  const presets: [string, () => void][] = [
    ['Now', () => restartAt(Date.now())],
    ['Summer day', () => restartAt(fergana(`${thisYear}-06-21`, 9))],
    ['Winter day', () => restartAt(fergana(`${thisYear}-12-21`, 9))],
    ['Spring sunrise', () => restartAt(fergana(`${thisYear}-03-21`, 5.75))],
    ['Night', () => restartAt(fergana(local.date, 21.5))],
  ];

  const menuClock = `${longDate(state.nowMs).split(',')[0]} ${clock(state.nowMs)}`;

  return (
    <div className="min-h-screen bg-forest-950 text-white">
      <div aria-hidden className="bg-cells pointer-events-none fixed inset-0 opacity-60" />

      {/* Header */}
      <header className="relative border-b border-white/10 px-6 py-5 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-[#13223a]">
              <LogoMark className="h-6 w-7 text-solar" />
            </span>
            <div>
              <h1 className="font-display text-xl">
                SolarSkin <span className="text-solar">Simulator</span>
              </h1>
              <p className="text-xs text-white/50">
                Test the whole system before the pilot is installed · Fergana, Uzbekistan
              </p>
            </div>
            <span className="rounded-full bg-solar px-3 py-1 text-xs font-semibold text-forest-950">
              Simulated data · not real readings
            </span>
          </div>

          <div className="text-right">
            <p className="font-display text-4xl tabular-nums">{clockSeconds(state.nowMs)}</p>
            <p className="text-xs text-white/50">
              {longDate(state.nowMs)} · Fergana (GMT+5) ·{' '}
              {state.running ? `${state.speed}×` : 'paused'}
            </p>
          </div>
        </div>
      </header>

      {/* Controls */}
      <section className="relative flex flex-wrap items-start gap-4 px-6 py-5 lg:px-10">
        <Group title="Time">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={act(() => engine.setRunning(!state.running))}
              className="rounded-full bg-solar px-4 py-2 text-sm font-semibold text-forest-950 transition hover:bg-solar-300"
            >
              {state.running ? 'Pause' : 'Play'}
            </button>
            <Segmented
              options={SPEEDS.map(([value, label]) => [value, label])}
              value={state.speed}
              onChange={(v) => act(() => engine.setSpeed(v))()}
            />
          </div>
        </Group>

        <Group title="Weather">
          <Segmented
            options={WEATHER}
            value={state.weather}
            onChange={(v) => act(() => engine.setWeather(v))()}
          />
        </Group>

        <Group title="Faults">
          <div className="flex flex-wrap items-center gap-3">
            <Toggle
              label="Wi-Fi"
              on={state.wifi}
              onChange={(on) => act(() => engine.setWifi(on))()}
            />
            <Toggle
              label="Kit power"
              on={state.powered}
              onChange={(on) => act(() => engine.setPowered(on))()}
            />
            <SmallButton onClick={act(() => engine.reboot())} disabled={!state.powered}>
              Reboot kit
            </SmallButton>
            <SmallButton onClick={act(() => engine.wifiOutage(45))} disabled={!state.wifi}>
              Wi-Fi outage, 45 min
            </SmallButton>
          </div>
        </Group>

        <Group title="Start at">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-full bg-white/10 px-3 py-1.5 text-sm ring-1 ring-white/20 [color-scheme:dark]"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="rounded-full bg-white/10 px-3 py-1.5 text-sm ring-1 ring-white/20 [color-scheme:dark]"
            />
            <SmallButton
              onClick={() => {
                const [h = 0, m = 0] = time.split(':').map(Number);
                if (date) restartAt(fergana(date, h + m / 60));
              }}
            >
              Restart here
            </SmallButton>
            <span className="mx-1 h-5 w-px bg-white/15" />
            {presets.map(([label, run]) => (
              <SmallButton key={label} onClick={run}>
                {label}
              </SmallButton>
            ))}
          </div>
        </Group>
      </section>

      {/* Data flow: what is happening between the screens */}
      <section className="relative flex flex-wrap items-center gap-x-3 gap-y-2 px-6 pb-2 text-xs lg:px-10">
        <Node
          on={state.powered}
          label={
            state.powered
              ? state.device.booting
                ? 'Kit booting'
                : 'Kit measuring'
              : 'Kit: no power'
          }
        />
        <Link
          ok={state.powered && state.wifi}
          text={
            !state.powered
              ? 'nothing measured'
              : state.wifi
                ? 'POST every minute'
                : `no Wi-Fi · ${state.device.queue} stored on kit`
          }
        />
        <Node
          on={!offline}
          label={offline ? `Server: offline alert (${silentFor ?? '–'} min)` : 'Server receiving'}
        />
        <Link ok text="reads" />
        <Node
          on
          label={`Website + owner app · today ${num(today.energyKwh, 1)} kWh · ${today.minutes}/${today.expectedMinutes} readings`}
        />

        <div className="ml-auto flex gap-1 rounded-full bg-white/10 p-1 ring-1 ring-white/15">
          {(
            [
              ['all', 'All three'],
              ['sensor', 'Sensor kit'],
              ['website', 'Website'],
              ['owner', 'Home owner'],
            ] as [View, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setView(id)}
              className={`rounded-full px-4 py-1.5 font-semibold transition ${
                view === id ? 'bg-white text-forest-950' : 'text-white/70 hover:bg-white/10'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* The three MacBooks. All stay loaded (just hidden) so switching views is instant. */}
      <main
        className={`relative px-6 pt-8 pb-20 lg:px-10 ${
          view === 'all' ? 'grid items-start gap-x-8 gap-y-14 lg:grid-cols-2 2xl:grid-cols-3' : ''
        }`}
      >
        {SCREENS.map((s) => {
          const visible = view === 'all' || view === s.id;
          const layout =
            view === 'all'
              ? s.id === 'website'
                ? 'lg:order-first lg:col-span-2 lg:mx-auto lg:w-4/5 2xl:order-none 2xl:col-span-1 2xl:w-full'
                : ''
              : 'mx-auto max-w-[1180px]';
          return (
            <div key={s.id} className={`${visible ? '' : 'hidden'} ${layout}`}>
              <MacBook
                src={s.src}
                url={s.url}
                label={s.label}
                caption={s.caption}
                clockText={menuClock}
              />
            </div>
          );
        })}
      </main>
    </div>
  );
}

// ---------- Small building blocks ----------

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/10 backdrop-blur">
      <p className="mb-2 text-[11px] font-semibold tracking-widest text-white/45 uppercase">
        {title}
      </p>
      {children}
    </div>
  );
}

function Segmented<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: readonly (readonly [T, string])[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-full bg-white/10 p-1 ring-1 ring-white/15">
      {options.map(([v, label]) => (
        <button
          key={String(v)}
          type="button"
          aria-pressed={v === value}
          onClick={() => onChange(v)}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
            v === value ? 'bg-white text-forest-950' : 'text-white/75 hover:bg-white/10'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Toggle({
  label,
  on,
  onChange,
}: {
  label: string;
  on: boolean;
  onChange: (on: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="flex items-center gap-2 text-sm"
    >
      <span
        className={`relative h-6 w-11 rounded-full transition ${on ? 'bg-leaf' : 'bg-[#ff7a59]'}`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${
            on ? 'left-6' : 'left-1'
          }`}
        />
      </span>
      {label} <span className="text-white/50">{on ? 'on' : 'off'}</span>
    </button>
  );
}

function SmallButton({
  children,
  onClick,
  disabled = false,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-white/25 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function Node({ on, label }: { on: boolean; label: string }) {
  return (
    <span className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 ring-1 ring-white/10">
      <span className={`h-2 w-2 rounded-full ${on ? 'bg-leaf' : 'bg-[#ff7a59]'}`} />
      {label}
    </span>
  );
}

function Link({ ok, text }: { ok: boolean; text: string }) {
  return (
    <span className={`flex items-center gap-2 ${ok ? 'text-leaf-300' : 'text-[#ff7a59]'}`}>
      <span className="h-px w-6 bg-current" />
      {text}
      <span aria-hidden>→</span>
    </span>
  );
}
