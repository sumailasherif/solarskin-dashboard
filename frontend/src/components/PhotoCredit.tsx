// A tiny, almost invisible "Photo credit" link in the corner of a photo.
// Hover it (or tap it on a phone, or Tab to it with the keyboard) and a small card
// appears with what the photo shows, who took it, and its source + licence.
//
// Put it INSIDE the element that holds the photo; that element needs `relative`
// (or `absolute`), because the credit positions itself in that element's corner.
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PHOTOS, type Photo } from '../content/photos';

type PhotoCreditProps = {
  photo: Photo;
  /** Which edge the link sits on. Use "top" when a caption covers the bottom of the photo. */
  corner?: 'top' | 'bottom';
  /** false for copies of photos that are only decoration (e.g. the repeated photo strip) */
  focusable?: boolean;
};

const LINK = 'underline decoration-white/30 underline-offset-2 hover:decoration-white';

/** Find the photo's name in PHOTOS (e.g. "tashkentBlocks") to look up its description. */
function photoKey(photo: Photo) {
  return Object.entries(PHOTOS).find(([, p]) => p.id === photo.id)?.[0];
}

export function PhotoCredit({ photo, corner = 'bottom', focusable = true }: PhotoCreditProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false); // for taps on phones (no hover there)
  const cardId = useId();
  const key = photoKey(photo);

  return (
    // Full-width strip along one edge of the photo; the link sits at its right end.
    // The card is positioned against this strip, so it never sticks out of the photo.
    <div
      className={`pointer-events-none absolute inset-x-3 z-20 flex justify-end ${
        corner === 'top' ? 'top-3' : 'bottom-3'
      }`}
    >
      <div
        className="group/credit pointer-events-auto"
        onMouseLeave={() => setOpen(false)}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
      >
        <button
          type="button"
          aria-expanded={open}
          aria-controls={cardId}
          tabIndex={focusable ? 0 : -1}
          onClick={() => setOpen((o) => !o)}
          className="rounded-full px-2 py-0.5 text-[10px] tracking-wide text-white/30 [text-shadow:0_1px_2px_rgb(0_0_0/0.5)] transition hover:bg-forest-950/70 hover:text-white focus-visible:bg-forest-950/70 focus-visible:text-white focus-visible:ring-1 focus-visible:ring-solar focus-visible:outline-none"
        >
          {t('credits.button')}
        </button>

        {/* The card. Hidden until the link is hovered, focused or tapped.
            The small padding between link and card keeps the hover "bridge" unbroken,
            so you can move the mouse onto the card and click the links in it. */}
        <div
          id={cardId}
          role="tooltip"
          className={`absolute right-0 max-w-full transition duration-200 ${
            corner === 'top' ? 'top-full pt-1.5' : 'bottom-full pb-1.5'
          } ${open ? 'visible opacity-100' : 'invisible opacity-0'} group-focus-within/credit:visible group-focus-within/credit:opacity-100 group-hover/credit:visible group-hover/credit:opacity-100`}
        >
          <div className="w-max max-w-full rounded-xl bg-forest-950/90 px-3 py-2 text-left text-[11px] leading-snug text-white/85 shadow-lg ring-1 ring-white/10 backdrop-blur-md">
            {key && <p className="font-semibold text-white">{t(`credits.subjects.${key}`)}</p>}
            <p>
              {t('credits.photoBy')}{' '}
              <a
                href={photo.page}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={focusable ? 0 : -1}
                className={LINK}
              >
                {photo.photographer}
              </a>
            </p>
            <p className="text-white/60">
              {t('credits.source')}{' '}
              <a
                href="https://unsplash.com/license"
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={focusable ? 0 : -1}
                className={LINK}
              >
                {t('credits.licence')}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
