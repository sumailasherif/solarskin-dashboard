// "Why walls?": three real photos that tell the story in one glance —
// the apartment blocks, the pilot city, and what a solar façade looks like.
import { useTranslation } from 'react-i18next';
import { PHOTOS, photoSrcSet, photoUrl, type Photo } from '../content/photos';
import { Reveal } from './Reveal';

const CARDS: { key: 'walls' | 'city' | 'idea'; photo: Photo; layout: string }[] = [
  // Tall card on the left (spans two rows on desktop)
  { key: 'walls', photo: PHOTOS.tashkentBlocks, layout: 'lg:row-span-2 min-h-[28rem] lg:min-h-0' },
  { key: 'city', photo: PHOTOS.ferganaStreet, layout: 'min-h-[22rem]' },
  { key: 'idea', photo: PHOTOS.solarFacade, layout: 'min-h-[22rem]' },
];

export function StorySection() {
  const { t } = useTranslation();

  return (
    <section id="story" className="bg-forest-950 px-4 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <Reveal className="max-w-3xl">
          <p className="text-xs font-semibold tracking-widest text-leaf uppercase">
            {t('story.kicker')}
          </p>
          <h2 className="mt-4 font-display text-[clamp(1.9rem,5vw,4rem)] leading-[1.05] font-bold uppercase">
            {t('story.title')}
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
            {t('story.lead')}
          </p>
        </Reveal>

        {/* Photo grid: 1 column on phones, a big tall photo + two stacked on desktop */}
        <div className="mt-14 grid gap-4 lg:grid-cols-[1.1fr_1fr] lg:grid-rows-[22rem_22rem]">
          {CARDS.map(({ key, photo, layout }, i) => (
            <Reveal key={key} delayMs={i * 120} className={`h-full ${layout}`}>
              <figure className="group relative h-full min-h-[inherit] overflow-hidden rounded-tl-[3rem] rounded-tr-xl rounded-br-[3rem] rounded-bl-xl">
                <img
                  src={photoUrl(photo, 1600)}
                  srcSet={photoSrcSet(photo)}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  alt={photo.alt}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition duration-[1.2s] ease-out group-hover:scale-105"
                />
                {/* Dark fade at the bottom so the caption is readable */}
                <div className="absolute inset-0 bg-gradient-to-t from-forest-950/95 via-forest-950/30 to-transparent" />

                <figcaption className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <span className="inline-flex items-center gap-2 rounded-full bg-solar px-3 py-1 text-[11px] font-semibold text-forest-950">
                    {t(`story.cards.${key}.place`)}
                  </span>
                  <h3 className="mt-3 font-display text-xl font-bold uppercase sm:text-2xl">
                    {t(`story.cards.${key}.title`)}
                  </h3>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-white/80">
                    {t(`story.cards.${key}.text`)}
                  </p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
