// "Where is the sun over Fergana right now?" An arc from sunrise to sunset,
// with the sun drawn at its current spot. Times come from lib/sun.ts (real astronomy).
import { useTranslation } from 'react-i18next';
import { formatHours, sunTimes } from '../lib/sun';

type SunPathProps = { dayOfYear: number; hours: number };

// The arc is half an ellipse: from (20,110) to (380,110), peaking at y=20.
const LEFT = 20;
const RIGHT = 380;
const BASE = 110;
const HEIGHT = 90;

export function SunPath({ dayOfYear, hours }: SunPathProps) {
  const { t } = useTranslation();
  const { sunrise, sunset } = sunTimes(dayOfYear);
  const isUp = hours > sunrise && hours < sunset;

  // How far through the day the sun is: 0 = sunrise, 1 = sunset.
  const progress = Math.min(1, Math.max(0, (hours - sunrise) / (sunset - sunrise)));
  const angle = Math.PI * (1 - progress);
  const sunX = (LEFT + RIGHT) / 2 + ((RIGHT - LEFT) / 2) * Math.cos(angle);
  const sunY = BASE - HEIGHT * Math.sin(angle);

  const arc = `M${LEFT},${BASE} A${(RIGHT - LEFT) / 2},${HEIGHT} 0 0 1 ${RIGHT},${BASE}`;

  return (
    <figure className="rounded-[2rem] bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur">
      <svg viewBox="0 0 400 130" className="w-full" role="img" aria-label={t('live.sunPath')}>
        <defs>
          <linearGradient id="daylight" x1="0" x2="1">
            <stop offset="0%" stopColor="#4cc27a" />
            <stop offset="50%" stopColor="#f5b82e" />
            <stop offset="100%" stopColor="#4cc27a" />
          </linearGradient>
        </defs>

        {/* Full day path (dashed) and the part the sun has already travelled (solid) */}
        <path
          d={arc}
          fill="none"
          stroke="rgb(255 255 255 / 0.2)"
          strokeWidth="2"
          strokeDasharray="3 7"
        />
        {isUp && (
          <path
            d={arc}
            fill="none"
            stroke="url(#daylight)"
            strokeWidth="3"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={`${progress} 1`}
          />
        )}

        {/* Horizon */}
        <line x1="0" x2="400" y1={BASE} y2={BASE} stroke="rgb(255 255 255 / 0.3)" />

        {/* The sun (only when it is above the horizon) */}
        {isUp && (
          <g>
            <circle cx={sunX} cy={sunY} r="16" fill="#f5b82e" opacity="0.25" />
            <circle cx={sunX} cy={sunY} r="8" fill="#ffd36b" />
          </g>
        )}
      </svg>

      <figcaption className="mt-3 flex items-end justify-between gap-4 text-xs text-white/60">
        <span>
          <span className="block font-display text-lg text-white tabular-nums">
            {formatHours(sunrise)}
          </span>
          {t('live.sunrise')}
        </span>
        <span className="text-center text-white/40">
          {isUp ? t('live.sunUp') : t('live.sunDown')}
        </span>
        <span className="text-right">
          <span className="block font-display text-lg text-white tabular-nums">
            {formatHours(sunset)}
          </span>
          {t('live.sunset')}
        </span>
      </figcaption>
    </figure>
  );
}
