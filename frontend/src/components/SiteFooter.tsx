// The footer:
//   left    logo + tagline
//   middle  quick links to the page sections
//   right   the contact form (sends to CONTACT_EMAIL from content/site.ts)
//   bottom  copyright + back to top
// If CONTACT_EMAIL is empty, the form is hidden.
import { useTranslation } from 'react-i18next';
import { CONTACT_EMAIL } from '../content/site';
import { ContactForm } from './ContactForm';
import { LogoMark } from './LogoMark';

// Same sections as the top nav bar
const LINKS = ['story', 'measure', 'impact', 'method', 'faq'] as const;

/** `email` defaults to CONTACT_EMAIL from content/site.ts (passing it in makes the footer easy to test). */
export function SiteFooter({ email = CONTACT_EMAIL }: { email?: string }) {
  const { t } = useTranslation();

  return (
    <footer id="contact" className="bg-forest-950 px-4 pt-20 pb-8 text-white sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_auto_1.3fr] lg:gap-16">
        {/* Logo + tagline */}
        <div>
          <a href="#top" className="inline-flex items-center gap-2.5 font-logo text-2xl uppercase">
            <LogoMark className="h-8 w-9 text-solar" />
            <span className="leading-none">
              <span className="font-bold">Solar</span>
              <span className="font-normal text-solar">Skin</span>
            </span>
          </a>
          <p className="mt-4 font-serif text-xl text-white/70 italic">{t('site.tagline')}</p>
        </div>

        {/* Quick links */}
        <nav aria-label={t('site.explore')}>
          <ul className="space-y-2">
            {LINKS.map((id) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="font-serif text-xl text-white/80 italic transition hover:text-solar"
                >
                  {t(`nav.${id}`)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact form */}
        {email && (
          <div>
            <h2 className="mb-6 font-serif text-4xl italic">{t('contact.title')}</h2>
            <ContactForm to={email} />
          </div>
        )}
      </div>

      <div className="mx-auto mt-16 flex max-w-7xl items-center justify-between border-t border-white/10 pt-6 text-xs text-white/40">
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
