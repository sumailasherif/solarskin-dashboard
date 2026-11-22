// Wrap anything in <Reveal> and it fades + rises into place when you scroll to it.
import type { ReactNode } from 'react';
import { useInView } from '../lib/useInView';

type RevealProps = { children: ReactNode; className?: string; delayMs?: number };

export function Reveal({ children, className = '', delayMs = 0 }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`reveal ${inView ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  );
}
