// A round badge with text slowly spinning around it. In the middle plays a tiny looping
// "video": a photo of solar panels with a slow camera drift, and glowing energy lines
// running across the panels. It's built from a photo + animated SVG lines (no video
// file), so it loads instantly and stops moving for people who turn animations off.
// Decoration only (not a link): the "See the live wall" button is the one way to the live section.
import { useId } from 'react';
import { PHOTOS, photoUrl } from '../content/photos';

type OrbitBadgeProps = { text: string };

// The energy lines: gentle curves FALLING from the top down onto the panels, like sunlight
// arriving (drawn in a 100 × 100 box). Each path starts at the top, so the moving dash travels downwards.
const STREAKS = [
  { d: 'M105 -8 C85 15 68 32 50 50 S18 85 -5 108', delay: '0s' },
  { d: 'M75 -8 C62 18 50 36 36 56 S12 90 -5 100', delay: '0.9s' },
  { d: 'M112 30 C95 45 80 58 64 72 S38 98 20 112', delay: '1.7s' },
];

export function OrbitBadge({ text }: OrbitBadgeProps) {
  // Unique ids, in case the badge appears more than once on a page
  const id = useId();
  const pathId = `${id}-orbit`;
  const glowId = `${id}-glow`;

  return (
    <div aria-hidden className="relative grid h-40 w-40 place-items-center">
      {/* The spinning ring of text, drawn along an invisible circle */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 animate-orbit">
        <defs>
          <path id={pathId} d="M50,50 m-42,0 a42,42 0 1,1 84,0 a42,42 0 1,1 -84,0" />
        </defs>
        {/* The text goes round ONCE and is spread to fill the whole circle exactly
            (circumference = 2 × π × 42 ≈ 263.9), so any sentence length fits without overlapping. */}
        <text className="fill-white text-[7.4px] font-semibold uppercase">
          <textPath href={`#${pathId}`} textLength="263" lengthAdjust="spacing">
            {text}
          </textPath>
        </text>
      </svg>

      {/* The round "mini video" in the middle */}
      <span className="relative h-24 w-24 overflow-hidden rounded-full shadow-[0_0_40px_-4px] shadow-solar/70 ring-2 ring-solar">
        {/* 1. Close-up of solar cells, slowly drifting and zooming like a camera shot */}
        <img
          src={photoUrl(PHOTOS.panelCloseUp, 240)}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full animate-drift-zoom object-cover"
        />
        {/* 2. Slightly darker, so the glowing lines stand out */}
        <span className="absolute inset-0 bg-gradient-to-tr from-forest-950/55 to-forest-950/10" />

        {/* 3. Glowing energy lines running across the panels */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
          <defs>
            <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {STREAKS.map((s) => (
            <path
              key={s.d}
              d={s.d}
              pathLength={100}
              fill="none"
              stroke="#ffd36b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="22 78"
              filter={`url(#${glowId})`}
              className="animate-flow"
              style={{ animationDelay: s.delay }}
            />
          ))}
        </svg>
      </span>
    </div>
  );
}
