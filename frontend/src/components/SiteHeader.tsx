// Top bar (logo + round menu button) and the full-screen yellow menu it opens,
// with huge numbered links on a solid yellow page.
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LogoMark } from './LogoMark';

// The page sections the menu links to. The ids match <section id="..."> in App.tsx.
const LINKS = ['story', 'live', 'impact', 'sdgs', 'measure', 'method'] as const;

export function SiteHeader() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Remember whether the page is scrolled down a little (to switch the bar style).
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // While the menu is open: stop the page behind it from scrolling,
  // and let the Escape key close it.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4">
        {/* Once you scroll, the bar turns into a frosted-glass pill so it stays readable
            on every section (dark green or yellow). */}
        <div
          className={`mx-auto flex items-center justify-between rounded-full py-2 pr-2 pl-4 transition duration-300 ${
            open
              ? 'text-forest-950'
              : scrolled
                ? 'bg-forest-950/70 text-white shadow-lg ring-1 ring-white/10 backdrop-blur-md'
                : 'text-white'
          }`}
        >
          <a
            href="#top"
            className="flex items-center gap-3 font-display text-base tracking-[0.2em] uppercase sm:text-lg"
          >
            {/* Logo mark: yellow normally, dark on the yellow menu page so it stays visible */}
            <LogoMark className={`h-8 w-9 ${open ? 'text-forest-950' : 'text-solar'}`} />
            {/* Wordmark like the logo: SOLAR bold, SKIN lighter and yellow */}
            <span>
              <span className="font-bold">Solar</span>
              <span className={`font-normal ${open ? '' : 'text-solar'}`}>Skin</span>
            </span>
          </a>

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? t('nav.close') : t('nav.open')}
            className={`grid h-11 w-11 place-items-center rounded-full transition hover:scale-105 ${
              open ? 'bg-forest-950 text-solar' : 'bg-solar text-forest-950'
            }`}
          >
            {/* Two lines that turn into an X when the menu is open */}
            <span className="relative block h-3 w-5">
              <span
                className={`absolute left-0 h-0.5 w-5 bg-current transition ${open ? 'top-1.5 rotate-45' : 'top-0'}`}
              />
              <span
                className={`absolute left-0 h-0.5 w-5 bg-current transition ${open ? 'top-1.5 -rotate-45' : 'top-3'}`}
              />
            </span>
          </button>
        </div>
      </header>

      {/* The menu itself. "hidden" keeps it out of the way (and away from screen readers) when closed. */}
      <nav
        id="site-menu"
        hidden={!open}
        className="fixed inset-0 z-40 overflow-y-auto bg-solar text-forest-950"
      >
        <div className="mx-auto flex min-h-full max-w-7xl flex-col justify-end gap-12 px-4 pt-28 pb-10 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
          <ol>
            {LINKS.map((id, i) => (
              <li key={id} className="border-b border-forest-950/15">
                <a
                  href={`#${id}`}
                  onClick={() => setOpen(false)}
                  className="group flex items-baseline gap-4 py-2 font-display text-[clamp(2rem,7vw,5rem)] leading-none uppercase transition hover:translate-x-3"
                >
                  <span className="font-sans text-sm font-semibold tabular-nums">0{i + 1}</span>
                  {t(`nav.${id}`)}
                </a>
              </li>
            ))}
          </ol>

          <div className="max-w-xs text-sm">
            <p className="text-xs font-semibold tracking-widest text-forest-950/60 uppercase">
              {t('nav.pilot')}
            </p>
            <p className="mt-2 text-lg font-semibold">{t('nav.pilotPlace')}</p>
            <p className="text-forest-950/70">{t('nav.pilotWall')}</p>
          </div>
        </div>
      </nav>
    </>
  );
}
