// SCREEN 1 · The sensor kit's own console.
// Imagine opening the ESP32's local web page on a laptop next to the wall: it shows what
// every sensor reads right now, where each sensor sits, the serial monitor and the exact
// JSON it sends to the server every minute.
import type { ReactNode } from 'react';
import { SITE } from '../../../../src/model/constants';
import type { LogLine, Reading, SimState } from '../../engine/types';
import { Sparkline } from '../../ui/charts';
import { clockSeconds, duration, num } from '../../ui/format';

type Tile = {
  key: keyof Reading;
  label: string;
  unit: string;
  part: string; // which kind of sensor makes this reading
  decimals: number;
};

const TILES: Tile[] = [
  { key: 'pv_power_w', label: 'PV power', unit: 'W', part: 'DC power meter', decimals: 0 },
  {
    key: 'irradiance_wm2',
    label: 'Irradiance',
    unit: 'W/m²',
    part: 'Reference cell, in the module plane',
    decimals: 0,
  },
  { key: 'panel_temp_c', label: 'Module temp', unit: '°C', part: 'Probe on module back', decimals: 1 },
  {
    key: 'wall_temp_shaded_c',
    label: 'Wall · shaded',
    unit: '°C',
    part: 'Probe on wall behind modules',
    decimals: 1,
  },
  {
    key: 'wall_temp_reference_c',
    label: 'Wall · reference',
    unit: '°C',
    part: 'Probe on bare wall',
    decimals: 1,
  },
  { key: 'ambient_temp_c', label: 'Air temp', unit: '°C', part: 'Probe in shade shield', decimals: 1 },
  { key: 'voltage_v', label: 'DC voltage', unit: 'V', part: 'DC power meter', decimals: 1 },
  { key: 'current_a', label: 'DC current', unit: 'A', part: 'DC power meter', decimals: 2 },
];

const LOG_COLOUR: Record<LogLine['level'], string> = {
  ok: 'text-leaf-300',
  info: 'text-white/60',
  warn: 'text-solar',
  error: 'text-[#ff7a59]',
};

/** 4 bars = strong Wi-Fi, 1 bar = weak */
const wifiBars = (rssi: number | null) =>
  rssi === null ? 0 : rssi > -60 ? 4 : rssi > -67 ? 3 : rssi > -75 ? 2 : 1;

export function SensorScreen({ state }: { state: SimState }) {
  const { device } = state;

  // No power = the kit's web page can't load at all (what you'd really see in the browser)
  if (!state.powered) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#202124] p-10 font-sans text-[#bdc1c6]">
        <div className="max-w-xl">
          <svg viewBox="0 0 24 24" className="h-14 w-14 text-[#9aa0a6]" fill="currentColor" aria-hidden>
            <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 14H4V8h16v10ZM9 10l-2 2 2 2-1 1-3-3 3-3 1 1Zm6 0 1-1 3 3-3 3-1-1 2-2-2-2Z" />
          </svg>
          <h1 className="mt-6 text-2xl text-[#e8eaed]">This site can’t be reached</h1>
          <p className="mt-3">
            <strong className="text-[#e8eaed]">192.168.4.1</strong> took too long to respond.
          </p>
          <p className="mt-6 text-sm">
            The sensor kit has no power, so its console is offline and nothing is being measured.
            Switch “Kit power” back on in the control room.
          </p>
          <p className="mt-6 font-mono text-xs text-[#9aa0a6]">ERR_CONNECTION_TIMED_OUT</p>
        </div>
      </div>
    );
  }

  const latest = device.recent.at(-1) ?? null;
  const bars = wifiBars(device.rssi);

  return (
    <div className="min-h-screen bg-[#070d0a] font-mono text-white">
      {/* Top bar: kit identity, status LEDs and health */}
      <header className="flex items-center justify-between border-b border-white/10 bg-forest-950 px-8 py-4">
        <div className="flex items-center gap-6">
          <div className="flex gap-3 text-[10px] tracking-widest text-white/50">
            <Led label="PWR" on colour="bg-leaf shadow-leaf" />
            <Led label="NET" on={state.wifi} colour={state.wifi ? 'bg-leaf shadow-leaf' : 'bg-[#ff7a59] shadow-[#ff7a59]'} />
            {/* Re-mounting with a new key replays the blink each time a reading is sent */}
            <Led key={device.lastSentMs ?? 0} label="TX" on={false} colour="" blink />
          </div>
          <div>
            <p className="text-lg font-semibold">
              SolarSkin Kit <span className="text-solar">· {SITE.deviceId}</span>
            </p>
            <p className="text-xs text-white/50">
              site {SITE.siteId} · firmware {latest?.firmware_version ?? '–'} · 1 reading / minute
            </p>
          </div>
        </div>
        <dl className="flex gap-8 text-right text-xs">
          <Stat label="Uptime" value={device.booting ? 'booting…' : duration(device.uptimeS)} />
          <Stat label="Reboots" value={String(device.rebootCount)} />
          <Stat
            label="Wi-Fi"
            value={
              <span className="inline-flex items-end gap-1">
                {[1, 2, 3, 4].map((b) => (
                  <span
                    key={b}
                    className={`w-1 rounded-sm ${b <= bars ? 'bg-leaf' : 'bg-white/15'}`}
                    style={{ height: 4 + b * 3 }}
                  />
                ))}
                <span className="ml-1">{device.rssi === null ? 'none' : `${device.rssi} dBm`}</span>
              </span>
            }
          />
          <Stat
            label="Stored, unsent"
            value={
              <span className={device.queue > 0 ? 'text-solar' : ''}>{device.queue} readings</span>
            }
          />
          <Stat label="Kit clock" value={clockSeconds(state.nowMs)} />
        </dl>
      </header>

      {device.booting && (
        <p className="bg-solar px-8 py-2 text-sm font-semibold text-forest-950">
          Booting… connecting sensors and Wi-Fi. The next reading is skipped.
        </p>
      )}

      <main className="grid grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-6 p-6">
        {/* Where the sensors sit */}
        <section className="rounded-2xl bg-white/[0.03] p-5 ring-1 ring-white/10">
          <h2 className="text-xs tracking-widest text-white/50 uppercase">Where the sensors sit</h2>
          <FacadeDiagram reading={latest} sending={state.wifi} />
        </section>

        {/* Live sensor tiles */}
        <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {TILES.map((tile) => {
            const value = latest ? Number(latest[tile.key]) : null;
            const history = device.recent.map((r) => Number(r[tile.key]));
            return (
              <article
                key={tile.key}
                className="flex flex-col justify-between rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10"
              >
                <div>
                  <p className="text-xs text-white/60">{tile.label}</p>
                  <p className="mt-2 font-display text-3xl tabular-nums">
                    {value === null ? '–' : num(value, tile.decimals)}
                    <span className="ml-1.5 font-mono text-sm text-solar">{tile.unit}</span>
                  </p>
                </div>
                <div>
                  <Sparkline values={history} className="mt-3 h-8 w-full text-leaf-300" />
                  <p className="mt-2 text-[10px] text-white/40">{tile.part}</p>
                </div>
              </article>
            );
          })}
        </section>

        {/* Serial monitor */}
        <section className="flex h-80 flex-col overflow-hidden rounded-2xl bg-black ring-1 ring-white/10">
          <h2 className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-xs text-white/50">
            <span>Serial monitor · 115200 baud</span>
            <span>{state.log.length} lines</span>
          </h2>
          {/* flex-col-reverse keeps the newest line in view at the bottom, like a real serial monitor */}
          <div className="flex flex-1 flex-col-reverse overflow-y-auto px-4 py-3 text-xs leading-relaxed">
            <div>
              {state.log.slice(-60).map((line) => (
                <p key={line.id} className={LOG_COLOUR[line.level]}>
                  <span className="text-white/30">[{clockSeconds(line.ts)}]</span> {line.text}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* The exact payload */}
        <section className="flex h-80 flex-col overflow-hidden rounded-2xl bg-black ring-1 ring-white/10">
          <h2 className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-xs">
            <span className="text-white/50">Last payload → POST /api/v1/readings</span>
            {latest && (
              <span className={state.wifi ? 'text-leaf-300' : 'text-solar'}>
                {state.wifi ? '201 Created' : 'stored on kit (no Wi-Fi)'}
              </span>
            )}
          </h2>
          <pre className="flex-1 overflow-auto px-4 py-3 text-xs leading-relaxed">
            {latest ? <Json reading={latest} /> : 'Waiting for the first reading…'}
          </pre>
        </section>
      </main>
    </div>
  );
}

function Led({
  label,
  on,
  colour,
  blink = false,
}: {
  label: string;
  on: boolean;
  colour: string;
  blink?: boolean;
}) {
  return (
    <span className="flex flex-col items-center gap-1">
      <span
        className={`h-2.5 w-2.5 rounded-full ${on ? `${colour} shadow-[0_0_8px]` : 'bg-white/15'} ${
          blink ? 'animate-blink' : ''
        }`}
      />
      {label}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-white/40">{label}</dt>
      <dd className="mt-1 text-sm text-white">{value}</dd>
    </div>
  );
}

/** Pretty-printed JSON with coloured keys and values. */
function Json({ reading }: { reading: Reading }) {
  const entries = Object.entries(reading);
  return (
    <>
      {'{\n'}
      {entries.map(([key, value], i) => (
        <span key={key}>
          {'  '}
          <span className="text-leaf-300">"{key}"</span>:{' '}
          <span className={typeof value === 'string' ? 'text-solar-300' : 'text-solar'}>
            {JSON.stringify(value)}
          </span>
          {i < entries.length - 1 ? ',' : ''}
          {'\n'}
        </span>
      ))}
      {'}'}
    </>
  );
}

/** A side view of the wall: modules on brackets, the bare reference wall below, and every sensor. */
function FacadeDiagram({ reading, sending }: { reading: Reading | null; sending: boolean }) {
  const v = (key: keyof Reading, unit: string, d = 1) =>
    reading ? `${num(Number(reading[key]), d)} ${unit}` : '–';
  const sunUp = (reading?.irradiance_wm2 ?? 0) > 10;

  // [label, value, sensor x, sensor y, label y]
  const callouts: [string, string, number, number, number][] = [
    ['① Irradiance', v('irradiance_wm2', 'W/m²', 0), 196, 78, 70],
    ['② Module back', v('panel_temp_c', '°C'), 166, 190, 150],
    ['③ Wall, shaded', v('wall_temp_shaded_c', '°C'), 132, 240, 230],
    ['⑤ Air (shade shield)', v('ambient_temp_c', '°C'), 262, 352, 310],
    ['④ Wall, bare (reference)', v('wall_temp_reference_c', '°C'), 132, 430, 400],
    ['⑥ DC power', v('pv_power_w', 'W', 0), 300, 482, 490],
  ];

  return (
    <svg viewBox="0 0 560 560" className="mt-3 w-full" role="img" aria-label="Sensor positions on the wall">
      <defs>
        <pattern id="brick" width="24" height="14" patternUnits="userSpaceOnUse">
          <rect width="24" height="14" fill="#3b2a22" />
          <path d="M0 13.5h24M12 0v7M0 7h24M24 7v7" stroke="#2a1d17" strokeWidth="1.2" />
        </pattern>
        <linearGradient id="ray" x1="1" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#ffd36b" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ffd36b" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Sun + rays (only by day) */}
      {sunUp && (
        <g>
          <circle cx="500" cy="50" r="26" fill="#f5b82e" opacity="0.9" />
          <circle cx="500" cy="50" r="40" fill="#f5b82e" opacity="0.2" />
          {[90, 150, 210].map((y) => (
            <line key={y} x1="470" y1="70" x2="200" y2={y} stroke="url(#ray)" strokeWidth="3" />
          ))}
        </g>
      )}

      {/* Ground */}
      <line x1="0" x2="560" y1="530" y2="530" stroke="rgb(255 255 255 / 0.3)" />

      {/* The wall (brick), seen from the side */}
      <rect x="70" y="30" width="62" height="500" fill="url(#brick)" />
      <text x="20" y="300" fill="rgb(255 255 255 / 0.4)" fontSize="11" transform="rotate(-90 20 300)">
        BUILDING · south wall
      </text>

      {/* Brackets + module (upper part of the wall) */}
      {[80, 280].map((y) => (
        <line key={y} x1="132" x2="176" y1={y} y2={y} stroke="#9aa3a8" strokeWidth="4" />
      ))}
      <rect x="176" y="60" width="14" height="250" rx="2" fill="#0e1c22" stroke="#4cc27a" strokeOpacity="0.5" />
      {Array.from({ length: 9 }, (_, i) => (
        <line key={i} x1="176" x2="190" y1={60 + i * 28} y2={60 + i * 28} stroke="#c8d7e1" strokeOpacity="0.35" />
      ))}
      <text x="200" y="300" fill="rgb(255 255 255 / 0.4)" fontSize="11">
        SolarSkin module
      </text>

      {/* Shade-shield for the air sensor (stacked plates) */}
      <line x1="262" x2="262" y1="330" y2="530" stroke="#9aa3a8" strokeWidth="2" />
      {[0, 1, 2, 3].map((i) => (
        <ellipse key={i} cx="262" cy={330 + i * 8} rx="16" ry="4" fill="#e7ece8" opacity="0.8" />
      ))}

      {/* The kit box (ESP32) with antenna and Wi-Fi waves */}
      <rect x="290" y="440" width="60" height="44" rx="6" fill="#0f3d29" stroke="#4cc27a" />
      <text x="320" y="466" textAnchor="middle" fill="#8fe0ab" fontSize="10">
        ESP32
      </text>
      <line x1="342" x2="342" y1="440" y2="416" stroke="#9aa3a8" strokeWidth="2" />
      {sending &&
        [10, 18, 26].map((r, i) => (
          <path
            key={r}
            d={`M${342 - r} ${414 - r * 0.4} Q342 ${400 - r} ${342 + r} ${414 - r * 0.4}`}
            fill="none"
            stroke="#8fe0ab"
            strokeWidth="1.5"
            opacity={0.8 - i * 0.2}
          />
        ))}
      {/* Cables from each sensor to the kit */}
      {callouts.map(([, , x, y]) => (
        <path
          key={`${x}-${y}`}
          d={`M${x} ${y} C ${x + 40} ${y + 60}, 280 ${440 - 40}, 300 440`}
          fill="none"
          stroke="rgb(255 255 255 / 0.15)"
          strokeDasharray="3 4"
        />
      ))}

      {/* Sensors + their live values */}
      {callouts.map(([label, value, x, y, ly]) => (
        <g key={label}>
          <circle cx={x} cy={y} r="6" fill="#f5b82e" />
          <circle cx={x} cy={y} r="11" fill="none" stroke="#f5b82e" strokeOpacity="0.4" />
          <line x1={x + 8} x2="388" y1={y} y2={ly} stroke="rgb(255 255 255 / 0.25)" />
          <text x="394" y={ly - 3} fill="rgb(255 255 255 / 0.55)" fontSize="11">
            {label}
          </text>
          <text x="394" y={ly + 14} fill="white" fontSize="15" fontWeight="600">
            {value}
          </text>
        </g>
      ))}
    </svg>
  );
}
