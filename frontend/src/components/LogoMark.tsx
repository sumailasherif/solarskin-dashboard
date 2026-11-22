// The SolarSkin logo mark: a rising sun drawn as a dome of vertical solar panels,
// standing on a straight base line (the building's façade).
// It's drawn in SVG (not a picture file) so it stays sharp at every size and its
// background is see-through, so it sits nicely on any colour.
// Its colour comes from the text colour around it ("currentColor"), so set it with a
// class, e.g. <LogoMark className="h-8 w-8 text-solar" />.
import { useId } from 'react';

// Where the four thin gaps between the five panels sit (x positions, in SVG units).
const GAPS = [257, 299, 341, 383];
const GAP_WIDTH = 12;

export function LogoMark({ className = '' }: { className?: string }) {
  // Each <svg> needs its own clip-path id, in case the logo appears twice on a page.
  const clipId = useId();

  return (
    <svg viewBox="200 92 240 216" className={className} aria-hidden>
      <defs>
        {/* The sun: a circle with its bottom cut off flat */}
        <clipPath id={clipId}>
          <circle cx="320" cy="215" r="115" />
        </clipPath>
      </defs>

      {/* Five panels = the circle, minus four thin vertical gaps, cut off at y = 285 */}
      <g clipPath={`url(#${clipId})`} fill="currentColor">
        {[200, ...GAPS.map((g) => g + GAP_WIDTH / 2)].map((left, i) => {
          const right = i < GAPS.length ? GAPS[i]! - GAP_WIDTH / 2 : 440;
          return <rect key={left} x={left} y="92" width={right - left} height="193" />;
        })}
      </g>

      {/* Base line under the sun */}
      <rect x="210" y="294" width="220" height="11" rx="5.5" fill="currentColor" />
    </svg>
  );
}
