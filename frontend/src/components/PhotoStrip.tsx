// A band of real photos that you can steer:
//   • On its own it drifts slowly to the left.
//   • Point the mouse at the RIGHT side → it slides LEFT; at the LEFT side → it slides RIGHT.
//     The further from the middle, the faster. In the middle it stops, so you can look.
//   • The round arrow buttons move it one photo at a time.
//   • You can also drag it with the mouse, or swipe it on a phone (it glides to a stop).
// The row is drawn three times side by side, so even on very wide screens the loop never shows a gap.
//
// The movement runs in a requestAnimationFrame loop (about 60 times a second) and moves the
// row with a CSS transform. The moving numbers live in a ref, not React state, so all those
// updates don't make React re-draw the page.
import {
  useEffect,
  useRef,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { useTranslation } from 'react-i18next';
import { PHOTOS, photoUrl, type Photo } from '../content/photos';
import { PhotoCredit } from './PhotoCredit';

// Walls, balconies and apartment blocks only: SolarSkin is solar ON WALLS, not a solar farm.
// Order chosen so similar photos are not next to each other.
const STRIP: Photo[] = [
  PHOTOS.solarFacade,
  PHOTOS.tashkentBlocks,
  PHOTOS.almatyBlocks,
  PHOTOS.tashkentBalcony,
];

// Speeds are in pixels per frame (at 60 frames a second).
const AUTO_SPEED = -0.5; // gentle drift to the left when nobody is steering
const MAX_SPEED = 7; // fastest speed when the mouse is at the very edge
const DEAD_ZONE = 0.1; // middle 20% of the strip = stand still

/** True if the visitor asked their device for less motion. */
const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={dir === 'left' ? 'M10 3 5 8l5 5' : 'M6 3l5 5-5 5'} />
    </svg>
  );
}

export function PhotoStrip() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLUListElement>(null);

  // Everything that moves. x = how far the row is shifted (px, always between -rowWidth and 0).
  const motion = useRef({
    x: 0,
    speed: AUTO_SPEED, // current speed
    target: AUTO_SPEED, // speed we're easing towards (set by the mouse position)
    nudge: 0, // distance still to travel after an arrow-button click
    dragging: false,
    lastPointerX: 0,
    dragDistance: 0, // how far the current drag moved (to tell a drag from a click)
  });

  // The animation loop
  useEffect(() => {
    const track = trackRef.current;
    const row = rowRef.current;
    if (!track || !row) return;
    const m = motion.current;
    if (prefersReducedMotion()) m.speed = m.target = 0; // only move when the visitor asks

    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const frames = Math.min(64, now - last) / (1000 / 60); // frames since last tick
      last = now;

      if (!m.dragging) {
        m.speed += (m.target - m.speed) * 0.06 * frames; // ease towards the wanted speed
        const step = m.nudge * 0.12 * frames; // arrow buttons: glide, slowing down at the end
        m.nudge -= step;
        m.x += m.speed * frames + step;
      }

      // Keep x inside one row's width, so the two copies loop seamlessly.
      const rowWidth = row.offsetWidth;
      if (rowWidth > 0) {
        while (m.x <= -rowWidth) m.x += rowWidth;
        while (m.x > 0) m.x -= rowWidth;
      }
      track.style.transform = `translate3d(${m.x}px, 0, 0)`;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Mouse position → direction and speed (right side → move left, left side → move right)
  const onMouseMove = (e: ReactMouseEvent) => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) return;
    const box = section.getBoundingClientRect();
    const fromMiddle = (e.clientX - box.left) / box.width - 0.5; // -0.5 (left) … +0.5 (right)
    const strength = Math.max(0, Math.abs(fromMiddle) - DEAD_ZONE) / (0.5 - DEAD_ZONE); // 0 … 1
    motion.current.target = -Math.sign(fromMiddle) * strength * MAX_SPEED;
  };
  const onMouseLeave = () => {
    motion.current.target = prefersReducedMotion() ? 0 : AUTO_SPEED;
  };

  // Arrow buttons: move by about one photo
  const move = (direction: 'prev' | 'next') => {
    const row = rowRef.current;
    const onePhoto = row ? row.offsetWidth / STRIP.length : 400;
    motion.current.nudge += direction === 'next' ? -onePhoto : onePhoto;
  };

  // Dragging with the mouse or swiping with a finger
  const onPointerDown = (e: ReactPointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const m = motion.current;
    m.dragging = true;
    m.lastPointerX = e.clientX;
    m.dragDistance = 0;
    m.nudge = 0;

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - m.lastPointerX;
      m.lastPointerX = ev.clientX;
      m.x += dx;
      m.dragDistance += Math.abs(dx);
      m.speed = dx; // remember the flick speed, so it glides on after you let go
    };
    const onUp = () => {
      m.dragging = false;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };
  // After a real drag, ignore the "click" the browser sends when you let go.
  const onClickCapture = (e: ReactMouseEvent) => {
    if (motion.current.dragDistance > 6) {
      e.preventDefault();
      e.stopPropagation();
      motion.current.dragDistance = 0;
    }
  };

  const row = (copy: boolean) => (
    <ul
      ref={copy ? undefined : rowRef}
      className="flex shrink-0 gap-4 pr-4"
      aria-hidden={copy || undefined}
    >
      {STRIP.map((photo, i) => (
        <li
          key={photo.id}
          className={`relative h-56 shrink-0 overflow-hidden sm:h-72 ${
            i % 3 === 1 ? 'w-44 sm:w-56' : 'w-72 sm:w-[26rem]'
          } ${i % 2 ? 'rounded-tl-[2.5rem] rounded-br-[2.5rem]' : 'rounded-tr-[2.5rem] rounded-bl-[2.5rem]'} rounded-lg`}
        >
          <img
            src={photoUrl(photo, 800)}
            alt={copy ? '' : photo.alt}
            loading="lazy"
            decoding="async"
            draggable={false}
            className="h-full w-full object-cover transition duration-700 hover:scale-105"
          />
          <PhotoCredit photo={photo} focusable={!copy} />
        </li>
      ))}
    </ul>
  );

  const ARROW =
    'absolute top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-forest-950 shadow-lg ring-1 ring-white/60 backdrop-blur transition hover:scale-110 hover:bg-solar focus-visible:bg-solar focus-visible:outline-none';

  return (
    <section
      ref={sectionRef}
      aria-label={t('gallery.label')}
      className="relative overflow-hidden bg-forest-950 py-6"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {/* The moving row (touch-action: pan-y = vertical swipes still scroll the page) */}
      <div
        ref={trackRef}
        className="flex w-max cursor-grab touch-pan-y select-none will-change-transform active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onClickCapture={onClickCapture}
      >
        {row(false)}
        {row(true)}
        {row(true)}
      </div>

      {/* Soft dark fades on both edges, so photos slide in and out gently */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-forest-950 to-transparent sm:w-20"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-forest-950 to-transparent sm:w-20"
      />

      {/* Manual controls */}
      <button
        type="button"
        onClick={() => move('prev')}
        aria-label={t('gallery.prev')}
        className={`${ARROW} left-3 sm:left-5`}
      >
        <Chevron dir="left" />
      </button>
      <button
        type="button"
        onClick={() => move('next')}
        aria-label={t('gallery.next')}
        className={`${ARROW} right-3 sm:right-5`}
      >
        <Chevron dir="right" />
      </button>
    </section>
  );
}
