// The SolarSkin logo mark: a rising sun drawn as a dome of vertical solar panels,
// standing on a straight base line (the building's façade).
// Every number below was measured from the official logo image (640×640 px), so
// this drawing matches it exactly, just without the navy circle around it.
// Drawn in SVG (not a picture file) so it stays sharp at every size and its
// background is see-through. Its colour comes from the text colour around it
// ("currentColor"), so set it with a class, e.g. <LogoMark className="h-8 w-9 text-solar" />.
import { useId } from 'react';

// The five panels: [left edge, right edge] in logo pixels. The 15 px spaces between
// them are the gaps. (They are NOT centred: the left panel is narrow, the right one wide.)
const PANELS: [number, number][] = [
  [190, 240],
  [255, 281],
  [296, 321],
  [336, 362],
  [377, 450],
];

export function LogoMark({ className = '' }: { className?: string }) {
  // Each <svg> needs its own clip-path id, in case the logo appears twice on a page.
  const clipId = useId();

  return (
    <svg viewBox="198 98 244 208" className={className} aria-hidden>
      <defs>
        {/* The sun: a circle (centre 319.5, 220, radius 119) */}
        <clipPath id={clipId}>
          <circle cx="319.5" cy="220" r="119" />
        </clipPath>
      </defs>

      {/* The panels, cut to the circle and stopped flat at y = 283.5 */}
      <g clipPath={`url(#${clipId})`} fill="currentColor">
        {PANELS.map(([left, right]) => (
          <rect key={left} x={left} y="98" width={right - left} height={283.5 - 98} />
        ))}
      </g>

      {/* Base line under the sun */}
      <rect x="210" y="295" width="221" height="9" rx="4.5" fill="currentColor" />
    </svg>
  );
}
