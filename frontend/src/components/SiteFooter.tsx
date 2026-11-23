// The footer: logo + tagline + email on the left, a small contact form on the right,
// and the copyright underneath. The email comes from content/site.ts; if it's empty,
// the email line and the form are hidden.
import { useTranslation } from 'react-i18next';
import { CONTACT_EMAIL } from '../content/site';
import { ContactForm } from './ContactForm';
import { LogoMark } from './LogoMark';

/** `email` defaults to CONTACT_EMAIL from content/site.ts (passing it in makes the footer easy to test). */
export function SiteFooter({ email = CONTACT_EMAIL }: { email?: string }) {
  const { t } = useTranslation();

  return (
    <footer id="contact" className="bg-forest-950 px-4 pt-20 pb-8 text-white sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        {/* Logo, tagline, email */}
        <div>
          <a href="#top" className="inline-flex items-center gap-2.5 font-logo text-2xl uppercase">
            <LogoMark className="h-8 w-9 text-solar" />
            <span className="leading-none">
              <span className="font-bold">Solar</span>
              <span className="font-normal text-solar">Skin</span>
            </span>
          </a>
          <p className="mt-4 font-serif text-xl text-white/70 italic">{t('site.tagline')}</p>

          {email && (
            <a
              href={`mailto:${email}`}
              className="mt-10 inline-block font-serif text-2xl italic underline decoration-solar/40 underline-offset-8 transition hover:text-solar hover:decoration-solar sm:text-3xl"
            >
              {email}
            </a>
          )}
        </div>

        {/* Contact form */}
        {email && (
          <div>
            <h2 className="mb-6 font-serif text-4xl italic">{t('contact.title')}</h2>
            <ContactForm to={email} />
          </div>
        )}
      </div>

      <p className="mx-auto mt-16 max-w-7xl border-t border-white/10 pt-6 text-xs text-white/40">
        {t('footer')}
      </p>
    </footer>
  );
}
