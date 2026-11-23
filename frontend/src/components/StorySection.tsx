// "Why walls?": two photo cards that tell the story in two steps —
// the opportunity (sunny apartment walls) and the idea (a solar façade).
import { useTranslation } from 'react-i18next';
import { PHOTOS, photoSrcSet, photoUrl, type Photo } from '../content/photos';
import { PhotoCredit } from './PhotoCredit';
import { Reveal } from './Reveal';

type Card = { key: 'walls' | 'idea'; photo: Photo };

const CARDS: Card[] = [
  { key: 'walls', photo: PHOTOS.tashkentBlocks },
  { key: 'idea', photo: PHOTOS.solarFacade },
];

/** One photo card: the photo fills the card, the caption sits on a dark fade at the bottom. */
function StoryCard({ card }: { card: Card }) {
  const { t } = useTranslation();
  const { key, photo } = card;

  return (
    <figure className="group relative h-[26rem] overflow-hidden rounded-tl-[3rem] rounded-tr-xl rounded-br-[3rem] rounded-bl-xl lg:h-[32rem]">
      <img
        src={photoUrl(photo, 1600)}
        srcSet={photoSrcSet(photo)}
        sizes="(min-width: 768px) 50vw, 100vw"
        alt={photo.alt}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover transition duration-[1.2s] ease-out group-hover:scale-105"
      />
      {/* Dark fade at the bottom so the caption is readable */}
      <div className="absolute inset-0 bg-gradient-to-t from-forest-950/95 via-forest-950/30 to-transparent" />

      <PhotoCredit photo={photo} corner="top" />

      <figcaption className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
        <span className="inline-flex rounded-full bg-solar px-3 py-1 text-[11px] font-semibold text-forest-950">
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
  );
}

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

        {/* Two equal cards: stacked on phones, side by side from tablets up */}
        <div className="mt-14 grid gap-4 md:grid-cols-2">
          {CARDS.map((card, i) => (
            <Reveal key={card.key} delayMs={i * 120}>
              <StoryCard card={card} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
