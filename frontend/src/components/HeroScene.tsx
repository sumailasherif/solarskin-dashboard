// The full-screen hero background: a Fergana skyline at golden hour, with the
// mountains of the valley behind, and one big apartment block whose façade
// is covered in SolarSkin modules. Drawn entirely in code (SVG), so it stays sharp
// on any screen and needs no photo files.
//
// Animations (all switched off if the visitor prefers reduced motion):
//   - the sun "breathes"           (animate-glow)
//   - clouds drift across the sky  (animate-drift)
//   - module rows light up one floor at a time (animate-light-up)
//   - a band of light sweeps over the modules  (animate-shimmer)
//   - little sparks of energy rise off the modules (animate-sparkle)

// --- Main building measurements (in drawing units; the drawing is 1600 × 900) ---
const B = { left: 900, right: 1380, top: 250, ground: 830, floors: 9 };
const FLOOR_H = (B.ground - B.top) / B.floors; // ≈ 64
const WINDOWS_PER_FLOOR = 8;

// Background blocks: [x, width, height]
const SKYLINE: [number, number, number][] = [
  [0, 140, 260],
  [150, 110, 340],
  [270, 170, 220],
  [450, 120, 380],
  [580, 160, 290],
  [750, 120, 330],
  [1470, 130, 300],
];

// Trees along the street: [x, size, colour]
const TREES: [number, number, string][] = [
  [60, 90, '#2f8f57'],
  [130, 60, '#4cc27a'],
  [520, 110, '#2f8f57'],
  [600, 70, '#4cc27a'],
  [820, 120, '#2f8f57'],
  [1430, 100, '#2f8f57'],
  [1500, 70, '#4cc27a'],
  [1560, 90, '#2f8f57'],
];

// A simple repeatable "random" so the lit windows look scattered but never change.
const lit = (f: number, c: number) => (f * 7 + c * 5) % 6 === 0;

export function HeroScene({ className = '' }: { className?: string }) {
  const floors = Array.from({ length: B.floors }, (_, f) => B.top + f * FLOOR_H);
  const winW = 40;
  const gap = (B.right - B.left - 30 - WINDOWS_PER_FLOOR * winW) / (WINDOWS_PER_FLOOR - 1);

  return (
    <svg
      viewBox="0 0 1600 900"
      // "xMaxYMax slice" = fill the whole screen and keep the building (right side) in view.
      preserveAspectRatio="xMaxYMax slice"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="hs-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#04160f" />
          <stop offset="45%" stopColor="#0f3d29" />
          <stop offset="78%" stopColor="#3d6b35" />
          <stop offset="100%" stopColor="#c9962a" />
        </linearGradient>
        <radialGradient id="hs-sun-glow">
          <stop offset="0%" stopColor="#ffd36b" stopOpacity="0.9" />
          <stop offset="35%" stopColor="#f5b82e" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#f5b82e" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hs-wall" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#d9d2bf" />
          <stop offset="100%" stopColor="#a79f8a" />
        </linearGradient>
        <linearGradient id="hs-side" x1="0" x2="1">
          <stop offset="0%" stopColor="#7d7764" />
          <stop offset="100%" stopColor="#5d584a" />
        </linearGradient>
        {/* Solar module glass: deep blue-green with a warm reflection at the bottom */}
        <linearGradient id="hs-pv" x1="0" x2="0.3" y1="0" y2="1">
          <stop offset="0%" stopColor="#123a4a" />
          <stop offset="70%" stopColor="#0b2430" />
          <stop offset="100%" stopColor="#b98a2a" />
        </linearGradient>
        <linearGradient id="hs-shine" x1="0" x2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="50%" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hs-ground" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#17583a" />
          <stop offset="100%" stopColor="#04160f" />
        </linearGradient>
        {/* Only the module rows: used to keep the light sweep on the glass */}
        <clipPath id="hs-pv-clip">
          {floors.map((y) => (
            <rect key={y} x={B.left + 12} y={y + 34} width={B.right - B.left - 24} height={26} />
          ))}
        </clipPath>
      </defs>

      {/* Sky */}
      <rect width="1600" height="900" fill="url(#hs-sky)" />

      {/* Sun + glow */}
      <circle
        cx="1500"
        cy="330"
        r="340"
        fill="url(#hs-sun-glow)"
        className="svg-centre animate-glow"
      />
      <circle cx="1500" cy="330" r="62" fill="#ffd36b" />

      {/* Clouds, drifting slowly to the right */}
      {[
        { y: 120, s: 1, d: '0s' },
        { y: 230, s: 0.7, d: '-25s' },
        { y: 80, s: 0.55, d: '-50s' },
      ].map((c) => (
        <g key={c.y} className="animate-drift" style={{ animationDelay: c.d }} opacity="0.12">
          <g transform={`translate(0 ${c.y}) scale(${c.s})`}>
            <ellipse cx="0" cy="0" rx="120" ry="26" fill="#fff" />
            <ellipse cx="60" cy="-16" rx="70" ry="26" fill="#fff" />
            <ellipse cx="-50" cy="-10" rx="60" ry="20" fill="#fff" />
          </g>
        </g>
      ))}

      {/* Mountains of the Fergana Valley (two layers for depth) */}
      <polygon
        points="0,600 160,500 300,560 470,440 640,540 790,480 960,560 1140,450 1310,540 1460,470 1600,530 1600,900 0,900"
        fill="#1d4a30"
        opacity="0.7"
      />
      <polygon
        points="0,660 200,590 380,640 560,570 740,640 930,600 1120,650 1320,590 1500,640 1600,610 1600,900 0,900"
        fill="#123a26"
      />

      {/* Background apartment blocks */}
      {SKYLINE.map(([x, w, h]) => (
        <g key={x}>
          <rect x={x} y={B.ground - h} width={w} height={h} fill="#0a2a1c" />
          {/* a few warm windows */}
          {Array.from({ length: Math.floor(h / 40) }).map((_, f) =>
            Array.from({ length: Math.floor(w / 30) }).map((_, c) =>
              lit(f + x, c) ? (
                <rect
                  key={`${f}-${c}`}
                  x={x + 10 + c * 30}
                  y={B.ground - h + 14 + f * 40}
                  width="12"
                  height="14"
                  fill="#f5b82e"
                  opacity="0.55"
                />
              ) : null,
            ),
          )}
        </g>
      ))}

      {/* ===== The SolarSkin building ===== */}
      {/* Side wall (in shadow) for a 3D feel */}
      <polygon
        points={`${B.right},${B.top} ${B.right + 90},${B.top + 36} ${B.right + 90},${B.ground} ${B.right},${B.ground}`}
        fill="url(#hs-side)"
      />
      {/* Roof edge */}
      <polygon
        points={`${B.left - 8},${B.top - 12} ${B.right + 8},${B.top - 12} ${B.right + 98},${B.top + 26} ${B.right + 90},${B.top + 36} ${B.right},${B.top} ${B.left - 8},${B.top}`}
        fill="#4a4639"
      />
      {/* Front wall */}
      <rect
        x={B.left}
        y={B.top}
        width={B.right - B.left}
        height={B.ground - B.top}
        fill="url(#hs-wall)"
      />

      {floors.map((y, f) => (
        <g key={y}>
          {/* Windows */}
          {Array.from({ length: WINDOWS_PER_FLOOR }).map((_, c) => (
            <rect
              key={c}
              x={B.left + 15 + c * (winW + gap)}
              y={y + 6}
              width={winW}
              height={24}
              rx="2"
              fill={lit(f, c) ? '#ffd36b' : '#1c2b2a'}
            />
          ))}

          {/* A row of SolarSkin modules under the windows, switching on floor by floor */}
          <g
            className="animate-light-up"
            style={{ animationDelay: `${0.4 + (B.floors - f) * 0.12}s` }}
          >
            <rect
              x={B.left + 12}
              y={y + 34}
              width={B.right - B.left - 24}
              height={26}
              fill="url(#hs-pv)"
              stroke="#0a1c22"
              strokeWidth="1.5"
            />
            {/* cell lines */}
            {Array.from({ length: 12 }).map((_, i) => (
              <line
                key={i}
                x1={B.left + 12 + (i + 1) * 38}
                x2={B.left + 12 + (i + 1) * 38}
                y1={y + 34}
                y2={y + 60}
                stroke="#0a1c22"
                strokeWidth="1.2"
              />
            ))}
            <line
              x1={B.left + 12}
              x2={B.right - 12}
              y1={y + 47}
              y2={y + 47}
              stroke="#0a1c22"
              strokeWidth="0.8"
              opacity="0.7"
            />
          </g>
        </g>
      ))}

      {/* The light sweep, kept on the glass by the clip path */}
      <g clipPath="url(#hs-pv-clip)">
        <rect
          x={(B.left + B.right) / 2 - 90}
          y={B.top}
          width="180"
          height={B.ground - B.top}
          fill="url(#hs-shine)"
          className="animate-shimmer"
        />
      </g>

      {/* Energy sparks rising off the modules */}
      {Array.from({ length: 14 }).map((_, i) => (
        <circle
          key={i}
          cx={B.left + 40 + ((i * 137) % (B.right - B.left - 80))}
          cy={B.top + 40 + ((i * 3) % B.floors) * FLOOR_H}
          r={i % 3 === 0 ? 3.5 : 2.5}
          fill="#ffd36b"
          opacity="0"
          className="animate-sparkle"
          style={{ animationDelay: `${(i * 0.45) % 3.2}s` }}
        />
      ))}

      {/* Ground + street trees */}
      <rect x="0" y={B.ground} width="1600" height={900 - B.ground} fill="url(#hs-ground)" />
      {TREES.map(([x, size, colour]) => (
        <g key={x}>
          <rect
            x={x - 3}
            y={B.ground - size * 0.35}
            width="6"
            height={size * 0.35}
            fill="#082417"
          />
          <ellipse
            cx={x}
            cy={B.ground - size * 0.62}
            rx={size * 0.3}
            ry={size * 0.45}
            fill={colour}
          />
        </g>
      ))}
    </svg>
  );
}
