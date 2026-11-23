// "Sustainability": the three pillars (planet, people, economy) and the UN Sustainable
// Development Goals (SDGs) SolarSkin contributes to. Each SDG tile names the exact UN
// target and the dashboard number we use to track it, so the claim can be checked.
import { useTranslation } from 'react-i18next';
import { PHOTOS, photoSrcSet, photoUrl } from '../content/photos';
import { PhotoCredit } from './PhotoCredit';
import { Reveal } from './Reveal';

const PILLARS = ['planet', 'people', 'economy'] as const;

// A real photo on top of each pillar card.
const PILLAR_PHOTOS = {
  planet: PHOTOS.solarFacade,
  people: PHOTOS.tashkentBalcony,
  economy: PHOTOS.almatyBlocks,
};

// Official SDG numbers and colours (from the UN SDG communication guidelines).
const SDGS = [
  { n: 7, colour: '#FCC30B', dark: true },
  { n: 9, colour: '#FD6925', dark: false },
  { n: 11, colour: '#FD9D24', dark: true },
  { n: 13, colour: '#3F7E44', dark: false },
] as const;

/** Small line icons for the three pillars. */
function PillarIcon({ kind }: { kind: (typeof PILLARS)[number] }) {
  const common = {
    viewBox: '0 0 24 24',
    className: 'h-7 w-7',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  if (kind === 'planet')
    return (
      <svg {...common}>
        {/* leaf */}
        <path d="M4 20c0-9 6-15 16-16 0 10-6 16-16 16Z" />
        <path d="M4 20 15 9" />
      </svg>
    );
  if (kind === 'people')
    return (
      <svg {...common}>
        {/* home */}
        <path d="M3 11 12 4l9 7" />
        <path d="M5 10v10h14V10" />
        <path d="M10 20v-5h4v5" />
      </svg>
    );
  return (
    <svg {...common}>
      {/* coin with an upward arrow */}
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 16V8M9 11l3-3 3 3" />
    </svg>
  );
}

export function SustainabilitySection() {
  const { t } = useTranslation();

  return (
    <section
      id="sdgs"
      className="relative overflow-hidden bg-forest-50 px-4 py-24 text-forest-950 sm:px-8 sm:py-32"
    >
      {/* A big soft leaf-green glow in the corner */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -bottom-40 h-[32rem] w-[32rem] rounded-full bg-leaf/25 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl">
        {/* Heading */}
        <Reveal className="max-w-3xl">
          <p className="text-xs font-semibold tracking-widest text-forest-700 uppercase">
            {t('sustainability.kicker')}
          </p>
          <h2 className="mt-4 font-display text-[clamp(1.9rem,5vw,4rem)] leading-[1.05] font-bold uppercase">
            {t('sustainability.title')}
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-forest-950/75 sm:text-lg">
            {t('sustainability.lead')}
          </p>
        </Reveal>

        {/* The three pillars */}
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {PILLARS.map((key, i) => (
            <Reveal key={key} delayMs={i * 120}>
              <article className="group h-full overflow-hidden rounded-tl-[2.5rem] rounded-tr-lg rounded-br-[2.5rem] rounded-bl-lg bg-white shadow-sm ring-1 ring-forest-950/5 transition hover:-translate-y-1 hover:shadow-lg">
                {/* Photo, with the pillar icon sitting on its bottom edge */}
                <div className="relative h-44 overflow-hidden lg:h-52">
                  <img
                    src={photoUrl(PILLAR_PHOTOS[key], 1080)}
                    srcSet={photoSrcSet(PILLAR_PHOTOS[key])}
                    sizes="(min-width: 768px) 33vw, 100vw"
                    alt={PILLAR_PHOTOS[key].alt}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition duration-[1.2s] ease-out group-hover:scale-105"
                  />
                  <PhotoCredit photo={PILLAR_PHOTOS[key]} />
                </div>
                <div className="relative px-5 pb-6 lg:px-7 lg:pb-7">
                  <span className="-mt-7 grid h-14 w-14 place-items-center rounded-2xl bg-leaf text-forest-950 shadow-md ring-4 ring-white">
                    <PillarIcon kind={key} />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-bold uppercase">
                    {t(`sustainability.pillars.${key}.title`)}
                  </h3>
                  <ul className="mt-4 space-y-2 text-sm leading-relaxed text-forest-950/75">
                    {(
                      t(`sustainability.pillars.${key}.points`, { returnObjects: true }) as string[]
                    ).map((point) => (
                      <li key={point} className="flex gap-2">
                        <span
                          aria-hidden
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-leaf"
                        />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        {/* The SDGs */}
        <Reveal className="mt-24 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h3 className="font-display text-[clamp(1.5rem,3.5vw,2.5rem)] leading-tight font-bold uppercase">
            {t('sustainability.sdgTitle')}
          </h3>
          <p className="max-w-sm text-sm text-forest-950/70">{t('sustainability.sdgLead')}</p>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SDGS.map(({ n, colour, dark }, i) => (
            <Reveal key={n} delayMs={i * 120}>
              <article
                className={`group flex h-full flex-col rounded-3xl p-6 transition hover:-translate-y-1.5 hover:shadow-xl ${
                  dark ? 'text-forest-950' : 'text-white'
                }`}
                style={{ backgroundColor: colour }}
              >
                <div className="flex items-start justify-between">
                  <span className="font-display text-6xl leading-none font-extrabold">{n}</span>
                  <span className="rounded-full bg-black/10 px-2.5 py-1 text-[11px] font-semibold">
                    {t('sustainability.sdgLabel')} {n}
                  </span>
                </div>
                <h4 className="mt-4 font-display text-base leading-snug font-bold uppercase">
                  {t(`sustainability.sdgs.${n}.name`)}
                </h4>
                <p className="mt-3 text-sm leading-relaxed opacity-90">
                  {t(`sustainability.sdgs.${n}.how`)}
                </p>

                {/* Which UN target, and which dashboard number tracks it */}
                <dl className="mt-auto space-y-2 border-t border-current/20 pt-4 text-xs">
                  <div>
                    <dt className="font-semibold">
                      {t('sustainability.target')} {t(`sustainability.sdgs.${n}.targetId`)}
                    </dt>
                    <dd className="opacity-85">{t(`sustainability.sdgs.${n}.target`)}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">{t('sustainability.trackedBy')}</dt>
                    <dd className="opacity-85">{t(`sustainability.sdgs.${n}.tracked`)}</dd>
                  </div>
                </dl>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
