// "How the cooling works": a small looping animation of two walls under the same sun.
//   • Left, the bare wall: sun rays hit it directly, heat shimmers off it, and its
//     thermometer stands high (orange).
//   • Right, the SolarSkin wall: panels catch the rays and turn them into energy sparks,
//     the wall behind stays in shade (cool green tint), and its thermometer stays low.
// It's an illustration, not a measurement: no numbers. The measured difference appears in
// the "Wall cooling" card above it once the sensors are running.
// With "reduce motion" switched on, it stays still (thermometers keep their high/low level).
import { useTranslation } from 'react-i18next';
import { Reveal } from './Reveal';

const WALL = '#cdbb98'; // same warm concrete colour as the hero building
const HOT = '#ff9a3d';
const COOL = '#4cc27a';
const FLOORS = [0, 1, 2, 3];
const COLUMNS = [0, 1, 2];

// Scale/move SVG shapes around their own box (needed for CSS transforms inside SVG)
const fromBottom = { transformBox: 'fill-box', transformOrigin: 'bottom' } as const;
const ownBox = { transformBox: 'fill-box', transformOrigin: 'center' } as const;

/** Windows on a wall: 3 columns × 4 floors */
function Windows({ x }: { x: number }) {
  return (
    <>
      {FLOORS.map((f) =>
        COLUMNS.map((c) => (
          <rect
            key={`${f}-${c}`}
            x={x + 22 + c * 50}
            y={122 + f * 46}
            width="26"
            height="20"
            rx="2"
            fill="#1d2b26"
          />
        )),
      )}
    </>
  );
}

/** A thermometer: glass tube, bulb, and a liquid column that rises from the bottom */
function Thermometer({
  x,
  colour,
  level,
  hot,
}: {
  x: number;
  colour: string;
  level: number;
  hot: boolean;
}) {
  const tubeTop = 140;
  const tubeBottom = 284;
  const liquidTop = tubeBottom - (tubeBottom - tubeTop) * level;
  return (
    <g>
      <rect
        x={x - 7}
        y={tubeTop}
        width="14"
        height={tubeBottom - tubeTop + 6}
        rx="7"
        fill="rgb(255 255 255 / 0.1)"
        stroke="rgb(255 255 255 / 0.3)"
      />
      <rect
        x={x - 3.5}
        y={liquidTop}
        width="7"
        height={tubeBottom - liquidTop + 4}
        rx="3.5"
        fill={colour}
        style={fromBottom}
        className={hot ? 'animate-thermo-hot' : 'animate-thermo-cool'}
      />
      <circle cx={x} cy={tubeBottom + 10} r="12" fill={colour} />
    </g>
  );
}

function CoolingScene() {
  const { t } = useTranslation();

  return (
    <svg viewBox="0 0 640 340" className="h-auto w-full" aria-hidden>
      <defs>
        <radialGradient id="cooling-sun">
          <stop offset="0" stopColor="#fff1c2" />
          <stop offset="0.45" stopColor="#f5b82e" stopOpacity="0.9" />
          <stop offset="1" stopColor="#f5b82e" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="cooling-cool">
          <stop offset="0" stopColor={COOL} stopOpacity="0.35" />
          <stop offset="1" stopColor={COOL} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Sun, with rays travelling to both walls */}
      <circle
        cx="320"
        cy="46"
        r="46"
        fill="url(#cooling-sun)"
        className="svg-centre animate-glow"
      />
      <circle cx="320" cy="46" r="16" fill="#fff1c2" />
      {['M300 66 L150 116', 'M308 72 L215 150', 'M340 66 L480 108', 'M332 72 L430 140'].map(
        (d, i) => (
          <path
            key={d}
            d={d}
            pathLength={100}
            stroke="#f5b82e"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="10 14"
            className="animate-flow"
            style={{ animationDuration: '3s', animationDelay: `${i * 0.3}s` }}
          />
        ),
      )}

      {/* Ground */}
      <line x1="20" y1="300" x2="620" y2="300" stroke="rgb(255 255 255 / 0.18)" strokeWidth="2" />

      {/* ── LEFT: bare wall in full sun ── */}
      <rect x="70" y="100" width="170" height="200" rx="4" fill={WALL} />
      <Windows x={70} />
      {/* warm glow pulsing on the sunny wall */}
      <rect
        x="70"
        y="100"
        width="170"
        height="200"
        rx="4"
        fill={HOT}
        opacity="0.22"
        className="animate-warm-pulse"
      />
      {/* heat shimmer rising off the wall */}
      {[
        { x: 95, y: 112, d: '0s' },
        { x: 150, y: 104, d: '1s' },
        { x: 205, y: 112, d: '2s' },
        { x: 120, y: 200, d: '0.5s' },
        { x: 185, y: 210, d: '1.6s' },
      ].map((h) => (
        <path
          key={`${h.x}-${h.y}`}
          d={`M${h.x} ${h.y} q7 -8 0 -16 q-7 -8 0 -16 q7 -8 0 -16`}
          fill="none"
          stroke={HOT}
          strokeWidth="3"
          strokeLinecap="round"
          style={{ ...ownBox, animationDelay: h.d }}
          className="animate-heat-rise opacity-0"
        />
      ))}
      <Thermometer x={268} colour={HOT} level={0.85} hot />

      {/* ── RIGHT: SolarSkin wall, shaded by panels ── */}
      <ellipse cx="485" cy="200" rx="130" ry="110" fill="url(#cooling-cool)" />
      <rect x="400" y="100" width="170" height="200" rx="4" fill={WALL} />
      <Windows x={400} />
      {/* the wall is in shade behind the panels */}
      <rect x="400" y="100" width="170" height="200" rx="4" fill="#0b2a1c" opacity="0.4" />
      <rect x="400" y="100" width="170" height="200" rx="4" fill={COOL} opacity="0.12" />
      {/* solar panels mounted in front of the wall, one band per floor */}
      {FLOORS.map((f) => (
        <g key={f}>
          <rect
            x="392"
            y={110 + f * 46}
            width="186"
            height="9"
            fill="rgb(0 0 0 / 0.25)"
            transform="translate(0 26)"
          />
          <rect
            x="392"
            y={110 + f * 46}
            width="186"
            height="26"
            rx="2"
            fill="#13232b"
            stroke="#4d6b78"
            strokeWidth="1.5"
          />
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((c) => (
            <line
              key={c}
              x1={392 + c * 18.6}
              y1={110 + f * 46}
              x2={392 + c * 18.6}
              y2={136 + f * 46}
              stroke="rgb(200 220 230 / 0.35)"
              strokeWidth="1"
            />
          ))}
        </g>
      ))}
      {/* energy sparks: sunlight turned into electricity */}
      {[
        { x: 420, y: 108, d: '0s' },
        { x: 470, y: 104, d: '0.8s' },
        { x: 525, y: 108, d: '1.6s' },
        { x: 560, y: 150, d: '2.3s' },
        { x: 445, y: 152, d: '1.2s' },
      ].map((s) => (
        <circle
          key={`${s.x}-${s.y}`}
          cx={s.x}
          cy={s.y}
          r="3.5"
          fill="#ffd36b"
          style={{ ...ownBox, animationDelay: s.d }}
          className="animate-sparkle opacity-0"
        />
      ))}
      <Thermometer x={598} colour={COOL} level={0.3} hot={false} />

      {/* Labels */}
      <text x="155" y="328" textAnchor="middle" className="fill-white text-[15px] font-semibold">
        {t('cooling.bare')}
      </text>
      <text x="485" y="328" textAnchor="middle" className="fill-white text-[15px] font-semibold">
        {t('cooling.skin')}
      </text>
      <text x="268" y="128" textAnchor="middle" className="text-[12px] font-semibold" fill={HOT}>
        {t('cooling.hotter')}
      </text>
      <text x="598" y="128" textAnchor="middle" className="text-[12px] font-semibold" fill={COOL}>
        {t('cooling.cooler')}
      </text>
    </svg>
  );
}

/** The dark panel in the Readings section: the animation + a two-line caption */
export function CoolingDemo() {
  const { t } = useTranslation();

  return (
    <Reveal className="mt-4">
      <figure className="grid items-center gap-8 rounded-tl-[2.75rem] rounded-tr-lg rounded-br-[2.75rem] rounded-bl-lg bg-forest-950 p-6 text-white sm:p-8 lg:grid-cols-[1.4fr_1fr] lg:gap-12 lg:p-10">
        <CoolingScene />

        <figcaption>
          <h3 className="font-serif text-4xl leading-tight italic sm:text-5xl">
            {t('cooling.title')}
          </h3>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-white/70">
            {t('cooling.text')}
          </p>
        </figcaption>
      </figure>
    </Reveal>
  );
}
