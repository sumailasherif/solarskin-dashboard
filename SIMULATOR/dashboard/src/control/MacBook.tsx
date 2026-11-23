// A MacBook drawn in CSS, with a real web page running on its screen.
// The screen is a full-size 1440 × 900 "virtual display" (a 13-inch MacBook Air's default size),
// shrunk to fit with a CSS scale, so the page inside behaves exactly as on a real laptop:
// same layout breakpoints, same font sizes, and you can scroll and click it.
// On top: the macOS menu bar (with the Fergana time) and a browser toolbar with the address.
import { useEffect, useRef, useState } from 'react';

const VW = 1440;
const VH = 900;

type MacBookProps = {
  src: string; // the page shown on the screen
  url: string; // what the address bar shows
  label: string;
  caption: string;
  clockText: string; // menu-bar clock
};

export function MacBook({ src, url, label, caption, clockText }: MacBookProps) {
  const screenRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);

  // Re-measure whenever the MacBook changes size, so the display always fills the screen
  useEffect(() => {
    const screen = screenRef.current;
    if (!screen) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry && entry.contentRect.width > 0) setScale(entry.contentRect.width / VW);
    });
    observer.observe(screen);
    return () => observer.disconnect();
  }, []);

  return (
    <figure className="w-full">
      <figcaption className="mb-4 flex items-end justify-between gap-3 px-[6%]">
        <span>
          <span className="font-display text-sm text-white">{label}</span>
          <span className="mt-0.5 block text-xs text-white/50">{caption}</span>
        </span>
        <a
          href={src}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 rounded-full px-3 py-1.5 text-xs text-white/70 ring-1 ring-white/20 transition hover:bg-white/10 hover:text-white"
        >
          Open full size ↗
        </a>
      </figcaption>

      {/* Lid: black bezel around the display */}
      <div className="mx-auto w-[88%] rounded-t-[1.1rem] bg-[#0c0c0e] p-[1.3%] pb-[2%] shadow-[0_30px_60px_-25px_rgb(0_0_0/0.9)] ring-1 ring-[#4a4d55]">
        <div
          ref={screenRef}
          className="relative aspect-[16/10] overflow-hidden rounded-[3px] bg-black"
        >
          <div
            className="absolute top-0 left-0 flex flex-col"
            style={{ width: VW, height: VH, transform: `scale(${scale})`, transformOrigin: '0 0' }}
          >
            <MenuBar clockText={clockText} />
            <BrowserBar url={url} title={label} />
            <iframe src={src} title={label} className="w-full flex-1 border-0 bg-forest-950" />
          </div>
          {/* The notch with the camera */}
          <div className="absolute top-0 left-1/2 flex h-[3.2%] w-[12%] -translate-x-1/2 items-center justify-center rounded-b-[6px] bg-[#0c0c0e]">
            <span
              className="h-[40%] w-auto rounded-full bg-[#1d2430] ring-1 ring-[#2c3442]"
              style={{ aspectRatio: 1 }}
            />
          </div>
        </div>
      </div>

      {/* Base: the aluminium edge of the keyboard half, with the thumb groove */}
      <div className="relative mx-auto aspect-[100/2.4] w-full rounded-t-[2px] rounded-b-[40%_100%] bg-aluminium shadow-[0_18px_30px_-12px_rgb(0_0_0/0.8)]">
        <div className="absolute top-0 left-1/2 h-[45%] w-[14%] -translate-x-1/2 rounded-b-[8px] bg-gradient-to-b from-[#8f939b] to-[#b9bcc3]" />
      </div>
    </figure>
  );
}

/** The macOS menu bar (real size: 26 px high). */
function MenuBar({ clockText }: { clockText: string }) {
  return (
    <div className="flex h-[26px] shrink-0 items-center justify-between bg-[#1c1c1e] px-4 text-[13px] text-white/90">
      <div className="flex gap-5">
        <b>Browser</b>
        {['File', 'Edit', 'View', 'History', 'Window', 'Help'].map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
      <div className="flex items-center gap-4">
        {/* Wi-Fi */}
        <svg viewBox="0 0 20 16" className="h-3.5 w-4" fill="currentColor" aria-hidden>
          <path d="M10 13.5 12.2 11a3.2 3.2 0 0 0-4.4 0L10 13.5Zm-4.3-4.8a6.2 6.2 0 0 1 8.6 0l1.5-1.6a8.4 8.4 0 0 0-11.6 0l1.5 1.6ZM2.4 5.1a11 11 0 0 1 15.2 0L19 3.6a13 13 0 0 0-18 0l1.4 1.5Z" />
        </svg>
        {/* Battery */}
        <span className="flex items-center">
          <span className="flex h-3 w-6 items-center rounded-[3px] p-[1.5px] ring-1 ring-white/70">
            <span className="h-full w-[75%] rounded-[1px] bg-white/90" />
          </span>
          <span className="ml-[1px] h-1.5 w-[2px] rounded-r bg-white/70" />
        </span>
        <span className="tabular-nums">{clockText}</span>
      </div>
    </div>
  );
}

/** A plain browser toolbar: window buttons, back/forward and the address bar (46 px high). */
function BrowserBar({ url, title }: { url: string; title: string }) {
  return (
    <div className="flex h-[46px] shrink-0 items-center gap-4 border-b border-black/40 bg-[#2b2b2e] px-4 text-[13px] text-white/80">
      <div className="flex gap-2">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
      </div>
      <div className="flex gap-3 text-white/50">
        <span>‹</span>
        <span>›</span>
      </div>
      <div className="mx-auto flex h-[30px] w-[560px] items-center justify-center gap-2 rounded-lg bg-[#1c1c1e] px-3 text-white/85">
        <svg viewBox="0 0 12 14" className="h-3 w-3 text-white/50" fill="currentColor" aria-hidden>
          <path d="M3 6V4a3 3 0 0 1 6 0v2h1a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h1Zm1.5 0h3V4a1.5 1.5 0 0 0-3 0v2Z" />
        </svg>
        <span className="truncate">{url}</span>
      </div>
      <span className="w-[120px] truncate text-right text-white/40">{title}</span>
    </div>
  );
}
