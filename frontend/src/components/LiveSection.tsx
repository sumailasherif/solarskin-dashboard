// "One day, one wall": a giant Fergana clock, today's sun path, the current power,
// range chips and a chart.
// The clock and sun path are real (time + astronomy). The power and chart stay empty
// until the API sends real readings (Milestone 7–8). We never draw a fake line.
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ferganaNow, sunTimes } from '../lib/sun';
import { SunPath } from './SunPath';

const RANGES = ['24h', '7d', '14d', '30d'] as const;
type Range = (typeof RANGES)[number];

// The labels under the chart for each range.
const AXIS: Record<Range, string[]> = {
  '24h': ['00', '04', '08', '12', '16', '20', '24'],
  '7d': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  '14d': ['1', '3', '5', '7', '9', '11', '14'],
  '30d': ['1', '5', '10', '15', '20', '25', '30'],
};

// Formats a date as "HH:MM" in Fergana's time zone (Asia/Tashkent, UTC+5).
const ferganaClock = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Tashkent',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

/** The current moment, refreshed every 10 seconds so the clock and sun keep moving. */
function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 10_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export function LiveSection() {
  const { t } = useTranslation();
  const now = useNow();
  const time = ferganaClock.format(now);
  const { dayOfYear, hours } = ferganaNow(now);
  const { sunrise, sunset } = sunTimes(dayOfYear);
  const isDay = hours > sunrise && hours < sunset;
  const [range, setRange] = useState<Range>('24h');

  return (
    <section
      id="live"
      className="relative overflow-hidden bg-gradient-to-b from-forest-950 via-forest to-forest-700 px-4 py-24 sm:px-8 sm:py-32"
    >
      {/* Faint solar-cell grid texture, fading out towards the bottom */}
      <div
        aria-hidden
        className="bg-cells pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_70%)]"
      />

      {/* Soft sun (or moon) glow in the corner, depending on the time in Fergana */}
      <div
        aria-hidden
        className={`pointer-events-none absolute -top-40 -left-40 h-[36rem] w-[36rem] rounded-full blur-3xl ${
          isDay ? 'bg-solar/25' : 'bg-leaf/15'
        }`}
      />

      <div className="relative mx-auto max-w-7xl">
        {/* Title row + range chips */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-display text-[clamp(1.8rem,5vw,3.75rem)] leading-none uppercase">
              {t('live.title')}
            </h2>
            <p className="mt-4 flex items-center gap-2 text-sm text-white/70">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-solar opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-solar" />
              </span>
              {t('live.from')}
            </p>
          </div>

          <div
            role="radiogroup"
            aria-label={t('live.title')}
            className="inline-flex w-fit shrink-0 gap-1 overflow-x-auto rounded-full bg-white/10 p-1 ring-1 ring-white/20 backdrop-blur"
          >
            {RANGES.map((r) => (
              <button
                key={r}
                type="button"
                role="radio"
                aria-checked={range === r}
                onClick={() => setRange(r)}
                className={`rounded-full px-3 py-2 text-xs font-semibold whitespace-nowrap transition sm:px-4 sm:text-sm ${
                  range === r ? 'bg-white text-forest-950' : 'text-white/80 hover:bg-white/10'
                }`}
              >
                {t(`live.ranges.${r}`)}
              </button>
            ))}
          </div>
        </div>

        {/* The giant clock */}
        <div className="mt-10 flex items-center gap-4 sm:gap-8">
          <span
            aria-hidden
            className={`hidden h-20 w-20 shrink-0 rounded-full sm:block lg:h-28 lg:w-28 ${
              isDay
                ? 'bg-gradient-to-br from-solar-300 to-solar shadow-[0_0_60px_10px] shadow-solar/40'
                : 'bg-gradient-to-br from-forest-50 to-leaf-300/50 shadow-[0_0_40px_6px] shadow-leaf/20'
            }`}
          />
          <p
            className="font-display text-[clamp(4.5rem,19vw,14rem)] leading-none tabular-nums"
            aria-label={`${t('live.localTime')}: ${time}`}
          >
            {time}
          </p>
        </div>
        <p className="mt-2 text-xs tracking-widest text-white/50 uppercase">
          {t('live.localTime')}
        </p>

        {/* Current power (empty until real data arrives) + today's sun path */}
        <div className="mt-12 grid items-end gap-8 lg:grid-cols-[1fr_minmax(0,28rem)]">
          <div>
            <p className="text-xs font-semibold tracking-widest text-solar uppercase">
              {t('live.power')}
            </p>
            <p className="mt-2 font-display text-5xl text-white/30 sm:text-6xl">
              ––<span className="ml-3 font-sans text-xl font-semibold">{t('live.unit')}</span>
            </p>
            <p className="mt-3 max-w-md text-sm text-white/70">{t('live.waiting')}</p>
          </div>
          <SunPath dayOfYear={dayOfYear} hours={hours} />
        </div>

        {/* Chart frame: grid lines + axis, with an honest "no readings" label instead of a line */}
        <div className="relative mt-12">
          <div className="relative h-48 border-b border-white/30 sm:h-56">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="absolute inset-x-0 border-t border-dashed border-white/10"
                style={{ top: `${i * 25}%` }}
              />
            ))}
            <p className="absolute inset-0 grid place-items-center text-sm text-white/40">
              {t('live.chartEmpty')}
            </p>
          </div>
          <div className="mt-3 flex justify-between text-xs text-white/50 tabular-nums">
            {AXIS[range].map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
