// "FAQ": just words. The heading on the left (it stays in view while you scroll on laptops),
// the questions on the right.
//
// The accordion uses the browser's built-in <details>/<summary> elements: they open
// and close without any JavaScript and work with the keyboard and screen readers.
// Giving them all the same `name` makes only one stay open at a time.
import { useTranslation } from 'react-i18next';
import { Reveal } from './Reveal';

type FaqItem = { q: string; a: string };

export function FaqSection() {
  const { t } = useTranslation();
  const items = t('faq.items', { returnObjects: true }) as FaqItem[];

  return (
    <section id="faq" className="bg-forest-50 px-4 py-24 text-forest-950 sm:px-8 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        {/* Left: heading */}
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <p className="font-serif text-4xl text-forest-700 italic sm:text-5xl">
            {t('faq.kicker')}
          </p>
          <h2 className="mt-3 font-display text-[clamp(2rem,5vw,3.75rem)] leading-none font-bold uppercase">
            {t('faq.title')}
          </h2>
          <p className="mt-5 max-w-md text-base text-forest-950/70 sm:text-lg">{t('faq.lead')}</p>
        </Reveal>

        {/* Right: questions */}
        <div className="border-t border-forest-950/15">
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
    </section>
  );
}
