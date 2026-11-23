// The footer: logo, one short line, the contact email, and the copyright.
// The email comes from content/site.ts; if it's empty, the contact line is hidden.
import { useTranslation } from 'react-i18next';
import { CONTACT_EMAIL } from '../content/site';
import { LogoMark } from './LogoMark';

/** `email` defaults to CONTACT_EMAIL from content/site.ts (passing it in makes the footer easy to test). */
export function SiteFooter({ email = CONTACT_EMAIL }: { email?: string }) {
  const { t } = useTranslation();

  return (
    <footer className="bg-forest-950 px-4 pt-16 pb-8 text-white sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 md:flex-row md:items-end md:justify-between">
        {/* Logo + one line */}
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

        {/* Contact (only when an email is set) */}
        {email && (
          <div className="md:text-right">
            <p className="text-sm text-white/50">{t('site.contact')}</p>
            <a
              href={`mailto:${email}`}
              className="mt-1 inline-block font-serif text-2xl italic underline decoration-solar/40 underline-offset-8 transition hover:text-solar hover:decoration-solar sm:text-3xl"
            >
              {email}
            </a>
          </div>
        )}
      </div>

      <p className="mx-auto mt-12 max-w-7xl border-t border-white/10 pt-6 text-xs text-white/40">
        {t('footer')}
      </p>
    </footer>
  );
}
