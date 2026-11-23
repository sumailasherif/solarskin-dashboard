// The Readings section (#measure):
//   1. "The wall, right now": sensor diagram + live reading tiles, with a "Simulated demo" switch
//   2. Today's totals: the four summary cards
//   3. How the cooling works: the two-wall animation
// Until the real sensor kit sends data, everything shows "No data yet" / "—".
// The demo switch fills it with the Fergana model's simulated day, clearly labelled.
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { demoSnapshot, type DemoSnapshot } from '../lib/demoReadings';
import { CoolingDemo } from './CoolingDemo';
import { KpiCard } from './KpiCard';
import { LiveSensors } from './LiveSensors';
import { Reveal } from './Reveal';

const REFRESH_MS = 30_000; // the demo updates twice a minute

/** The four summary cards: which total each shows, and how to round it */
const KPIS = [
  { key: 'energy', note: false, value: (s: DemoSnapshot) => round(s.totals.energyKwh, 1) },
  { key: 'co2', note: true, value: (s: DemoSnapshot) => round(s.totals.co2Kg, 1) },
  { key: 'cooling', note: true, value: (s: DemoSnapshot) => round(s.totals.coolingC, 1) },
  {
    key: 'irradiance',
    note: false,
    value: (s: DemoSnapshot) => Math.round(s.totals.peakIrradiance),
  },
] as const;

const round = (n: number, decimals: number) => Number(n.toFixed(decimals));

/** Today's simulated snapshot while the demo is on (refreshed every 30 s), otherwise null. */
function useDemo(on: boolean) {
  const [snapshot, setSnapshot] = useState<DemoSnapshot | null>(null);

  useEffect(() => {
    if (!on) return;
    const update = () => setSnapshot(demoSnapshot());
    update();
    const timer = window.setInterval(update, REFRESH_MS);
    return () => {
      window.clearInterval(timer);
      setSnapshot(null);
    };
  }, [on]);

  return snapshot;
}

export function ReadingsSection() {
  const { t } = useTranslation();
  const [demo, setDemo] = useState(false);
  const snapshot = useDemo(demo);

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

        {/* 1. Live sensors */}
        <Reveal className="mt-16">
          <LiveSensors demo={demo} onDemoChange={setDemo} snapshot={snapshot} />
        </Reveal>

        {/* 2. Today's totals: 1 column on phones, 2 on tablets, 4 on laptops */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {KPIS.map(({ key, note, value }, i) => (
            <Reveal key={key} delayMs={i * 120}>
              <KpiCard
                index={`0${i + 1}`}
                label={t(`kpi.${key}.label`)}
                value={snapshot ? value(snapshot) : null}
                unit={t(`kpi.${key}.unit`)}
                note={snapshot ? t('readings.simulated') : note ? t(`kpi.${key}.note`) : undefined}
                noDataText={t('noData')}
              />
            </Reveal>
          ))}
        </div>

        {/* 3. How the wall cooling works */}
        <CoolingDemo />
      </div>
    </section>
  );
}
