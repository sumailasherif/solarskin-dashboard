// Top bar: logo on the left, 5 section links in the middle, a "See the live wall" button on the right.
// On phones the links don't fit in one row, so the round yellow button opens a small
// dropdown with the same links instead.
// The links use Fraunces Italic and a "solar panel switching on" hover: a coloured panel
// slides up behind the link. The link for the section you're reading gets a small dot.
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LogoMark } from './LogoMark';

// The page sections the bar links to ("Live" is reached with the "See the live wall" button). The ids match <section id="..."> in the page.
const LINKS = ['story', 'measure', 'impact', 'method', 'faq'] as const;

// Sections without their own link that should light up another link's dot:
// the SDGs part follows the pilot figures, so it counts as "Impact".
const ALIAS: Record<string, string> = { sdgs: 'impact' };

/** The id of the section in the middle of the screen right now (null at the very top). */
function useActiveSection() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    // Watch a thin line across the middle of the screen: whichever section crosses it is "active".
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) setActive(ALIAS[entry.target.id] ?? entry.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    document.querySelectorAll('main section[id]').forEach((el) => observer.observe(el));

    // Back at the top (the hero has no id): no link is active.
    const onScroll = () => window.scrollY < window.innerHeight * 0.5 && setActive(null);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return active;
}

// The sliding panel behind a link (shared by the bar and the phone dropdown)
/** Small down arrow drawn in SVG so it always takes the text colour. */
function ArrowDown() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M8 3v10M3.5 8.5 8 13l4.5-4.5" />
    </svg>
  );
}

const PANEL =
  'absolute inset-0 translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:translate-y-0 group-focus-visible:translate-y-0';

export function SiteHeader() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false); // phone dropdown
  const [scrolled, setScrolled] = useState(false);
  const active = useActiveSection();

  // Remember whether the page is scrolled down a little (to switch the bar style).
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // The Escape key closes the phone dropdown.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4">
      {/* Once you scroll (or open the phone menu), the bar turns into a frosted-glass pill
          so it stays readable on every section. */}
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full py-2 pr-2 pl-4 text-white transition duration-300 ${
          scrolled || open ? 'bg-forest-950/75 shadow-lg ring-1 ring-white/10 backdrop-blur-md' : ''
        }`}
      >
        <a
          href="#top"
          className="flex shrink-0 items-center gap-2.5 font-logo text-xl tracking-[0.03em] uppercase sm:text-2xl"
        >
          <LogoMark className="h-8 w-9 text-solar" />
          {/* Wordmark exactly like the logo: Montserrat, SOLAR bold + SKIN regular in yellow */}
          <span className="leading-none">
            <span className="font-bold">Solar</span>
            <span className="font-normal text-solar">Skin</span>
          </span>
        </a>

        {/* Desktop / tablet: the 5 links in a row. Each one rises in, one after another. */}
        <nav aria-label={t('nav.label')} className="hidden lg:block">
          <ol className="flex items-center gap-1">
            {LINKS.map((id, i) => (
              <li key={id} className="animate-rise" style={{ animationDelay: `${150 + i * 70}ms` }}>
                <a
                  href={`#${id}`}
                  aria-current={active === id ? 'location' : undefined}
                  className="group relative flex overflow-hidden rounded-full px-3.5 py-1.5 outline-none"
                >
                  {/* Yellow panel that slides up on hover/focus */}
                  <span aria-hidden className={`${PANEL} rounded-full bg-solar`} />
                  <span className="relative font-serif text-lg italic transition-colors group-hover:text-forest-950 group-focus-visible:text-forest-950">
                    {t(`nav.${id}`)}
                  </span>
                  {/* Dot under the link of the section you're reading */}
                  <span
                    aria-hidden
                    className={`absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-solar transition-opacity group-hover:opacity-0 ${
                      active === id ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Call-to-action button (laptop and up). Same slide-up panel, in white. */}
        <a
          href="#live"
          className="group relative hidden shrink-0 animate-rise items-center gap-2 overflow-hidden rounded-full bg-solar px-5 py-2.5 text-sm font-semibold text-forest-950 transition hover:shadow-[0_0_24px_-4px] hover:shadow-solar lg:inline-flex"
          style={{ animationDelay: '550ms' }}
        >
          <span aria-hidden className={`${PANEL} rounded-full bg-white`} />
          <span className="relative">{t('nav.cta')}</span>
          <span aria-hidden className="relative transition-transform group-hover:translate-y-0.5">
            <ArrowDown />
          </span>
        </a>

        {/* Phones: round button that opens the dropdown */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label={open ? t('nav.close') : t('nav.open')}
          className="grid h-11 w-11 place-items-center rounded-full bg-solar text-forest-950 transition hover:scale-105 lg:hidden"
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

      {/* Phone dropdown: same 5 links, same font and slide-up panel */}
      <nav
        id="site-menu"
        hidden={!open}
        aria-label={t('nav.label')}
        className="mx-auto mt-2 max-w-7xl overflow-hidden rounded-3xl bg-solar p-2 text-forest-950 shadow-2xl lg:hidden"
      >
        <ol>
          {LINKS.map((id, i) => (
            <li
              key={id}
              className="animate-rise border-b border-forest-950/15 last:border-0"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <a
                href={`#${id}`}
                onClick={() => setOpen(false)}
                aria-current={active === id ? 'location' : undefined}
                className="group relative flex items-center gap-3 overflow-hidden rounded-2xl px-4 py-3 outline-none"
              >
                <span aria-hidden className={`${PANEL} bg-forest-950`} />
                <span className="relative min-w-0 flex-1">
                  <span className="block font-serif text-2xl leading-tight italic transition-colors group-hover:text-solar group-focus-visible:text-solar">
                    {t(`nav.${id}`)}
                  </span>
                  <span className="block text-xs text-forest-950/60 transition-colors group-hover:text-white/60 group-focus-visible:text-white/60">
                    {t(`nav.desc.${id}`)}
                  </span>
                </span>
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
      </nav>
    </header>
  );
}
