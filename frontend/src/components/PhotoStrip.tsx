// A band of real photos sliding slowly sideways (it pauses when you hover over it).
// Like the yellow ticker, the row is drawn twice so the loop is seamless.
import { useTranslation } from 'react-i18next';
import { PHOTOS, photoUrl, type Photo } from '../content/photos';
import { PhotoCredit } from './PhotoCredit';

// Order chosen so similar photos are not next to each other.
const STRIP: Photo[] = [
  PHOTOS.solarFacade,
  PHOTOS.tashkentBlocks,
  PHOTOS.solarField,
  PHOTOS.ferganaStreet,
  PHOTOS.installer,
  PHOTOS.uzLandscape,
  PHOTOS.panelCloseUp,
  PHOTOS.tashkentBalcony,
  PHOTOS.sensorKit,
];

export function PhotoStrip() {
  const { t } = useTranslation();

  const row = (hidden: boolean) => (
    <ul className="flex shrink-0 gap-4 pr-4" aria-hidden={hidden || undefined}>
      {STRIP.map((photo, i) => (
        <li
          key={photo.id}
          className={`relative h-56 shrink-0 overflow-hidden sm:h-72 ${
            i % 3 === 1 ? 'w-44 sm:w-56' : 'w-72 sm:w-[26rem]'
          } ${i % 2 ? 'rounded-tl-[2.5rem] rounded-br-[2.5rem]' : 'rounded-tr-[2.5rem] rounded-bl-[2.5rem]'} rounded-lg`}
        >
          <img
            src={photoUrl(photo, 800)}
            alt={hidden ? '' : photo.alt}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-700 hover:scale-105"
          />
          <PhotoCredit photo={photo} focusable={!hidden} />
        </li>
      ))}
    </ul>
  );

  return (
    <section aria-label={t('gallery.label')} className="overflow-hidden bg-forest-950 py-6">
      <div className="flex w-max animate-[marquee_80s_linear_infinite] hover:[animation-play-state:paused]">
        {row(false)}
        {row(true)}
      </div>
    </section>
  );
}
