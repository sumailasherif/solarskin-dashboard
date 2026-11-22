// Tells you when an element has scrolled onto the screen.
// Uses IntersectionObserver: the browser tells us when the element enters the screen.
import { useEffect, useRef, useState } from 'react';

/** true once the element has been on screen (it then stays true). */
export function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  // In old browsers / tests without IntersectionObserver, just show everything.
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [inView]);

  return { ref, inView };
}
