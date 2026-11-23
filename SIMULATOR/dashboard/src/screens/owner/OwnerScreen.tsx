// SCREEN 3 · The home owner's side: a simple, friendly portal for people who live in the block.
// Plain words instead of sensor names: "your wall made 14 kWh today, worth ≈ 9,100 UZS".
// Everything comes from the same readings as the website (engine/stats.ts), so they agree.
// Monitoring only: the portal shows information and tips, it never switches anything.
import { useEffect, useState, type ReactNode } from 'react';
import { LogoMark } from '@site/components/LogoMark';
import { SITE, TARIFF } from '../../../../src/model/constants';
import { localMidnightUtc, localTime } from '../../../../src/model/fergana';
import {
  co2Kg,
  isOffline,
  lastDays,
  minutesSinceContact,
  todayStats,
  valueUzs,
} from '../../engine/stats';
import type { OwnerEvent, SimState } from '../../engine/types';
import { DayBars, PowerChart } from '../../ui/charts';
import { clock, greeting, longDate, num } from '../../ui/format';

const NAV = [
  ['overview', 'Overview'],
  ['energy', 'Energy'],
  ['wall', 'My wall'],
  ['alerts', 'Notifications'],
] as const;

const TONE: Record<OwnerEvent['tone'], { dot: string; ring: string }> = {
  good: { dot: 'bg-leaf', ring: 'ring-leaf/40' },
  info: { dot: 'bg-forest-700', ring: 'ring-forest-700/20' },
  warn: { dot: 'bg-solar', ring: 'ring-solar/60' },
};

/** New notifications pop up for 5 seconds in the top-right corner. */
function useToasts(events: OwnerEvent[]) {
  const newestId = events.at(-1)?.id ?? 0;
  const [seenId, setSeenId] = useState(newestId);
  const [toasts, setToasts] = useState<OwnerEvent[]>([]);
  // A new event arrived: add it to the toasts (React's "adjust state while rendering" pattern)
  if (newestId !== seenId) {
    setSeenId(newestId);
    const fresh = events.filter((e) => e.id > seenId);
    setToasts((current) => [...current, ...fresh].slice(-3));
  }
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => setToasts((current) => current.slice(1)), 5000);
    return () => clearTimeout(timer);
  }, [toasts]);
  return toasts;
}

export function OwnerScreen({ state }: { state: SimState }) {
  const today = todayStats(state);
  const offline = isOffline(state);
  const silentFor = minutesSinceContact(state);
  const { hours, month } = localTime(state.nowMs);
  const latest = today.latest;
  const sunUp = (latest?.irradiance_wm2 ?? 0) > 10;
  const toasts = useToasts(state.events);

  const monthDays = lastDays(state, 31).filter((d) => Number(d.date.slice(5, 7)) - 1 === month);
  const monthKwh = monthDays.reduce((s, d) => s + d.energyKwh, 0);
  const peakTime =
    today.peak && today.peak.pv_power_w > 0 ? clock(Date.parse(today.peak.ts)) : 'midday';

  return (
    <div className="flex min-h-screen bg-[#f4f1e8] font-sans text-forest-950">
      {/* Sidebar */}
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col bg-forest-950 p-6 text-white">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[#13223a]">
            <LogoMark className="h-5 w-6 text-solar" />
          </span>
          <span className="font-logo text-lg tracking-wide">
            <b>SOLAR</b>
            <span className="text-solar">SKIN</span>
          </span>
        </div>
        <p className="mt-8 text-xs tracking-widest text-white/40 uppercase">My building</p>
        <nav className="mt-3 space-y-1">
          {NAV.map(([id, label], i) => (
            <a
              key={id}
              href={`#${id}`}
              className={`block rounded-xl px-4 py-2.5 text-sm transition ${
                i === 0 ? 'bg-white/10 font-semibold' : 'text-white/70 hover:bg-white/5'
              }`}
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="mt-auto rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
          <p className="text-sm font-semibold">{SITE.name}</p>
          <p className="mt-1 text-xs text-white/50">South wall · {SITE.kwp} kWp of modules</p>
          <p className="mt-3 flex items-center gap-2 text-xs">
            <span className={`h-2 w-2 rounded-full ${offline ? 'bg-solar' : 'bg-leaf'}`} />
            {offline ? 'Sensor kit offline' : 'Everything is working'}
          </p>
        </div>
      </aside>

      <main className="min-w-0 flex-1 space-y-8 p-10">
        {/* Greeting */}
        <header id="overview" className="flex items-end justify-between">
          <div>
            <p className="text-sm text-forest-950/50">{longDate(state.nowMs)} · Fergana</p>
            <h1 className="mt-1 font-display text-3xl">{greeting(hours)}!</h1>
          </div>
          <p
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              offline ? 'bg-solar text-forest-950' : 'bg-leaf/15 text-forest-700'
            }`}
          >
            {offline ? `No data for ${silentFor ?? '–'} min` : `Updated ${clock(state.nowMs)}`}
          </p>
        </header>

        {/* Big "right now" card + 4 tiles */}
        <section className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-6">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-forest-700 to-forest-950 p-8 text-white">
            <div
              aria-hidden
              className={`absolute -top-16 -right-16 h-56 w-56 rounded-full blur-2xl ${sunUp ? 'bg-solar/50' : 'bg-leaf/20'}`}
            />
            <div className="relative">
              <p className="text-sm text-white/60">Right now</p>
              {offline ? (
                <p className="mt-3 max-w-md font-display text-2xl leading-snug">
                  We can’t reach your building’s sensor kit. The SolarSkin team has been alerted.
                </p>
              ) : sunUp && latest ? (
                <p className="mt-3 font-display text-2xl leading-snug">
                  Your wall is making
                  <span className="mt-2 block text-6xl text-solar tabular-nums">
                    {num(latest.pv_power_w / 1000, 2)} kW
                  </span>
                </p>
              ) : (
                <p className="mt-3 max-w-md font-display text-2xl leading-snug">
                  The sun is down. Your wall rests until morning.
                </p>
              )}
              <p className="mt-6 text-sm text-white/70">
                Today so far: <strong className="text-white">{num(today.energyKwh, 1)} kWh</strong>{' '}
                of clean electricity
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Tile label="Energy today" value={num(today.energyKwh, 1)} unit="kWh" />
            <Tile
              label="Worth today"
              value={`≈ ${num(valueUzs(today.energyKwh), 0)}`}
              unit="UZS"
              note={`at ${TARIFF.lowUzsPerKwh} UZS/kWh · estimate`}
            />
            <Tile
              label="Less CO₂ today"
              value={num(co2Kg(today.energyKwh), 1)}
              unit="kg"
              note="kept out of the air"
            />
            <Tile
              label="Wall cooler by"
              value={
                today.coolingNow !== null && today.coolingNow >= 0.5
                  ? num(today.coolingNow, 1)
                  : '–'
              }
              unit="°C"
              note={
                today.coolingNow !== null && today.coolingNow >= 0.5
                  ? 'right now, vs the bare wall'
                  : 'no sun on the wall right now'
              }
            />
          </div>
        </section>

        {/* Energy charts */}
        <section id="energy" className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-6">
          <Card title="Today, hour by hour" subtitle="Power from your wall (kW)">
            <PowerChart
              readings={state.server.today}
              dayStartMs={localMidnightUtc(state.server.date)}
              nowMs={state.nowMs}
              tone="light"
              heightClass="h-44"
            />
          </Card>
          <Card title="This week" subtitle="Energy per day (kWh)">
            <DayBars days={lastDays(state, 7)} tone="light" heightClass="h-44" />
          </Card>
        </section>

        {/* Wall + month + tip */}
        <section id="wall" className="grid grid-cols-3 gap-6">
          <Card title="My wall" subtitle="Temperatures on the outside wall now">
            <div className="space-y-3">
              <Thermo label="Bare wall" value={latest?.wall_temp_reference_c ?? null} hot />
              <Thermo label="Wall behind the modules" value={latest?.wall_temp_shaded_c ?? null} />
              <Thermo label="Air" value={latest?.ambient_temp_c ?? null} />
            </div>
            <p className="mt-4 text-xs text-forest-950/60">
              The modules shade your wall, so less summer heat soaks into the flats. Biggest
              difference today: <strong>{num(today.maxCooling, 1)} °C</strong>.
            </p>
          </Card>
          <Card title="This month" subtitle={`${monthDays.length} days so far`}>
            <p className="font-display text-4xl tabular-nums">
              {num(monthKwh, 0)} <span className="text-lg">kWh</span>
            </p>
            <p className="mt-2 text-sm text-forest-950/70">
              ≈ {num(valueUzs(monthKwh), 0)} UZS of grid electricity replaced and{' '}
              {num(co2Kg(monthKwh), 0)} kg less CO₂.
            </p>
            <p className="mt-4 text-xs text-forest-950/50">
              Money value is an estimate at {TARIFF.lowUzsPerKwh} UZS/kWh (tariff from 1 June 2026).
            </p>
          </Card>
          <div className="rounded-[1.75rem] bg-solar p-6">
            <p className="text-xs font-semibold tracking-widest uppercase">Tip</p>
            <p className="mt-3 font-display text-xl leading-snug">
              Your wall makes the most power around {peakTime}.
            </p>
            <p className="mt-3 text-sm text-forest-950/75">
              That is a good time to run the washing machine or charge phones and laptops, so more
              of the building’s electricity comes from your own wall.
            </p>
          </div>
        </section>

        {/* Notifications */}
        <section id="alerts">
          <Card title="Notifications" subtitle="Messages about your building’s solar wall">
            {state.events.length === 0 ? (
              <p className="text-sm text-forest-950/50">No notifications yet.</p>
            ) : (
              <ul className="divide-y divide-forest-950/10">
                {[...state.events]
                  .reverse()
                  .slice(0, 8)
                  .map((e) => (
                    <li key={e.id} className="flex items-start gap-4 py-3">
                      <span
                        className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${TONE[e.tone].dot}`}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{e.title}</p>
                        <p className="text-sm text-forest-950/60">{e.text}</p>
                      </div>
                      <span className="text-xs text-forest-950/40 tabular-nums">{clock(e.ts)}</span>
                    </li>
                  ))}
              </ul>
            )}
          </Card>
        </section>
      </main>

      {/* Pop-up notifications */}
      <div className="fixed top-6 right-6 z-50 w-80 space-y-3">
        {toasts.map((e) => (
          <div
            key={e.id}
            className={`animate-pop rounded-2xl bg-white/85 p-4 shadow-xl ring-1 backdrop-blur ${TONE[e.tone].ring}`}
          >
            <p className="flex items-center gap-2 text-xs text-forest-950/50">
              <LogoMark className="h-3 w-3.5 text-solar" /> SolarSkin · now
            </p>
            <p className="mt-1 text-sm font-semibold">{e.title}</p>
            <p className="text-xs text-forest-950/60">{e.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[1.75rem] bg-white p-6 shadow-sm ring-1 ring-forest-950/5">
      <h2 className="font-semibold">{title}</h2>
      <p className="mb-5 text-xs text-forest-950/50">{subtitle}</p>
      {children}
    </div>
  );
}

function Tile({
  label,
  value,
  unit,
  note,
}: {
  label: string;
  value: string;
  unit: string;
  note?: string;
}) {
  return (
    <div className="flex flex-col justify-between rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-forest-950/5">
      <p className="text-sm text-forest-950/60">{label}</p>
      <div>
        <p className="mt-3 font-display text-3xl tabular-nums">
          {value} <span className="font-sans text-base font-semibold text-forest-700">{unit}</span>
        </p>
        {note && <p className="mt-1 text-xs text-forest-950/45">{note}</p>}
      </div>
    </div>
  );
}

/** A horizontal "thermometer" bar from -10 °C to 60 °C. */
function Thermo({
  label,
  value,
  hot = false,
}: {
  label: string;
  value: number | null;
  hot?: boolean;
}) {
  const pct = value === null ? 0 : Math.min(100, Math.max(2, ((value + 10) / 70) * 100));
  return (
    <div>
      <p className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-semibold tabular-nums">
          {value === null ? '–' : `${num(value, 1)} °C`}
        </span>
      </p>
      <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-forest-950/10">
        <div
          className={`h-full rounded-full transition-all duration-700 ${hot ? 'bg-[#f08a4b]' : 'bg-leaf'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
