// A tiny trend line for a list of numbers (no axes, just the shape of the day).
type SparklineProps = { values: number[]; colour: string; className?: string };

export function Sparkline({ values, colour, className = '' }: SparklineProps) {
  const W = 100;
  const H = 28;

  // Not enough data yet: draw a faint flat line
  if (values.length < 2) {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className={className} aria-hidden>
        <line
          x1="0"
          y1={H - 2}
          x2={W}
          y2={H - 2}
          stroke="rgb(255 255 255 / 0.15)"
          strokeDasharray="3 3"
        />
      </svg>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1; // avoid dividing by 0 when the line is flat
  const points = values
    .map((v, i) => `${(i / (values.length - 1)) * W},${H - 2 - ((v - min) / range) * (H - 4)}`)
    .join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className={className} aria-hidden>
      <polyline
        points={points}
        fill="none"
        stroke={colour}
        strokeWidth="1.6"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
