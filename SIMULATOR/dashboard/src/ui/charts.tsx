// Hand-drawn SVG charts (no chart library needed):
//   PowerChart  today's power curve, 00:00–24:00, with a hover tooltip and honest gaps
//   DayBars     energy per day (kWh) as bars
//   Sparkline   a tiny line for the sensor tiles
import { useId, useState, type PointerEvent } from 'react';
import type { DaySummary, Reading } from '../engine/types';
import { clock, dayLabel, num } from './format';

type Tone = 'dark' | 'light';

/** Round a maximum up to a tidy axis value: 0.8 → 1, 3.4 → 4, 4.6 → 5, 6.2 → 8 */
function niceCeil(x: number) {
  const steps = [0.5, 1, 2, 3, 4, 5, 6, 8, 10, 12];
  return steps.find((s) => s >= x) ?? Math.ceil(x);
}

const W = 1440; // one unit per minute of the day
const H = 240;

type PowerChartProps = {
  readings: Reading[];
  dayStartMs: number; // local midnight (UTC ms)
  nowMs: number;
  tone?: Tone;
  heightClass?: string;
};

export function PowerChart({
  readings,
  dayStartMs,
  nowMs,
  tone = 'dark',
  heightClass = 'h-56',
}: PowerChartProps) {
  const gradientId = useId();
  const [hover, setHover] = useState<{ x: number; kw: number; r: Reading } | null>(null);

  const points = readings.map((r) => ({
    x: (Date.parse(r.ts) - dayStartMs) / 60_000,
    kw: r.pv_power_w / 1000,
    r,
  }));
  const top = niceCeil(Math.max(1, ...points.map((p) => p.kw)) * 1.1);
  const y = (kw: number) => H - (kw / top) * H;

  // Split the line wherever readings are missing, so a gap shows as a gap (never a made-up line)
  const runs: (typeof points)[] = [];
  for (const p of points) {
    const run = runs.at(-1);
    const last = run?.at(-1);
    if (run && last && p.x - last.x <= 2) run.push(p);
    else runs.push([p]);
  }
  const line = (run: typeof points) =>
    run.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${y(p.kw).toFixed(1)}`).join('');
  const area = (run: typeof points) =>
    `${line(run)}L${run.at(-1)!.x.toFixed(1)},${H}L${run[0]!.x.toFixed(1)},${H}Z`;

  const nowX = Math.min(W, Math.max(0, (nowMs - dayStartMs) / 60_000));

  // Find the reading nearest the mouse
  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    if (points.length === 0) return;
    const box = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - box.left) / box.width) * W;
    let best = points[0]!;
    for (const p of points) if (Math.abs(p.x - x) < Math.abs(best.x - x)) best = p;
    setHover(Math.abs(best.x - x) < 20 ? best : null);
  };

  const dark = tone === 'dark';
  const grid = dark ? 'rgb(255 255 255 / 0.12)' : 'rgb(4 22 15 / 0.1)';
  const label = dark ? 'text-white/50' : 'text-forest-950/50';

  return (
    <div className="relative">
      <div className="flex gap-3">
        {/* y-axis labels */}
        <div className={`flex flex-col justify-between text-right text-xs tabular-nums ${label}`}>
          <span>{top} kW</span>
          <span>{top / 2}</span>
          <span>0</span>
        </div>
        <div className={`relative flex-1 ${heightClass}`}>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full overflow-visible"
            onPointerMove={onMove}
            onPointerLeave={() => setHover(null)}
            role="img"
            aria-label="Power through the day"
          >
            <defs>
              <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#f5b82e" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#f5b82e" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0, 0.25, 0.5, 0.75].map((f) => (
              <line
                key={f}
                x1="0"
                x2={W}
                y1={H * f}
                y2={H * f}
                stroke={grid}
                strokeDasharray="4 6"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            <line
              x1="0"
              x2={W}
              y1={H}
              y2={H}
              stroke={grid}
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
            {runs.map((run) => (
              <g key={run[0]!.x}>
                <path d={area(run)} fill={`url(#${gradientId})`} />
                <path
                  d={line(run)}
                  fill="none"
                  stroke="#f5b82e"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            ))}
            {/* "now" marker */}
            <line
              x1={nowX}
              x2={nowX}
              y1="0"
              y2={H}
              stroke={dark ? '#8fe0ab' : '#17583a'}
              strokeWidth="1.5"
              strokeDasharray="3 4"
              vectorEffect="non-scaling-stroke"
            />
            {hover && (
              <line
                x1={hover.x}
                x2={hover.x}
                y1="0"
                y2={H}
                stroke={dark ? 'white' : '#04160f'}
                strokeOpacity="0.4"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>
          {hover && (
            <div
              className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full rounded-xl bg-forest-950 px-3 py-2 text-xs whitespace-nowrap text-white shadow-xl ring-1 ring-white/15"
              style={{ left: `${(hover.x / W) * 100}%` }}
            >
              <span className="font-semibold">{clock(Date.parse(hover.r.ts))}</span> ·{' '}
              <span className="text-solar">{num(hover.kw, 2)} kW</span> ·{' '}
              {num(hover.r.irradiance_wm2)} W/m²
            </div>
          )}
        </div>
      </div>
      <div className={`mt-2 ml-12 flex justify-between text-xs tabular-nums ${label}`}>
        {['00', '04', '08', '12', '16', '20', '24'].map((h) => (
          <span key={h}>{h}</span>
        ))}
      </div>
    </div>
  );
}

type DayBarsProps = { days: DaySummary[]; tone?: Tone; heightClass?: string };

/** One bar per day; the last bar (today) is still growing, so it is drawn lighter. */
export function DayBars({ days, tone = 'dark', heightClass = 'h-48' }: DayBarsProps) {
  const top = niceCeil(Math.max(5, ...days.map((d) => d.energyKwh)) * 1.1);
  const dark = tone === 'dark';
  return (
    <div>
      <div className={`flex items-end gap-2 ${heightClass}`}>
        {days.map((d, i) => {
          const today = i === days.length - 1;
          return (
            <div key={d.date} className="group relative flex h-full flex-1 flex-col justify-end">
              <span
                className={`mb-1 text-center text-[11px] tabular-nums ${dark ? 'text-white/70' : 'text-forest-950/60'}`}
              >
                {num(d.energyKwh, 1)}
              </span>
              <div
                className={`rounded-t-lg transition-all ${today ? 'bg-solar/45' : 'bg-solar'}`}
                style={{ height: `${(d.energyKwh / top) * 100}%` }}
                title={`${d.date}: ${num(d.energyKwh, 1)} kWh · ${d.weather}`}
              />
            </div>
          );
        })}
      </div>
      <div
        className={`mt-2 flex gap-2 text-center text-[11px] ${dark ? 'text-white/50' : 'text-forest-950/50'}`}
      >
        {days.map((d, i) => (
          <span key={d.date} className="flex-1 truncate">
            {i === days.length - 1 ? 'Today' : dayLabel(d.date)}
          </span>
        ))}
      </div>
    </div>
  );
}

/** A tiny trend line (no axes). */
export function Sparkline({ values, className = '' }: { values: number[]; className?: string }) {
  if (values.length < 2) return <svg className={className} />;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values
    .map(
      (v, i) =>
        `${((i / (values.length - 1)) * 100).toFixed(1)},${(28 - ((v - min) / span) * 26).toFixed(1)}`,
    )
    .join(' ');
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className={className} aria-hidden>
      <polyline
        points={pts}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
