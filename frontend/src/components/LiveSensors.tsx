// "The wall, right now": where each sensor sits on the wall (diagram) and what it reads (tiles).
// Without data every value shows "—". With the "Simulated demo" switch on, the values come
// from the Fergana model and every one is clearly marked "Simulated".
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { DemoSnapshot, Reading, ReadingKey } from '../lib/demoReadings';
import { Sparkline } from './Sparkline';

type Tile = { key: ReadingKey; colour: string; format: (r: Reading) => string };

const HOT = '#ff9a3d';
const COOL = '#4cc27a';
const SOLAR = '#f5b82e';

const oneDecimal = (n: number) => n.toFixed(1);

// The six main readings, then the two technical ones behind "More readings"
const MAIN_TILES: Tile[] = [
  { key: 'powerW', colour: SOLAR, format: (r) => (r.powerW / 1000).toFixed(2) },
  { key: 'irradiance', colour: SOLAR, format: (r) => Math.round(r.irradiance).toString() },
  { key: 'panel', colour: HOT, format: (r) => oneDecimal(r.panel) },
  { key: 'wallShaded', colour: COOL, format: (r) => oneDecimal(r.wallShaded) },
  { key: 'wallReference', colour: HOT, format: (r) => oneDecimal(r.wallReference) },
  { key: 'ambient', colour: '#d6e3dc', format: (r) => oneDecimal(r.ambient) },
];
const EXTRA_TILES: Tile[] = [
  { key: 'voltageV', colour: '#d6e3dc', format: (r) => Math.round(r.voltageV).toString() },
  { key: 'currentA', colour: '#d6e3dc', format: (r) => oneDecimal(r.currentA) },
];

type LiveSensorsProps = {
  demo: boolean;
  onDemoChange: (on: boolean) => void;
  snapshot: DemoSnapshot | null;
};

/** One reading: label, value + unit, and today's trend line */
function ReadingTile({ tile, snapshot }: { tile: Tile; snapshot: DemoSnapshot | null }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10">
      <p className="text-xs text-white/60">{t(`readings.tiles.${tile.key}.label`)}</p>
      <p className="mt-1 font-display text-2xl tabular-nums">
        {snapshot ? tile.format(snapshot.now) : '—'}
        <span className="ml-1 font-sans text-xs font-semibold" style={{ color: tile.colour }}>
          {t(`readings.tiles.${tile.key}.unit`)}
        </span>
      </p>
      <Sparkline
        values={snapshot?.series[tile.key] ?? []}
        colour={tile.colour}
        className="mt-2 h-7 w-full"
      />
    </div>
  );
}

/** Side view of the wall: module in front, sensors as dots, values in callouts on the right */
function WallDiagram({ snapshot }: { snapshot: DemoSnapshot | null }) {
  const { t } = useTranslation();
  const r = snapshot?.now;
  const value = (text: string | undefined, unit: string) =>
    text === undefined ? '—' : `${text} ${unit}`;

  // [sensor dot x, y, label key, value text, colour]
  const SENSORS: [number, number, ReadingKey, string, string][] = [
    [175, 92, 'irradiance', value(r && Math.round(r.irradiance).toString(), 'W/m²'), SOLAR],
    [154, 150, 'panel', value(r && oneDecimal(r.panel), '°C'), HOT],
    [138, 205, 'wallShaded', value(r && oneDecimal(r.wallShaded), '°C'), COOL],
    [138, 330, 'wallReference', value(r && oneDecimal(r.wallReference), '°C'), HOT],
    [205, 288, 'ambient', value(r && oneDecimal(r.ambient), '°C'), '#d6e3dc'],
    [226, 372, 'powerW', value(r && (r.powerW / 1000).toFixed(2), 'kW'), SOLAR],
  ];

  return (
    <svg
      viewBox="0 0 360 410"
      className="h-auto w-full"
      role="img"
      aria-label={t('readings.diagram')}
    >
      {/* Sun and rays reaching the module */}
      <circle cx="318" cy="44" r="18" fill={SOLAR} opacity="0.9" />
      <circle cx="318" cy="44" r="30" fill={SOLAR} opacity="0.15" />
      {[0, 1, 2].map((i) => (
        <line
          key={i}
          x1="300"
          y1={58 + i * 6}
          x2="180"
          y2={110 + i * 50}
          stroke={SOLAR}
          strokeWidth="1.5"
          strokeDasharray="4 6"
          opacity="0.6"
        />
      ))}

      {/* Ground */}
      <line x1="40" y1="400" x2="340" y2="400" stroke="rgb(255 255 255 / 0.2)" />

      {/* The wall (side view) */}
      <rect x="100" y="40" width="34" height="360" fill="#7d6f56" />
      {/* shaded part behind the module (green) and the bare part below it (orange) */}
      <rect x="134" y="70" width="16" height="200" fill={COOL} opacity="0.18" />
      <rect x="134" y="280" width="6" height="120" fill={HOT} opacity="0.35" />

      {/* The solar module, a little in front of the wall, with brackets */}
      {[95, 170, 245].map((y) => (
        <line key={y} x1="134" y1={y} x2="160" y2={y} stroke="#9fb3bb" strokeWidth="2" />
      ))}
      <rect x="160" y="70" width="10" height="200" rx="2" fill="#13232b" stroke="#4d6b78" />

      {/* Air sensor in its little sun shield, and the logger box with the power meter */}
      <path d="M197 280 h16 M195 286 h20 M197 292 h16" stroke="#9fb3bb" strokeWidth="2" />
      <rect x="186" y="358" width="38" height="28" rx="4" fill="#1d3b2e" stroke={COOL} />
      <text x="205" y="376" textAnchor="middle" className="fill-white/80 text-[8px] font-semibold">
        ESP32
      </text>

      {/* Sensors + callouts */}
      {SENSORS.map(([x, y, key, text, colour]) => (
        <g key={key}>
          <line
            x1={x}
            y1={y}
            x2="232"
            y2={y}
            stroke="rgb(255 255 255 / 0.25)"
            strokeDasharray="2 3"
          />
          <circle cx={x} cy={y} r="5" fill={colour} stroke="#04160f" strokeWidth="2" />
          <text x="238" y={y - 3} className="fill-white/55 text-[9px]">
            {t(`readings.tiles.${key}.label`)}
          </text>
          <text x="238" y={y + 10} className="text-[12px] font-semibold tabular-nums" fill={colour}>
            {text}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function LiveSensors({ demo, onDemoChange, snapshot }: LiveSensorsProps) {
  const { t } = useTranslation();
  const [showMore, setShowMore] = useState(false);
  const tiles = showMore ? [...MAIN_TILES, ...EXTRA_TILES] : MAIN_TILES;

  return (
    <div className="rounded-tl-[2.75rem] rounded-tr-lg rounded-br-[2.75rem] rounded-bl-lg bg-forest-950 p-6 text-white sm:p-8 lg:p-10">
      {/* Header: title, status, demo switch */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="font-serif text-3xl italic sm:text-4xl">{t('readings.title')}</h3>

        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              demo ? 'bg-solar/15 text-solar' : 'bg-white/10 text-white/60'
            }`}
          >
            {demo
              ? t('readings.simulatedAt', { time: snapshot?.time ?? '' })
              : t('readings.waiting')}
          </span>

          <button
            type="button"
            role="switch"
            aria-checked={demo}
            onClick={() => onDemoChange(!demo)}
            className="flex items-center gap-2 text-sm text-white/80"
          >
            <span
              className={`relative h-6 w-11 rounded-full transition ${demo ? 'bg-solar' : 'bg-white/20'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                  demo ? 'translate-x-5' : ''
                }`}
              />
            </span>
            {t('readings.demo')}
          </button>
        </div>
      </div>

      {/* Diagram + tiles: side by side on laptops, stacked on phones */}
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <WallDiagram snapshot={snapshot} />

        <div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {tiles.map((tile) => (
              <ReadingTile key={tile.key} tile={tile} snapshot={snapshot} />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowMore((s) => !s)}
            aria-expanded={showMore}
            className="mt-4 text-sm text-white/60 underline decoration-white/25 underline-offset-4 hover:text-white"
          >
            {showMore ? t('readings.less') : t('readings.more')}
          </button>
        </div>
      </div>
    </div>
  );
}
