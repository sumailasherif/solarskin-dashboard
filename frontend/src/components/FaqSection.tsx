// "FAQ": common questions in an accordion, next to a photo of a resident checking
// his phone. Small SolarSkin notifications pop up around his phone, one after another,
// then float gently (like messages arriving).
//
// The accordion uses the browser's built-in <details>/<summary> elements: they open
// and close without any JavaScript and work with the keyboard and screen readers.
// Giving them all the same `name` makes only one stay open at a time.
import type { CSSProperties, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { PHOTOS, photoSrcSet, photoUrl } from '../content/photos';
import { useInView } from '../lib/useInView';
import { LogoMark } from './LogoMark';
import { PhotoCredit } from './PhotoCredit';
import { Reveal } from './Reveal';

type FaqItem = { q: string; a: string };

/** Wrapper that makes its content "pop" in (after `delayMs`) and then float up and down. */
function Popup({
  show,
  delayMs,
  className,
  children,
}: {
  show: boolean;
  delayMs: number;
  className: string;
  children: ReactNode;
}) {
  const style: CSSProperties = { animationDelay: `${delayMs}ms` };
  return (
    <div className={`absolute ${show ? 'animate-pop' : 'opacity-0'} ${className}`} style={style}>
      <div className="animate-float" style={{ animationDelay: `${delayMs + 700}ms` }}>
        {children}
      </div>
    </div>
  );
}

// Frosted-glass look shared by all the pop-ups
const GLASS =
  'rounded-2xl bg-white/85 text-forest-950 shadow-xl ring-1 ring-white/70 backdrop-blur-xl';

/** A small chip: coloured icon tile + two short lines (like "Kale / 2 cups"). */
function Chip({ icon, title, value }: { icon: ReactNode; title: string; value: string }) {
  return (
    <div className={`${GLASS} flex items-center gap-2.5 py-2 pr-4 pl-2`}>
      <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-forest-50 text-forest-700">
        {icon}
        {/* Small tick badge on the icon */}
        <span className="absolute -right-1 -bottom-1 grid h-4 w-4 place-items-center rounded-full bg-leaf text-[9px] font-bold text-white ring-2 ring-white">
          ✓
        </span>
      </span>
      <span className="leading-tight">
        <span className="block text-[11px] font-semibold">{title}</span>
        <span className="block text-[11px] text-forest-950/60">{value}</span>
      </span>
    </div>
  );
}

/** The notifications that pop up around the phone in the photo. */
function PhonePopups() {
  const { t } = useTranslation();
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0" aria-hidden>
      {/* 1. Push notification, just below his phone */}
      <Popup show={inView} delayMs={300} className="top-[69%] right-[4%] w-[62%] min-w-52">
        <div className={`${GLASS} p-3`}>
          <div className="flex items-center gap-2 text-[10px] text-forest-950/55">
            <span className="grid h-5 w-5 place-items-center rounded-md bg-[#13223a] text-solar">
              <LogoMark className="h-2.5 w-3" />
            </span>
            <span className="flex-1 font-logo font-bold tracking-wide text-forest-950 uppercase">
              {t('faq.popups.app')}
            </span>
            <span>{t('faq.popups.now')}</span>
          </div>
          <p className="mt-1.5 text-[13px] leading-snug font-semibold">
            {t('faq.popups.bannerTitle')}
          </p>
          <p className="text-[11px] text-forest-950/60">{t('faq.popups.bannerText')}</p>
        </div>
      </Popup>

      {/* 2. CO₂ chip, to his right side */}
      <Popup show={inView} delayMs={900} className="top-[50%] left-[4%]">
        <Chip
          title={t('faq.popups.co2Title')}
          value={t('faq.popups.co2Value')}
          icon={
            // leaf
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14" />
              <path d="M5 19 13 11" />
            </svg>
          }
        />
      </Popup>

      {/* 3. "shaded wall" chip, top right in the background */}
      <Popup show={inView} delayMs={1500} className="top-[16%] right-[4%]">
        <Chip
          title={t('faq.popups.shadeTitle')}
          value={t('faq.popups.shadeValue')}
          icon={
            // thermometer
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M10 13.5V5a2 2 0 1 1 4 0v8.5a4 4 0 1 1-4 0Z" />
              <path d="M12 9v6" />
            </svg>
          }
        />
      </Popup>
    </div>
  );
}

export function FaqSection() {
  const { t } = useTranslation();
  const items = t('faq.items', { returnObjects: true }) as FaqItem[];
  const photo = PHOTOS.residentPhone;

  return (
    <section id="faq" className="bg-forest-50 px-4 py-24 text-forest-950 sm:px-8 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        {/* Left: photo with pop-up notifications. On laptops it stretches to the height of the questions */}
        <Reveal className="lg:flex lg:flex-col">
          <figure className="lg:flex lg:flex-1 lg:flex-col">
            <div className="relative overflow-hidden rounded-tl-[3rem] rounded-tr-xl rounded-br-[3rem] rounded-bl-xl shadow-xl lg:flex-1">
              <img
                src={photoUrl(photo, 1080)}
                srcSet={photoSrcSet(photo)}
                sizes="(min-width: 1024px) 45vw, 100vw"
                alt={photo.alt}
                loading="lazy"
                decoding="async"
                className="aspect-[4/5] w-full object-cover object-[40%_center] md:aspect-[4/3] lg:absolute lg:inset-0 lg:aspect-auto lg:h-full"
              />
              <PhonePopups />
              <PhotoCredit photo={photo} corner="top" />
            </div>

            <figcaption className="mt-4 text-sm text-forest-950/70">
              {t('faq.photoCaption')}
            </figcaption>
          </figure>
        </Reveal>

        {/* Right: heading + questions */}
        <div>
          <Reveal>
            <p className="font-serif text-4xl text-forest-700 italic sm:text-5xl">
              {t('faq.kicker')}
            </p>
            <h2 className="mt-3 font-display text-[clamp(2rem,5vw,3.75rem)] leading-none font-bold uppercase">
              {t('faq.title')}
            </h2>
            <p className="mt-5 max-w-xl text-base text-forest-950/70 sm:text-lg">{t('faq.lead')}</p>
          </Reveal>

          <div className="mt-10 border-t border-forest-950/15">
            {items.map((item, i) => (
              <Reveal key={item.q} delayMs={Math.min(i, 5) * 60}>
                <details
                  name="faq"
                  open={i === 0}
                  className="group border-b border-forest-950/15 [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex cursor-pointer list-none items-center gap-4 py-5 text-left">
                    <span className="w-7 shrink-0 text-xs font-semibold text-forest-950/45 tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="flex-1 font-serif text-xl italic sm:text-2xl">{item.q}</span>
                    {/* A "+" that turns into an "×" when the answer is open */}
                    <span
                      aria-hidden
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-solar text-lg leading-none text-forest-950 transition duration-300 group-open:rotate-45 group-open:bg-forest-950 group-open:text-solar"
                    >
                      +
                    </span>
                  </summary>
                  <p className="max-w-2xl pr-12 pb-6 pl-11 text-sm leading-relaxed text-forest-950/75 sm:text-base">
                    {item.a}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
