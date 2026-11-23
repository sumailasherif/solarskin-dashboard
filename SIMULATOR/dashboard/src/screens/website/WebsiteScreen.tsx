// SCREEN 2 · The public SolarSkin website, as it will look once real readings arrive.
// The page is built from the website's OWN components (imported from /frontend/src via "@site"),
// in the same order as frontend/src/App.tsx. Only the three data sections are new here:
// Live (power curve), Readings (the KPI cards with values) and Impact (measured totals).
// The hero and Method markup mirror App.tsx: keep them in sync if App.tsx changes.
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CountUp } from '@site/components/CountUp';
import { FaqSection } from '@site/components/FaqSection';
import { HeroScene } from '@site/components/HeroScene';
import { KpiCard } from '@site/components/KpiCard';
import { Marquee } from '@site/components/Marquee';
import { OrbitBadge } from '@site/components/OrbitBadge';
import { PhotoStrip } from '@site/components/PhotoStrip';
import { Reveal } from '@site/components/Reveal';
import { SiteHeader } from '@site/components/SiteHeader';
import { SolarPanelBackdrop } from '@site/components/SolarPanelBackdrop';
import { StorySection } from '@site/components/StorySection';
import { SunPath } from '@site/components/SunPath';
import { SustainabilitySection } from '@site/components/SustainabilitySection';
import { PHOTOS, photoSrcSet, photoUrl } from '@site/content/photos';
import {
  EMISSION_FACTOR_KG_PER_KWH,
  OFFLINE_AFTER_MINUTES,
  PLANNING_YIELD_KWH_PER_KWP_YEAR,
  SENSITIVITY_FACTOR_KG_PER_KWH,
  TARIFF,
} from '../../../../src/model/constants';
import { localMidnightUtc, localTime } from '../../../../src/model/fergana';
import {
  annualisedYield,
  co2Kg,
  isOffline,
  lastDays,
  minutesSinceContact,
  todayStats,
  valueUzs,
} from '../../engine/stats';
import type { SimState } from '../../engine/types';
import { DayBars, PowerChart } from '../../ui/charts';
import { clock, duration, num } from '../../ui/format';

type MethodItem = { h: string; p: string };

export function WebsiteScreen({ state }: { state: SimState }) {
  const { t } = useTranslation();
  const ticker = t('ticker', { returnObjects: true }) as string[];
  const methodItems = t('method.items', { returnObjects: true }) as MethodItem[];

  return (
    <div id="top" className="overflow-x-clip">
      <SiteHeader />
      <main>
        <Hero />
        <Marquee items={ticker} />
        <StorySection />
        <LiveReadings state={state} />
        <Readings state={state} />
        <MeasuredImpact state={state} />
        <PhotoStrip />
        <SustainabilitySection />

        {/* METHOD (mirrors App.tsx) */}
        <section
          id="method"
          className="relative overflow-hidden bg-forest px-4 py-24 sm:px-8 sm:py-32"
        >
          <img
            src={photoUrl(PHOTOS.uzLandscape, 1600)}
            srcSet={photoSrcSet(PHOTOS.uzLandscape)}
            sizes="100vw"
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-forest/95 via-forest/90 to-forest-950/80" />
          <div className="relative mx-auto max-w-7xl">
            <Reveal>
              <h2 className="font-display text-[clamp(1.8rem,5vw,3.75rem)] leading-none font-bold uppercase">
                {t('method.title')}
              </h2>
            </Reveal>
            <ol className="mt-14 grid gap-10 md:grid-cols-3">
              {methodItems.map((item, i) => (
                <li key={item.h}>
                  <Reveal delayMs={i * 150} className="border-t border-white/20 pt-6">
                    <span className="font-display text-sm text-leaf">0{i + 1}</span>
                    <h3 className="mt-4 text-lg font-semibold">{item.h}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/70">{item.p}</p>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <FaqSection />
      </main>
      <footer className="bg-forest-950 px-4 py-10 text-center text-xs text-white/50 sm:px-8">
        <p>{t('footer')}</p>
      </footer>
    </div>
  );
}

/** HERO (mirrors App.tsx) */
function Hero() {
  const { t } = useTranslation();
  return (
    <section className="relative flex min-h-svh items-center overflow-hidden px-4 pt-28 pb-16 sm:px-8">
      <HeroScene className="absolute inset-0 h-full w-full" />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-forest-950/90 via-forest-950/70 to-forest-950/35 lg:from-forest-950/95 lg:via-forest-950/60 lg:to-transparent"
      />
      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="max-w-2xl">
          <p className="mb-6 inline-flex animate-rise items-center gap-2 rounded-full bg-leaf/15 px-4 py-2 text-xs font-semibold text-leaf-300 ring-1 ring-leaf/30 backdrop-blur">
            <span aria-hidden className="h-2 w-2 rounded-full bg-leaf" />
            {t('hero.eyebrow')}
          </p>
          <h1 className="font-display text-[clamp(2.2rem,6.5vw,5.25rem)] leading-[1.02] font-bold uppercase">
            <span className="block animate-rise [animation-delay:120ms]">{t('hero.line1')}</span>
            <span className="block animate-rise text-solar [animation-delay:260ms]">
              {t('hero.line2')}
            </span>
          </h1>
          <p className="mt-6 max-w-lg animate-rise text-base leading-relaxed text-white/80 [animation-delay:400ms] sm:text-lg">
            {t('hero.lead')}
          </p>
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 z-20 hidden -translate-x-1/2 md:block lg:right-auto lg:left-[52%]">
        <OrbitBadge text={t('hero.orbit')} />
      </div>
    </section>
  );
}

const RANGES = [
  ['24h', 1],
  ['7d', 7],
  ['14d', 14],
  ['30d', 30],
] as const;

/** LIVE: the same look as LiveSection.tsx, but with the real (simulated) power curve. */
function LiveReadings({ state }: { state: SimState }) {
  const { t } = useTranslation();
  const [range, setRange] = useState<(typeof RANGES)[number][0]>('24h');
  const { dayOfYear, hours } = localTime(state.nowMs);
  const today = todayStats(state);
  const offline = isOffline(state);
  const silentFor = minutesSinceContact(state);
  const latest = today.latest;
  const days = lastDays(state, RANGES.find(([r]) => r === range)![1]);
  const isDay = (latest?.irradiance_wm2 ?? 0) > 10;

  return (
    <section
      id="live"
      className="relative overflow-hidden bg-gradient-to-b from-forest-950 via-forest to-forest-700 px-4 py-24 sm:px-8 sm:py-32"
    >
      <div
        aria-hidden
        className="bg-cells pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_70%)]"
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute -top-40 -left-40 h-[36rem] w-[36rem] rounded-full blur-3xl ${
          isDay ? 'bg-solar/25' : 'bg-leaf/15'
        }`}
      />

      <div className="relative mx-auto max-w-7xl">
        {/* Offline alert (after 30 minutes without a reading) */}
        {offline && (
          <div
            role="alert"
            className="mb-10 flex items-start gap-4 rounded-2xl bg-solar px-6 py-4 text-forest-950"
          >
            <span className="mt-1 h-3 w-3 shrink-0 animate-pulse rounded-full bg-forest-950" />
            <p className="text-sm">
              <strong>Sensor kit offline.</strong> No reading for{' '}
              {silentFor === null ? 'a while' : `${silentFor} minutes`} (alert after{' '}
              {OFFLINE_AFTER_MINUTES}). The team has been notified. Readings stored on the kit will
              upload when it reconnects, so no data is lost.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-display text-[clamp(1.8rem,5vw,3.75rem)] leading-none uppercase">
              {t('live.title')}
            </h2>
            <p className="mt-4 flex items-center gap-2 text-sm text-white/70">
              <span className="relative flex h-2.5 w-2.5">
                {!offline && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-solar opacity-60" />
                )}
                <span
                  className={`relative inline-flex h-2.5 w-2.5 rounded-full ${offline ? 'bg-white/30' : 'bg-solar'}`}
                />
              </span>
              {offline ? 'Waiting for the kit to reconnect' : t('live.from')}
            </p>
          </div>
          <div
            role="radiogroup"
            aria-label={t('live.title')}
            className="inline-flex w-fit shrink-0 gap-1 rounded-full bg-white/10 p-1 ring-1 ring-white/20 backdrop-blur"
          >
            {RANGES.map(([r]) => (
              <button
                key={r}
                type="button"
                role="radio"
                aria-checked={range === r}
                onClick={() => setRange(r)}
                className={`rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition ${
                  range === r ? 'bg-white text-forest-950' : 'text-white/80 hover:bg-white/10'
                }`}
              >
                {t(`live.ranges.${r}`)}
              </button>
            ))}
          </div>
        </div>

        {/* The giant clock (simulated Fergana time) */}
        <div className="mt-10 flex items-center gap-8">
          <span
            aria-hidden
            className={`h-28 w-28 shrink-0 rounded-full ${
              isDay
                ? 'bg-gradient-to-br from-solar-300 to-solar shadow-[0_0_60px_10px] shadow-solar/40'
                : 'bg-gradient-to-br from-forest-50 to-leaf-300/50 shadow-[0_0_40px_6px] shadow-leaf/20'
            }`}
          />
          <p className="font-display text-[clamp(4.5rem,19vw,14rem)] leading-none tabular-nums">
            {clock(state.nowMs)}
          </p>
        </div>
        <p className="mt-2 text-xs tracking-widest text-white/50 uppercase">
          {t('live.localTime')}
        </p>

        {/* Power right now + sun path */}
        <div className="mt-12 grid items-end gap-8 lg:grid-cols-[1fr_minmax(0,28rem)]">
          <div>
            <p className="text-xs font-semibold tracking-widest text-solar uppercase">
              {t('live.power')}
            </p>
            {latest && !offline ? (
              <>
                <p className="mt-2 font-display text-6xl tabular-nums">
                  {num(latest.pv_power_w / 1000, 2)}
                  <span className="ml-3 font-sans text-xl font-semibold">{t('live.unit')}</span>
                </p>
                <p className="mt-3 max-w-md text-sm text-white/70">
                  Reading at {clock(Date.parse(latest.ts))} · sunlight on the wall{' '}
                  {num(latest.irradiance_wm2)} W/m² · module {num(latest.panel_temp_c, 1)} °C
                </p>
              </>
            ) : (
              <>
                <p className="mt-2 font-display text-6xl text-white/30">
                  ––<span className="ml-3 font-sans text-xl font-semibold">{t('live.unit')}</span>
                </p>
                <p className="mt-3 max-w-md text-sm text-white/70">
                  {latest ? `Last reading at ${clock(Date.parse(latest.ts))}.` : t('live.waiting')}
                </p>
              </>
            )}
          </div>
          <SunPath dayOfYear={dayOfYear} hours={hours} />
        </div>

        {/* Chart: today's power curve, or energy per day */}
        <div className="mt-12">
          {range === '24h' ? (
            <PowerChart
              readings={state.server.today}
              dayStartMs={localMidnightUtc(state.server.date)}
              nowMs={state.nowMs}
            />
          ) : (
            <>
              <DayBars days={days} />
              {days.length < RANGES.find(([r]) => r === range)![1] && (
                <p className="mt-3 text-xs text-white/50">
                  Only {days.length} days of readings so far.
                </p>
              )}
            </>
          )}
        </div>

        {/* Device health (Milestone 9) */}
        <dl className="mt-12 grid grid-cols-3 gap-px overflow-hidden rounded-2xl bg-white/10 text-sm lg:grid-cols-6">
          {[
            [
              'Last reading',
              silentFor === null ? '–' : silentFor === 0 ? 'just now' : `${silentFor} min ago`,
            ],
            ['Readings today', `${today.minutes} / ${today.expectedMinutes}`],
            ['Wi-Fi signal', latest?.rssi != null ? `${latest.rssi} dBm` : '–'],
            ['Kit uptime', latest ? duration(latest.uptime_s) : '–'],
            ['Reboots', latest ? String(latest.reboot_count) : '–'],
            ['Firmware', latest?.firmware_version ?? '–'],
          ].map(([label, value]) => (
            <div key={label} className="bg-forest-950/60 px-5 py-4 backdrop-blur">
              <dt className="text-xs text-white/50">{label}</dt>
              <dd className="mt-1 font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/** READINGS: the website's real KPI cards, now with values. */
function Readings({ state }: { state: SimState }) {
  const { t } = useTranslation();
  const today = todayStats(state);
  const hasData = today.minutes > 0;
  const round1 = (x: number) => Number(x.toFixed(1));
  const cards = [
    { key: 'energy', value: round1(today.energyKwh), note: 'today' },
    {
      key: 'co2',
      value: round1(co2Kg(today.energyKwh)),
      note: `today · ${t('kpi.co2.note')}`,
    },
    {
      key: 'cooling',
      value: round1(today.maxCooling),
      note: `peak today · ${t('kpi.cooling.note')}`,
    },
    { key: 'irradiance', value: Math.round(today.peakIrradiance), note: 'today, on the wall' },
  ];

  return (
    <section id="measure" className="bg-solar px-4 py-24 text-forest-950 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <h2 className="text-center font-display text-[clamp(2.2rem,7.5vw,6rem)] leading-[1.02] font-bold uppercase">
            {t('measure.title1')} {t('measure.title2')}
            <br />
            {t('measure.title3')}
          </h2>
          <p className="mx-auto mt-6 max-w-md text-center text-base">{t('measure.lead')}</p>
        </Reveal>
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ key, value, note }, i) => (
            <Reveal key={key} delayMs={i * 120}>
              <KpiCard
                index={`0${i + 1}`}
                label={t(`kpi.${key}.label`)}
                value={hasData ? value : null}
                unit={t(`kpi.${key}.unit`)}
                note={note}
                noDataText={t('noData')}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/** IMPACT: measured totals over the days on record, with the plan for comparison. */
function MeasuredImpact({ state }: { state: SimState }) {
  const days = lastDays(state, 30);
  const kwh = days.reduce((s, d) => s + d.energyKwh, 0);
  const yieldPerKwp = annualisedYield(state.server.history);
  const vsPlan = (yieldPerKwp / PLANNING_YIELD_KWH_PER_KWP_YEAR - 1) * 100;

  const items = [
    {
      value: num(kwh, 0),
      unit: 'kWh',
      text: `generated in the last ${days.length} days`,
      pill: 'Measured',
    },
    {
      value: num(co2Kg(kwh), 0),
      unit: 'kg CO₂',
      text: `avoided at ${EMISSION_FACTOR_KG_PER_KWH} t/MWh (UNFCCC CDM ASB0003). At ${SENSITIVITY_FACTOR_KG_PER_KWH} t/MWh: ${num(co2Kg(kwh, SENSITIVITY_FACTOR_KG_PER_KWH), 0)} kg`,
      pill: 'Measured × grid factor',
    },
    {
      value: num(yieldPerKwp, 0),
      unit: 'kWh/kWp·yr',
      text: `measured so far, scaled to a year: ${vsPlan >= 0 ? '+' : ''}${num(vsPlan, 0)} % vs the ${PLANNING_YIELD_KWH_PER_KWP_YEAR} kWh/kWp plan`,
      pill: 'Estimate · extrapolated',
    },
    {
      value: num(valueUzs(kwh), 0),
      unit: 'UZS',
      text: `of grid electricity replaced, at ${TARIFF.lowUzsPerKwh} UZS/kWh (tariff from 1 June 2026)`,
      pill: 'Estimate',
    },
  ];

  return (
    <section
      id="impact"
      className="relative overflow-hidden bg-forest-950 px-4 py-24 sm:px-8 sm:py-32"
    >
      <SolarPanelBackdrop />
      <div className="relative mx-auto max-w-7xl">
        <Reveal>
          <p className="text-xs font-semibold tracking-widest text-solar uppercase">
            The pilot, measured
          </p>
        </Reveal>
        <div className="mt-12 grid gap-x-12 gap-y-16 md:grid-cols-2">
          {items.map((item, i) => (
            <Reveal
              key={item.unit}
              delayMs={(i % 2) * 150}
              className="border-t border-white/15 pt-8"
            >
              <p className="flex flex-wrap items-baseline gap-x-4">
                <CountUp
                  value={item.value}
                  className={`bg-gradient-to-b bg-clip-text pb-2 font-display text-[clamp(3rem,8vw,7rem)] leading-none font-bold text-transparent tabular-nums ${
                    i % 2 ? 'from-leaf-300 to-leaf/40' : 'from-solar-300 to-solar/40'
                  }`}
                />
                <span className="font-display text-lg text-white sm:text-2xl">{item.unit}</span>
              </p>
              <p className="mt-4 max-w-md text-lg text-white/80">{item.text}</p>
              <span className="mt-4 inline-block rounded-full px-3 py-1 text-xs text-white/60 ring-1 ring-white/20">
                {item.pill}
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
