// The animated background behind the impact numbers: a cinematic "solar sunset" scene,
// drawn entirely in code (no video file), that covers the whole section.
//
//   1. Warm sunset sky with a glowing low sun near the top.
//   2. A surface of solar panels in 3D perspective that fades into the horizon and slowly
//      glides towards you (like a camera moving over a solar roof).
//   3. Golden glare: the sun's reflection on the panels, plus a beam of light drifting across.
//   4. Two translucent diagonal bands with glowing light trails running along their edges.
//   5. Every few seconds, an energy current crackles across the panels.
//
// With "reduce motion" switched on in the visitor's system settings, all of this stays still
// (see the rule at the end of index.css); the energy currents are then simply hidden.
import { useId } from 'react';

// Diagonal bands (wide, faint strokes) and the glowing trails along their edges.
// Coordinates are in a 1600 × 1000 drawing that is scaled to cover the section.
const BANDS = [
  // top right, pointing left (green trail)
  {
    band: 'M1800 -150 L1180 330 L1800 810',
    trail: 'M1650 -150 L1080 291 Q1030 330 1080 369 L1650 810',
    colour: '#8fe0ab',
    duration: '7s',
  },
  // bottom left, pointing right (orange trail)
  {
    band: 'M-200 420 L420 900 L-200 1380',
    trail: 'M-50 420 L520 861 Q570 900 520 939 L-50 1380',
    colour: '#ffb347',
    duration: '8s',
  },
];

// Jagged "lightning" paths for the energy currents
const BOLTS = [
  {
    d: 'M980 250 L955 320 L990 350 L930 445 L965 475 L880 585 L910 612 L820 728 L850 758 L760 878 L782 905 L700 1010',
    delay: '1s',
  },
  {
    d: 'M1320 300 L1298 360 L1335 395 L1262 498 L1300 528 L1226 640 L1252 668 L1180 760',
    delay: '4.5s',
  },
];

export function SolarPanelBackdrop() {
  const id = useId();
  const glow = `${id}-glow`;
  const softGlow = `${id}-soft`;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden bg-[#040b08]">
      {/* 1. Sunset sky: warm at the top, fading into the dark */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(150,85,15,0.45)_0%,rgba(90,50,10,0.25)_14%,transparent_32%)]" />
      {/* The low sun: a big warm halo and a bright core that gently pulses */}
      <div className="absolute top-[-6%] right-[6%] h-[55%] w-[50%] bg-[radial-gradient(closest-side,rgba(255,196,90,0.55),rgba(245,184,46,0.18)_45%,transparent)]" />
      <div className="absolute top-[12%] right-[26%] h-20 w-20 animate-glow rounded-full bg-[#fff1c2] shadow-[0_0_80px_30px_rgba(255,190,80,0.6)] blur-[2px] sm:h-24 sm:w-24" />

      {/* 2. The solar panels, tilted back and fading into the horizon near the top */}
      <div className="absolute inset-x-[-60%] top-[6%] bottom-[-25%] [mask-image:linear-gradient(to_bottom,transparent,black_38%)] [transform:perspective(1400px)_rotateX(46deg)]">
        {/* Taller than needed, so it can slide down one module and loop without a gap */}
        <div className="absolute inset-x-0 top-[-720px] bottom-0 animate-panel-glide bg-solar-cells will-change-transform" />
      </div>

      {/* 3. Golden glare: the sun's reflection on the panels + a drifting beam of light */}
      <div className="absolute top-[22%] right-[18%] h-[60%] w-[22%] bg-[radial-gradient(closest-side,rgba(255,190,90,0.35),transparent)] mix-blend-screen blur-xl" />
      <div className="absolute top-[30%] left-1/2 h-[55%] w-[55%] -translate-x-1/2 animate-light-sweep rounded-full bg-[radial-gradient(closest-side,rgba(255,214,150,0.22),rgba(255,214,150,0.06)_55%,transparent)] mix-blend-screen blur-2xl" />

      {/* 4 + 5. Bands with light trails, and the energy currents */}
      <svg
        viewBox="0 0 1600 1000"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <filter id={glow} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id={softGlow} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {BANDS.map((b) => (
          <g key={b.band}>
            {/* the faint band itself */}
            <path
              d={b.band}
              fill="none"
              stroke="rgb(255 255 255 / 0.04)"
              strokeWidth="210"
              strokeLinejoin="round"
            />
            {/* the glowing trail racing along its edge */}
            <path
              d={b.trail}
              pathLength={100}
              fill="none"
              stroke={b.colour}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="12 88"
              filter={`url(#${glow})`}
              className="animate-flow"
              style={{ animationDuration: b.duration }}
            />
          </g>
        ))}

        {BOLTS.map((bolt) => (
          <path
            key={bolt.d}
            d={bolt.d}
            pathLength={100}
            fill="none"
            stroke="#fff4cf"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeDasharray="100"
            filter={`url(#${softGlow})`}
            className="animate-bolt opacity-0"
            style={{ animationDelay: bolt.delay }}
          />
        ))}
      </svg>

      {/* 6. Gentle fade at the bottom edge into the next section */}
      <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-b from-transparent to-forest-950/80" />
    </div>
  );
}
