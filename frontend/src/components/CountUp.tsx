// Shows a number that counts up from 0 when it scrolls into view, e.g. "8,000".
// The final text is always exactly the `value` you pass in.
import { useEffect, useState } from 'react';
import { useInView } from '../lib/useInView';

type CountUpProps = { value: string; className?: string; durationMs?: number };

export function CountUp({ value, className = '', durationMs = 1600 }: CountUpProps) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  const target = Number(value.replace(/,/g, ''));
  const decimals = value.split('.')[1]?.length ?? 0;
  const [shown, setShown] = useState<number | null>(null);

  useEffect(() => {
    if (!inView || Number.isNaN(target)) return;
    // People who turn off animations get the final number straight away.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3); // fast start, gentle finish
      setShown(t < 1 ? target * eased : null);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, target, durationMs]);

  const text =
    shown === null
      ? value
      : shown.toLocaleString('en-US', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });

  // Until the number scrolls into view we show the REAL value (never a placeholder "0"),
  // so screenshots, printing and slow devices always see the correct figure.
  // The count-up from 0 only runs once the number is on screen.
  return (
    <span ref={ref} className={className} aria-label={value}>
      {text}
    </span>
  );
}
