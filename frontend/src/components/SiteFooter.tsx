// The footer, top to bottom:
//   1. "Quick links" (left) and the contact form (right; sends to CONTACT_EMAIL from content/site.ts)
//   2. The SolarSkin logo + tagline, large and centred, on a soft golden glow
//   3. Copyright + back to top
// If CONTACT_EMAIL is empty, the form is hidden.
import { useTranslation } from 'react-i18next';
import { CONTACT_EMAIL } from '../content/site';
import { ContactForm } from './ContactForm';
import { LogoMark } from './LogoMark';

// Same sections as the top nav bar
const LINKS = ['story', 'measure', 'impact', 'method', 'team', 'faq'] as const;

/** `email` defaults to CONTACT_EMAIL from content/site.ts (passing it in makes the footer easy to test). */
export function SiteFooter({ email = CONTACT_EMAIL }: { email?: string }) {
  const { t } = useTranslation();

  return (
    <footer id="contact" className="bg-forest-950 px-4 pt-16 pb-8 text-white sm:px-8">
      {/* 1. Quick links + contact form */}
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-12">
        <nav aria-labelledby="quick-links">
          <h2 id="quick-links" className="font-serif text-2xl text-solar italic">
            {t('site.quickLinks')}
          </h2>
          <ul className="mt-4 space-y-2">
            {LINKS.map((id) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="font-serif text-3xl text-white/85 italic transition hover:text-leaf-300"
                >
                  {t(`nav.${id}`)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {email && (
          <div>
            <h2 className="mb-6 font-serif text-4xl italic">{t('contact.title')}</h2>
            <ContactForm to={email} />
          </div>
        )}
      </div>

      {/* 2. Brand: big centred logo + tagline, with a soft sun glow behind it */}
      <div className="relative mx-auto mt-12 max-w-7xl overflow-hidden py-10 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-1/2 mx-auto h-40 max-w-xl -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(245,184,46,0.16),transparent)]"
        />
        <a
          href="#top"
          className="relative inline-flex items-center gap-3 font-logo text-3xl tracking-[0.03em] uppercase sm:text-4xl"
        >
          <LogoMark className="h-8 w-9 text-solar sm:h-10 sm:w-12" />
          <span className="leading-none">
            <span className="font-bold">Solar</span>
            <span className="font-normal text-solar">Skin</span>
          </span>
        </a>
        <p className="relative mt-4 font-serif text-base text-white/70 italic sm:text-lg">
          {t('site.tagline')}
        </p>
      </div>

      {/* 3. Copyright + back to top */}
      <div className="mx-auto flex max-w-7xl items-center justify-between border-t border-white/10 pt-6 text-xs text-white/40">
        <p>{t('footer')}</p>
        <a href="#top" className="inline-flex items-center gap-1.5 transition hover:text-white">
          {t('site.top')}
          <svg
            viewBox="0 0 16 16"
            className="h-3 w-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" />
          </svg>
        </a>
      </div>
    </footer>
  );
}
