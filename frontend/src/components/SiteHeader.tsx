// Top bar (logo + round menu button) and the full-screen yellow menu it opens,
// with huge numbered links on a solid yellow page.
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LogoMark } from './LogoMark';

// The page sections the menu links to. The ids match <section id="..."> in App.tsx.
const LINKS = ['story', 'live', 'impact', 'sdgs', 'measure', 'method', 'faq'] as const;

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
            className="flex items-center gap-2.5 font-logo text-xl tracking-[0.03em] uppercase sm:text-2xl"
          >
            {/* Logo mark: yellow normally, dark on the yellow menu page so it stays visible */}
            <LogoMark className={`h-8 w-9 ${open ? 'text-forest-950' : 'text-solar'}`} />
            {/* Wordmark exactly like the logo: Montserrat, SOLAR bold + SKIN regular in yellow */}
            <span className="leading-none">
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
        className="fixed inset-0 z-40 overflow-x-hidden overflow-y-auto bg-solar text-forest-950"
      >
        {/* Our logo's panel-sun, huge and very faint, as a watermark in the corner */}
        <LogoMark className="pointer-events-none absolute -right-24 -bottom-20 h-[26rem] w-[29rem] text-forest-950/[0.07]" />

        <div className="relative mx-auto grid min-h-full max-w-6xl content-center gap-10 px-4 pt-28 pb-10 sm:px-8 lg:grid-cols-[1fr_17rem] lg:items-end">
          {/* Links: 1 column on phones, 2 on wider screens. Each one rises in, one after another. */}
          <ol className="grid gap-x-8 sm:grid-cols-2">
            {LINKS.map((id, i) => (
              <li
                key={id}
                className="animate-rise border-t border-forest-950/20"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <a
                  href={`#${id}`}
                  onClick={() => setOpen(false)}
                  className="group relative flex items-center gap-4 overflow-hidden px-3 py-4 outline-none"
                >
                  {/* A dark "panel" that slides up behind the link on hover/focus,
                      like a solar panel switching on */}
                  <span
                    aria-hidden
                    className="absolute inset-0 translate-y-full bg-forest-950 transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:translate-y-0 group-focus-visible:translate-y-0"
                  />

                  <span className="relative w-6 shrink-0 text-xs font-semibold text-forest-950/55 tabular-nums transition-colors group-hover:text-solar group-focus-visible:text-solar">
                    0{i + 1}
                  </span>

                  <span className="relative min-w-0 flex-1">
                    <span className="block font-serif text-[clamp(1.6rem,3.6vw,2.5rem)] leading-tight font-normal italic transition-colors group-hover:text-solar group-focus-visible:text-solar">
                      {t(`nav.${id}`)}
                    </span>
                    <span className="block text-xs text-forest-950/60 transition-colors group-hover:text-white/60 group-focus-visible:text-white/60">
                      {t(`nav.desc.${id}`)}
                    </span>
                  </span>

                  {/* Arrow that slides in on hover */}
                  <span
                    aria-hidden
                    className="relative -translate-x-3 text-xl text-solar opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                  >
                    →
                  </span>
                </a>
              </li>
            ))}
          </ol>

          {/* Small dark card about the pilot site */}
          <div
            className="animate-rise rounded-tl-[2rem] rounded-tr-md rounded-br-[2rem] rounded-bl-md bg-forest-950 p-5 text-white"
            style={{ animationDelay: '380ms' }}
          >
            <p className="flex items-center gap-2 text-xs font-semibold tracking-widest text-solar uppercase">
              <LogoMark className="h-4 w-5" />
              {t('nav.pilot')}
            </p>
            <p className="mt-3 font-serif text-2xl italic">{t('nav.pilotPlace')}</p>
            <p className="mt-1 text-sm text-white/60">{t('nav.pilotWall')}</p>
          </div>
        </div>
      </nav>
    </>
  );
}
